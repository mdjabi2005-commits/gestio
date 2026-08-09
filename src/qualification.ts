import type { AppDatabase } from "./db.js";
import { normalizeTransactionLabel } from "./deduplication.js";
import type { TransactionNature } from "./schema.js";

const IBAN_LENGTHS = { DE: 22, FR: 27 } as const;
const INSTITUTION_ALIASES: Record<string, readonly string[]> = {
  "LA BANQUE POSTALE": ["BANQUE POSTALE"],
  NICKEL: ["NICKEL"],
  REVOLUT: ["REVOLUT", "POCKET", "COMPTE D EPARGNE"],
  "TRADE REPUBLIC": ["TRADE REPUBLIC", "PEA"]
};

export type TransactionForQualification = {
  id: number;
  accountId: number;
  institutionId: number;
  institutionName: string;
  accountIban: string | null;
  transactionDate: string;
  amountCents: number;
  label: string;
};

export type Qualification = {
  id: number;
  nature: TransactionNature;
  confidence: "certaine" | "forte" | "faible" | "probable";
  evidence: "iban" | "même institution" | "banque nommée" | "libellé" | "aucune";
  linkedTransactionId?: number;
  targetIban?: string;
};

type Candidate = {
  outgoing: TransactionForQualification;
  incoming: TransactionForQualification;
  score: number;
  confidence: Qualification["confidence"];
  evidence: Qualification["evidence"];
};

export function normalizeIban(value: string | null | undefined) {
  return value ? value.toUpperCase().replace(/\s+/g, "") : null;
}

export function extractIbans(value: string) {
  const result = new Set<string>();
  const upper = value.toUpperCase();
  for (const [country, length] of Object.entries(IBAN_LENGTHS)) {
    const pattern = new RegExp(`\\b${country}\\s?\\d{2}(?:\\s?[A-Z0-9]){${length - 4}}\\b`, "g");
    for (const match of upper.matchAll(pattern)) result.add(match[0].replace(/\s+/g, ""));
  }
  return result;
}

export function qualifyTransactions(
  transactions: readonly TransactionForQualification[],
  personalNames: readonly string[] = []
) {
  const normalized = transactions.map(transaction => ({ ...transaction, accountIban: normalizeIban(transaction.accountIban) }));
  const ibansByInstitution = discoverIbans(normalized, personalNames);
  const personalIbans = new Set([...ibansByInstitution.values()].flatMap(ibans => [...ibans]));
  const transfers = normalized.filter(transaction => transaction.amountCents !== 0 && isTransfer(transaction.label));
  const candidates = transfers.filter(transaction => transaction.amountCents < 0).flatMap(outgoing =>
    transfers.filter(transaction => transaction.amountCents > 0).flatMap(incoming => {
      if (outgoing.accountId === incoming.accountId || outgoing.amountCents !== -incoming.amountCents) return [];
      const days = dayDifference(outgoing.transactionDate, incoming.transactionDate);
      if (days > 4) return [];
      return [{ outgoing, incoming, ...internalScore(outgoing, incoming, ibansByInstitution, days) }];
    })
  );
  const pairs = matchCandidates(candidates);

  const result = new Map<number, Qualification>();
  for (const pair of pairs) {
    for (const [movement, linked] of [[pair.outgoing, pair.incoming], [pair.incoming, pair.outgoing]] as const) {
      if (pair.confidence === "probable" || pair.confidence === "faible") {
        result.set(movement.id, { id: movement.id, nature: "virement_a_verifier", confidence: "faible", evidence: pair.evidence });
        continue;
      }
      result.set(movement.id, {
        id: movement.id,
        nature: "virement_intercompte",
        confidence: pair.confidence,
        evidence: pair.evidence,
        linkedTransactionId: linked.id,
        ...(linked.accountIban ? { targetIban: linked.accountIban } : {})
      });
    }
  }

  const pairedIds = new Set(pairs.flatMap(pair => [pair.outgoing.id, pair.incoming.id]));
  const ambiguousIds = new Set(candidates.flatMap(candidate =>
    pairedIds.has(candidate.outgoing.id) || pairedIds.has(candidate.incoming.id) ? [] : [candidate.outgoing.id, candidate.incoming.id]
  ));
  for (const id of ambiguousIds) result.set(id, { id, nature: "virement_a_verifier", confidence: "faible", evidence: "aucune" });

  for (const transaction of normalized) {
    if (!result.has(transaction.id)) {
      const qualification = qualifyAlone(transaction, personalIbans, personalNames);
      if (qualification) result.set(transaction.id, qualification);
    }
  }
  return [...result.values()];
}

