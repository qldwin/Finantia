import { z } from 'zod'
import { getUserById } from '#server/services/user.service'
import { db } from '#server/db'
import { accounts } from '#server/db/schema'
import { eq, and } from 'drizzle-orm'

const updateAccountSchema = z.object({
    accountName: z.string().min(1).max(255).optional(),
    accountType: z.string().min(1).max(255).optional(),
    balance: z.number().or(z.string().transform(val => parseFloat(val))).optional(),
    currency: z.string().length(3).optional()
})

export default defineEventHandler(async (event) => {
    const session = await getUserSession(event)
    if (!session.user) throw createError({ statusCode: 401, message: 'Non authentifié' })

    const user = await getUserById(session.user.id)
    if (!user) throw createError({ statusCode: 404, message: 'Utilisateur introuvable' })

    const accountId = getRouterParam(event, 'id')
    if (!accountId) throw createError({ statusCode: 400, message: 'ID du compte manquant' })

    const result = await readValidatedBody(event, body => updateAccountSchema.safeParse(body))
    if (!result.success) {
        throw createError({
            statusCode: 400,
            message: 'Données invalides',
            data: result.error.format()
        })
    }

    // Verify account exists and belongs to user
    const [existingAccount] = await db
        .select()
        .from(accounts)
        .where(and(
            eq(accounts.id, accountId),
            eq(accounts.userId, user.id)
        ))

    if (!existingAccount) throw createError({ statusCode: 404, message: 'Compte introuvable' })

    const updates = result.data
    const [updatedAccount] = await db
        .update(accounts)
        .set({
            ...updates,
            updatedAt: new Date()
        })
        .where(eq(accounts.id, accountId))
        .returning()

    return { account: updatedAccount }
})
