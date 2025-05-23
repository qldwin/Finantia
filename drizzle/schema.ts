import {pgTable, serial, varchar, numeric, timestamp, integer, decimal, primaryKey} from 'drizzle-orm/pg-core';

// Table User
export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    email: varchar('email', {length: 255}).notNull().unique(),
    name: varchar('name', {length: 255}),
    password: varchar('password', {length: 255}).notNull(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
});

// Table Account
export const accounts = pgTable('accounts', {
    id: serial('id').primaryKey(),
    userId: integer('userId').notNull().references(() => users.id),
    accountName: varchar('accountName', {length: 255}).notNull(),
    accountType: varchar('accountType', {length: 255}).notNull(),
    balance: decimal('balance', {precision: 15, scale: 3}).notNull(),
    currency: varchar('currency', {length: 3}).notNull(),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});
// Table Transactions
export const transactions = pgTable('transactions', {
    id: serial('id').primaryKey(),
    userId: integer('userId').notNull().references(() => users.id),
    description: varchar('description', { length: 255 }).notNull(),
    amount: numeric('amount').notNull(),
    type: varchar('type', { length: 20 }).notNull(), // 'income' ou 'expense'
    category: varchar('category', { length: 255 }),
    date: timestamp('date').notNull().defaultNow(),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
});
// Table HistoryTransact
export const historyTransacts = pgTable('history_transacts', {
    id: serial('id').primaryKey(),
    account_id: integer('account_id').notNull(),
    transaction_type: varchar('transaction_type', {length: 10}).notNull(),
    amount: numeric('amount').notNull(),
    description: varchar('description', {length: 255}),
    date: timestamp('date').defaultNow().notNull(),
});


// Table Budget
export const budgets = pgTable('budgets', {
    id: serial('id').primaryKey(),
    userId: integer('userId').notNull().references(() => users.id),
    name: varchar('name', {length: 255}).notNull(),
    amount: decimal('amount', {precision: 15, scale: 3}).notNull(),
    startDate: timestamp('startDate').notNull(),
    endDate: timestamp('endDate').notNull(),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

// Table Category
export const categories = pgTable('categories', {
    id: serial('id').primaryKey(),
    name: varchar('name', {length: 255}).notNull(),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

// Table BudgetCategory
export const budgetCategories = pgTable('budgetCategories', {
    budgetId: integer('budgetId').notNull().references(() => budgets.id),
    categoryId: integer('categoryId').notNull().references(() => categories.id),
}, (table) => {
    return {
        pk: primaryKey({columns: [table.budgetId, table.categoryId]}),
    };
});

// Table AccountCategory
export const accountCategories = pgTable('accountCategories', {
    accountId: integer('accountId').notNull().references(() => accounts.id),
    categoryId: integer('categoryId').notNull().references(() => categories.id),
}, (table) => {
    return {
        pk: primaryKey({columns: [table.accountId, table.categoryId]}),
    };
});