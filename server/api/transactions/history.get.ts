import { db } from '~/src/db';
import { historyTransacts } from '~/src/schema';
import { desc, eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
    const accountId = Number(getQuery(event).accountId);
    if (!accountId) {
        throw createError({ statusCode: 400, statusMessage: 'accountId manquant' });
    }

    const transactions = await db.query.historyTransacts.findMany({
        where: eq(historyTransacts.accountId, accountId),
        orderBy: [desc(historyTransacts.date)],
    });

    return transactions;
});