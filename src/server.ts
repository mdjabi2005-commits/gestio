import { createHash, randomBytes } from "node:crypto";
import type { Server as HttpsServer, ServerOptions as HttpsServerOptions } from "node:https";
import { argon2id, hash as hashPassword, verify as verifyPassword } from "argon2";
import Fastify, { type FastifyHttpsOptions, type FastifyServerOptions } from "fastify";
import { eq } from "drizzle-orm";
import { accounts, accountTypes, transactions, transactionSources, type AccountType } from "./schema.js";
import { openDatabase, type AppDatabase } from "./db.js";
import { normalizeTransactionLabel } from "./deduplication.js";

type BuildAppOptions = {
  database?: AppDatabase;
  https?: HttpsServerOptions;
  logger?: FastifyServerOptions["logger"];
};

const SESSION_COOKIE = "gestio_session";
const SESSION_SECONDS = 24 * 60 * 60;
const PUBLIC_PATHS = new Set(["/", "/auth/setup", "/auth/login"]);

export function buildApp(options: BuildAppOptions = {}) {
  const database = options.database ?? openDatabase();
  const logger = options.logger ?? process.env.NODE_ENV !== "test";
  const app = Fastify({
    logger,
    https: options.https ?? null
  } satisfies FastifyHttpsOptions<HttpsServer>);

  app.addHook("onClose", () => {
    database.close();
  });

  app.addHook("onRequest", async (request, reply) => {
    if (PUBLIC_PATHS.has(request.url.split("?", 1)[0])) {
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

  app.get("/", async () => ({ name: "gestio", status: "ok" }));

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
    const account = database.orm.insert(accounts).values(input).returning().get();
    return reply.code(201).send(account);
  });

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
      .onConflictDoNothing({ target: transactions.fingerprint })
      .returning()
      .get();
    const transaction = inserted ?? database.orm.select().from(transactions)
      .where(eq(transactions.fingerprint, input.fingerprint))
      .get();
    return reply.code(inserted ? 201 : 200).send(transaction);
  });

  app.get("/balance", async () => {
    const rows = database.sqlite.prepare(`
      SELECT
        a.id,
        a.name,
        a.type,
        COALESCE(SUM(t.amount_cents), 0) AS balanceCents,
        MAX(t.created_at) AS updatedAt
      FROM accounts a
      LEFT JOIN transactions t ON t.account_id = a.id
      GROUP BY a.id
      ORDER BY a.id
    `).all() as Array<{
      id: number;
      name: string;
      type: AccountType;
      balanceCents: number;
      updatedAt: string | null;
    }>;

    return {
      totalCents: rows.reduce((sum, row) => sum + row.balanceCents, 0),
      accounts: rows
    };
  });

  return app;
}

function readAccountInput(body: unknown) {
  const data = objectBody(body);
  const name = requiredString(data.name, "name");
  const type = oneOf(data.type, accountTypes, "type");
  return { name, type };
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

  return { accountId, transactionDate, label, amountCents, source, fingerprint };
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
}) {
  return createHash("sha256")
    .update(`${input.accountId}\0${input.transactionDate}\0${input.amountCents}\0${normalizeTransactionLabel(input.label)}`)
    .digest("hex");
}

function badRequest(message: string): never {
  const error = new Error(message) as Error & { statusCode: number };
  error.statusCode = 400;
  throw error;
}
