import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { openDatabase } from "./db.js";
import { parsePdfStatement } from "./pdf-import.js";
import { requalifyTransactions } from "./qualification.js";

type ManifestDocument = {
  id: string;
  institution: string;
  period_start: string;
  period_end: string;
  format: "pdf" | "csv";
  sha256: string;
  expected_accounts: number;
  expected_raw_movements: number;
};

type OracleMovement = {
  id: string;
  document_id: string;
  account: string;
  institution: string;
  date: string;
  amount_cents: number;
  label: string;
};

type OracleDecision = OracleMovement & {
  nature: "virement_interne" | "virement_a_verifier" | "externe_probable";
};

type OraclePair = { outgoing_id: string; incoming_id: string; confidence: string };

type ObservedMovement = {
  documentId: string;
  institution: string;
  sourceAccount: string;
  accountIban: string | null;
  date: string;
  amountCents: number;
  label: string;
  qualificationLabel: string;
  source: "PDF_RELEVE" | "CSV_IMPORT";
};

const windowsHome = join("/mnt/c/Users", process.env.USER ?? "");
const repository = process.env.GESTIO_T27_ORACLE_REPO ?? join(windowsHome, "Documents/releves-pdf");
const institutionNames = {
  LA_BANQUE_POSTALE: "La Banque Postale",
  NICKEL: "Nickel",
  TRADE_REPUBLIC: "Trade Republic"
} as const;

