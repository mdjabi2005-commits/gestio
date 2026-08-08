import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { parseBankCsv } from "./csv-import.js";
import { openDatabase } from "./db.js";
import { buildApp } from "./server.js";

const lab = process.env.GESTIO_LAB_CORPUS ?? "/mnt/c/Users/djabi/gestio/.lamoms/lab/agy";
const statementCorpus = process.env.GESTIO_PDF_CORPUS ?? "/mnt/c/Users/djabi/Documents/relevé pdf";
const revolutCsv = process.env.GESTIO_REVOLUT_CSV
  ?? join(statementCorpus, "revolut", "account-statement_2025-09-01_2026-06-14_fr-fr_646623.csv");

test("parses the real La Banque Postale and Revolut CSV corpus", () => {
  const lbpCounts = ["0984209Z0241785448406468.csv", "0984209Z0241785448417573.csv"].map(name => {
    const path = join(lab, name);
    assert.ok(existsSync(path), `Corpus CSV La Banque Postale absent : ${path}`);
    const parsed = parseBankCsv("LA_BANQUE_POSTALE", readFileSync(path));
    assert.equal(parsed.ignored, 0);
    assert.equal(parsed.transactions.some(transaction => transaction.label.includes("�")), false);
    return parsed.transactions.length;
  });
  assert.deepEqual(lbpCounts, [19, 8]);

  assert.ok(existsSync(revolutCsv), `Corpus CSV Revolut absent : ${revolutCsv}`);
  const bytes = readFileSync(revolutCsv);
  assert.equal(bytes.toString("utf8").trimEnd().split(/\r?\n/).length, 254);
  const revolut = parseBankCsv("REVOLUT", bytes);
  assert.equal(revolut.transactions.length, 250);
  assert.equal(revolut.ignored, 3);
  assert.equal(revolut.transactions.filter(transaction => /[^\x00-\x7F]/.test(transaction.label)).length, 77);
  assert.equal(revolut.transactions.some(transaction => transaction.label.includes("�")), false);
  const timestamped = revolut.transactions.find(transaction => transaction.transactionAt === "2025-09-27T13:05:08");
  assert.equal(timestamped?.transactionDate, "2025-09-27");
});

test("imports attributable CSV and rejects unsafe formats atomically", async (t) => {
  const dir = mkdtempSync(join(tmpdir(), "gestio-csv-"));
  const database = openDatabase({ path: join(dir, "gestio.db"), key: "test-db-key-32-random-characters" });
  const app = buildApp({ database, logger: false });
  t.after(async () => {
    await app.close();
    rmSync(dir, { recursive: true, force: true });
  });

  const setup = await app.inject({ method: "POST", url: "/auth/setup", payload: { password: "correct horse battery staple" } });
  const cookie = (setup.headers["set-cookie"] as string).split(";", 1)[0];
  const institutionResponse = await app.inject({
    method: "POST", url: "/institutions", headers: { cookie }, payload: { name: "La Banque Postale", country: "FR" }
  });
  const institutionId = (institutionResponse.json() as { id: number }).id;
  const accountResponse = await app.inject({
    method: "POST", url: "/accounts", headers: { cookie }, payload: { name: "Compte test", type: "BANK", institutionId }
  });
  const accountId = (accountResponse.json() as { id: number }).id;
  await app.inject({
    method: "POST",
    url: "/transactions",
    headers: { cookie },
    payload: { accountId, transactionDate: "2026-08-01", label: "Virement référence", amountCents: 399, source: "ENABLE_BANKING" }
  });

  const invalidLbp = lbpCsv([
    '01/08/2026;"Nouvelle opération";5,00',
    '02/08/2026;"Montant cassé";invalide'
  ]);
  const beforeInvalidLbp = transactionCount(database, accountId);
  const invalidResponse = await importCsv(app, cookie, accountId, "LA_BANQUE_POSTALE", invalidLbp);
  assert.equal(invalidResponse.statusCode, 400);
  assert.match((invalidResponse.json() as { message: string }).message, /séparateur décimal/);
  assert.equal(transactionCount(database, accountId), beforeInvalidLbp);

  const lbp = lbpCsv([
    '01/08/2026;"VIREMENT DEFAULT RÉFÉRENCE ";3,99',
    '02/08/2026;"Café été ";-10,00'
  ]);
  const firstLbp = await importCsv(app, cookie, accountId, "LA_BANQUE_POSTALE", lbp);
  assert.deepEqual(firstLbp.json(), { read: 2, imported: 1, duplicates: 1, ignored: 0 });
  const secondLbp = await importCsv(app, cookie, accountId, "LA_BANQUE_POSTALE", lbp);
  assert.deepEqual(secondLbp.json(), { read: 2, imported: 0, duplicates: 2, ignored: 0 });

  const revolut = Buffer.from(
    "Type,Produit,Date de début,Date de fin,Description,Montant,Frais,Devise,État,Solde\n" +
    "Virement,Épargne,2026-08-03 12:34:56,2026-08-03 12:35:00,Crédit hôtel,20.00,0.00,EUR,TERMINÉ,20.00\n" +
    "Virement,Épargne,2026-08-03 13:34:56,2026-08-03 13:35:00,Crédit hôtel,20.00,0.00,EUR,TERMINÉ,40.00\n" +
    "Paiement par carte,Épargne,2026-08-04 10:00:00,,Opération renvoyée,-2.00,0.00,EUR,RENVOYÉ,\n",
    "utf8"
  );
  const beforeMismatch = transactionCount(database, accountId);
  const revolutResponse = await importCsv(app, cookie, accountId, "REVOLUT", revolut);
  assert.equal(revolutResponse.statusCode, 400);
  assert.deepEqual(revolutResponse.json(), {
    error: "csv_institution_mismatch",
    message: "Le fichier CSV REVOLUT ne correspond pas à l’établissement « La Banque Postale » du compte cible."
  });
  assert.equal(transactionCount(database, accountId), beforeMismatch);

  const revolutInstitutionResponse = await app.inject({
    method: "POST", url: "/institutions", headers: { cookie }, payload: { name: "Revolut", country: "LT" }
  });
  const revolutInstitutionId = (revolutInstitutionResponse.json() as { id: number }).id;
  const revolutAccountResponse = await app.inject({
    method: "POST", url: "/accounts", headers: { cookie },
    payload: { name: "Compte Revolut", type: "BANK", institutionId: revolutInstitutionId }
  });
  const revolutAccountId = (revolutAccountResponse.json() as { id: number }).id;
  const beforeMultiAccount = transactionCount(database, revolutAccountId);
  const multiAccountResponse = await importCsv(app, cookie, revolutAccountId, "REVOLUT", revolut);
  assert.equal(multiAccountResponse.statusCode, 400);
  assert.deepEqual(multiAccountResponse.json(), {
    error: "csv_accounts_not_separable",
    message: "Le fichier CSV REVOLUT mélange plusieurs comptes et rien ne permet de les séparer. Utilisez la synchronisation API."
  });
  assert.equal(transactionCount(database, revolutAccountId), beforeMultiAccount);

  const rows = database.sqlite.prepare(`
    SELECT transaction_at AS transactionAt, label FROM transactions ORDER BY transaction_date
  `).all() as Array<{ transactionAt: string | null; label: string }>;
  assert.deepEqual(rows, [
    { transactionAt: null, label: "Virement référence" },
    { transactionAt: null, label: "Café été" }
  ]);
  const balance = await app.inject({ method: "GET", url: "/balance", headers: { cookie } });
  assert.equal((balance.json() as { totalCents: number }).totalCents, -601);

  for (const [bank, content] of [
    ["BANQUE_INCONNUE", "x"],
    ["LA_BANQUE_POSTALE", "pas un relevé"]
  ]) {
    const before = transactionCount(database, accountId);
    const response = await importCsv(app, cookie, accountId, bank, Buffer.from(content));
    const body = response.json() as { error: string; message: string };
    assert.equal(response.statusCode, 400);
    assert.equal(body.error, "csv_format_unrecognized");
    assert.ok(body.message);
    assert.equal(transactionCount(database, accountId), before);
  }
});

