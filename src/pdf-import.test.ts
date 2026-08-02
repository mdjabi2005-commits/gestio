import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";
import { openDatabase } from "./db.js";
import { parsePdfStatement, PdfStatementError } from "./pdf-import.js";
import { buildApp } from "./server.js";

const corpus = process.env.GESTIO_PDF_CORPUS ?? "/mnt/c/Users/djabi/Documents/relevé pdf";
const bpDirectory = join(corpus, "bp");
const nickelDirectory = join(corpus, "nickel");
const bpFiles = existsSync(bpDirectory)
  ? readdirSync(bpDirectory).filter(name => name.startsWith("releve_")).sort()
  : [];

test("refuses a PDF without a text layer and proposes another import path", async () => {
  await assert.rejects(
    parsePdfStatement(blankPdf()),
    (error: unknown) => error instanceof PdfStatementError && /couche texte.*CSV.*saisie manuelle/i.test(error.message)
  );
});

test("parses and balances every real La Banque Postale and Nickel statement", {
  skip: !existsSync(bpDirectory) || !existsSync(nickelDirectory)
}, async () => {
  const bpStatements = await Promise.all(
    bpFiles
      .map(name => parsePdfStatement(new Uint8Array(readFileSync(join(bpDirectory, name)))))
  );
  assert.equal(bpStatements.length, 12);
  assert.equal(bpStatements.flatMap(statement => statement.accounts).filter(account => account.key === "LIVRET_A").length, 12);
  assert.equal(totalTransactions(bpStatements, "CCP"), 299);
  assert.equal(totalTransactions(bpStatements, "LIVRET_A"), 45);
  assert.equal(totalTransactions(bpStatements, "LIVRET_JEUNE"), 6);
  assert.ok(bpStatements.every(statement => statement.accounts.map(account => account.key).join() === "CCP,LIVRET_A,LIVRET_JEUNE"));

  const nickelStatements = await Promise.all(
    readdirSync(nickelDirectory)
      .filter(name => /RM.*\.pdf$/.test(name))
      .sort()
      .map(name => parsePdfStatement(new Uint8Array(readFileSync(join(nickelDirectory, name)))))
  );
  assert.equal(nickelStatements.length, 9);
  assert.equal(totalTransactions(nickelStatements, "NICKEL"), 54);
});

