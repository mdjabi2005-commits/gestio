import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test, { type TestContext } from "node:test";
import { openDatabase } from "./db.js";
import { decimalCents, EnableBankingError, parseBalance, parseBankTransaction, type EnableBankingApi } from "./enable-banking.js";
import { buildApp } from "./server.js";

type ApiOptions = {
  body?: unknown;
  headers?: Record<string, string>;
  query?: Record<string, string>;
};

class FakeEnableBanking implements EnableBankingApi {
  calls: Array<{ method: string; path: string; options: ApiOptions }> = [];
  state = "";
  rateLimited = false;
  transactionDates = ["2026-05-04", "2026-05-05"];
  transactionLabels = ["Salaire", "Courses"];
  failDuringPagination = false;

  async request<T>(method: "GET" | "POST", path: string, options: ApiOptions = {}): Promise<T> {
    this.calls.push({ method, path, options });
    if (method === "GET" && path === "/aspsps") {
      return { aspsps: [{ name: "Banque Test", country: "FR", maximum_consent_validity: 90 }] } as T;
    }
    if (method === "POST" && path === "/auth") {
      this.state = (options.body as { state: string }).state;
      return { authorization_id: "authorization-1", url: "https://bank.example/authorize" } as T;
    }
    if (method === "POST" && path === "/sessions") {
      return { session_id: "session-1" } as T;
    }
    if (method === "GET" && path === "/sessions/session-1") {
      return {
        status: "AUTHORIZED",
        access: { valid_until: "2027-01-01T00:00:00Z" },
        accounts_data: [{ uid: "account-session-uid", identification_hash: "stable-account-hash" }]
      } as T;
    }
    if (method === "GET" && path === "/accounts/account-session-uid/details") {
      return {
        name: "Compte courant",
        cash_account_type: "CACC"
      } as T;
    }
    if (method === "GET" && path === "/accounts/account-session-uid/balances") {
      return {
        balances: [{ balance_type: "CLAV", balance_amount: { amount: "100.00", currency: "EUR" } }]
      } as T;
    }
    if (method === "GET" && path === "/accounts/account-session-uid/transactions") {
      if (this.rateLimited) throw new EnableBankingError(429, "ASPSP_RATE_LIMIT_EXCEEDED", "rate limited");
      if (this.failDuringPagination) {
        if (options.query?.continuation_key === "failing-page-2") throw new Error("page 2 failed");
        return {
          transactions: [{
            booking_date: "2026-08-03",
            credit_debit_indicator: "CRDT",
            transaction_amount: { amount: "12.34", currency: "EUR" },
            remittance_information: ["Page acquise"]
          }],
          continuation_key: "failing-page-2"
        } as T;
      }
      if (options.query?.strategy === "longest" && !options.query.continuation_key) {
        return { transactions: [], continuation_key: "page-2" } as T;
      }
      if (options.query?.strategy === "longest" && options.query.continuation_key === "page-2") {
        return { transactions: [], continuation_key: "page-3" } as T;
      }
      return {
        transactions: [
          {
            booking_date: this.transactionDates[0],
            credit_debit_indicator: "CRDT",
            transaction_amount: { amount: "10", currency: "USD" },
            remittance_information: [this.transactionLabels[0]],
            entry_reference: "synthetic.0"
          },
          {
            booking_date: this.transactionDates[1],
            credit_debit_indicator: "DBIT",
            transaction_amount: { amount: "5.00", currency: "USD" },
            remittance_information: [this.transactionLabels[1]],
            entry_reference: "synthetic.1"
          }
        ]
      } as T;
    }
    throw new Error(`Unexpected Enable Banking call: ${method} ${path}`);
  }
}

test("parses bank money without floating point and signs it from the indicator", () => {
  assert.equal(decimalCents("90071992547409.91"), Number.MAX_SAFE_INTEGER);
  assert.deepEqual(parseBankTransaction({
    booking_date: "2026-08-02",
    credit_debit_indicator: "DBIT",
    transaction_amount: { amount: "12.34", currency: "EUR" }
  }), {
    transactionDate: "2026-08-02",
    amountCents: -1_234,
    label: "",
    externalReference: null
  });
});

