import { createHash, randomBytes } from "node:crypto";
import type { Server as HttpsServer, ServerOptions as HttpsServerOptions } from "node:https";
import { resolve } from "node:path";
import fastifyStatic from "@fastify/static";
import { argon2id, hash as hashPassword, verify as verifyPassword } from "argon2";
import Fastify, { LogController, type FastifyHttpsOptions, type FastifyReply, type FastifyRequest, type FastifyServerOptions } from "fastify";
import { eq } from "drizzle-orm";
import { accounts, accountTypes, institutions, transactions, transactionSources, type AccountType } from "./schema.js";
import { openDatabase, type AppDatabase } from "./db.js";
import { deduplicateTransactions, normalizeTransactionLabel } from "./deduplication.js";
import { bankCsvFormats, CsvFormatError, parseBankCsv } from "./csv-import.js";
import { parsePdfStatement, PdfStatementError } from "./pdf-import.js";
import { reviewGroups, type UiTransaction } from "./ui-logic.js";
import {
  EnableBankingError,
  enableBankingFromEnvironment,
  parseBalance,
  parseBankTransaction,
  type EnableBankingApi,
  type ParsedBankTransaction
} from "./enable-banking.js";


type BuildAppOptions = {
  database?: AppDatabase;
  enableBanking?: EnableBankingApi;
  https?: HttpsServerOptions;
  logger?: FastifyServerOptions["logger"];
  staticRoot?: string;
};

const SESSION_COOKIE = "gestio_session";
const SESSION_SECONDS = 24 * 60 * 60;
const PUBLIC_PATHS = new Set(["/", "/auth/state", "/auth/setup", "/auth/login", "/sw.js"]);

