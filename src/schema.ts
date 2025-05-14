import { pgTable, serial, text, varchar, integer, decimal, timestamp, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Table User
export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    name: varchar('name', { length: 255 }),
    password: varchar('password', { length: 255 }).notNull(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
});

// Table Account
export const accounts = pgTable('accounts', {
    id: serial('id').primaryKey(),
    userId: integer('userId').notNull().references(() => users.id),
    accountName: varchar('accountName', { length: 255 }).notNull(),
    accountType: varchar('accountType', { length: 255 }).notNull(),
    balance: decimal('balance', { precision: 15, scale: 3 }).notNull(),
    currency: varchar('currency', { length: 3 }).notNull(),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

// Table HistoryTransact
export const historyTransacts = pgTable('historyTransacts', {
    id: serial('id').primaryKey(),
    accountId: integer('accountId').notNull().references(() => accounts.id),
    transactionType: varchar('transactionType', { length: 255 }).notNull(),
    amount: decimal('amount', { precision: 15, scale: 3 }).notNull(),
    date: timestamp('date').notNull().defaultNow(),
    description: varchar('description', { length: 255 }),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
});

// Table Budget
export const budgets = pgTable('budgets', {
    id: serial('id').primaryKey(),
    userId: integer('userId').notNull().references(() => users.id),
    name: varchar('name', { length: 255 }).notNull(),
    amount: decimal('amount', { precision: 15, scale: 3 }).notNull(),
    startDate: timestamp('startDate').notNull(),
    endDate: timestamp('endDate').notNull(),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

// Table Category
export const categories = pgTable('categories', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

// Table BudgetCategory
export const budgetCategories = pgTable('budgetCategories', {
    budgetId: integer('budgetId').notNull().references(() => budgets.id),
    categoryId: integer('categoryId').notNull().references(() => categories.id),
}, (table) => {
    return {
        pk: primaryKey({ columns: [table.budgetId, table.categoryId] }),
    };
});

// Table AccountCategory
export const accountCategories = pgTable('accountCategories', {
    accountId: integer('accountId').notNull().references(() => accounts.id),
    categoryId: integer('categoryId').notNull().references(() => categories.id),
}, (table) => {
    return {
        pk: primaryKey({ columns: [table.accountId, table.categoryId] }),
    };
});

// Relations
export const userRelations = relations(users, ({ many }) => ({
    accounts: many(accounts),
    budgets: many(budgets),
}));

export const accountRelations = relations(accounts, ({ one, many }) => ({
    user: one(users, { fields: [accounts.userId], references: [users.id] }),
    categories: many(accountCategories),
    historyTransacts: many(historyTransacts),
}));

export const historyTransactRelations = relations(historyTransacts, ({ one }) => ({
    account: one(accounts, { fields: [historyTransacts.accountId], references: [accounts.id] }),
}));

export const budgetRelations = relations(budgets, ({ one, many }) => ({
    user: one(users, { fields: [budgets.userId], references: [users.id] }),
    categories: many(budgetCategories),
}));

export const categoryRelations = relations(categories, ({ many }) => ({
    accounts: many(accountCategories),
    budgets: many(budgetCategories),
}));

export const budgetCategoryRelations = relations(budgetCategories, ({ one }) => ({
    budget: one(budgets, { fields: [budgetCategories.budgetId], references: [budgets.id] }),
    category: one(categories, { fields: [budgetCategories.categoryId], references: [categories.id] }),
}));

export const accountCategoryRelations = relations(accountCategories, ({ one }) => ({
    account: one(accounts, { fields: [accountCategories.accountId], references: [accounts.id] }),
    category: one(categories, { fields: [accountCategories.categoryId], references: [categories.id] }),
}));