import {defineEventHandler, readBody} from 'h3';
import {or, eq, isNull} from 'drizzle-orm';
import {db} from "#server/db";
import {importRules} from "~~/drizzle/schema/importRules";
import {requireAuth} from "#server/utils/auth";

export default defineEventHandler(async (event) => {
    const user = await requireAuth(event);
    const body = await readBody(event);
    const {transactions} = body;

    const rules = await db.select().from(importRules)
        .where(or(eq(importRules.userId, user.id), isNull(importRules.userId)));

    const enrichedTransactions = transactions.map((tx: any) => {
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