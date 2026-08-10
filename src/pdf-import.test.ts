// Requiert les arborescences bp/, nickel/ et trade republic/ sous GESTIO_PDF_CORPUS.
// Le corpus n'est pas versé car il contient IBAN, adresse et titulaire dans un dépôt public.
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";
import { openDatabase } from "./db.js";
import { parsePdfStatement, PdfStatementError, tradeRepublicIsoDate, verifyTradeRepublicTotals } from "./pdf-import.js";
import { buildApp } from "./server.js";

const corpus = process.env.GESTIO_PDF_CORPUS ?? join("/mnt/c/Users", process.env.USER ?? "", "Documents/relevé pdf");
const bpDirectory = join(corpus, "bp");
const nickelDirectory = join(corpus, "nickel");
const tradeRepublicDirectory = join(corpus, "trade republic");
const bpFiles = existsSync(bpDirectory)
  ? readdirSync(bpDirectory).filter(name => name.startsWith("releve_")).sort()
  : [];
const bpReferenceFiles = [
  "releve_CCP0984209Z024_20250708",
  "releve_CCP0984209Z024_20250808",
  "releve_CCP0984209Z024_20250908",
  "releve_CCP0984209Z024_20251008",
  "releve_CCP0984209Z024_20251107",
  "releve_CCP0984209Z024_20251208",
  "releve_CCP0984209Z024_20260108",
  "releve_CCP0984209Z024_20260206",
  "releve_CCP0984209Z024_20260306",
  "releve_CCP0984209Z024_20260408",
  "releve_CCP0984209Z024_20260507",
  "releve_CCP0984209Z024_20260608"
];
const nickelReferenceFiles = [
  "2025-9-251005RM40001128530.pdf",
  "2025-10-251102RM40001128530.pdf",
  "2025-11-251207RM40001128530.pdf",
  "2025-12-260104RM40001128530.pdf",
  "2026-1-260201RM40001128530.pdf",
  "2026-2-260301RM40001128530.pdf",
  "2026-3-260405RM40001128530.pdf",
  "2026-4-260503RM40001128530.pdf",
  "2026-5-260607RM40001128530.pdf"
];

test("refuses a PDF without a text layer and proposes manual entry", async () => {
  await assert.rejects(
    parsePdfStatement(blankPdf()),
    (error: unknown) => error instanceof PdfStatementError && /couche texte.*saisie manuelle/i.test(error.message)
  );
});

test("refuses another bank and names the three supported formats", async () => {
  await assert.rejects(
    parsePdfStatement(textPdf("AUTRE BANQUE")),
    (error: unknown) => error instanceof PdfStatementError && /La Banque Postale, Nickel et Trade Republic/.test(error.message)
  );
});

test("accepts one-digit Trade Republic days and normalizes accented months", () => {
  assert.equal(tradeRepublicIsoDate("1 déc. 2025"), "2025-12-01");
});