export function buildApp(options: BuildAppOptions = {}) {
  const database = options.database ?? openDatabase();
  let enableBanking = options.enableBanking;
  const bankApi = () => enableBanking ??= enableBankingFromEnvironment();
  const logger = options.logger ?? process.env.NODE_ENV !== "test";
  const app = Fastify({
    logController: new LogController({ disableRequestLogging: true }),
    logger,
    https: options.https ?? null
  } satisfies FastifyHttpsOptions<HttpsServer>);

  let backgroundSyncRunning = false;
  const backgroundSync = setInterval(async () => {
    if (backgroundSyncRunning) return;
    backgroundSyncRunning = true;
    try {
      const connections = database.sqlite.prepare(`
        SELECT authorization_id AS authorizationId, institution_id AS institutionId, state,
               session_id AS sessionId, consent_valid_until AS consentValidUntil, status,
               last_sync_at AS lastSyncAt, last_sync_error AS lastSyncError
        FROM bank_connections WHERE status = 'AUTHORIZED'
      `).all() as BankConnection[];
      for (const connection of connections) {
        try {
          await syncBankConnection(database, bankApi(), connection, connection.lastSyncAt === null, {},
            details => app.log.info(details, "Enable Banking background synchronization page"));
        } catch (error) {
          recordBankError(database, connection.authorizationId, error);
          app.log.warn(bankErrorLog(error, connection.authorizationId), "Enable Banking background synchronization deferred");
        }
      }
    } finally {
      backgroundSyncRunning = false;
    }
  }, 6 * 60 * 60 * 1000);
  backgroundSync.unref();
  app.addHook("onClose", () => {
    clearInterval(backgroundSync);
    database.close();
  });

  app.addHook("onRequest", async (request, reply) => {
    const path = request.url.split("?", 1)[0];
    if (PUBLIC_PATHS.has(path) || path.startsWith("/assets/")) {
      return;
    }

    const token = sessionToken(request.headers.cookie);
    const session = token && database.sqlite.prepare(
      "SELECT 1 FROM auth_sessions WHERE token_hash = ? AND expires_at > ?"
    ).get(hashSessionToken(token), nowSeconds());
    if (!session) {
      return reply.code(401).send({ error: "unauthorized" });
    }
  });

  app.register(fastifyStatic, { root: options.staticRoot ?? resolve("dist/web") });

  app.get("/", async (request, reply) => {
    const query = request.query as Record<string, unknown>;
    if (typeof query.code !== "string" && typeof query.state !== "string") {
      return reply.sendFile("index.html");
    }
    if (typeof query.code !== "string" || typeof query.state !== "string") {
      return reply.code(400).type("text/html").send(callbackPage("Retour bancaire incomplet."));
    }

    const connection = bankConnectionByState(database, query.state);
    if (!connection || connection.status !== "PENDING") {
      return reply.code(400).type("text/html").send(callbackPage("Connexion bancaire inconnue ou déjà utilisée."));
    }

    try {
      const session = await bankApi().request<Record<string, unknown>>("POST", "/sessions", {
        body: { code: query.code, authorization_id: connection.authorizationId }
      });
      const sessionId = requiredApiString(session.session_id, "session_id");
      const sessionData = await bankApi().request<Record<string, unknown>>("GET", `/sessions/${sessionId}`);
      const access = apiObject(sessionData.access, "access");
      const consentValidUntil = requiredApiString(access.valid_until, "access.valid_until");
      database.sqlite.prepare(`
        UPDATE bank_connections
        SET session_id = ?, consent_valid_until = ?, status = 'AUTHORIZED', last_sync_error = NULL,
            updated_at = CURRENT_TIMESTAMP
        WHERE authorization_id = ?
      `).run(sessionId, consentValidUntil, connection.authorizationId);

      try {
        await syncBankConnection(database, bankApi(), { ...connection, sessionId, consentValidUntil }, true, psuHeaders(request),
          details => app.log.info(details, "Enable Banking synchronization page"));
      } catch (error) {
        recordBankError(database, connection.authorizationId, error);
        app.log.warn(bankErrorLog(error, connection.authorizationId), "Enable Banking connected; initial synchronization deferred");
        return reply.type("text/html").send(callbackPage("Banque connectée. La première synchronisation sera reprise plus tard."));
      }
      return reply.type("text/html").send(callbackPage("Banque connectée. Vous pouvez fermer cet onglet."));
    } catch (error) {
      recordBankError(database, connection.authorizationId, error);
      app.log.error(bankErrorLog(error, connection.authorizationId), "Enable Banking callback failed");
      return reply.code(502).type("text/html").send(callbackPage("La connexion bancaire n’a pas pu être finalisée."));
    }
  });

  app.get("/auth/state", async () => ({
    configured: Boolean(database.sqlite.prepare("SELECT 1 FROM local_auth WHERE id = 1").get())
  }));

  app.post("/auth/setup", async (request, reply) => {
    if (database.sqlite.prepare("SELECT 1 FROM local_auth WHERE id = 1").get()) {
      return reply.code(409).send({ error: "auth_already_configured" });
    }

    const password = readPassword(request.body);
    const passwordHash = await hashPassword(password, { type: argon2id });
    const inserted = database.sqlite.prepare(
      "INSERT OR IGNORE INTO local_auth (id, password_hash) VALUES (1, ?)"
    ).run(passwordHash);
    if (!inserted.changes) {
      return reply.code(409).send({ error: "auth_already_configured" });
    }

    setSession(database, reply);
    return reply.code(204).send();
  });

  app.post("/auth/login", async (request, reply) => {
    const password = readPassword(request.body);
    const auth = database.sqlite.prepare(
      "SELECT password_hash AS passwordHash FROM local_auth WHERE id = 1"
    ).get() as { passwordHash: string } | undefined;
    if (!auth || !await verifyPassword(auth.passwordHash, password)) {
      return reply.code(401).send({ error: "invalid_credentials" });
    }

    setSession(database, reply);
    return reply.code(204).send();
  });

  app.post("/auth/logout", async (request, reply) => {
    const token = sessionToken(request.headers.cookie);
    if (token) {
      database.sqlite.prepare("DELETE FROM auth_sessions WHERE token_hash = ?").run(hashSessionToken(token));
    }
    reply.header("set-cookie", `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`);
    return reply.code(204).send();
  });

  app.post("/accounts", async (request, reply) => {
    const input = readAccountInput(request.body);
    const institutionId = input.institutionId ?? manualInstitutionId(database);
    if (!database.orm.select({ id: institutions.id }).from(institutions).where(eq(institutions.id, institutionId)).get()) {
      return reply.code(404).send({ error: "institution_not_found" });
    }
    const account = database.orm.insert(accounts).values({ ...input, institutionId }).returning().get();
    return reply.code(201).send(account);
  });

  app.post("/institutions", async (request, reply) => {
    const input = readInstitutionInput(request.body);
    const id = upsertInstitution(database, input.name, input.country);
    const institution = database.orm.select().from(institutions).where(eq(institutions.id, id)).get();
    return reply.code(201).send(institution);
  });

  app.get("/institutions", async () => database.orm.select().from(institutions).all());

  app.get("/accounts", async () => {
    return database.orm.select().from(accounts).all();
  });

  app.post("/transactions", async (request, reply) => {
    const input = readTransactionInput(request.body);
    const account = database.orm.select({ id: accounts.id }).from(accounts).where(eq(accounts.id, input.accountId)).get();
    if (!account) {
      return reply.code(404).send({ error: "account_not_found" });
    }

    const inserted = database.orm.insert(transactions)
      .values(input)
      .onConflictDoNothing({ target: [transactions.fingerprint, transactions.occurrence] })
      .returning()
      .get();
    const transaction = inserted ?? database.orm.select().from(transactions)
      .where(eq(transactions.fingerprint, input.fingerprint))
      .get();
    return reply.code(inserted ? 201 : 200).send(transaction);
  });

  app.get("/transactions", async (request) => {
    const query = request.query as Record<string, unknown>;
    const accountId = optionalQueryInteger(query.accountId, "accountId");
    const needsReview = optionalQueryBoolean(query.needsReview, "needsReview");
    const limit = optionalQueryInteger(query.limit, "limit") ?? 100;
    const offset = optionalQueryInteger(query.offset, "offset") ?? 0;
    if (limit < 1 || limit > 500) badRequest("limit must be between 1 and 500");

    const conditions: string[] = [];
    const parameters: Array<number> = [];
    if (accountId !== undefined) {
      conditions.push("account_id = ?");
      parameters.push(accountId);
    }
    if (needsReview !== undefined) {
      conditions.push("needs_review = ?");
      parameters.push(needsReview ? 1 : 0);
    }
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const rows = database.sqlite.prepare(`
      SELECT id, account_id AS accountId, transaction_date AS transactionDate,
             transaction_at AS transactionAt, label, amount_cents AS amountCents,
             source, needs_review AS needsReview, resolved_at AS resolvedAt, created_at AS createdAt
      FROM transactions
      ${where}
      ORDER BY transaction_date DESC, id DESC
      LIMIT ? OFFSET ?
    `).all(...parameters, limit, offset) as Array<Omit<UiTransaction, "needsReview"> & { needsReview: number }>;
    return { transactions: rows.map(row => ({ ...row, needsReview: Boolean(row.needsReview) })), limit, offset };
  });

  app.post("/transactions/resolve", async (request, reply) => {
    const transactionId = requiredInteger(objectBody(request.body).transactionId, "transactionId");
    const group = transactionGroup(database, transactionId);
    if (!group) return reply.code(404).send({ error: "transaction_not_found" });
    if (!reviewGroups(group.transactions).length) {
      return reply.code(409).send({ error: "transaction_group_not_ambiguous" });
    }
    const result = database.sqlite.prepare(`
      UPDATE transactions SET needs_review = 0, resolved_at = CURRENT_TIMESTAMP
      WHERE account_id = ? AND transaction_date = ? AND amount_cents = ?
    `).run(group.accountId, group.transactionDate, group.amountCents);
    return { resolved: result.changes };
  });

  app.delete<{ Params: { id: string } }>("/transactions/:id", async (request, reply) => {
    const transactionId = requiredInteger(Number(request.params.id), "id");
    const group = transactionGroup(database, transactionId);
    if (!group) return reply.code(404).send({ error: "transaction_not_found" });
    if (!reviewGroups(group.transactions).length) {
      return reply.code(409).send({ error: "transaction_group_not_ambiguous" });
    }
    if (group.transactions.every(transaction => transaction.source === "ENABLE_BANKING")) {
      return reply.code(409).send({ error: "transaction_group_api" });
    }
    database.sqlite.prepare("DELETE FROM transactions WHERE id = ?").run(transactionId);
    return reply.code(204).send();
  });

  app.post("/imports/csv", async (request, reply) => {
    const data = objectBody(request.body);
    const accountId = requiredInteger(data.accountId, "accountId");
    const bank = requiredString(data.bank, "bank");
    const bytes = requiredBase64(data.contentBase64, "contentBase64");
    const account = database.sqlite.prepare(`
      SELECT i.name AS institutionName
      FROM accounts a JOIN institutions i ON i.id = a.institution_id
      WHERE a.id = ?
    `).get(accountId) as { institutionName: string } | undefined;
    if (!account) {
      return reply.code(404).send({ error: "account_not_found" });
    }

    const format = bankCsvFormats[bank as keyof typeof bankCsvFormats];
    if (format && format.institutionName !== account.institutionName) {
      return reply.code(400).send({
        error: "csv_institution_mismatch",
        message: `Le fichier CSV ${bank} ne correspond pas à l’établissement « ${account.institutionName} » du compte cible.`
      });
    }
    if (format?.multiAccount) {
      return reply.code(400).send({
        error: "csv_accounts_not_separable",
        message: `Le fichier CSV ${bank} mélange plusieurs comptes et rien ne permet de les séparer. Utilisez la synchronisation API.`
      });
    }

    let parsed;
    try {
      parsed = parseBankCsv(bank, bytes);
    } catch (error) {
      if (error instanceof CsvFormatError) {
        return reply.code(400).send({ error: "csv_format_unrecognized", message: error.message });
      }
      throw error;
    }

    const imported = database.sqlite.transaction(() => {
      // ponytail: full account scan is enough for one user; filter by imported date range if history becomes large.
      const existing = database.sqlite.prepare(`
        SELECT transaction_date AS transactionDate, amount_cents AS amountCents, label
        FROM transactions WHERE account_id = ? ORDER BY id
      `).all(accountId) as Array<{ transactionDate: string; amountCents: number; label: string }>;
      const occurrences = new Map<string, number>();
      const candidates = parsed.transactions.map(transaction => {
        const input = readTransactionInput({ ...transaction, accountId, source: "CSV_IMPORT" });
        const occurrence = occurrences.get(input.fingerprint) ?? 0;
        occurrences.set(input.fingerprint, occurrence + 1);
        return { ...transaction, ...input, occurrence };
      });
      const candidateSet = new Set(candidates);
      const pending = deduplicateTransactions([existing, candidates]).transactions.filter(
        (transaction): transaction is typeof candidates[number] => candidateSet.has(transaction as typeof candidates[number])
      );
      const insert = database.sqlite.prepare(`
        INSERT OR IGNORE INTO transactions
          (account_id, transaction_date, transaction_at, label, amount_cents, source, fingerprint, occurrence)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      return pending.reduce((count, transaction) => count + insert.run(
        transaction.accountId,
        transaction.transactionDate,
        transaction.transactionAt,
        transaction.label,
        transaction.amountCents,
        transaction.source,
        transaction.fingerprint,
        transaction.occurrence
      ).changes, 0);
    })();

    return reply.code(200).send({
      read: parsed.transactions.length,
      imported,
      duplicates: parsed.transactions.length - imported,
      ignored: parsed.ignored
    });
  });

  app.post("/imports/pdf", async (request, reply) => {
    const data = objectBody(request.body);
    const pdf = requiredBase64(data.pdfBase64, "pdfBase64");
    const mapping = objectBody(data.accountIds);
    let statement;
    try {
      statement = await parsePdfStatement(pdf);
    } catch (error) {
      if (error instanceof PdfStatementError) {
        return reply.code(400).send({ error: "pdf_format_unrecognized", message: error.message });
      }
      throw error;
    }

    const ids = statement.accounts.map(account => mapping[account.key]);
    if (ids.some(id => id === undefined)) {
      badRequest(`accountIds must map every statement account: ${statement.accounts.map(account => account.key).join(", ")}`);
    }
    const accountIds = ids.map((id, index) => requiredInteger(id, `accountIds.${statement.accounts[index].key}`));
    if (new Set(accountIds).size !== accountIds.length) {
      badRequest("each statement account must map to a different accountId");
    }

    let imported = 0;
    let balancesImported = 0;
    let reviewNeeded = 0;
    database.sqlite.transaction(() => {
      for (const [index, statementAccount] of statement.accounts.entries()) {
        const accountId = accountIds[index];
        if (!database.orm.select({ id: accounts.id }).from(accounts).where(eq(accounts.id, accountId)).get()) {
          badRequest(`accountId mapped from ${statementAccount.key} does not exist`);
        }

        // ponytail: full account scan is enough for one user; filter by statement period if history becomes large.
        const existing = database.sqlite.prepare(`
          SELECT transaction_date AS transactionDate, amount_cents AS amountCents, label
          FROM transactions WHERE account_id = ? ORDER BY id
        `).all(accountId) as Array<{ transactionDate: string; amountCents: number; label: string }>;
        const occurrences = new Map<string, number>();
        const candidates = statementAccount.transactions.map(transaction => {
          const input = readTransactionInput({ ...transaction, accountId, source: "PDF_RELEVE" });
          const occurrence = occurrences.get(input.fingerprint) ?? 0;
          occurrences.set(input.fingerprint, occurrence + 1);
          return { ...input, transactionAt: null, occurrence };
        });
        const candidateSet = new Set(candidates);
        const deduplicated = deduplicateTransactions([existing, candidates]);
        const pending = deduplicated.transactions.filter(
          (transaction): transaction is typeof candidates[number] => candidateSet.has(transaction as typeof candidates[number])
        );
        const review = new Set(deduplicated.toReview);
        const insert = database.sqlite.prepare(`
          INSERT OR IGNORE INTO transactions
            (account_id, transaction_date, transaction_at, label, amount_cents, source, fingerprint, occurrence, needs_review)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const transaction of pending) {
          imported += insert.run(
            transaction.accountId,
            transaction.transactionDate,
            transaction.transactionAt,
            transaction.label,
            transaction.amountCents,
            transaction.source,
            transaction.fingerprint,
            transaction.occurrence,
            review.has(transaction) ? 1 : 0
          ).changes;
        }
        reviewNeeded += pending.filter(transaction => review.has(transaction)).length;

        database.sqlite.prepare(`
          UPDATE accounts
          SET known_since = CASE
            WHEN known_since IS NULL OR ? < known_since THEN ?
            ELSE known_since
          END
          WHERE id = ?
        `).run(statement.periodStart, statement.periodStart, accountId);
        balancesImported += database.sqlite.prepare(`
          UPDATE accounts
          SET balance_cents = ?, currency = 'EUR', last_synced_at = ?
          WHERE id = ? AND external_hash IS NULL
            AND (last_synced_at IS NULL OR substr(last_synced_at, 1, 10) < ?
              OR (substr(last_synced_at, 1, 10) = ? AND balance_cents IS NOT ?))
        `).run(
          statementAccount.closingBalanceCents,
          `${statementAccount.balanceDate}T23:59:59.999Z`,
          accountId,
          statementAccount.balanceDate,
          statementAccount.balanceDate,
          statementAccount.closingBalanceCents
        ).changes;
      }
    })();

    const total = statement.accounts.reduce((count, account) => count + account.transactions.length, 0);
    return reply.code(200).send({
      institution: statement.institution,
      imported,
      duplicates: total - imported,
      balancesImported,
      reviewNeeded
    });
  });

  app.get("/balance", async () => {
    const rows = database.sqlite.prepare(`
      SELECT
        a.id,
        a.institution_id AS institutionId,
        i.name AS institutionName,
        i.country AS institutionCountry,
        a.name,
        a.type,
        CASE WHEN a.external_hash IS NOT NULL THEN a.balance_cents
             ELSE COALESCE(a.balance_cents, SUM(t.amount_cents), 0) END AS balanceCents,
        a.currency,
        CASE WHEN a.external_hash IS NOT NULL THEN a.last_synced_at
             ELSE COALESCE(a.last_synced_at, MAX(t.created_at)) END AS updatedAt,
        a.known_since AS knownSince
      FROM accounts a
      JOIN institutions i ON i.id = a.institution_id
      LEFT JOIN transactions t ON t.account_id = a.id
      GROUP BY a.id
      ORDER BY a.id
    `).all() as Array<{
      id: number;
      institutionId: number;
      institutionName: string;
      institutionCountry: string;
      name: string;
      type: AccountType;
      balanceCents: number | null;
      updatedAt: string | null;
      currency: string | null;
      knownSince: string | null;
    }>;

    const institutionBalances = new Map<number, {
      id: number;
      name: string;
      country: string;
      balanceCents: number;
      accounts: typeof rows;
    }>();
    for (const row of rows) {
      const institution = institutionBalances.get(row.institutionId) ?? {
        id: row.institutionId,
        name: row.institutionName,
        country: row.institutionCountry,
        balanceCents: 0,
        accounts: []
      };
      institution.balanceCents += row.balanceCents ?? 0;
      institution.accounts.push(row);
      institutionBalances.set(row.institutionId, institution);
    }

    return {
      totalCents: rows.reduce((sum, row) => sum + (row.balanceCents ?? 0), 0),
      unknownBalanceCount: rows.filter(row => row.balanceCents === null).length,
      accounts: rows,
      institutions: [...institutionBalances.values()]
    };
  });

  app.post("/enable-banking/connect", async (request, reply) => {
    const input = readBankConnectionInput(request.body);
    try {
      const catalog = await bankApi().request<unknown>("GET", "/aspsps", { query: { country: input.country } });
      const aspsp = aspspList(catalog).find(candidate => candidate.name === input.name && candidate.country === input.country);
      if (!aspsp) return reply.code(404).send({ error: "aspsp_not_found" });
      const maximumConsent = requiredPositiveInteger(aspsp.maximum_consent_validity, "maximum_consent_validity");
      const validUntil = new Date(Date.now() + Math.max(1, maximumConsent - 60) * 1000).toISOString();
      const state = randomBytes(24).toString("hex");
      const authorization = await bankApi().request<Record<string, unknown>>("POST", "/auth", {
        body: {
          access: { valid_until: validUntil },
          aspsp: { name: input.name, country: input.country },
          state,
          redirect_url: process.env.ENABLE_BANKING_REDIRECT_URL ?? "https://localhost:3443/",
          psu_type: "personal"
        }
      });
      const authorizationId = requiredApiString(authorization.authorization_id, "authorization_id");
      const url = requiredApiString(authorization.url, "url");
      const institutionId = upsertInstitution(database, input.name, input.country);
      database.sqlite.prepare(`
        INSERT INTO bank_connections (authorization_id, institution_id, state, status)
        VALUES (?, ?, ?, 'PENDING')
      `).run(authorizationId, institutionId, state);
      return reply.code(201).send({ authorizationId, url, status: "PENDING" });
    } catch (error) {
      return sendBankError(reply, error);
    }
  });

  app.get<{ Params: { authorizationId: string } }>("/enable-banking/status/:authorizationId", async (request, reply) => {
    const connection = bankConnection(database, request.params.authorizationId);
    if (!connection) return reply.code(404).send({ error: "bank_connection_not_found" });
    const expired = connection.consentValidUntil !== null && Date.parse(connection.consentValidUntil) <= Date.now();
    return {
      authorizationId: connection.authorizationId,
      status: expired ? "EXPIRED" : connection.status,
      consentValidUntil: connection.consentValidUntil,
      lastSyncedAt: connection.lastSyncAt,
      lastSyncError: connection.lastSyncError
    };
  });

  app.post<{ Params: { authorizationId: string } }>("/enable-banking/sync/:authorizationId", async (request, reply) => {
    const connection = bankConnection(database, request.params.authorizationId);
    if (!connection) return reply.code(404).send({ error: "bank_connection_not_found" });
    try {
      const result = await syncBankConnection(database, bankApi(), connection, connection.lastSyncAt === null, psuHeaders(request),
        details => app.log.info(details, "Enable Banking synchronization page"));
      return result;
    } catch (error) {
      recordBankError(database, connection.authorizationId, error);
      app.log.warn(bankErrorLog(error, connection.authorizationId), "Enable Banking user synchronization deferred");
      return sendBankError(reply, error, connection.lastSyncAt);
    }
  });

  return app;
}

