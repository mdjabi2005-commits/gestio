export type TransactionForDeduplication = {
  transactionDate: string;
  amountCents: number;
  label?: string | null;
};

export function deduplicateTransactions<T extends TransactionForDeduplication>(
  channels: ReadonlyArray<ReadonlyArray<T>>
) {
  const transactions: T[] = [];
  const matches: Array<{ transaction: T; duplicate: T; jaccard: number }> = [];
  const toReview = new Set<T>();

  for (const channel of channels) {
    const candidatesByKey = new Map<string, T[]>();
    for (const transaction of transactions) {
      const key = matchKey(transaction);
      const queue = candidatesByKey.get(key) ?? [];
      queue.push(transaction);
      candidatesByKey.set(key, queue);
    }

    for (const transaction of channel) {
      const candidates = candidatesByKey.get(matchKey(transaction)) ?? [];

      let matchIndex = -1;
      let score = 0;
      if (candidates.length === 1) {
        score = jaccard(transaction.label, candidates[0].label);
        if (!hasLabel(transaction) || !hasLabel(candidates[0]) || score > 0) matchIndex = 0;
      } else if (candidates.length > 1 && hasLabel(transaction) && candidates.every(hasLabel)) {
        const scores = candidates.map(candidate => jaccard(transaction.label, candidate.label));
        score = Math.max(...scores);
        if (score > 0) matchIndex = scores.indexOf(score);
      }

      if (matchIndex >= 0) {
        const [match] = candidates.splice(matchIndex, 1);
        matches.push({ transaction: match, duplicate: transaction, jaccard: score });
      } else {
        transactions.push(transaction);
        if (candidates.length) {
          toReview.add(transaction);
          candidates.forEach(candidate => toReview.add(candidate));
        }
      }
    }
  }

  return { transactions, matches, toReview: [...toReview] };
}

export function signedAmountCents(amountCents: number, indicator: "CRDT" | "DBIT") {
  return indicator === "CRDT" ? Math.abs(amountCents) : -Math.abs(amountCents);
}

export function normalizeTransactionLabel(label: string) {
  return label
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/\bdefault\b/g, " ")
    .replace(/[^\p{Letter}\p{Number}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function matchKey(transaction: TransactionForDeduplication) {
  return `${transaction.transactionDate}\0${transaction.amountCents}`;
}

function hasLabel(transaction: TransactionForDeduplication): transaction is TransactionForDeduplication & { label: string } {
  return typeof transaction.label === "string" && normalizeTransactionLabel(transaction.label) !== "";
}

function jaccard(leftLabel: string | null | undefined, rightLabel: string | null | undefined) {
  const left = new Set(normalizeTransactionLabel(leftLabel ?? "").split(" ").filter(Boolean));
  const right = new Set(normalizeTransactionLabel(rightLabel ?? "").split(" ").filter(Boolean));
  if (!left.size && !right.size) return 1;

  const intersection = [...left].filter(token => right.has(token)).length;
  return intersection / new Set([...left, ...right]).size;
}
