// Requiert le relevé PDF BP de juin 2026 et la capture API réelle correspondante.
// Ils ne sont pas versés car ils contiennent des données bancaires personnelles dans un dépôt public.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { deduplicateTransactions, type TransactionForDeduplication } from "./deduplication.js";
import { parseBankTransaction } from "./enable-banking.js";
import { parsePdfStatement } from "./pdf-import.js";

const windowsHome = join("/mnt/c/Users", process.env.USER ?? "");
const lab = process.env.GESTIO_LAB_CORPUS ?? join(windowsHome, "gestio/.lamoms/lab/agy");
const statements = process.env.GESTIO_PDF_CORPUS ?? join(windowsHome, "Documents/relevé pdf");

test("replays the real PDF and API corpus in both channel orders", async () => {
  const apiPath = join(lab, "enable_banking_transactions_reelles.json");
  const pdfPath = join(statements, "bp", "releve_CCP0984209Z024_20260608");
  for (const path of [apiPath, pdfPath]) assert.ok(existsSync(path), `Corpus PDF/API absent : ${path}`);

  const statement = await parsePdfStatement(new Uint8Array(readFileSync(pdfPath)));
  const pdf = statement.accounts.find(account => account.key === "CCP")!.transactions;
  const apiSource = JSON.parse(readFileSync(apiPath, "utf8")) as { transactions: unknown[] };
  const api = apiSource.transactions.map(parseBankTransaction);
  const inWindow = (transaction: { transactionDate: string }) =>
    transaction.transactionDate >= statement.periodStart && transaction.transactionDate <= statement.periodEnd;
  const apiWindow = api.filter(inWindow);
  const pdfWindow = pdf.filter(inWindow);

  const orders: TransactionForDeduplication[][][] = [[apiWindow, pdfWindow], [pdfWindow, apiWindow]];
  for (const channels of orders) {
    const result = deduplicateTransactions(channels);
    assert.equal(result.matches.length, 16);
    assert.equal(result.transactions.length - result.matches.length, 0);
    assert.equal(result.toReview.length, 0);
  }
});
