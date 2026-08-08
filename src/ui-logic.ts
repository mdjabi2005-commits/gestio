export type UiAccount = {
  id: number;
  institutionId: number;
  institutionName: string;
  institutionCountry: string;
  name: string;
  balanceCents: number | null;
  updatedAt: string | null;
  knownSince: string | null;
  currency?: string | null;
  type?: string;
};

export type UiTransaction = {
  id: number;
  accountId: number;
  transactionDate: string;
  amountCents: number;
  label: string;
  needsReview: boolean;
  resolvedAt: string | null;
  transactionAt?: string | null;
  source?: string;
  createdAt?: string;
};

export function groupAccountsByInstitution(accounts: readonly UiAccount[]) {
  const institutions = new Map<number, {
    id: number;
    name: string;
    country: string;
    balanceCents: number;
    unknownBalanceCount: number;
    accounts: UiAccount[];
  }>();
  for (const account of accounts) {
    const institution = institutions.get(account.institutionId) ?? {
      id: account.institutionId,
      name: account.institutionName,
      country: account.institutionCountry,
      balanceCents: 0,
      unknownBalanceCount: 0,
      accounts: []
    };
    institution.balanceCents += account.balanceCents ?? 0;
    if (account.balanceCents === null) institution.unknownBalanceCount += 1;
    institution.accounts.push(account);
    institutions.set(account.institutionId, institution);
  }
  return [...institutions.values()];
}

export function oldestUpdatedAt(accounts: readonly UiAccount[]) {
  let oldest: string | null = null;
  for (const account of accounts) {
    if (!account.updatedAt) continue;
    if (!oldest || dateValue(account.updatedAt) < dateValue(oldest)) oldest = account.updatedAt;
  }
  return oldest;
}

export function missingUpdatedAtCount(accounts: readonly UiAccount[]) {
  return accounts.filter(account => !account.updatedAt).length;
}

export function knownSinceLabel(date: string | null) {
  if (!date) return null;
  const [year, month, day] = date.split("-");
  return year && month && day ? `Connu depuis le ${day}/${month}/${year}` : null;
}

export function reviewGroups(transactions: readonly UiTransaction[]) {
  const groups = new Map<string, UiTransaction[]>();
  for (const transaction of transactions) {
    const key = `${transaction.accountId}\0${transaction.transactionDate}\0${transaction.amountCents}`;
    const group = groups.get(key) ?? [];
    group.push(transaction);
    groups.set(key, group);
  }
  return [...groups.values()].filter(group =>
    group.length > 1 && group.some(transaction => transaction.needsReview && !transaction.resolvedAt)
  );
}

export function visibleTransactionLabel(transaction: Pick<UiTransaction, "id" | "label">) {
  return transaction.label || `Sans libellé n°${transaction.id}`;
}

function dateValue(value: string) {
  return Date.parse(value.includes("T") ? value : `${value.replace(" ", "T")}Z`);
}
