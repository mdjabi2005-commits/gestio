import assert from "node:assert/strict";
import test from "node:test";
import { extractIbans, normalizeIban, qualifyTransactions, type TransactionForQualification } from "./qualification.js";

const ibanA = "FR7611111111111111111111111";
const ibanB = "DE11111111111111111111";

function movement(id: number, accountId: number, institutionId: number, institutionName: string, amountCents: number, label: string): TransactionForQualification {
  return { id, accountId, institutionId, institutionName, accountIban: accountId === 1 ? ibanA : ibanB, transactionDate: "2026-06-15", amountCents, label };
}

test("extracts FR and DE IBANs without assuming the account country", () => {
  assert.equal(normalizeIban("fr76 1111 1111 1111 1111 1111 111"), ibanA);
  assert.deepEqual(extractIbans(`De ${ibanA} vers ${ibanB}`), new Set([ibanA, ibanB]));
});

test("matches only mutual unique internal transfers", () => {
  const ibanPair = [
    movement(1, 1, 1, "La Banque Postale", -4_000, `Virement vers ${ibanB}`),
    movement(2, 2, 2, "Trade Republic", 4_000, `Incoming transfer from holder (${ibanA})`)
  ];
  assert.deepEqual(qualifyTransactions(ibanPair).map(({ id, nature, confidence, evidence, linkedTransactionId }) => ({ id, nature, confidence, evidence, linkedTransactionId })), [
    { id: 1, nature: "virement_intercompte", confidence: "certaine", evidence: "iban", linkedTransactionId: 2 },
    { id: 2, nature: "virement_intercompte", confidence: "certaine", evidence: "iban", linkedTransactionId: 1 }
  ]);

  const sameInstitution = [
    movement(6, 1, 1, "Revolut", -1_000, "Virement vers épargne"),
    movement(7, 2, 1, "Revolut", 1_000, "Virement reçu")
  ].map(item => ({ ...item, accountIban: null }));
  assert.ok(qualifyTransactions(sameInstitution).every(item => item.evidence === "même institution"));

  const namedBank = [
    movement(8, 1, 1, "La Banque Postale", -1_500, "Virement vers Trade Republic"),
    movement(9, 2, 2, "Trade Republic", 1_500, "Incoming transfer")
  ].map(item => ({ ...item, accountIban: null }));
  assert.ok(qualifyTransactions(namedBank).every(item => item.evidence === "banque nommée" && item.confidence === "forte"));

  const tied = [
    movement(3, 1, 1, "Banque A", -2_200, "Virement"),
    movement(4, 2, 2, "Banque B", 2_200, "Virement"),
    movement(5, 3, 3, "Banque C", 2_200, "Virement")
  ].map(item => ({ ...item, accountIban: null }));
  assert.equal(qualifyTransactions(tied).some(item => item.nature === "virement_intercompte"), false);
});

test("classifies cash movements and flags configured personal transfers without a mirror", () => {
  const rows = [
    movement(1, 1, 1, "Banque A", -5_000, "Retrait DAB"),
    movement(2, 1, 1, "Banque A", -150, "Frais retrait DAB"),
    movement(3, 1, 1, "Banque A", 10_000, "Dépôt d'espèces"),
    movement(4, 1, 1, "Banque A", -3_000, "Virement à Titulaire Unique")
  ].map(item => ({ ...item, accountIban: null }));
  assert.deepEqual(qualifyTransactions(rows, ["Titulaire Unique"]).map(item => item.nature), [
    "retrait_especes", "frais_retrait", "depot_especes", "virement_a_verifier"
  ]);
});
