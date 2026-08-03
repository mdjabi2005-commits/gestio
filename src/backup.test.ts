import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import Database from "better-sqlite3-multiple-ciphers";

const script = join(process.cwd(), "scripts", "backup.sh");
const key = "test-backup-key";

function encryptedDatabase(path: string, databaseKey = key) {
  const database = new Database(path);
  database.pragma("cipher='sqlcipher'");
  database.pragma("legacy=4");
  database.pragma(`key='${databaseKey}'`);
  return database;
}

test("creates an encrypted backup that the server library can reopen", (t) => {
  assert.equal(spawnSync("sqlcipher", ["-version"]).status, 0, "sqlcipher is required to prove backup compatibility");

  const dir = mkdtempSync(join(tmpdir(), "gestio-backup-"));
  const sourcePath = join(dir, "gestio.db");
  const backupDir = join(dir, "backups");
  t.after(() => rmSync(dir, { recursive: true, force: true }));

  const source = encryptedDatabase(sourcePath);
  source.exec("CREATE TABLE proof (value TEXT NOT NULL); INSERT INTO proof VALUES ('restorable');");
  source.close();

  const result = spawnSync("bash", [script], {
    cwd: dir,
    env: { ...process.env, GESTIO_DB_KEY: key, GESTIO_DB_PATH: sourcePath, GESTIO_BACKUP_DIR: backupDir, SQLITE3_BIN: "sqlcipher" },
    encoding: "utf8"
  });
  assert.equal(result.status, 0, result.stderr);

  const backupPath = join(backupDir, readdirSync(backupDir).at(0)!);
  assert.notEqual(readFileSync(backupPath).subarray(0, 16).toString("utf8"), "SQLite format 3\0");

  const backup = encryptedDatabase(backupPath);
  assert.equal(backup.prepare("SELECT value FROM proof").pluck().get(), "restorable");
  backup.close();
});

test("fails when the key, binary, or export is unavailable", (t) => {
  const dir = mkdtempSync(join(tmpdir(), "gestio-backup-errors-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const env = { ...process.env };
  delete env.GESTIO_DB_KEY;

  assert.notEqual(spawnSync("bash", [script], { cwd: dir, env }).status, 0);
  assert.notEqual(spawnSync("bash", [script], {
    cwd: dir,
    env: { ...env, GESTIO_DB_KEY: key, SQLITE3_BIN: "missing-sqlcipher" }
  }).status, 0);

  const invalidDatabase = join(dir, "invalid.db");
  writeFileSync(invalidDatabase, "not a database");
  assert.notEqual(spawnSync("bash", [script], {
    cwd: dir,
    env: { ...env, GESTIO_DB_KEY: key, GESTIO_DB_PATH: invalidDatabase, GESTIO_BACKUP_DIR: join(dir, "backups"), SQLITE3_BIN: "sqlcipher" }
  }).status, 0);
});
