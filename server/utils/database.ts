import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// Créer une table users pour SQLite
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  name: text('name'),
  password: text('password').notNull(),
  createdAt: text('createdAt').notNull().default(new Date().toISOString()),
  updatedAt: text('updatedAt').notNull().default(new Date().toISOString()),
});

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

// Créer un client SQLite en mémoire pour les tests
const client = createClient({
  url: 'file:./temp_database.db',
});

// Exporter la base de données
export const db = drizzle(client);

// Fonction pour initialiser la base de données
export const initializeDatabase = async () => {
  // Créer la table users si elle n'existe pas
  await client.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      name TEXT,
      password TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Créer la table transactions si elle n'existe pas
  await client.execute(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      description TEXT NOT NULL,
      amount REAL NOT NULL,
      type TEXT NOT NULL,
      category TEXT,
      date TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Créer la table budgets si elle n'existe pas
  await client.execute(`
    CREATE TABLE IF NOT EXISTS budgets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      name TEXT NOT NULL,
      amount REAL NOT NULL,
      category TEXT NOT NULL,
      period TEXT NOT NULL,
      startDate TEXT NOT NULL,
      endDate TEXT,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  console.log('Base de données initialisée');
}; 