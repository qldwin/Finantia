import { getUserById } from '#server/services/user.service'
import { db } from '#server/db'
import { accounts, transactions } from '#server/db/schema'
import { eq, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
    const session = await getUserSession(event)
    if (!session.user) throw createError({ statusCode: 401, message: 'Non authentifié' })

    const user = await getUserById(session.user.id)
    if (!user) throw createError({ statusCode: 404, message: 'Utilisateur introuvable' })

    const accountId = getRouterParam(event, 'id')
    if (!accountId) throw createError({ statusCode: 400, message: 'ID du compte manquant' })

    // Verify account exists and belongs to user
    const [existingAccount] = await db
        .select()
        .from(accounts)
        .where(and(
            eq(accounts.id, accountId),
            eq(accounts.userId, user.id)
        ))

    if (!existingAccount) throw createError({ statusCode: 404, message: 'Compte introuvable' })

    // Check if account has transactions
    const [transactionCount] = await db
        .select({ count: db.fn('COUNT', db.column('*')) })
        .from(transactions)
        .where(eq(transactions.accountId, accountId))

    if (parseInt(transactionCount.count) > 0) {
        throw createError({
            statusCode: 400,
            message: 'Impossible de supprimer ce compte car il contient des transactions. Supprimez d\'abord les transactions ou transférez-les vers un autre compte.'
        })
    }

    await db
        .delete(accounts)
        .where(eq(accounts.id, accountId))

    return { success: true, message: 'Compte supprimé avec succès' }
})
