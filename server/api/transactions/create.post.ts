import { db } from '@/src/db';
import { historyTransacts } from '@/src/schema';
import { z } from 'zod';

const bodySchema = z.object({
    accountId: z.number(),
    transactionType: z.enum(['debit', 'credit']),
    amount: z.number().positive(),
    description: z.string().optional(),
});

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);

        // Validation des données reçues
        const parsed = bodySchema.safeParse(body);
        if (!parsed.success) {
            console.error('Validation error:', parsed.error.format());
            throw createError({ statusCode: 400, statusMessage: 'Invalid request data' });
        }

        const { accountId, transactionType, amount, description } = parsed.data;

        // Insertion dans la base
        const [newTx] = await db
            .insert(historyTransacts)
            .values({
                account_id: accountId,
                transaction_type: transactionType,
                amount: amount.toString(),  // <-- ici en string
                description,
                date: new Date(),
            })
            .returning();

        return newTx;
    } catch (error) {
        // Affiche bien toute l’erreur dans la console serveur (terminal)
        console.error('Erreur création transaction:', error);
        throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' });
    }
});
