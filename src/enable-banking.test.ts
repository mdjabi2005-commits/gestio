import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test, { type TestContext } from "node:test";
import { openDatabase } from "./db.js";
import { decimalCents, EnableBankingError, parseBankTransaction, type EnableBankingApi } from "./enable-banking.js";
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
            remittance_information: ["Salaire"],
            entry_reference: "synthetic.0"
          },
          {
            booking_date: this.transactionDates[1],
            credit_debit_indicator: "DBIT",
            transaction_amount: { amount: "5.00", currency: "USD" },
            remittance_information: ["Courses"],
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
