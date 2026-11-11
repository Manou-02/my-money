import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

export const SQL_TABLES_DEFINITIONS = `
CREATE TABLE IF NOT EXISTS settings (
  id TEXT PRIMARY KEY NOT NULL,
  currency TEXT NOT NULL DEFAULT 'Ar',
  language TEXT NOT NULL DEFAULT 'fr',
  theme TEXT NOT NULL DEFAULT 'system',
  monthly_threshold_enabled INTEGER NOT NULL DEFAULT 1,
  monthly_threshold_percentage INTEGER NOT NULL DEFAULT 20,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS budgets (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  amount INTEGER NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  threshold_enabled INTEGER NOT NULL DEFAULT 1,
  threshold_percentage INTEGER NOT NULL DEFAULT 20,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  is_default INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY NOT NULL,
  budget_id TEXT NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL REFERENCES categories(id),
  title TEXT NOT NULL,
  description TEXT,
  amount INTEGER NOT NULL,
  transaction_date TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
`;

export const DRIZZLE_SCHEMA_EXPO_CODE = `import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

export const settings = sqliteTable('settings', {
  id: text('id').primaryKey(),
  currency: text('currency').notNull().default('Ar'),
  language: text('language').notNull().default('fr'),
  theme: text('theme').notNull().default('system'),
  monthly_threshold_enabled: integer('monthly_threshold_enabled', { mode: 'boolean' }).notNull().default(true),
  monthly_threshold_percentage: integer('monthly_threshold_percentage').notNull().default(20),
  created_at: text('created_at').notNull(),
  updated_at: text('updated_at').notNull(),
});

export const budgets = sqliteTable('budgets', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  amount: integer('amount').notNull(),
  start_date: text('start_date').notNull(),
  end_date: text('end_date').notNull(),
  threshold_enabled: integer('threshold_enabled', { mode: 'boolean' }).notNull().default(true),
  threshold_percentage: integer('threshold_percentage').notNull().default(20),
  created_at: text('created_at').notNull(),
  updated_at: text('updated_at').notNull(),
});

export const categories = sqliteTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  icon: text('icon').notNull(),
  color: text('color').notNull(),
  is_default: integer('is_default', { mode: 'boolean' }).notNull().default(false),
  is_active: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  created_at: text('created_at').notNull(),
  updated_at: text('updated_at').notNull(),
});

export const transactions = sqliteTable('transactions', {
  id: text('id').primaryKey(),
  budget_id: text('budget_id').notNull().references(() => budgets.id, { onDelete: 'cascade' }),
  category_id: text('category_id').notNull().references(() => categories.id),
  title: text('title').notNull(),
  description: text('description'),
  amount: integer('amount').notNull(),
  transaction_date: text('transaction_date').notNull(),
  created_at: text('created_at').notNull(),
  updated_at: text('updated_at').notNull(),
});
`;
export const settings = sqliteTable('settings', {
  id: text('id').primaryKey(),
  currency: text('currency').notNull().default('Ar'),
  language: text('language').notNull().default('fr'),
  theme: text('theme').notNull().default('system'),
  monthly_threshold_enabled: integer('monthly_threshold_enabled', { mode: 'boolean' }).notNull().default(true),
  monthly_threshold_percentage: integer('monthly_threshold_percentage').notNull().default(20),
  created_at: text('created_at').notNull(),
  updated_at: text('updated_at').notNull(),
});

export const budgets = sqliteTable('budgets', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  amount: integer('amount').notNull(), // Stocké en unités monétaires entières
  start_date: text('start_date').notNull(),
  end_date: text('end_date').notNull(),
  threshold_enabled: integer('threshold_enabled', { mode: 'boolean' }).notNull().default(true),
  threshold_percentage: integer('threshold_percentage').notNull().default(20),
  created_at: text('created_at').notNull(),
  updated_at: text('updated_at').notNull(),
});

export const categories = sqliteTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  icon: text('icon').notNull(),
  color: text('color').notNull(),
  is_default: integer('is_default', { mode: 'boolean' }).notNull().default(false),
  is_active: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  created_at: text('created_at').notNull(),
  updated_at: text('updated_at').notNull(),
});

export const transactions = sqliteTable('transactions', {
  id: text('id').primaryKey(),
  budget_id: text('budget_id').notNull().references(() => budgets.id, { onDelete: 'cascade' }),
  category_id: text('category_id').notNull().references(() => categories.id),
  title: text('title').notNull(),
  description: text('description'),
  amount: integer('amount').notNull(),
  transaction_date: text('transaction_date').notNull(),
  created_at: text('created_at').notNull(),
  updated_at: text('updated_at').notNull(),
});

// Relations
export const budgetsRelations = relations(budgets, ({ many }) => ({
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  budget: one(budgets, {
    fields: [transactions.budget_id],
    references: [budgets.id],
  }),
  category: one(categories, {
    fields: [transactions.category_id],
    references: [categories.id],
  }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  transactions: many(transactions),
}));

export type SettingsRecord = typeof settings.$inferSelect;
export type BudgetRecord = typeof budgets.$inferSelect;
export type CategoryRecord = typeof categories.$inferSelect;
export type TransactionRecord = typeof transactions.$inferSelect;
