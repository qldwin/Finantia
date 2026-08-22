import { defineEventHandler } from 'h3';
import { eq } from 'drizzle-orm';
import { db } from '#server/db';
import { accounts } from '~~/drizzle/schema/accounts';
import { requireAuth } from '#server/utils/auth';

export default defineEventHandler(async (event) => {
    const user = await requireAuth(event);

    try {
        const userAccounts = await db.select()
            .from(accounts)
            .where(eq(accounts.userId, user.id))
            .orderBy(accounts.createdAt);

        return { success: true, accounts: userAccounts };
    } catch (error) {
        console.error('Erreur lors de la récupération des comptes', error);
        throw createError({ statusCode: 500, message: 'Impossible de récupérer les comptes' });
    }
});