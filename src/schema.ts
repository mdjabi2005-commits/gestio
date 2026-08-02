import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const accountTypes = ["BANK", "LIVRET_A", "OTHER"] as const;
export const transactionSources = ["MANUEL", "ENABLE_BANKING", "CSV_IMPORT", "PDF_RELEVE"] as const;

export type AccountType = (typeof accountTypes)[number];
export type TransactionSource = (typeof transactionSources)[number];

export const accounts = sqliteTable("accounts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  type: text("type", { enum: accountTypes }).notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const transactions = sqliteTable("transactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  accountId: integer("account_id").notNull().references(() => accounts.id, { onDelete: "cascade" }),
  transactionDate: text("transaction_date").notNull(),
  label: text("label").notNull(),
  amountCents: integer("amount_cents").notNull(),
  source: text("source", { enum: transactionSources }).notNull(),
  fingerprint: text("fingerprint").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
}, (table) => [
  uniqueIndex("transactions_fingerprint_unique_idx").on(table.fingerprint)
]);