export function requalifyTransactions(database: AppDatabase) {
  const rows = database.sqlite.prepare(`
    SELECT t.id, t.account_id AS accountId, a.institution_id AS institutionId,
           i.name AS institutionName, a.iban AS accountIban,
           t.transaction_date AS transactionDate, t.amount_cents AS amountCents, t.label
    FROM transactions t
    JOIN accounts a ON a.id = t.account_id
    JOIN institutions i ON i.id = a.institution_id
  `).all() as TransactionForQualification[];
  const names = (process.env.GESTIO_PERSONAL_NAMES ?? "").split(",").map(value => value.trim()).filter(Boolean);
  const byId = new Map(qualifyTransactions(rows, names).map(qualification => [qualification.id, qualification.nature]));
  // ponytail: full rewrite is enough for one user; make it incremental only if transaction volume makes this measurable.
  database.sqlite.transaction(() => {
    const update = database.sqlite.prepare("UPDATE transactions SET nature = ? WHERE id = ? AND nature IS NOT ?");
    for (const row of rows) update.run(byId.get(row.id) ?? null, row.id, byId.get(row.id) ?? null);
  })();
  return byId;
}

function qualifyAlone(
  transaction: TransactionForQualification,
  personalIbans: ReadonlySet<string>,
  personalNames: readonly string[]
): Qualification | undefined {
  if (!transaction.amountCents) return undefined;
  const text = normalizedText(transaction.label);
  if (text.includes("RETRAIT DAB") && !text.includes("FRAIS RETRAIT")) return qualification(transaction.id, "retrait_especes");
  if (text.includes("FRAIS RETRAIT")) return qualification(transaction.id, "frais_retrait");
  if ((text.includes("DEPOT AGENCE") || text.includes("DEPOT D ESPECES")) && !text.includes("FRAIS DEPOT")) return qualification(transaction.id, "depot_especes");
  if (!isTransfer(transaction.label)) return undefined;

  const ibans = extractIbans(text);
  const personalIban = [...ibans].find(iban => personalIbans.has(iban));
  if (personalIban) {
    return { id: transaction.id, nature: "virement_a_verifier", confidence: "faible", evidence: "iban", targetIban: personalIban };
  }
  const externalIban = [...ibans].find(iban => !personalIbans.has(iban));
  if (externalIban && !hasPersonalHint(text, personalNames)) {
    return { id: transaction.id, nature: "virement_externe", confidence: "forte", evidence: "iban", targetIban: externalIban };
  }
  if (hasPersonalHint(text, personalNames)) {
    return { id: transaction.id, nature: "virement_a_verifier", confidence: "faible", evidence: "libellé" };
  }
  return {
    id: transaction.id,
    nature: "virement_externe",
    confidence: "probable",
    evidence: "aucune",
    ...(externalIban ? { targetIban: externalIban } : {})
  };
}

function qualification(id: number, nature: TransactionNature): Qualification {
  return { id, nature, confidence: "certaine", evidence: "libellé" };
}

function discoverIbans(transactions: readonly TransactionForQualification[], personalNames: readonly string[]) {
  const result = new Map<number, Set<string>>();
  for (const transaction of transactions) {
    const ibans = result.get(transaction.institutionId) ?? new Set<string>();
    if (transaction.accountIban) ibans.add(transaction.accountIban);
    result.set(transaction.institutionId, ibans);
  }
  const institutions = new Map(transactions.map(transaction => [transaction.institutionId, transaction.institutionName]));
  for (const transaction of transactions) {
    const text = normalizedText(transaction.label);
    if (!hasConfiguredPersonalName(text, personalNames)) continue;
    const ibans = extractIbans(text);
    for (const [institutionId, institutionName] of institutions) {
      if (aliases(institutionName).some(alias => text.includes(alias))) {
        const known = result.get(institutionId) ?? new Set<string>();
        ibans.forEach(iban => known.add(iban));
        result.set(institutionId, known);
      }
    }
  }
  return result;
}

