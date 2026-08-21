import { defineEventHandler, readBody } from 'h3';
import { db } from '#server/db';
import { accounts } from '~~/drizzle/schema/accounts';
import { requireAuth } from '#server/utils/auth';

export default defineEventHandler(async (event) => {
    const user = await requireAuth(event);

    const body = await readBody(event);

    try {
        const newAccount = await db.insert(accounts).values({
            userId: user.id,
            accountName: body.accountName,
            typeAccount: body.typeAccount,
            balance: '0',
            currency: 'EUR'
        }).returning();

        return { success: true, account: newAccount[0] };
    } catch (error) {
        console.error('Erreur lors de la création du compte', error);
        throw createError({ statusCode: 500, message: 'Impossible de créer le compte' });
    }
});