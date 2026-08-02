import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";
import { buildApp } from "./server.js";
import { openDatabase } from "./db.js";

test("creates an account, records transactions, and returns exact balances", async (t) => {
  const dir = mkdtempSync(join(tmpdir(), "gestio-"));
  const dbPath = join(dir, "gestio.db");
  const database = openDatabase({ path: dbPath, key: "test-db-key-32-random-characters" });
  const app = buildApp({ database, logger: false });
  t.after(async () => {
    await app.close();
    rmSync(dir, { recursive: true, force: true });
  });

  const accountResponse = await app.inject({
    method: "POST",
    url: "/accounts",
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
    const response = await app.inject({ method: "POST", url: "/transactions", payload });
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

  const balanceResponse = await app.inject({ method: "GET", url: "/balance" });
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

  assert.notEqual(readFileSync(dbPath).subarray(0, 16).toString("utf8"), "SQLite format 3\0");
});
