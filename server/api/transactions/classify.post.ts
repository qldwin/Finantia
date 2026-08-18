import {defineEventHandler} from 'h3';
import {z} from 'zod';
import {or, eq, isNull} from 'drizzle-orm';
import {db} from "#server/db";
import {importRules} from "~~/drizzle/schema/importRules";
import {requireAuth} from "#server/utils/auth";

const classifySchema = z.object({
    transactions: z.array(z.object({
        description: z.string().optional(),
        selectedCategoryId: z.string().uuid().nullable().optional()
    }).passthrough())
})

export default defineEventHandler(async (event) => {
    const user = await requireAuth(event);
    const result = await readValidatedBody(event, (body) => classifySchema.safeParse(body))
    if (!result.success) {
        throw createError({statusCode: 400, message: 'Données invalides'})
    }
    const {transactions} = result.data;

    const rules = await db.select().from(importRules)
        .where(or(eq(importRules.userId, user.id), isNull(importRules.userId)));

    const enrichedTransactions = transactions.map((tx) => {
        if (tx.selectedCategoryId) return tx;

        const description = (tx.description || '').toLowerCase();
        const matchingRule = rules.find((rule) =>
            description.includes(rule.keyword.toLowerCase())
        );

        if (matchingRule) {
            return {
                ...tx,
                selectedCategoryId: matchingRule.categoryId,
                status: 'ready'
            };
        }

        return {
            ...tx,
            typeTransactionsId: 3,
            selectedCategoryId: null,
            status: 'ready'
        };
    });
    return {transactions: enrichedTransactions};
});