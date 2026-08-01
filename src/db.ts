import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import Database from "better-sqlite3-multiple-ciphers";
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema.js";

type RawDatabase = InstanceType<typeof Database>;

export type AppDatabase = {
  sqlite: RawDatabase;
  orm: BetterSQLite3Database<typeof schema>;
  close: () => void;
};

type OpenDatabaseOptions = {
  path?: string;
  key?: string;
};

export function openDatabase(options: OpenDatabaseOptions = {}): AppDatabase {
  const path = options.path ?? process.env.GESTIO_DB_PATH ?? "data/gestio.db";
  const key = options.key ?? process.env.GESTIO_DB_KEY;
  if (!key) {
    throw new Error("GESTIO_DB_KEY is required to open the encrypted database");
  }

  mkdirSync(dirname(path), { recursive: true });

  const sqlite = new Database(path);
  sqlite.pragma("cipher='sqlcipher'");
  sqlite.pragma("legacy=4");
  sqlite.pragma(`key='${key.replaceAll("'", "''")}'`);
  sqlite.pragma("foreign_keys=ON");
  sqlite.pragma("journal_mode=WAL");
  migrate(sqlite);

  return {
    sqlite,
    orm: drizzle(sqlite, { schema }),
    close: () => sqlite.close()
  };
}

function migrate(sqlite: RawDatabase) {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('BANK', 'LIVRET_A', 'OTHER')),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
      transaction_date TEXT NOT NULL,
      label TEXT NOT NULL,
      amount_cents INTEGER NOT NULL,
      source TEXT NOT NULL CHECK (source IN ('MANUEL', 'ENABLE_BANKING', 'CSV_IMPORT', 'PDF_RELEVE')),
      fingerprint TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS transactions_account_id_idx ON transactions(account_id);
    CREATE INDEX IF NOT EXISTS transactions_fingerprint_idx ON transactions(fingerprint);
  `);
}
