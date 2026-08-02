import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";
import { buildApp } from "./server.js";
import { openDatabase } from "./db.js";

test("creates an account, records transactions, and returns exact balances", async (t) => {
  const dir = mkdtempSync(join(tmpdir(), "gestio-"));
  const dbPath = join(dir, "gestio.db");
  const database = openDatabase({ path: dbPath, key: "test-db-key-32-random-characters" });
  let logs = "";
  const app = buildApp({
    database,
    logger: { stream: { write: (chunk: string) => { logs += chunk; } } }
  });
  t.after(async () => {
    await app.close();
    rmSync(dir, { recursive: true, force: true });
  });

  const unauthenticatedResponse = await app.inject({ method: "GET", url: "/balance" });
  assert.equal(unauthenticatedResponse.statusCode, 401);

  const password = "correct horse battery staple";
  const setupResponse = await app.inject({
    method: "POST",
    url: "/auth/setup",
    payload: { password }
  });
  assert.equal(setupResponse.statusCode, 204);
  const setCookie = setupResponse.headers["set-cookie"];
  assert.equal(typeof setCookie, "string");
  const cookie = (setCookie as string).split(";", 1)[0];
  const sessionToken = cookie.split("=", 2)[1];
  assert.match(cookie, /^gestio_session=[a-f0-9]{64}$/);

  const passwordHash = database.sqlite.prepare(
    "SELECT password_hash FROM local_auth WHERE id = 1"
  ).pluck().get() as string;
  assert.match(passwordHash, /^\$argon2id\$/);
  assert.notEqual(passwordHash, password);

  const repeatedSetupResponse = await app.inject({
    method: "POST",
    url: "/auth/setup",
    payload: { password: "replacement password rejected" }
  });
  assert.equal(repeatedSetupResponse.statusCode, 409);

  const invalidSessionResponse = await app.inject({
    method: "GET",
    url: "/accounts",
    headers: { cookie: `gestio_session=${"0".repeat(64)}` }
  });
  assert.equal(invalidSessionResponse.statusCode, 401);

  const invalidLoginResponse = await app.inject({
    method: "POST",
    url: "/auth/login",
    payload: { password: "wrong password with length" }
  });
  assert.equal(invalidLoginResponse.statusCode, 401);

  const accountResponse = await app.inject({
    method: "POST",
    url: "/accounts",
    headers: { cookie },
    payload: { name: "Compte courant", type: "BANK" }
  });
  assert.equal(accountResponse.statusCode, 201);
  const account = accountResponse.json() as { id: number };

  const createdTransactions: Array<{ id: number; source: string; fingerprint: string; amountCents: number }> = [];
  for (const payload of [
    { accountId: account.id, transactionDate: "2026-08-01", label: "Salaire", amountCents: 100_00 },
    { accountId: account.id, transactionDate: "2026-08-01", label: "Courses", amountCents: -25_99 },
    { accountId: account.id, transactionDate: "2026-08-02", label: "Virement DEFAULT RÉFÉRENCE", amountCents: 3_99 }
  ]) {
    const response = await app.inject({ method: "POST", url: "/transactions", headers: { cookie }, payload });
    assert.equal(response.statusCode, 201);
    const transaction = response.json() as { id: number; source: string; fingerprint: string; amountCents: number };
    assert.equal(transaction.source, "MANUEL");
    assert.equal(Number.isInteger(transaction.amountCents), true);
    assert.match(transaction.fingerprint, /^[a-f0-9]{64}$/);
    createdTransactions.push(transaction);
  }

  const duplicateResponse = await app.inject({
    method: "POST",
    url: "/transactions",
    headers: { cookie },
    payload: {
      accountId: account.id,
      transactionDate: "2026-08-02",
      label: "  virement reference ",
      amountCents: 3_99,
      source: "CSV_IMPORT",
      fingerprint: "client-controlled-value"
    }
  });
  assert.equal(duplicateResponse.statusCode, 200);
  const duplicate = duplicateResponse.json() as { id: number; source: string; fingerprint: string };
  assert.equal(duplicate.id, createdTransactions[2].id);
  assert.equal(duplicate.source, "MANUEL");
  assert.equal(duplicate.fingerprint, createdTransactions[2].fingerprint);
  assert.equal(database.sqlite.prepare("SELECT COUNT(*) FROM transactions").pluck().get(), 3);

  const balanceResponse = await app.inject({ method: "GET", url: "/balance", headers: { cookie } });
  assert.equal(balanceResponse.statusCode, 200);
  const balance = balanceResponse.json() as {
    totalCents: number;
    accounts: Array<{ id: number; name: string; type: string; balanceCents: number; updatedAt: string }>;
  };
  assert.equal(balance.totalCents, 78_00);
  assert.deepEqual(balance.accounts.map(({ updatedAt, ...accountBalance }) => accountBalance), [
    { id: account.id, name: "Compte courant", type: "BANK", balanceCents: 78_00 }
  ]);
  assert.match(balance.accounts[0].updatedAt, /^\d{4}-\d{2}-\d{2} /);

  const applicationSecret = "authorized-enable-banking-session-id";
  database.sqlite.prepare("INSERT INTO application_secrets (name, value) VALUES (?, ?)")
    .run("enable_banking_session_id", applicationSecret);
  database.sqlite.pragma("wal_checkpoint(TRUNCATE)");
  for (const path of [dbPath, `${dbPath}-wal`]) {
    if (existsSync(path)) {
      const bytes = readFileSync(path);
      assert.equal(bytes.includes(Buffer.from(password)), false);
      assert.equal(bytes.includes(Buffer.from(sessionToken)), false);
      assert.equal(bytes.includes(Buffer.from(applicationSecret)), false);
    }
  }

  assert.notEqual(readFileSync(dbPath).subarray(0, 16).toString("utf8"), "SQLite format 3\0");

  database.sqlite.prepare("UPDATE auth_sessions SET expires_at = 0").run();
  const expiredSessionResponse = await app.inject({ method: "GET", url: "/balance", headers: { cookie } });
  assert.equal(expiredSessionResponse.statusCode, 401);

  const loginResponse = await app.inject({ method: "POST", url: "/auth/login", payload: { password } });
  assert.equal(loginResponse.statusCode, 204);
  const loginCookieHeader = loginResponse.headers["set-cookie"];
  assert.equal(typeof loginCookieHeader, "string");
  const loginCookie = (loginCookieHeader as string).split(";", 1)[0];
  const logoutResponse = await app.inject({ method: "POST", url: "/auth/logout", headers: { cookie: loginCookie } });
  assert.equal(logoutResponse.statusCode, 204);
  const loggedOutResponse = await app.inject({ method: "GET", url: "/balance", headers: { cookie: loginCookie } });
  assert.equal(loggedOutResponse.statusCode, 401);
  assert.equal(logs.includes(password), false);
  assert.equal(logs.includes(sessionToken), false);
  assert.equal(logs.includes(applicationSecret), false);
});