test("imports a multi-account statement atomically and remains idempotent", {
  skip: !bpFiles.length
}, async (t) => {
  const path = join(bpDirectory, bpFiles[0]);
  const pdf = readFileSync(path);
  const parsed = await parsePdfStatement(new Uint8Array(pdf));
  const dir = mkdtempSync(join(tmpdir(), "gestio-pdf-"));
  const database = openDatabase({ path: join(dir, "gestio.db"), key: "test-db-key-32-random-characters" });
  const app = buildApp({ database, logger: false });
  t.after(async () => {
    await app.close();
    rmSync(dir, { recursive: true, force: true });
  });

  const setup = await app.inject({ method: "POST", url: "/auth/setup", payload: { password: "correct horse battery staple" } });
  const cookie = (setup.headers["set-cookie"] as string).split(";", 1)[0];
  const institution = (await app.inject({
    method: "POST",
    url: "/institutions",
    headers: { cookie },
    payload: { name: "La Banque Postale", country: "FR" }
  })).json() as { id: number };
  const accountIds: Record<string, number> = {};
  for (const [key, name, type] of [
    ["CCP", "Compte courant", "BANK"],
    ["LIVRET_A", "Livret A", "LIVRET_A"],
    ["LIVRET_JEUNE", "Livret Jeune", "OTHER"]
  ]) {
    const response = await app.inject({
      method: "POST",
      url: "/accounts",
      headers: { cookie },
      payload: { name, type, institutionId: institution.id }
    });
    accountIds[key] = response.json().id;
  }

  const existing = parsed.accounts[0].transactions[0];
  assert.equal((await app.inject({
    method: "POST",
    url: "/transactions",
    headers: { cookie },
    payload: { accountId: accountIds.CCP, ...existing, label: "Libellé externe complètement différent" }
  })).statusCode, 201);

  const payload = { pdfBase64: pdf.toString("base64"), accountIds };
  const first = await app.inject({ method: "POST", url: "/imports/pdf", headers: { cookie }, payload });
  assert.equal(first.statusCode, 200);
  assert.deepEqual(first.json(), {
    institution: "LA_BANQUE_POSTALE",
    imported: 48,
    duplicates: 1,
    balancesImported: 3,
    reviewNeeded: 0
  });

  const second = await app.inject({ method: "POST", url: "/imports/pdf", headers: { cookie }, payload });
  assert.equal(second.statusCode, 200);
  assert.deepEqual(second.json(), {
    institution: "LA_BANQUE_POSTALE",
    imported: 0,
    duplicates: 49,
    balancesImported: 0,
    reviewNeeded: 0
  });
  assert.equal(database.sqlite.prepare("SELECT COUNT(*) FROM transactions").pluck().get(), 49);

  const storedAccounts = () => database.sqlite.prepare(`
      SELECT id, balance_cents AS balanceCents, currency, last_synced_at AS lastSyncedAt,
             known_since AS knownSince
      FROM accounts ORDER BY id
    `).all() as Array<{
      id: number;
      balanceCents: number;
      currency: string;
      lastSyncedAt: string;
      knownSince: string;
    }>;
  assert.deepEqual(storedAccounts(), parsed.accounts.map(account => ({
    id: accountIds[account.key],
    balanceCents: account.closingBalanceCents,
    currency: "EUR",
    lastSyncedAt: `${account.balanceDate}T23:59:59.999Z`,
    knownSince: parsed.periodStart
  })));

  const balance = (await app.inject({ method: "GET", url: "/balance", headers: { cookie } })).json();
  const expectedBalance = parsed.accounts.reduce((sum, account) => sum + account.closingBalanceCents, 0);
  assert.equal(balance.totalCents, expectedBalance);
  assert.equal(balance.institutions.length, 1);
  assert.equal(balance.institutions[0].balanceCents, expectedBalance);
  assert.equal(balance.institutions[0].accounts.length, 3);

  const latestPdf = readFileSync(join(bpDirectory, bpFiles.at(-1)!));
  const latest = await parsePdfStatement(new Uint8Array(latestPdf));
  const latestImport = await app.inject({
    method: "POST",
    url: "/imports/pdf",
    headers: { cookie },
    payload: { pdfBase64: latestPdf.toString("base64"), accountIds }
  });
  assert.equal(latestImport.statusCode, 200);
  assert.equal(latestImport.json().balancesImported, 3);
  assert.equal((await app.inject({ method: "POST", url: "/imports/pdf", headers: { cookie }, payload })).json().balancesImported, 0);
  assert.deepEqual(storedAccounts(), latest.accounts.map(account => ({
    id: accountIds[account.key],
    balanceCents: account.closingBalanceCents,
    currency: "EUR",
    lastSyncedAt: `${account.balanceDate}T23:59:59.999Z`,
    knownSince: parsed.periodStart
  })));
});

function totalTransactions(statements: Awaited<ReturnType<typeof parsePdfStatement>>[], key: string) {
  return statements.flatMap(statement => statement.accounts)
    .filter(account => account.key === key)
    .reduce((total, account) => total + account.transactions.length, 0);
}

function blankPdf() {
  const objects = [
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>\nendobj\n"
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = objects.map(object => {
    const offset = Buffer.byteLength(pdf);
    pdf += object;
    return offset;
  });
  const xref = Buffer.byteLength(pdf);
  pdf += `xref\n0 4\n0000000000 65535 f \n${offsets.map(offset => `${String(offset).padStart(10, "0")} 00000 n `).join("\n")}\n`;
  pdf += `trailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return new Uint8Array(Buffer.from(pdf));
}
