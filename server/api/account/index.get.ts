import { defineEventHandler } from 'h3';
import { eq, sql } from 'drizzle-orm';
import { db } from '#server/db';
import { accounts } from '~~/drizzle/schema/accounts';
import { transactions } from '~~/drizzle/schema/transactions';
import { requireAuth } from '#server/utils/auth';

export default defineEventHandler(async (event) => {
    const user = await requireAuth(event);

    try {
        const userAccounts = await db.select({
            id: accounts.id,
            accountName: accounts.accountName,
            typeAccount: accounts.typeAccount,
            balance: sql<string>`COALESCE(SUM( CASE WHEN ${transactions.typeTransaction} = 'revenu' THEN abs(${transactions.amount}) ELSE -abs(${transactions.amount}) END), 0)`,
            currency: accounts.currency,
            createdAt: accounts.createdAt,
            updatedAt: accounts.updatedAt
        })
            .from(accounts)
            .leftJoin(transactions, eq(accounts.id, transactions.accountId))
            .where(eq(accounts.userId, user.id))
            .groupBy(accounts.id)
            .orderBy(accounts.createdAt);

        return { success: true, accounts: userAccounts };
    } catch (error) {
        console.error('Erreur lors de la récupération des comptes', error);
        throw createError({ statusCode: 500, message: 'Impossible de récupérer les comptes' });
    }
});