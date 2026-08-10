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
    CREATE TABLE IF NOT EXISTS institutions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      country TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(name, country)
    );

    CREATE TABLE IF NOT EXISTS accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      institution_id INTEGER REFERENCES institutions(id),
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('BANK', 'LIVRET_A', 'OTHER')),
      external_uid TEXT,
      external_hash TEXT,
      iban TEXT,
      balance_cents INTEGER,
      currency TEXT,
      last_synced_at TEXT,
      known_since TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
      transaction_date TEXT NOT NULL,
      transaction_at TEXT,
      label TEXT NOT NULL,
      qualification_label TEXT,
      amount_cents INTEGER NOT NULL,
      source TEXT NOT NULL CHECK (source IN ('MANUEL', 'ENABLE_BANKING', 'CSV_IMPORT', 'PDF_RELEVE')),
      fingerprint TEXT NOT NULL,
      occurrence INTEGER NOT NULL DEFAULT 0,
      external_reference TEXT,
      needs_review INTEGER NOT NULL DEFAULT 0,
      resolved_at TEXT,
      nature TEXT CHECK (nature IS NULL OR nature IN ('virement_intercompte', 'virement_externe', 'virement_a_verifier', 'retrait_especes', 'frais_retrait', 'depot_especes')),

      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS bank_connections (
      authorization_id TEXT PRIMARY KEY,
      institution_id INTEGER NOT NULL REFERENCES institutions(id),
      state TEXT NOT NULL UNIQUE,
      session_id TEXT,
      consent_valid_until TEXT,
      status TEXT NOT NULL,
      last_sync_at TEXT,
      last_sync_error TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS local_auth (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS auth_sessions (
      token_hash TEXT PRIMARY KEY,
      expires_at INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS application_secrets (
      name TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS transactions_account_id_idx ON transactions(account_id);
    CREATE UNIQUE INDEX IF NOT EXISTS institutions_name_country_unique_idx ON institutions(name, country);
    DROP INDEX IF EXISTS transactions_fingerprint_idx;
  `);

  const columns = sqlite.pragma("table_info(transactions)") as Array<{ name: string }>;
  if (!columns.some(column => column.name === "transaction_at")) {
    sqlite.exec("ALTER TABLE transactions ADD COLUMN transaction_at TEXT");
  }
  if (!columns.some(column => column.name === "occurrence")) {
    sqlite.exec("ALTER TABLE transactions ADD COLUMN occurrence INTEGER NOT NULL DEFAULT 0");
  }
  sqlite.exec(`
    DROP INDEX IF EXISTS transactions_fingerprint_unique_idx;
    CREATE UNIQUE INDEX IF NOT EXISTS transactions_fingerprint_occurrence_unique_idx
      ON transactions(fingerprint, occurrence);
  `);

  addColumn(sqlite, "accounts", "institution_id", "INTEGER REFERENCES institutions(id)");
  addColumn(sqlite, "accounts", "external_uid", "TEXT");
  addColumn(sqlite, "accounts", "external_hash", "TEXT");
  addColumn(sqlite, "accounts", "iban", "TEXT");
  addColumn(sqlite, "accounts", "balance_cents", "INTEGER");
  addColumn(sqlite, "accounts", "currency", "TEXT");
  addColumn(sqlite, "accounts", "last_synced_at", "TEXT");
  addColumn(sqlite, "accounts", "known_since", "TEXT");
  addColumn(sqlite, "transactions", "external_reference", "TEXT");
  addColumn(sqlite, "transactions", "qualification_label", "TEXT");
  addColumn(sqlite, "transactions", "needs_review", "INTEGER NOT NULL DEFAULT 0");
  addColumn(sqlite, "transactions", "resolved_at", "TEXT");
  addColumn(sqlite, "transactions", "nature", "TEXT");
  sqlite.exec("CREATE UNIQUE INDEX IF NOT EXISTS accounts_external_hash_unique_idx ON accounts(external_hash)");

  if (sqlite.prepare("SELECT 1 FROM accounts WHERE institution_id IS NULL LIMIT 1").get()) {
    sqlite.prepare("INSERT OR IGNORE INTO institutions (name, country) VALUES ('Comptes manuels', 'XX')").run();
    sqlite.prepare(`
      UPDATE accounts
      SET institution_id = (SELECT id FROM institutions WHERE name = 'Comptes manuels' AND country = 'XX')
      WHERE institution_id IS NULL
    `).run();
  }
}

function addColumn(sqlite: RawDatabase, table: string, column: string, definition: string) {
  const columns = sqlite.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>;
  if (!columns.some(candidate => candidate.name === column)) {
    sqlite.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}