test("accepts lossless Trade Republic amounts and rejects real sub-cent values", () => {
  const transaction = {
    booking_date: "2026-08-04",
    credit_debit_indicator: "CRDT",
    transaction_amount: { amount: "-12.340000", currency: "EUR" },
    remittance_information: null
  };
  assert.deepEqual(parseBankTransaction(transaction), {
    transactionDate: "2026-08-04",
    amountCents: 1_234,
    label: "",
    externalReference: null
  });
  assert.throws(
    () => parseBankTransaction({ ...transaction, remittance_information: [null] }),
    { message: "remittance_information must be an array of strings" }
  );
  assert.deepEqual(parseBalance({
    balances: [{ balance_type: "OTHR", balance_amount: { amount: "0.470000", currency: "EUR" } }]
  }), { balanceCents: 47, currency: "EUR" });
  assert.throws(
    () => decimalCents("0.435", true),
    { message: "amount must be a decimal with at most two fraction digits" }
  );
});

test("refuses to guess between multiple unknown balance types", () => {
  assert.throws(() => parseBalance({ balances: [
    { balance_type: "OTHR", balance_amount: { amount: "1.00", currency: "EUR" } },
    { balance_type: "INFO", balance_amount: { amount: "2.00", currency: "EUR" } }
  ] }), /OTHR, INFO/);
});

test("replays the local Trade Republic capture", {
  skip: process.env.GESTIO_SKIP_CORPUS === "1"
}, () => {
  const lab = process.env.GESTIO_LAB_CORPUS ?? "/mnt/c/Users/djabi/gestio/.lamoms/lab/agy";
  const transactions = JSON.parse(readFileSync(join(lab, "tr_transactions_raw.json"), "utf8")) as {
    transactions: unknown[];
  };

  assert.equal(transactions.transactions.map(parseBankTransaction).length, 43);
  assert.deepEqual(
    parseBalance(JSON.parse(readFileSync(join(lab, "tr_balances_raw.json"), "utf8"))),
    { balanceCents: 47, currency: "EUR" }
  );
});

