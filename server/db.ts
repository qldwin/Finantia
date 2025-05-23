import {drizzle} from 'drizzle-orm/node-postgres';

export const db = drizzle("postgresql://finantia:example@localhost:5432/finantia");
