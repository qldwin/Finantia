import { getUserById } from '#server/services/user.service'
import { db } from '#server/db'
import { accounts } from '#server/db/schema'
import { eq, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
    const session = await getUserSession(event)
    if (!session.user) throw createError({ statusCode: 401, message: 'Non authentifié' })

    const user = await getUserById(session.user.id)
    if (!user) throw createError({ statusCode: 404, message: 'Utilisateur introuvable' })

    const accountId = getRouterParam(event, 'id')
    if (!accountId) throw createError({ statusCode: 400, message: 'ID du compte manquant' })

    const [account] = await db
        .select()
        .from(accounts)
        .where(and(
            eq(accounts.id, accountId),
            eq(accounts.userId, user.id)
        ))

    if (!account) throw createError({ statusCode: 404, message: 'Compte introuvable' })

    // Get account balance from transactions
    const { db: dbInstance } = event.context
    const [balanceResult] = await dbInstance
        .select({
            balance: dbInstance.fn('SUM', dbInstance.fn('CASE', [
                dbInstance.fn('WHEN', dbInstance.fn('=', dbInstance.column('typeTransaction'), 'revenu'), dbInstance.column('amount')),
                dbInstance.fn('ELSE', dbInstance.fn('NEG', dbInstance.column('amount')))
            ]))
        })
        .from(transactions)
        .where(eq(transactions.accountId, accountId))

    const currentBalance = parseFloat(balanceResult?.balance || '0')

    return { 
        account: { 
            ...account, 
            currentBalance: account.balance + currentBalance 
        } 
    }
})