test("migrates existing fingerprints to FIFO occurrences without losing data", () => {
  const dir = mkdtempSync(join(tmpdir(), "gestio-csv-migration-"));
  const path = join(dir, "gestio.db");
  const key = "test-db-key-32-random-characters";
  const previous = openDatabase({ path, key });
  previous.sqlite.exec(`
    INSERT INTO accounts (name, type) VALUES ('Compte existant', 'BANK');
    INSERT INTO transactions
      (account_id, transaction_date, label, amount_cents, source, fingerprint)
    VALUES (1, '2026-08-01', 'Existant', 100, 'MANUEL', 'same-fingerprint');
    DROP INDEX transactions_fingerprint_occurrence_unique_idx;
    ALTER TABLE transactions DROP COLUMN transaction_at;
    ALTER TABLE transactions DROP COLUMN occurrence;
    CREATE UNIQUE INDEX transactions_fingerprint_unique_idx ON transactions(fingerprint);
  `);
  previous.close();

  const migrated = openDatabase({ path, key });
  try {
    const columns = migrated.sqlite.pragma("table_info(transactions)") as Array<{ name: string }>;
    assert.equal(columns.some(column => column.name === "transaction_at"), true);
    assert.equal(columns.some(column => column.name === "occurrence"), true);
    migrated.sqlite.prepare(`
      INSERT INTO transactions
        (account_id, transaction_date, label, amount_cents, source, fingerprint, occurrence)
      VALUES (1, '2026-08-01', 'Existant', 100, 'CSV_IMPORT', 'same-fingerprint', 1)
    `).run();
    assert.equal(transactionCount(migrated, 1), 2);
  } finally {
    migrated.close();
    rmSync(dir, { recursive: true, force: true });
  }
});

function lbpCsv(rows: string[]) {
  return Buffer.from([
    "Numéro Compte   ;0000",
    "Type         ;Compte courant",
    "Compte tenu en  ;EUR",
    "Date            ;04/08/2026",
    "Solde (EUROS)   ;13,99",
    "",
    "Date;Libellé;Montant(EUROS)",
    ...rows,
    ""
  ].join("\r\n"), "latin1");
}

function importCsv(
  app: ReturnType<typeof buildApp>,
  cookie: string,
  accountId: number,
  bank: string,
  contents: Buffer
) {
  return app.inject({
    method: "POST",
    url: "/imports/csv",
    headers: { cookie },
    payload: { accountId, bank, contentBase64: contents.toString("base64") }
  });
}

function transactionCount(database: ReturnType<typeof openDatabase>, accountId: number) {
  return database.sqlite.prepare("SELECT COUNT(*) FROM transactions WHERE account_id = ?").pluck().get(accountId);
}