function matchCandidates(initial: readonly Candidate[]) {
  const result: Candidate[] = [];
  let candidates = [...initial];
  while (candidates.length) {
    const accepted = candidates.filter(candidate => {
      const outgoingScores = candidates.filter(other => other.outgoing.id === candidate.outgoing.id).map(other => other.score);
      const incomingScores = candidates.filter(other => other.incoming.id === candidate.incoming.id).map(other => other.score);
      return candidate.score === Math.max(...outgoingScores)
        && candidate.score === Math.max(...incomingScores)
        && outgoingScores.filter(score => score === candidate.score).length === 1
        && incomingScores.filter(score => score === candidate.score).length === 1;
    });
    if (!accepted.length) break;
    result.push(...accepted);
    const used = new Set(accepted.flatMap(candidate => [candidate.outgoing.id, candidate.incoming.id]));
    candidates = candidates.filter(candidate => !used.has(candidate.outgoing.id) && !used.has(candidate.incoming.id));
  }
  return result;
}

function internalScore(
  a: TransactionForQualification,
  b: TransactionForQualification,
  ibansByInstitution: ReadonlyMap<number, ReadonlySet<string>>,
  days: number
) {
  const ibansA = extractIbans(a.label);
  const ibansB = extractIbans(b.label);
  const textA = normalizedText(a.label);
  const textB = normalizedText(b.label);
  if (a.institutionId === b.institutionId && textA === textB) {
    return { score: 120 - days, confidence: "certaine" as const, evidence: "libellé" as const };
  }
  if ((b.accountIban && ibansA.has(b.accountIban)) || (a.accountIban && ibansB.has(a.accountIban))) {
    return { score: 110 - days, confidence: "certaine" as const, evidence: "iban" as const };
  }
  if (intersects(ibansA, ibansByInstitution.get(b.institutionId)) || intersects(ibansB, ibansByInstitution.get(a.institutionId))) {
    return { score: 100 - days, confidence: "certaine" as const, evidence: "iban" as const };
  }
  if (a.institutionId === b.institutionId) {
    return { score: 90 - days, confidence: "certaine" as const, evidence: "même institution" as const };
  }
  if (aliases(b.institutionName).some(alias => textA.includes(alias)) || aliases(a.institutionName).some(alias => textB.includes(alias))) {
    return { score: 80 - days, confidence: "forte" as const, evidence: "banque nommée" as const };
  }
  return days === 0
    ? { score: 60, confidence: "probable" as const, evidence: "aucune" as const }
    : { score: 50 - days, confidence: "faible" as const, evidence: "aucune" as const };
}

function isTransfer(label: string) {
  const text = normalizedText(label);
  return ["VIREMENT", "TRANSFER", "AJOUT DE FONDS", "COMPTE D EPARGNE"].some(term => text.includes(term));
}

function hasPersonalHint(text: string, personalNames: readonly string[]) {
  return [...Object.values(INSTITUTION_ALIASES).flat()].some(hint => text.includes(hint))
    || hasConfiguredPersonalName(text, personalNames);
}

function hasConfiguredPersonalName(text: string, personalNames: readonly string[]) {
  return personalNames.map(normalizedText).filter(Boolean).some(name => text.includes(name));
}

function aliases(institution: string) {
  return INSTITUTION_ALIASES[normalizedText(institution)] ?? [normalizedText(institution)];
}

function normalizedText(value: string) {
  return normalizeTransactionLabel(value).toUpperCase();
}

function dayDifference(left: string, right: string) {
  return Math.abs(Date.parse(`${left}T00:00:00Z`) - Date.parse(`${right}T00:00:00Z`)) / 86_400_000;
}

function intersects(left: ReadonlySet<string>, right: ReadonlySet<string> | undefined) {
  return right ? [...left].some(value => right.has(value)) : false;
}