test("connects out-of-band, exhausts empty pages, stores API balance freshness, and resyncs idempotently", async (t) => {
  const dir = mkdtempSync(join(tmpdir(), "gestio-enable-banking-"));
  const database = openDatabase({ path: join(dir, "gestio.db"), key: "test-db-key-32-random-characters" });
  const api = new FakeEnableBanking();
  let logs = "";
  const app = buildApp({
    database,
    enableBanking: api,
    logger: { stream: { write: (chunk: string) => { logs += chunk; } } }
  });
  t.after(async () => {
    await app.close();
    rmSync(dir, { recursive: true, force: true });
  });

  const setup = await app.inject({
    method: "POST",
    url: "/auth/setup",
    payload: { password: "correct horse battery staple" }
  });
  const cookie = String(setup.headers["set-cookie"]).split(";", 1)[0];
  const connectedAt = Date.now();
  const connect = await app.inject({
    method: "POST",
    url: "/enable-banking/connect",
    headers: { cookie },
    payload: { name: "Banque Test", country: "fr" }
  });
  assert.equal(connect.statusCode, 201);
  assert.deepEqual(connect.json(), {
    authorizationId: "authorization-1",
    url: "https://bank.example/authorize",
    status: "PENDING"
  });
  const authBody = api.calls.find(call => call.path === "/auth")?.options.body as {
    access: { valid_until: string };
    redirect_url: string;
  };
  assert.equal(authBody.redirect_url, "https://localhost:3443/");
  assert.ok(Date.parse(authBody.access.valid_until) > connectedAt);
  assert.ok(Date.parse(authBody.access.valid_until) <= connectedAt + 90_000);

  const callback = await app.inject({
    method: "GET",
    url: `/?code=bank-code&state=${api.state}`,
    headers: { "user-agent": "Gestio test browser" },
    remoteAddress: "192.0.2.10"
  });
  assert.equal(callback.statusCode, 200);
  assert.match(callback.body, /Banque connectée/);
  assert.equal(logs.includes("bank-code"), false);
  assert.equal(logs.includes(api.state), false);

  const transactionCalls = api.calls.filter(call => call.path.endsWith("/transactions"));
  assert.equal(transactionCalls.length, 3);
  assert.deepEqual(transactionCalls.map(call => call.options.query), [
    { strategy: "longest" },
    { strategy: "longest", continuation_key: "page-2" },
    { strategy: "longest", continuation_key: "page-3" }
  ]);
  assert.equal(transactionCalls[0].options.headers?.["psu-ip-address"], "192.0.2.10");
  assert.equal(transactionCalls[0].options.headers?.["psu-user-agent"], "Gestio test browser");
  assert.match(logs, /"received":0/);
  assert.match(logs, /"continued":true/);

  const status = await app.inject({
    method: "GET",
    url: "/enable-banking/status/authorization-1",
    headers: { cookie }
  });
  assert.equal(status.statusCode, 200);
  assert.equal(status.json().consentValidUntil, "2027-01-01T00:00:00Z");

  const beforeResync = await app.inject({ method: "GET", url: "/balance", headers: { cookie } });
  assert.equal(beforeResync.statusCode, 200);
  assert.equal(beforeResync.json().totalCents, 10_000);
  assert.equal(beforeResync.json().accounts[0].currency, "EUR");
  assert.equal(beforeResync.json().accounts[0].knownSince, "2026-05-04");
  assert.equal(database.sqlite.prepare("SELECT COUNT(*) FROM transactions").pluck().get(), 2);

  const resync = await app.inject({
    method: "POST",
    url: "/enable-banking/sync/authorization-1",
    headers: { cookie, "user-agent": "Gestio test browser" },
    remoteAddress: "192.0.2.10"
  });
  assert.equal(resync.statusCode, 200);
  assert.equal(resync.json().transactionsWritten, 0);
  assert.equal(database.sqlite.prepare("SELECT COUNT(*) FROM transactions").pluck().get(), 2);
  const defaultCall = api.calls.filter(call => call.path.endsWith("/transactions")).at(-1);
  assert.deepEqual(defaultCall?.options.query, { strategy: "default" });

  api.rateLimited = true;
  const rateLimited = await app.inject({
    method: "POST",
    url: "/enable-banking/sync/authorization-1",
    headers: { cookie, "user-agent": "Gestio test browser" },
    remoteAddress: "192.0.2.10"
  });
  assert.equal(rateLimited.statusCode, 429);
  assert.equal(rateLimited.json().error, "aspsp_rate_limited");
  assert.match(rateLimited.json().lastSuccessfulSync, /^\d{4}-\d{2}-\d{2}T/);
  const failedStatus = (await app.inject({
    method: "GET",
    url: "/enable-banking/status/authorization-1",
    headers: { cookie }
  })).json();
  assert.equal(failedStatus.status, "FAILED");
  assert.equal(failedStatus.lastSyncedAt, rateLimited.json().lastSuccessfulSync);
  assert.match(logs, /"message":"rate limited"/);
  api.rateLimited = false;

  const institutionId = database.sqlite.prepare("SELECT institution_id FROM accounts WHERE external_hash = ?")
    .pluck().get("stable-account-hash") as number;
  database.sqlite.prepare(`
    INSERT INTO accounts (institution_id, name, type, external_hash, balance_cents, currency, last_synced_at)
    VALUES (?, 'Livret A', 'LIVRET_A', 'livret-hash', 2000, 'EUR', CURRENT_TIMESTAMP),
           (?, 'Livret Jeune', 'OTHER', 'jeune-hash', 3000, 'EUR', CURRENT_TIMESTAMP)
  `).run(institutionId, institutionId);
  const grouped = (await app.inject({ method: "GET", url: "/balance", headers: { cookie } })).json();
  assert.equal(grouped.totalCents, 15_000);
  assert.equal(grouped.institutions[0].balanceCents, 15_000);
  assert.equal(grouped.institutions[0].accounts.length, 3);
});

test("background synchronization sends no PSU headers", async (t) => {
  const { api, runBackgroundSync } = await connectedFixture(t);
  const callCount = api.calls.length;

  await runBackgroundSync();

  const transactionCall = api.calls.slice(callCount).find(call => call.path.endsWith("/transactions"));
  assert.deepEqual(transactionCall?.options.headers, {});
});

test("a shorter synchronization never moves known_since forward", async (t) => {
  const { api, app, cookie, database } = await connectedFixture(t);
  api.transactionDates = ["2026-07-04", "2026-07-05"];

  const response = await app.inject({
    method: "POST",
    url: "/enable-banking/sync/authorization-1",
    headers: { cookie }
  });

  assert.equal(response.statusCode, 200);
  assert.equal(database.sqlite.prepare("SELECT known_since FROM accounts WHERE external_hash = ?")
    .pluck().get("stable-account-hash"), "2026-05-04");
});

