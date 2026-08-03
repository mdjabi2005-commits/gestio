import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { parseBankCsv } from "./csv-import.js";
import { deduplicateTransactions, signedAmountCents } from "./deduplication.js";
import { decimalCents } from "./enable-banking.js";

type Transaction = {
  id: string;
  transactionDate: string;
  amountCents: number;
  label: string | null;
};

type ApiTransaction = {
  booking_date: string;
  credit_debit_indicator: "CRDT" | "DBIT";
  transaction_amount: { amount: string };
  remittance_information?: string[];
};

const lab = process.env.GESTIO_LAB_CORPUS ?? "/mnt/c/Users/djabi/gestio/.lamoms/lab/agy";

test("replays the real T2 corpus in both channel orders", {
  skip: process.env.GESTIO_SKIP_CORPUS === "1"
}, () => {
  const apiPath = join(lab, "enable_banking_transactions_reelles.json");
  const csvPaths = ["0984209Z0241785448406468.csv", "0984209Z0241785448417573.csv"]
    .map(name => join(lab, name));
  for (const path of [apiPath, ...csvPaths]) assert.ok(existsSync(path), `Corpus T2 absent : ${path}`);

  const apiSource = JSON.parse(readFileSync(apiPath, "utf8")) as { transactions: ApiTransaction[] };
  const api = apiSource.transactions.map((transaction, index): Transaction => ({
    id: `api-${index}`,
    transactionDate: transaction.booking_date,
    amountCents: signedAmountCents(decimalCents(transaction.transaction_amount.amount), transaction.credit_debit_indicator),
    label: transaction.remittance_information?.join(" ") || null
  }));
  const csv = csvPaths.flatMap((path, fileIndex) =>
    parseBankCsv("LA_BANQUE_POSTALE", readFileSync(path)).transactions.map((transaction, index): Transaction => ({
      id: `csv-${fileIndex}-${index}`,
      transactionDate: transaction.transactionDate,
      amountCents: transaction.amountCents,
      label: transaction.label
    }))
  );
  const inWindow = (transaction: Transaction) => transaction.transactionDate >= "2026-06-01";
  const apiWindow = api.filter(inWindow);
  const csvWindow = csv.filter(inWindow);

  for (const channels of [[apiWindow, csvWindow], [csvWindow, apiWindow]]) {
    const result = deduplicateTransactions(channels);
    assert.equal(result.matches.length, 27);
    assert.equal(result.transactions.length - result.matches.length, 0);
    assert.equal(result.toReview.length, 0);
  }
});
