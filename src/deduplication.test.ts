import assert from "node:assert/strict";
import test from "node:test";
import { deduplicateTransactions, signedAmountCents } from "./deduplication.js";

type Transaction = {
  id: string;
  transactionDate: string;
  amountCents: number;
  label?: string | null;
};

test("deduplicates channels one-to-one and uses labels only to break a shared-key tie", () => {
  const api: Transaction[] = [
    { id: "api-a", transactionDate: "2026-07-01", amountCents: -1_000, label: "PAIEMENT CARTE SNCF" },
    { id: "api-b", transactionDate: "2026-07-01", amountCents: -1_000, label: "PAIEMENT CARTE ÉPICERIE" }
  ];
  const csv: Transaction[] = [
    { id: "csv-b", transactionDate: "2026-07-01", amountCents: -1_000, label: "Paiement carte epicerie" },
    { id: "csv-a", transactionDate: "2026-07-01", amountCents: -1_000, label: "Paiement carte SNCF" }
  ];

  const result = deduplicateTransactions([api, csv]);

  assert.deepEqual(result.transactions.map(transaction => transaction.id), ["api-a", "api-b"]);
  assert.deepEqual(result.matches.map(match => [match.transaction.id, match.duplicate.id]), [
    ["api-b", "csv-b"],
    ["api-a", "csv-a"]
  ]);
  assert.deepEqual(result.toReview, []);
  assert.equal(result.transactions.length + result.matches.length, api.length + csv.length);
});

test("falls back to FIFO when labels tie", () => {
  const first: Transaction[] = [
    { id: "first-a", transactionDate: "2026-07-02", amountCents: -500, label: "Même libellé" },
    { id: "first-b", transactionDate: "2026-07-02", amountCents: -500, label: "Même libellé" }
  ];
  const second: Transaction[] = [
    { id: "second-a", transactionDate: "2026-07-02", amountCents: -500, label: "Meme libelle" },
    { id: "second-b", transactionDate: "2026-07-02", amountCents: -500, label: "Meme libelle" }
  ];

  const result = deduplicateTransactions([first, second]);

  assert.deepEqual(result.matches.map(match => [match.transaction.id, match.duplicate.id]), [
    ["first-a", "second-a"],
    ["first-b", "second-b"]
  ]);
  assert.equal(result.transactions.length, 2);
});

test("keeps same-day same-amount transactions and marks an unlabeled cross-channel match for review", () => {
  const first: Transaction[] = [
    { id: "first-a", transactionDate: "2026-07-02", amountCents: 2_200 },
    { id: "first-b", transactionDate: "2026-07-02", amountCents: 2_200 }
  ];
  const second: Transaction[] = [
    { id: "second-a", transactionDate: "2026-07-02", amountCents: 2_200 }
  ];

  const result = deduplicateTransactions([first, second]);

  assert.deepEqual(result.transactions.map(transaction => transaction.id), ["first-a", "first-b", "second-a"]);
  assert.deepEqual(result.matches, []);
  assert.deepEqual(result.toReview.map(transaction => transaction.id), ["second-a", "first-a", "first-b"]);
});

test("is idempotent across repeated ingestions and signs API amounts from the indicator", () => {
  const transaction: Transaction = {
    id: "api",
    transactionDate: "2026-07-03",
    amountCents: signedAmountCents(1_234, "DBIT"),
    label: "Virement DEFAULT référence"
  };
  const replay: Transaction = {
    ...transaction,
    id: "csv",
    amountCents: signedAmountCents(-1_234, "DBIT"),
    label: "virement reference"
  };

  const first = deduplicateTransactions([[transaction], [replay]]);
  const second = deduplicateTransactions([first.transactions, [replay]]);

  assert.equal(signedAmountCents(-1_234, "CRDT"), 1_234);
  assert.equal(first.transactions.length, 1);
  assert.equal(second.transactions.length, 1);
  assert.equal(second.matches.length, 1);
});
