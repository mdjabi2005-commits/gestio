import { mkdirSync, readdirSync, statSync, unlinkSync } from "node:fs";
import { dirname, join } from "node:path";
import Database from "better-sqlite3-multiple-ciphers";

const key = process.env.GESTIO_DB_KEY;
if (!key) {
  throw new Error("GESTIO_DB_KEY is required");
}

const dbPath = process.env.GESTIO_DB_PATH ?? "data/gestio.db";
const backupDir = process.env.GESTIO_BACKUP_DIR ?? "backups";
const stamp = new Date().toISOString().replaceAll(":", "-").replace(/\.\d{3}Z$/, "Z");
const backupPath = join(backupDir, `gestio-${stamp}.db`);

mkdirSync(dirname(dbPath), { recursive: true });
mkdirSync(backupDir, { recursive: true });

const db = new Database(dbPath);
db.pragma("cipher='sqlcipher'");
db.pragma("legacy=4");
db.pragma(`key='${key.replaceAll("'", "''")}'`);
try {
  db.exec(`VACUUM INTO '${backupPath.replaceAll("'", "''")}'`);
} finally {
  db.close();
}

const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
for (const entry of readdirSync(backupDir)) {
  if (!/^gestio-.*\.db$/.test(entry)) {
    continue;
  }
  const path = join(backupDir, entry);
  if (statSync(path).mtimeMs < cutoff) {
    unlinkSync(path);
  }
}