test("replays the validated T27 oracle through the TypeScript import chain", async t => {
  const expectedPath = join(repository, "oracle/expected-final.json");
  const manifestPath = join(repository, "oracle/corpus-manifest.json");
  const localPathsPath = join(repository, "oracle/local-paths.json");
  if (![expectedPath, manifestPath, localPathsPath].every(existsSync)) {
    t.skip("Oracle T27 privé indisponible");
    return;
  }
  if (!process.env.GESTIO_PERSONAL_NAMES?.trim()) {
    t.skip("GESTIO_PERSONAL_NAMES non configuré pour rejouer l'oracle privé");
    return;
  }

  const oracle = JSON.parse(readFileSync(expectedPath, "utf8")) as {
    status: string;
    totals: { raw_movements: number; amount_cents: number };
    movements: OracleMovement[];
    decisions: OracleDecision[];
    internal_pairs: OraclePair[];
  };
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as { documents: ManifestDocument[] };
  const localPaths = JSON.parse(readFileSync(localPathsPath, "utf8")) as Record<string, string>;
  assert.equal(oracle.status, "validated");
  assert.deepEqual(Object.keys(localPaths).sort(), manifest.documents.map(document => document.id).sort());

  const observed: ObservedMovement[] = [];
  for (const document of [...manifest.documents].sort((left, right) => left.id.localeCompare(right.id))) {
    const path = localPaths[document.id];
    assert.ok(existsSync(path), `Document oracle absent : ${document.id}`);
    const bytes = readFileSync(path);
    assert.equal(createHash("sha256").update(bytes).digest("hex"), document.sha256, `Document oracle modifié : ${document.id}`);

    const movements = document.format === "pdf"
      ? await pdfMovements(document, bytes)
      : revolutCsvMovements(document, bytes.toString("utf8"));
    assert.equal(movements.length, document.expected_raw_movements);
    observed.push(...movements);
  }
  assert.equal(observed.length, oracle.totals.raw_movements);
  assert.equal(observed.reduce((total, movement) => total + movement.amountCents, 0), oracle.totals.amount_cents);

  const expectedAccounts = matchAccounts(observed, oracle.movements);
  const directory = mkdtempSync(join(tmpdir(), "gestio-oracle-"));
  const database = openDatabase({ path: join(directory, "gestio.db"), key: "test-db-key-32-random-characters" });
  t.after(() => {
    database.close();
    rmSync(directory, { recursive: true, force: true });
  });

  const institutionIds = new Map<string, number>();
  const accountIds = new Map<string, number>();
  for (const movement of observed) {
    const actualAccount = accountKey(movement);
    let institutionId = institutionIds.get(movement.institution);
    if (!institutionId) {
      institutionId = Number(database.sqlite.prepare(
        "INSERT INTO institutions (name, country) VALUES (?, 'XX')"
      ).run(movement.institution).lastInsertRowid);
      institutionIds.set(movement.institution, institutionId);
    }
    if (!accountIds.has(actualAccount)) {
      const iban = observed.find(candidate => accountKey(candidate) === actualAccount && candidate.accountIban)?.accountIban;
      accountIds.set(actualAccount, Number(database.sqlite.prepare(`
        INSERT INTO accounts (institution_id, name, type, iban) VALUES (?, ?, 'OTHER', ?)
      `).run(institutionId, movement.sourceAccount, iban ?? null).lastInsertRowid));
    }
  }

  const inserted = new Map<number, ObservedMovement>();
  const insert = database.sqlite.prepare(`
    INSERT INTO transactions
      (account_id, transaction_date, label, qualification_label, amount_cents, source, fingerprint)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  for (const [index, movement] of observed.entries()) {
    const result = insert.run(
      accountIds.get(accountKey(movement))!,
      movement.date,
      movement.label,
      movement.qualificationLabel,
      movement.amountCents,
      movement.source,
      `oracle-${index}`
    );
    inserted.set(Number(result.lastInsertRowid), movement);
  }

  const qualifications = requalifyTransactions(database);
  const storedLabels = database.sqlite.prepare("SELECT id, label FROM transactions ORDER BY id").all() as Array<{ id: number; label: string }>;
  assert.ok(storedLabels.every(row => row.label === inserted.get(row.id)!.label), "La qualification a modifié un libellé brut");

  const oracleMovementById = new Map(oracle.movements.map(movement => [movement.id, movement]));
  const expectedNatures = oracle.decisions.map(decision =>
    `${movementKey(expectedAccounts.get(expectedAccountKey(decision))!, decision.date, decision.amount_cents)}|${({
      virement_interne: "virement_intercompte",
      virement_a_verifier: "virement_a_verifier",
      externe_probable: "virement_externe"
    } as const)[decision.nature]}`
  ).sort();
  const actualNatures = qualifications.filter(qualification => qualification.nature.startsWith("virement")).map(qualification => {
    const movement = inserted.get(qualification.id)!;
    return `${movementKey(accountKey(movement), movement.date, movement.amountCents)}|${qualification.nature}`;
  }).sort();
  const expectedDecisionKeys = new Map<string, number>();
  for (const decision of oracle.decisions) {
    const key = movementKey(expectedAccounts.get(expectedAccountKey(decision))!, decision.date, decision.amount_cents);
    expectedDecisionKeys.set(key, (expectedDecisionKeys.get(key) ?? 0) + 1);
  }
  const extraDecisionCount = qualifications.filter(qualification => qualification.nature.startsWith("virement")).reduce((total, qualification) => {
    const movement = inserted.get(qualification.id)!;
    const key = movementKey(accountKey(movement), movement.date, movement.amountCents);
    const count = expectedDecisionKeys.get(key) ?? 0;
    if (count) {
      expectedDecisionKeys.set(key, count - 1);
      return total;
    }
    return total + 1;
  }, 0);

  const expectedPairs = oracle.internal_pairs.map(pair => {
    const left = oracleMovementById.get(pair.outgoing_id)!;
    const right = oracleMovementById.get(pair.incoming_id)!;
    return pairKey(
      expectedAccounts.get(expectedAccountKey(left))!, left.date, left.amount_cents,
      expectedAccounts.get(expectedAccountKey(right))!, right.date, right.amount_cents
    );
  }).sort();
  const actualPairs = qualifications.flatMap(qualification => {
    if (qualification.nature !== "virement_intercompte" || !qualification.linkedTransactionId || qualification.id > qualification.linkedTransactionId) return [];
    const left = inserted.get(qualification.id)!;
    const right = inserted.get(qualification.linkedTransactionId)!;
    return [pairKey(
      accountKey(left), left.date, left.amountCents,
      accountKey(right), right.date, right.amountCents
    )];
  }).sort();
  assert.deepEqual({
    extraDecisions: extraDecisionCount,
    decisionDifferences: multisetDifference(actualNatures, expectedNatures),
    pairDifferences: multisetDifference(actualPairs, expectedPairs),
    decisions: actualNatures.length,
    pairs: actualPairs.length
  }, {
    extraDecisions: 0,
    decisionDifferences: 0,
    pairDifferences: 0,
    decisions: expectedNatures.length,
    pairs: expectedPairs.length
  });
});

async function pdfMovements(document: ManifestDocument, bytes: Buffer): Promise<ObservedMovement[]> {
  const statement = await parsePdfStatement(new Uint8Array(bytes));
  assert.equal(institutionNames[statement.institution], document.institution);
  assert.deepEqual([statement.periodStart, statement.periodEnd], [document.period_start, document.period_end]);
  return statement.accounts.flatMap(account => account.transactions.map(transaction => ({
    documentId: document.id,
    institution: document.institution,
    sourceAccount: `${statement.institution}:${account.key}`,
    accountIban: account.iban ?? null,
    date: transaction.transactionDate,
    amountCents: transaction.amountCents,
    label: transaction.label,
    qualificationLabel: transaction.qualificationLabel ?? transaction.label,
    source: "PDF_RELEVE" as const
  })));
}

function revolutCsvMovements(document: ManifestDocument, text: string): ObservedMovement[] {
  const [header, ...rows] = parseCsv(text.replace(/^\uFEFF/, ""));
  assert.ok(header);
  const column = (name: string) => {
    const index = header.indexOf(name);
    assert.notEqual(index, -1, `Colonne Revolut absente : ${name}`);
    return index;
  };
  const dateColumn = column("Date de début");
  const stateColumn = column("État");
  const accountColumn = column("Produit");
  const amountColumn = column("Montant");
  const labelColumn = column("Description");
  const typeColumn = column("Type");
  return rows.flatMap(row => {
    if (comparable(row[stateColumn]) !== "TERMINE") return [];
    const amountCents = Math.round(Number(row[amountColumn]) * 100);
    assert.ok(Number.isSafeInteger(amountCents));
    const label = row[labelColumn].trim();
    return [{
      documentId: document.id,
      institution: document.institution,
      sourceAccount: row[accountColumn] || "Compte Revolut",
      accountIban: null,
      date: row[dateColumn].slice(0, 10),
      amountCents,
      label,
      qualificationLabel: `${row[typeColumn]} ${label}`.replace(/\s+/g, " ").trim(),
      source: "CSV_IMPORT" as const
    }];
  });
}

function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (character === '"') {
      if (quoted && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else quoted = !quoted;
    } else if (character === "," && !quoted) {
      row.push(field);
      field = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && text[index + 1] === "\n") index += 1;
      row.push(field);
      if (row.some(value => value.length)) rows.push(row);
      row = [];
      field = "";
    } else field += character;
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function matchAccounts(observed: ObservedMovement[], expected: OracleMovement[]) {
  const actualGroups = groupBy(observed, accountKey);
  const expectedGroups = groupBy(expected, expectedAccountKey);
  const result = new Map<string, string>();
  for (const [expectedKey, movements] of expectedGroups) {
    const institution = movements[0].institution;
    const candidates = [...actualGroups.entries()]
      .filter(([, values]) => values[0].institution === institution)
      .map(([key, values]) => ({ key, overlap: signatureOverlap(movements, values) }))
      .sort((left, right) => right.overlap - left.overlap);
    assert.ok(candidates[0]?.overlap > 0, `Correspondance de compte oracle absente : ${institution}`);
    assert.notEqual(candidates[0].overlap, candidates[1]?.overlap, `Correspondance de compte oracle ambiguë : ${institution}`);
    result.set(expectedKey, candidates[0].key);
  }
  for (const [actualKey, movements] of actualGroups) {
    const matched = [...expectedGroups.entries()]
      .filter(([expectedKey]) => result.get(expectedKey) === actualKey)
      .flatMap(([, values]) => values);
    assert.equal(matched.length, movements.length, "Le nombre de mouvements d'un compte diffère de l'oracle");
    assert.equal(
      matched.reduce((total, movement) => total + movement.amount_cents, 0),
      movements.reduce((total, movement) => total + movement.amountCents, 0),
      "La somme des mouvements d'un compte diffère de l'oracle"
    );
  }
  return result;
}

function groupBy<T>(values: readonly T[], key: (value: T) => string) {
  const result = new Map<string, T[]>();
  for (const value of values) result.set(key(value), [...(result.get(key(value)) ?? []), value]);
  return result;
}

function signatures(values: readonly (ObservedMovement | OracleMovement)[]) {
  return values.map(value => "documentId" in value
    ? `${value.documentId}|${value.date}|${value.amountCents}`
    : `${value.document_id}|${value.date}|${value.amount_cents}`
  ).sort();
}

function signatureOverlap(expected: readonly OracleMovement[], values: readonly ObservedMovement[]) {
  const remaining = new Map<string, number>();
  for (const signature of signatures(values)) remaining.set(signature, (remaining.get(signature) ?? 0) + 1);
  return signatures(expected).reduce((overlap, signature) => {
    const count = remaining.get(signature) ?? 0;
    if (!count) return overlap;
    remaining.set(signature, count - 1);
    return overlap + 1;
  }, 0);
}

function accountKey(movement: ObservedMovement) {
  return `${movement.institution}\0${movement.sourceAccount}`;
}

function expectedAccountKey(movement: OracleMovement) {
  return `${movement.institution}\0${movement.account}`;
}

function movementKey(account: string, date: string, amountCents: number) {
  return `${account}|${date}|${amountCents}`;
}

function pairKey(leftAccount: string, leftDate: string, leftAmount: number, rightAccount: string, rightDate: string, rightAmount: number) {
  return [
    movementKey(leftAccount, leftDate, leftAmount),
    movementKey(rightAccount, rightDate, rightAmount)
  ].sort().join("<->");
}

function comparable(value: string) {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toUpperCase();
}

function multisetDifference(actual: readonly string[], expected: readonly string[]) {
  const actualCounts = new Map<string, number>();
  const expectedCounts = new Map<string, number>();
  for (const value of actual) actualCounts.set(value, (actualCounts.get(value) ?? 0) + 1);
  for (const value of expected) expectedCounts.set(value, (expectedCounts.get(value) ?? 0) + 1);
  const keys = new Set([...actualCounts.keys(), ...expectedCounts.keys()]);
  return [...keys].reduce(
    (total, key) => total + Math.abs((actualCounts.get(key) ?? 0) - (expectedCounts.get(key) ?? 0)),
    0
  ) / 2;
}