test("parses and balances every real La Banque Postale and Nickel statement", async () => {
  assert.ok(existsSync(bpDirectory), `Corpus PDF La Banque Postale absent : ${bpDirectory}`);
  assert.ok(existsSync(nickelDirectory), `Corpus PDF Nickel absent : ${nickelDirectory}`);
  const bpStatements = await Promise.all(
    bpFiles
      .map(name => parsePdfStatement(new Uint8Array(readFileSync(join(bpDirectory, name)))))
  );
  for (const name of bpReferenceFiles) {
    assert.ok(bpFiles.includes(name), `Relevé PDF La Banque Postale manquant : ${join(bpDirectory, name)}`);
  }
  assert.ok(bpFiles.length >= 12);
  const bpReferenceStatements = bpReferenceFiles.map(name => bpStatements[bpFiles.indexOf(name)]);
  assert.equal(bpReferenceStatements.length, 12);
  assert.equal(bpReferenceStatements.flatMap(statement => statement.accounts).filter(account => account.key === "LIVRET_A").length, 12);
  assert.equal(totalTransactions(bpReferenceStatements, "CCP"), 299);
  assert.equal(totalTransactions(bpReferenceStatements, "LIVRET_A"), 45);
  assert.equal(totalTransactions(bpReferenceStatements, "LIVRET_JEUNE"), 6);
  const ibanCounts = bpReferenceStatements.flatMap(statement => statement.accounts)
    .filter(account => /^(?:FR[A-Z0-9]{25}|DE[A-Z0-9]{20})$/.test(account.iban ?? ""))
    .reduce<Record<string, number>>((counts, account) => ({ ...counts, [account.key]: (counts[account.key] ?? 0) + 1 }), {});
  assert.deepEqual(ibanCounts, { CCP: 12, LIVRET_A: 11, LIVRET_JEUNE: 2 });
  assert.ok(bpStatements.every(statement => statement.accounts.map(account => account.key).join() === "CCP,LIVRET_A,LIVRET_JEUNE"));

  const nickelFiles = readdirSync(nickelDirectory).filter(name => /RM.*\.pdf$/.test(name)).sort();
  const nickelStatements = await Promise.all(
    nickelFiles.map(name => parsePdfStatement(new Uint8Array(readFileSync(join(nickelDirectory, name)))))
  );
  for (const name of nickelReferenceFiles) {
    assert.ok(nickelFiles.includes(name), `Relevé PDF Nickel manquant : ${join(nickelDirectory, name)}`);
  }
  assert.ok(nickelFiles.length >= 9);
  const nickelReferenceStatements = nickelReferenceFiles.map(name => nickelStatements[nickelFiles.indexOf(name)]);
  assert.equal(nickelReferenceStatements.length, 9);
  assert.equal(totalTransactions(nickelReferenceStatements, "NICKEL"), 54);
  assert.ok(nickelReferenceStatements.every(statement => /^(?:FR[A-Z0-9]{25}|DE[A-Z0-9]{20})$/.test(statement.accounts[0].iban ?? "")));
});

test("parses and balances both real Trade Republic statements", async () => {
  const expectedPeriods = new Map([
    ["Relevé de compte.pdf", ["2025-09-01", "2026-06-13"]],
    ["statement.pdf", ["2025-12-01", "2026-05-31"]]
  ]);
  assert.ok(existsSync(tradeRepublicDirectory), `Corpus PDF Trade Republic absent : ${tradeRepublicDirectory}`);
  for (const [name, period] of expectedPeriods) {
    const statement = await parsePdfStatement(new Uint8Array(readFileSync(join(tradeRepublicDirectory, name))));
    assert.equal(statement.institution, "TRADE_REPUBLIC");
    assert.deepEqual([statement.periodStart, statement.periodEnd], period);
    assert.deepEqual(statement.accounts.map(account => account.key), ["TRADE_REPUBLIC", "TRADE_REPUBLIC_PEA", "TRADE_REPUBLIC_PEA_2"]);
    assert.equal(statement.excludedProducts, undefined);
    for (const account of statement.accounts) {
      assert.match(account.iban!, /^(?:FR[A-Z0-9]{25}|DE[A-Z0-9]{20})$/);
      assert.ok(account.transactions.length > 0);
      const totalCredit = total(account.transactions.filter(transaction => transaction.amountCents > 0));
      const totalDebit = -total(account.transactions.filter(transaction => transaction.amountCents < 0));
      assert.doesNotThrow(() => verifyTradeRepublicTotals(account, totalCredit, totalDebit));
      assert.throws(
        () => verifyTradeRepublicTotals({ ...account, transactions: account.transactions.slice(1) }, totalCredit, totalDebit),
        PdfStatementError
      );
    }
    assert.ok(statement.accounts.flatMap(account => account.transactions).some(transaction => /Incoming transfer/i.test(transaction.label) && transaction.amountCents > 0));
    assert.ok(statement.accounts.flatMap(account => account.transactions).some(transaction => /Outgoing transfer/i.test(transaction.label) && transaction.amountCents < 0));
  }
});

