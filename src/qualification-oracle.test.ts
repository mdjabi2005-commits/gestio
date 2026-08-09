import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { qualifyTransactions, type TransactionForQualification } from "./qualification.js";

type OracleMovement = {
  id: string;
  account: string;
  institution: string;
  date: string;
  amount_cents: number;
};

type OracleDecision = { id: string; nature: "virement_interne" | "virement_a_verifier" | "externe_probable" };
type OraclePair = { outgoing_id: string; incoming_id: string };

const windowsHome = join("/mnt/c/Users", process.env.USER ?? "");
const repository = process.env.GESTIO_T27_ORACLE_REPO ?? join(windowsHome, "Documents/releves-pdf");

test("replays the validated T27 oracle exactly", () => {
  const expectedPath = join(repository, "oracle/expected-final.json");
  const pythonPath = join(repository, ".venv/bin/python");
  for (const path of [expectedPath, pythonPath]) assert.ok(existsSync(path), `Oracle T27 absent : ${path}`);

  const oracle = JSON.parse(readFileSync(expectedPath, "utf8")) as {
    status: string;
    movements: OracleMovement[];
    decisions: OracleDecision[];
    internal_pairs: OraclePair[];
  };
  assert.equal(oracle.status, "validated");

  const privateInput = JSON.parse(execFileSync(pythonPath, ["-c", pythonInput(repository)], {
    cwd: repository,
    encoding: "utf8",
    env: { ...process.env, PYTHONPATH: "src:." }
  })) as { ibans: Record<string, string | null>; texts: Record<string, string>; personal: string[] };

  const accounts = new Map<string, number>();
  const institutions = new Map<string, number>();
  const oracleIdById = new Map<number, string>();
  const idByOracleId = new Map<string, number>();
  const rows: TransactionForQualification[] = oracle.movements.map((movement, index) => {
    const id = index + 1;
    oracleIdById.set(id, movement.id);
    idByOracleId.set(movement.id, id);
    return {
      id,
      accountId: mapId(accounts, movement.account),
      institutionId: mapId(institutions, movement.institution),
      institutionName: movement.institution,
      accountIban: privateInput.ibans[movement.account] ?? null,
      transactionDate: movement.date,
      amountCents: movement.amount_cents,
      label: privateInput.texts[movement.id]
    };
  });

  const qualifications = qualifyTransactions(rows, privateInput.personal);
  const actualPairs = new Set(qualifications.flatMap(qualification =>
    qualification.nature === "virement_intercompte" && qualification.linkedTransactionId && qualification.id < qualification.linkedTransactionId
      ? [pairKey(qualification.id, qualification.linkedTransactionId)]
      : []
  ));
  const expectedPairs = new Set(oracle.internal_pairs.map(pair =>
    pairKey(idByOracleId.get(pair.outgoing_id)!, idByOracleId.get(pair.incoming_id)!)
  ));
  assert.deepEqual([...actualPairs].sort(), [...expectedPairs].sort());

  const actualByOracleId = new Map(qualifications.map(qualification => [oracleIdById.get(qualification.id)!, qualification.nature]));
  const expectedNatures = new Map(oracle.decisions.map(decision => [decision.id, ({
    virement_interne: "virement_intercompte",
    virement_a_verifier: "virement_a_verifier",
    externe_probable: "virement_externe"
  } as const)[decision.nature]]));
  assert.deepEqual(
    [...actualByOracleId].filter(([id, nature]) => expectedNatures.has(id) || nature.startsWith("virement")).sort(),
    [...expectedNatures].sort()
  );
  assert.equal(rows.length, oracle.movements.length);
});

function mapId(values: Map<string, number>, value: string) {
  const existing = values.get(value);
  if (existing) return existing;
  const id = values.size + 1;
  values.set(value, id);
  return id;
}

function pairKey(left: number, right: number) {
  return left < right ? `${left}:${right}` : `${right}:${left}`;
}

function pythonInput(root: string) {
  return `
import json
from pathlib import Path
from scripts.build_oracle import load_corpus
from gestio_releves.preparation_flux import observer_mouvements, texte_normalise
from gestio_releves.appariement_miroirs import nom_personnel
root = Path(${JSON.stringify(root)})
_, documents = load_corpus(root / "oracle/corpus-manifest.json", root / "oracle/local-paths.json")
movements = observer_mouvements(documents)
print(json.dumps({
    "ibans": {account.nom: account.iban for document in documents for account in document.comptes},
    "texts": {movement.identifiant: texte_normalise(movement) for movement in movements},
    "personal": [texte_normalise(movement) for movement in movements if nom_personnel(texte_normalise(movement))],
}))
`;
}