function readAccountInput(body: unknown) {
  const data = objectBody(body);
  const name = requiredString(data.name, "name");
  const type = oneOf(data.type, accountTypes, "type");
  const institutionId = data.institutionId === undefined ? undefined : requiredInteger(data.institutionId, "institutionId");
  return { name, type, institutionId };
}

function readInstitutionInput(body: unknown) {
  const data = objectBody(body);
  return { name: requiredString(data.name, "name"), country: countryCode(data.country) };
}

function readBankConnectionInput(body: unknown) {
  const data = objectBody(body);
  return { name: requiredString(data.name, "name"), country: countryCode(data.country) };
}

function readPassword(body: unknown) {
  const password = objectBody(body).password;
  if (typeof password !== "string" || password.length < 12 || password.length > 1024) {
    badRequest("password must contain between 12 and 1024 characters");
  }
  return password;
}

function setSession(database: AppDatabase, reply: { header: (name: string, value: string) => unknown }) {
  const token = randomBytes(32).toString("hex");
  database.sqlite.prepare("DELETE FROM auth_sessions WHERE expires_at <= ?").run(nowSeconds());
  database.sqlite.prepare("INSERT INTO auth_sessions (token_hash, expires_at) VALUES (?, ?)")
    .run(hashSessionToken(token), nowSeconds() + SESSION_SECONDS);
  reply.header(
    "set-cookie",
    `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_SECONDS}`
  );
}

