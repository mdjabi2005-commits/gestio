import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const accountTypes = ["BANK", "LIVRET_A", "OTHER"] as const;
export const transactionSources = ["MANUEL", "ENABLE_BANKING", "CSV_IMPORT", "PDF_RELEVE"] as const;

export type AccountType = (typeof accountTypes)[number];
export type TransactionSource = (typeof transactionSources)[number];

export const institutions = sqliteTable("institutions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  country: text("country").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
}, (table) => [
  uniqueIndex("institutions_name_country_unique_idx").on(table.name, table.country)
]);

export const accounts = sqliteTable("accounts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  institutionId: integer("institution_id").references(() => institutions.id),
  name: text("name").notNull(),
  type: text("type", { enum: accountTypes }).notNull(),
  externalUid: text("external_uid"),
  externalHash: text("external_hash"),
  balanceCents: integer("balance_cents"),
  currency: text("currency"),
  lastSyncedAt: text("last_synced_at"),
  knownSince: text("known_since"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
}, (table) => [
  uniqueIndex("accounts_external_hash_unique_idx").on(table.externalHash)
]);

export const transactions = sqliteTable("transactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  accountId: integer("account_id").notNull().references(() => accounts.id, { onDelete: "cascade" }),
  transactionDate: text("transaction_date").notNull(),
  transactionAt: text("transaction_at"),
  label: text("label").notNull(),
  amountCents: integer("amount_cents").notNull(),
  source: text("source", { enum: transactionSources }).notNull(),
  fingerprint: text("fingerprint").notNull(),
  occurrence: integer("occurrence").notNull().default(0),
  externalReference: text("external_reference"),
  needsReview: integer("needs_review", { mode: "boolean" }).notNull().default(false),
  resolvedAt: text("resolved_at"),

  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
}, (table) => [
  uniqueIndex("transactions_fingerprint_occurrence_unique_idx").on(table.fingerprint, table.occurrence)
]);
