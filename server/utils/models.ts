import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// Table pour les transactions
export const transactions = sqliteTable('transactions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('userId').notNull(),
  description: text('description').notNull(),
  amount: real('amount').notNull(),
  type: text('type').notNull(), // 'income' ou 'expense'
  category: text('category'),
  date: text('date').notNull().default(new Date().toISOString()),
  createdAt: text('createdAt').notNull().default(new Date().toISOString()),
});

// Table pour les budgets
export const budgets = sqliteTable('budgets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('userId').notNull(),
  name: text('name').notNull(),
  amount: real('amount').notNull(),
  category: text('category').notNull(),
  period: text('period').notNull(), // 'weekly', 'monthly', 'yearly'
  startDate: text('startDate').notNull(),
  endDate: text('endDate'),
  createdAt: text('createdAt').notNull().default(new Date().toISOString()),
});

// Types pour TypeScript
export interface Transaction {
  id: number;
  userId: number;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category?: string;
  date: string;
  createdAt: string;
}

export interface Budget {
  id: number;
  userId: number;
  name: string;
  amount: number;
  category: string;
  period: 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate?: string;
  createdAt: string;
}

// Catégories prédéfinies
export const EXPENSE_CATEGORIES = [
  'Alimentation',
  'Logement',
  'Transport',
  'Loisirs',
  'Santé',
  'Éducation',
  'Shopping',
  'Factures',
  'Autres'
];

export const INCOME_CATEGORIES = [
  'Salaire',
  'Freelance',
  'Dividendes',
  'Cadeaux',
  'Remboursements',
  'Ventes',
  'Autres'
]; 