function sessionToken(cookieHeader: string | undefined) {
  return cookieHeader?.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE}=([a-f0-9]{64})(?:;|$)`))?.[1];
}

function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function nowSeconds() {
  return Math.floor(Date.now() / 1000);
}

function readTransactionInput(body: unknown) {
  const data = objectBody(body);
  const accountId = requiredInteger(data.accountId, "accountId");
  const transactionDate = requiredDate(data.transactionDate, "transactionDate");
  const label = requiredString(data.label, "label");
  const amountCents = requiredInteger(data.amountCents, "amountCents");
  const source = oneOf(data.source ?? "MANUEL", transactionSources, "source");
  const fingerprint = hashFingerprint({ accountId, transactionDate, label, amountCents });

  return { accountId, transactionDate, label, amountCents, source, fingerprint, occurrence: 0 };
}

function objectBody(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    badRequest("body must be an object");
  }
  return value as Record<string, unknown>;
}

function requiredString(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim()) {
    badRequest(`${field} must be a non-empty string`);
  }
  return value.trim();
}

function requiredInteger(value: unknown, field: string): number {
  if (!Number.isSafeInteger(value)) {
    badRequest(`${field} must be an integer`);
  }
  return value as number;
}

function optionalQueryInteger(value: unknown, field: string) {
  if (value === undefined) return undefined;
  if (typeof value !== "string" || !/^\d+$/.test(value)) badRequest(`${field} must be a non-negative integer`);
  return requiredInteger(Number(value), field);
}

function optionalQueryBoolean(value: unknown, field: string) {
  if (value === undefined) return undefined;
  if (value === "true") return true;
  if (value === "false") return false;
  badRequest(`${field} must be true or false`);
}

function requiredBase64(value: unknown, field: string) {
  const base64 = requiredString(value, field);
  if (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(base64)) {
    badRequest(`${field} must be valid base64`);
  }
  return Buffer.from(base64, "base64");
}

function requiredDate(value: unknown, field: string) {
  const date = requiredString(value, field);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(`${date}T00:00:00.000Z`))) {
    badRequest(`${field} must be an ISO date`);
  }
  return date;
}

function oneOf<T extends readonly string[]>(value: unknown, allowed: T, field: string): T[number] {
  if (typeof value !== "string" || !(allowed as readonly string[]).includes(value)) {
    badRequest(`${field} must be one of: ${allowed.join(", ")}`);
  }
  return value as T[number];
}

function hashFingerprint(input: {
  accountId: number;
  transactionDate: string;
  label: string;
  amountCents: number;
  occurrence?: number;
}) {
  const content = `${input.accountId}\0${input.transactionDate}\0${input.amountCents}\0${normalizeTransactionLabel(input.label)}`;
  return createHash("sha256")
    .update(input.occurrence ? `${content}\0${input.occurrence}` : content)
    .digest("hex");
}

function badRequest(message: string): never {
  const error = new Error(message) as Error & { statusCode: number };
  error.statusCode = 400;
  throw error;
}

type BankConnection = {
  authorizationId: string;
  institutionId: number;
  state: string;
  sessionId: string | null;
  consentValidUntil: string | null;
  status: string;
  lastSyncAt: string | null;
  lastSyncError: string | null;
};

type StoredTransaction = ParsedBankTransaction & { id: number };

function transactionGroup(database: AppDatabase, transactionId: number) {
  const seed = database.sqlite.prepare(`
    SELECT account_id AS accountId, transaction_date AS transactionDate, amount_cents AS amountCents
    FROM transactions WHERE id = ?
  `).get(transactionId) as Pick<UiTransaction, "accountId" | "transactionDate" | "amountCents"> | undefined;
  if (!seed) return undefined;
  const rows = database.sqlite.prepare(`
    SELECT id, account_id AS accountId, transaction_date AS transactionDate, label,
           amount_cents AS amountCents, source, needs_review AS needsReview, resolved_at AS resolvedAt
    FROM transactions
    WHERE account_id = ? AND transaction_date = ? AND amount_cents = ?
  `).all(seed.accountId, seed.transactionDate, seed.amountCents) as Array<Omit<UiTransaction, "needsReview"> & { needsReview: number }>;
  return { ...seed, transactions: rows.map(row => ({ ...row, needsReview: Boolean(row.needsReview) })) };
}

function bankConnection(database: AppDatabase, authorizationId: string) {
  return database.sqlite.prepare(`
    SELECT authorization_id AS authorizationId, institution_id AS institutionId, state,
           session_id AS sessionId, consent_valid_until AS consentValidUntil, status,
           last_sync_at AS lastSyncAt, last_sync_error AS lastSyncError
    FROM bank_connections WHERE authorization_id = ?
  `).get(authorizationId) as BankConnection | undefined;
}

function bankConnectionByState(database: AppDatabase, state: string) {
  return database.sqlite.prepare(`
    SELECT authorization_id AS authorizationId, institution_id AS institutionId, state,
           session_id AS sessionId, consent_valid_until AS consentValidUntil, status,
           last_sync_at AS lastSyncAt, last_sync_error AS lastSyncError
    FROM bank_connections WHERE state = ?
  `).get(state) as BankConnection | undefined;
}

async function syncBankConnection(
  database: AppDatabase,
  api: EnableBankingApi,
  connection: BankConnection,
  firstSync: boolean,
  headers: Record<string, string>,
  logPage: (details: Record<string, unknown>) => void
) {
  if (!connection.sessionId) throw new EnableBankingError(409, "SESSION_NOT_AUTHORIZED", "Session is not authorized");
  const session = await api.request<Record<string, unknown>>("GET", `/sessions/${connection.sessionId}`);
  const access = apiObject(session.access, "access");
  const consentValidUntil = requiredApiString(access.valid_until, "access.valid_until");
  if (session.status !== "AUTHORIZED" || Date.parse(consentValidUntil) <= Date.now()) {
    database.sqlite.prepare("UPDATE bank_connections SET status = 'EXPIRED', consent_valid_until = ?, updated_at = CURRENT_TIMESTAMP WHERE authorization_id = ?")
      .run(consentValidUntil, connection.authorizationId);
    throw new EnableBankingError(409, "EXPIRED_SESSION", "Bank consent has expired");
  }

  if (!Array.isArray(session.accounts_data)) throw new Error("accounts_data must be an array");
  const accountValues = session.accounts_data;
  let totalWritten = 0;
  let totalPages = 0;
  let oldestDate: string | null = null;
  const syncedAt = new Date().toISOString();

  for (const value of accountValues) {
    const accountReference = apiObject(value, "account reference");
    const externalUid = requiredApiString(accountReference.uid, "account.uid");
    const externalHash = requiredApiString(accountReference.identification_hash, "account.identification_hash");
    const account = await api.request<Record<string, unknown>>("GET", `/accounts/${externalUid}/details`, { headers });
    const name = optionalApiString(account.name) ?? optionalApiString(account.product) ?? "Compte bancaire";
    const type: AccountType = account.cash_account_type === "CACC" ? "BANK" : "OTHER";
    const storedAccount = database.sqlite.prepare(`
      INSERT INTO accounts (institution_id, name, type, external_uid, external_hash)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(external_hash) DO UPDATE SET
        institution_id = excluded.institution_id,
        name = excluded.name,
        type = excluded.type,
        external_uid = excluded.external_uid
      RETURNING id
    `).get(connection.institutionId, name, type, externalUid, externalHash) as { id: number };

    const existing = database.sqlite.prepare(`
      SELECT id, transaction_date AS transactionDate, amount_cents AS amountCents,
             label, external_reference AS externalReference
      FROM transactions WHERE account_id = ? ORDER BY id
    `).all(storedAccount.id) as StoredTransaction[];
    const incoming: ParsedBankTransaction[] = [];
    const insertedIds = new Map<ParsedBankTransaction, number>();
    const baseQuery: Record<string, string> = { strategy: firstSync ? "longest" : "default" };
    let query: Record<string, string> = { ...baseQuery };

    for (let page = 1; page <= 1000; page += 1) {
      const pageResponse = await api.request<Record<string, unknown>>(
        "GET",
        `/accounts/${externalUid}/transactions`,
        { query, headers }
      );
      if (!Array.isArray(pageResponse.transactions)) throw new Error("transactions must be an array");
      const pageTransactions = pageResponse.transactions.map(parseBankTransaction);
      incoming.push(...pageTransactions);
      const deduplicated = deduplicateTransactions([existing, incoming]);
      const kept = new Set(deduplicated.transactions);
      const toReview = new Set(deduplicated.toReview);
      let written = 0;

      database.sqlite.transaction(() => {
        for (const transaction of pageTransactions) {
          if (!kept.has(transaction)) continue;
          const fingerprint = nextFingerprint(database, storedAccount.id, transaction);
          const result = database.sqlite.prepare(`
            INSERT INTO transactions
              (account_id, transaction_date, label, amount_cents, source, fingerprint, external_reference, needs_review)
            VALUES (?, ?, ?, ?, 'ENABLE_BANKING', ?, ?, ?)
          `).run(
            storedAccount.id,
            transaction.transactionDate,
            transaction.label ?? "",
            transaction.amountCents,
            fingerprint,
            transaction.externalReference,
            toReview.has(transaction) ? 1 : 0
          );
          insertedIds.set(transaction, Number(result.lastInsertRowid));
          written += 1;
        }

        for (const transaction of toReview) {
          const id = "id" in transaction ? transaction.id : insertedIds.get(transaction as ParsedBankTransaction);
          if (id !== undefined) database.sqlite.prepare(
            "UPDATE transactions SET needs_review = 1 WHERE id = ? AND resolved_at IS NULL"
          ).run(id);
        }
      })();

      totalWritten += written;
      totalPages += 1;
      const dates = incoming.map(transaction => transaction.transactionDate);
      const accountOldest = dates.length ? dates.reduce((left, right) => left < right ? left : right) : null;
      if (accountOldest && (!oldestDate || accountOldest < oldestDate)) oldestDate = accountOldest;
      const continuation = optionalApiString(pageResponse.continuation_key);
      logPage({
        authorizationId: connection.authorizationId,
        accountId: storedAccount.id,
        page,
        received: pageTransactions.length,
        written,
        oldestDate: accountOldest,
        continued: Boolean(continuation)
      });
      if (!continuation) break;
      query = { ...baseQuery, continuation_key: continuation };
      if (page === 1000) throw new Error("Enable Banking pagination exceeded 1000 pages");
    }

    const balance = parseBalance(await api.request<unknown>("GET", `/accounts/${externalUid}/balances`, { headers }));
    const accountOldest = incoming.length
      ? incoming.map(transaction => transaction.transactionDate).reduce((left, right) => left < right ? left : right)
      : null;
    database.sqlite.prepare(`
      UPDATE accounts
      SET balance_cents = ?, currency = ?, last_synced_at = ?,
          known_since = CASE
            WHEN ? IS NULL THEN known_since
            WHEN known_since IS NULL OR ? < known_since THEN ?
            ELSE known_since
          END
      WHERE id = ?
    `).run(balance.balanceCents, balance.currency, syncedAt, accountOldest, accountOldest, accountOldest, storedAccount.id);
  }

  database.sqlite.prepare(`
    UPDATE bank_connections
    SET status = 'AUTHORIZED', consent_valid_until = ?, last_sync_at = ?, last_sync_error = NULL,
        updated_at = CURRENT_TIMESTAMP
    WHERE authorization_id = ?
  `).run(consentValidUntil, syncedAt, connection.authorizationId);
  logPage({
    authorizationId: connection.authorizationId,
    completed: true,
    pages: totalPages,
    transactionsWritten: totalWritten,
    oldestDate,
    stopReason: "continuation_exhausted"
  });
  return { status: "AUTHORIZED", pages: totalPages, transactionsWritten: totalWritten, oldestDate, syncedAt };
}

function nextFingerprint(database: AppDatabase, accountId: number, transaction: ParsedBankTransaction) {
  for (let occurrence = 0; ; occurrence += 1) {
    const fingerprint = hashFingerprint({
      accountId,
      transactionDate: transaction.transactionDate,
      label: transaction.label ?? "",
      amountCents: transaction.amountCents,
      occurrence
    });
    if (!database.sqlite.prepare("SELECT 1 FROM transactions WHERE fingerprint = ?").get(fingerprint)) return fingerprint;
  }
}

function upsertInstitution(database: AppDatabase, name: string, country: string) {
  return (database.sqlite.prepare(`
    INSERT INTO institutions (name, country) VALUES (?, ?)
    ON CONFLICT(name, country) DO UPDATE SET name = excluded.name
    RETURNING id
  `).get(name, country) as { id: number }).id;
}

function manualInstitutionId(database: AppDatabase) {
  return upsertInstitution(database, "Comptes manuels", "XX");
}

function aspspList(value: unknown) {
  const list = Array.isArray(value) ? value : apiObject(value, "ASPSP catalog").aspsps;
  if (!Array.isArray(list)) throw new Error("ASPSP catalog must be an array");
  return list.map(candidate => apiObject(candidate, "ASPSP"));
}

function apiObject(value: unknown, field: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${field} must be an object`);
  return value as Record<string, unknown>;
}

