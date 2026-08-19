import { z } from 'zod'
import { getUserById } from '#server/services/user.service'
import { db } from '#server/db'
import { accounts, transactions } from '#server/db/schema'
import { eq, and } from 'drizzle-orm'

const importSchema = z.object({
    accountId: z.string().uuid(),
    transactions: z.array(z.object({
        date: z.coerce.date(),
        description: z.string(),
        amount: z.number(),
        typeTransaction: z.enum(['revenu', 'depense', 'non_categorise']).optional()
    }))
})

export default defineEventHandler(async (event) => {
    const session = await getUserSession(event)
    if (!session.user) throw createError({ statusCode: 401, message: 'Non authentifié' })

    const user = await getUserById(session.user.id)
    if (!user) throw createError({ statusCode: 404, message: 'Utilisateur introuvable' })

    const result = await readValidatedBody(event, body => importSchema.safeParse(body))
    if (!result.success) {
        throw createError({
            statusCode: 400,
            message: 'Données invalides',
            data: result.error.format()
        })
    }

    const { accountId, transactions: rawTransactions } = result.data

    // Verify account exists and belongs to user
    const [account] = await db
        .select()
        .from(accounts)
        .where(and(
            eq(accounts.id, accountId),
            eq(accounts.userId, user.id)
        ))

    if (!account) throw createError({ statusCode: 404, message: 'Compte introuvable ou non autorisé' })

    // Insert transactions
    const now = new Date()
    const transactionData = rawTransactions.map(t => ({
        userId: user.id,
        accountId: account.id,
        description: t.description,
        amount: String(Math.abs(t.amount)),
        date: t.date,
        typeTransaction: t.typeTransaction || (t.amount >= 0 ? 'revenu' : 'depense'),
        devise: account.currency || 'EUR',
        recurrence: 'Aucune',
        startRecurrence: t.date,
        endRecurrence: null,
        createdAt: now,
        updatedAt: now
    }))

    const inserted = await db
        .insert(transactions)
        .values(transactionData)
        .returning()

    return {
        success: true,
        count: inserted.length,
        accountId: account.id,
        message: `${inserted.length} transactions importées vers le compte ${account.accountName}`
    }
})