test("imports a multi-account statement atomically and remains idempotent", async (t) => {
  assert.ok(bpFiles.length, `Corpus PDF La Banque Postale absent ou vide : ${bpDirectory}`);
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

  const existing = parsed.accounts.find(account => account.key === "LIVRET_A")!.transactions[0];
  assert.equal((await app.inject({
    method: "POST",
    url: "/transactions",
    headers: { cookie },
    payload: { accountId: accountIds.LIVRET_A, ...existing, label: "Libellé externe complètement différent" }
  })).statusCode, 201);

  const payload = { pdfBase64: pdf.toString("base64"), accountIds };
  const first = await app.inject({ method: "POST", url: "/imports/pdf", headers: { cookie }, payload });
  assert.equal(first.statusCode, 200);
  assert.deepEqual(first.json(), {
    institution: "LA_BANQUE_POSTALE",
    imported: 49,
    duplicates: 0,
    balancesImported: 3,
    reviewNeeded: 1
  });
  assert.equal(database.sqlite.prepare("SELECT COUNT(*) FROM transactions WHERE needs_review = 1").pluck().get(), 1);

  const manualState = () => database.sqlite.prepare(`
    SELECT a.balance_cents AS balanceCents, COUNT(t.id) AS transactionCount
    FROM accounts a LEFT JOIN transactions t ON t.account_id = a.id
    WHERE a.id = ? GROUP BY a.id
  `).get(accountIds.LIVRET_A);
  const stateAfterFirstImport = manualState();

  const second = await app.inject({ method: "POST", url: "/imports/pdf", headers: { cookie }, payload });
  assert.equal(second.statusCode, 200);
  assert.deepEqual(second.json(), {
    institution: "LA_BANQUE_POSTALE",
    imported: 0,
    duplicates: 49,
    balancesImported: 0,
    reviewNeeded: 0
  });
  assert.deepEqual(manualState(), stateAfterFirstImport);
  assert.equal(database.sqlite.prepare("SELECT COUNT(*) FROM transactions").pluck().get(), 50);

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

  const tradeRepublicInstitution = (await app.inject({
    method: "POST",
    url: "/institutions",
    headers: { cookie },
    payload: { name: "Trade Republic", country: "FR" }
  })).json() as { id: number };
  const tradeRepublicAccount = (await app.inject({
    method: "POST",
    url: "/accounts",
    headers: { cookie },
    payload: { name: "Compte courant Trade Republic", type: "BANK", institutionId: tradeRepublicInstitution.id }
  })).json() as { id: number };
  const tradeRepublicPea = (await app.inject({
    method: "POST",
    url: "/accounts",
    headers: { cookie },
    payload: { name: "Compte PEA", type: "OTHER", institutionId: tradeRepublicInstitution.id }
  })).json() as { id: number };
  const tradeRepublicPea2 = (await app.inject({
    method: "POST",
    url: "/accounts",
    headers: { cookie },
    payload: { name: "Compte PEA 2", type: "OTHER", institutionId: tradeRepublicInstitution.id }
  })).json() as { id: number };
  const tradeRepublicPdf = readFileSync(join(tradeRepublicDirectory, "statement.pdf"));
  const tradeRepublicImport = await app.inject({
    method: "POST",
    url: "/imports/pdf",
    headers: { cookie },
    payload: {
      pdfBase64: tradeRepublicPdf.toString("base64"),
      accountIds: {
        TRADE_REPUBLIC: tradeRepublicAccount.id,
        TRADE_REPUBLIC_PEA: tradeRepublicPea.id,
        TRADE_REPUBLIC_PEA_2: tradeRepublicPea2.id
      }
    }
  });
  assert.equal(tradeRepublicImport.statusCode, 200);
  assert.equal(tradeRepublicImport.json().balancesImported, 3);
  assert.equal(tradeRepublicImport.json().excludedProducts, undefined);
});

function totalTransactions(statements: Awaited<ReturnType<typeof parsePdfStatement>>[], key: string) {
  return statements.flatMap(statement => statement.accounts)
    .filter(account => account.key === key)
    .reduce((total, account) => total + account.transactions.length, 0);
}

function total(transactions: Array<{ amountCents: number }>) {
  return transactions.reduce((sum, transaction) => sum + transaction.amountCents, 0);
}

function blankPdf() {
  return pdf([
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>\nendobj\n"
  ]);
}

function textPdf(text: string) {
  const stream = `BT /F1 12 Tf 72 720 Td (${text}) Tj ET`;
  return pdf([
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n",
    "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
    `5 0 obj\n<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream\nendobj\n`
  ]);
}

function pdf(objects: string[]) {
  let pdf = "%PDF-1.4\n";
  const offsets = objects.map(object => {
    const offset = Buffer.byteLength(pdf);
    pdf += object;
    return offset;
  });
  const xref = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.map(offset => `${String(offset).padStart(10, "0")} 00000 n `).join("\n")}\n`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return new Uint8Array(Buffer.from(pdf));
}
