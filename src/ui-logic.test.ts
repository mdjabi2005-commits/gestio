import assert from "node:assert/strict";
import test from "node:test";
import {
  groupAccountsByInstitution,
  knownSinceLabel,
  oldestUpdatedAt,
  reviewGroups,
  type UiAccount,
  type UiTransaction
} from "./ui-logic.js";

test("derives the visible balance rules without DOM state", () => {
  const accounts: UiAccount[] = [
    { id: 1, institutionId: 1, institutionName: "La Banque Postale", institutionCountry: "FR", name: "CCP", balanceCents: 120_00, updatedAt: "2026-08-04T10:00:00Z", knownSince: "2026-05-04" },
    { id: 2, institutionId: 1, institutionName: "La Banque Postale", institutionCountry: "FR", name: "Livret A", balanceCents: 80_00, updatedAt: "2026-08-01T09:00:00Z", knownSince: "2025-07-08" },
    { id: 3, institutionId: 2, institutionName: "Revolut", institutionCountry: "LT", name: "Principal", balanceCents: 50_00, updatedAt: "2026-08-03T12:00:00Z", knownSince: null }
  ];

  assert.deepEqual(groupAccountsByInstitution(accounts).map(({ name, balanceCents, accounts }) => ({ name, balanceCents, accounts: accounts.length })), [
    { name: "La Banque Postale", balanceCents: 200_00, accounts: 2 },
    { name: "Revolut", balanceCents: 50_00, accounts: 1 }
  ]);
  assert.equal(oldestUpdatedAt(accounts), "2026-08-01T09:00:00Z");
  assert.equal(knownSinceLabel("2025-07-08"), "Connu depuis le 08/07/2025");
});

test("only exposes unresolved review markers that form a real group", () => {
  const transaction = (id: number, needsReview: boolean, amountCents = -10_00): UiTransaction => ({
    id,
    accountId: 1,
    transactionDate: "2026-08-04",
    amountCents,
    label: `Transaction ${id}`,
    needsReview,
    resolvedAt: null
  });

  assert.deepEqual(reviewGroups([transaction(1, true)]), []);
  assert.deepEqual(reviewGroups([transaction(1, true), transaction(2, true)]).map(group => group.map(item => item.id)), [[1, 2]]);
  assert.deepEqual(reviewGroups([{ ...transaction(1, false), resolvedAt: "2026-08-04 12:00:00" }, transaction(2, false)]), []);
  assert.deepEqual(reviewGroups([transaction(1, true), transaction(2, true, -20_00)]), []);
});