function requiredApiString(value: unknown, field: string) {
  const result = optionalApiString(value);
  if (!result) throw new Error(`${field} must be a non-empty string`);
  return result;
}

function optionalApiString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function requiredPositiveInteger(value: unknown, field: string) {
  if (!Number.isSafeInteger(value) || Number(value) <= 0) throw new Error(`${field} must be a positive integer`);
  return Number(value);
}

function countryCode(value: unknown) {
  const country = requiredString(value, "country").toUpperCase();
  if (!/^[A-Z]{2}$/.test(country)) badRequest("country must be an ISO 3166-1 alpha-2 code");
  return country;
}

function psuHeaders(request: FastifyRequest) {
  const headers: Record<string, string> = { "psu-ip-address": request.ip };
  if (typeof request.headers["user-agent"] === "string") headers["psu-user-agent"] = request.headers["user-agent"];
  return headers;
}

function recordBankError(database: AppDatabase, authorizationId: string, error: unknown) {
  const code = error instanceof EnableBankingError ? error.code : "SYNC_FAILED";
  database.sqlite.prepare(`
    UPDATE bank_connections
    SET status = CASE WHEN status = 'EXPIRED' THEN status ELSE 'FAILED' END,
        last_sync_error = ?, updated_at = CURRENT_TIMESTAMP
    WHERE authorization_id = ?
  `).run(code, authorizationId);
}

