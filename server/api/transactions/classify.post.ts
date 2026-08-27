import {defineEventHandler} from 'h3';
import {z} from 'zod';
import {and, eq, isNull, or} from 'drizzle-orm';
import {db} from "#server/db";
import {categories} from "~~/drizzle/schema";
import {requireAuth} from "#server/utils/auth";
import { useRuntimeConfig } from '#imports';

const getAiPredictUrl = () => {
    const config = useRuntimeConfig();
    return config.ai?.predictUrl || process.env.AIRGAP_AI_PREDICT_URL || 'https://airgap-ai.aldwin-weber.fr/predire';
};

const classifySchema = z.object({
    transactions: z.array(z.object({
        description: z.string().optional(),
        amount: z.number().or(z.string()).optional(),
        selectedCategoryId: z.string().uuid().nullable().optional(),
        typeTransaction: z.enum(["depense", "revenu", "non_categorise"]).optional()
    }).passthrough())
});

const normalizeCategoryName = (value = '') => value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const resolvePredictedCategoryId = async (userId: string, categoryName: string, typeTransaction: 'depense' | 'revenu' | 'non_categorise') => {
    const normalizedName = normalizeCategoryName(categoryName);
    const matchingCategories = await db.select()
        .from(categories)
        .where(and(
            or(eq(categories.userId, userId), isNull(categories.userId)),
            eq(categories.typeTransaction, typeTransaction)
        ));

    const existing = matchingCategories.find((category) =>
        normalizeCategoryName(category.name) === normalizedName
    );

    if (existing) return existing.id;

    const [created] = await db.insert(categories).values({
        name: categoryName,
        typeTransaction: typeTransaction,
        userId,
        isDefault: false
    }).returning({id: categories.id});

    return created?.id ?? null;
};

const predictCategoryForTransaction = async (transaction: any, userId: string) => {
    const description = String(transaction.description || '').trim();
    const amount = Number(transaction.amount ?? 0);
    const typeTransaction = transaction.typeTransaction || (amount >= 0 ? 'revenu' : 'depense');

    if (!description) return null;

    try {
        const response = await fetch(getAiPredictUrl(), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                libelle: description,
                montant: amount
            })
        });

        if (!response.ok) {
            console.warn('Erreur IA pour la transaction CSV:', response.status, await response.text());
            return null;
        }

        const payload = await response.json();
        const predictedCategory = payload?.categorie || payload?.category || payload?.categoryName || payload?.nomCategorie;
        if (!predictedCategory) return null;

        return await resolvePredictedCategoryId(
            userId,
            String(predictedCategory),
            typeTransaction
        );
    } catch (error) {
        console.warn('Prédiction IA indisponible pour la transaction CSV:', error);
        return null;
    }
};

export default defineEventHandler(async (event) => {
    const user = await requireAuth(event);
    const result = await readValidatedBody(event, (body) => classifySchema.safeParse(body));

    if (!result.success) {
        throw createError({statusCode: 400, message: 'Données invalides'});
    }

    const {transactions} = result.data;

    const enrichedTransactions = await Promise.all(transactions.map(async (tx) => {
        if (tx.selectedCategoryId) {
            return { ...tx, status: 'ready' };
        }

        const predictedCategoryId = await predictCategoryForTransaction(tx, user.id);
        if (predictedCategoryId) {
            return { ...tx, selectedCategoryId: predictedCategoryId, status: 'ready' };
        }

        return {
            ...tx,
            typeTransaction: tx.typeTransaction || (Number(tx.amount ?? 0) >= 0 ? 'revenu' : 'depense'),
            selectedCategoryId: null,
            status: 'ready'
        };
    }));

    return { transactions: enrichedTransactions };
});