test("keeps a resolved ambiguous group resolved after resynchronization", async (t) => {
  const { api, app, cookie, database } = await connectedFixture(t);
  const accountId = database.sqlite.prepare("SELECT id FROM accounts WHERE external_hash = ?")
    .pluck().get("stable-account-hash") as number;
  api.transactionDates[0] = "2026-07-10";
  database.sqlite.prepare(`
    INSERT INTO transactions
      (account_id, transaction_date, label, amount_cents, source, fingerprint)
    VALUES (?, ?, 'Retrait espèces', 1000, 'CSV_IMPORT', 'ambiguous-cash'),
           (?, ?, 'Remboursement ami', 1000, 'CSV_IMPORT', 'ambiguous-refund')
  `).run(accountId, api.transactionDates[0], accountId, api.transactionDates[0]);

  const sync = () => app.inject({
    method: "POST",
    url: "/enable-banking/sync/authorization-1",
    headers: { cookie }
  });
  assert.equal((await sync()).statusCode, 200);

  const group = database.sqlite.prepare(`
    SELECT id FROM transactions WHERE transaction_date = ? AND amount_cents = 1000 ORDER BY id
  `).all(api.transactionDates[0]) as Array<{ id: number }>;
  assert.equal(group.length, 3);
  assert.equal(database.sqlite.prepare(`
    SELECT COUNT(*) FROM transactions
    WHERE transaction_date = ? AND amount_cents = 1000 AND needs_review = 1
  `).pluck().get(api.transactionDates[0]), group.length);

  database.sqlite.transaction((ids: number[]) => {
    const resolve = database.sqlite.prepare(
      "UPDATE transactions SET needs_review = 0, resolved_at = CURRENT_TIMESTAMP WHERE id = ?"
    );
    for (const id of ids) resolve.run(id);
  })(group.map(transaction => transaction.id));

  api.transactionLabels[0] = "Prime exceptionnelle";
  assert.equal((await sync()).statusCode, 200);
  assert.equal(database.sqlite.prepare(`
    SELECT COUNT(*) FROM transactions WHERE resolved_at IS NOT NULL AND needs_review = 1
  `).pluck().get(), 0);
});

test("keeps pages written before a later pagination failure", async (t) => {
  const { api, app, cookie, database } = await connectedFixture(t);
  api.failDuringPagination = true;

  const response = await app.inject({
    method: "POST",
    url: "/enable-banking/sync/authorization-1",
    headers: { cookie }
  });

  assert.equal(response.statusCode, 502);
  assert.equal(database.sqlite.prepare("SELECT COUNT(*) FROM transactions WHERE label = 'Page acquise'")
    .pluck().get(), 1);
});

async function connectedFixture(t: TestContext) {
  const dir = mkdtempSync(join(tmpdir(), "gestio-enable-banking-proof-"));
  const database = openDatabase({ path: join(dir, "gestio.db"), key: "test-db-key-32-random-characters" });
  const api = new FakeEnableBanking();
  let runBackgroundSync: () => Promise<void> = async () => assert.fail("Background synchronization was not registered");
  const nativeSetInterval = globalThis.setInterval;
  globalThis.setInterval = ((callback: () => Promise<void>) => {
    runBackgroundSync = callback;
    return nativeSetInterval(() => {}, 2_147_483_647);
  }) as typeof setInterval;
  const app = (() => {
    try {
      return buildApp({ database, enableBanking: api, logger: false });
    } finally {
      globalThis.setInterval = nativeSetInterval;
    }
  })();
  t.after(async () => {
    await app.close();
    rmSync(dir, { recursive: true, force: true });
  });

  const setup = await app.inject({
    method: "POST",
    url: "/auth/setup",
    payload: { password: "correct horse battery staple" }
  });
  const cookie = String(setup.headers["set-cookie"]).split(";", 1)[0];
  await app.inject({
    method: "POST",
    url: "/enable-banking/connect",
    headers: { cookie },
    payload: { name: "Banque Test", country: "fr" }
  });
  await app.inject({
    method: "GET",
    url: `/?code=bank-code&state=${api.state}`,
    headers: { "user-agent": "Gestio test browser" },
    remoteAddress: "192.0.2.10"
  });
  return { api, app, cookie, database, runBackgroundSync };
}
