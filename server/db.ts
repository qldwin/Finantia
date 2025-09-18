import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL, // ou ta string hardcodée, mais préférable env
});

export const db = drizzle(pool);