function sendBankError(reply: FastifyReply, error: unknown, lastSuccessfulSync: string | null = null) {
  if (error instanceof EnableBankingError && error.status === 429) {
    return reply.code(429).send({ error: "aspsp_rate_limited", retryAfterHours: 6, lastSuccessfulSync });
  }
  if (error instanceof EnableBankingError && error.code === "WRONG_TRANSACTIONS_PERIOD") {
    return reply.code(409).send({ error: "history_window_exceeded", lastSuccessfulSync });
  }
  if (error instanceof EnableBankingError && error.code === "EXPIRED_SESSION") {
    return reply.code(409).send({ error: "consent_expired", lastSuccessfulSync });
  }
  if (error instanceof EnableBankingError && error.status === 403) {
    return reply.code(502).send({ error: "enable_banking_application_inactive" });
  }
  return reply.code(502).send({ error: "enable_banking_unavailable", lastSuccessfulSync });
}

function bankErrorLog(error: unknown, authorizationId: string) {
  return {
    authorizationId,
    status: error instanceof EnableBankingError ? error.status : undefined,
    code: error instanceof EnableBankingError ? error.code : "SYNC_FAILED",
    message: error instanceof Error ? error.message : String(error)
  };
}

function callbackPage(message: string) {
  return `<!doctype html><html lang="fr"><meta charset="utf-8"><title>Gestio</title><body><p>${message}</p></body></html>`;
}
