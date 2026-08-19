import { getUserById } from '#server/services/user.service'
import { db } from '#server/db'
import { accounts } from '#server/db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
    const session = await getUserSession(event)
    if (!session.user) throw createError({ statusCode: 401, message: 'Non authentifié' })

    const user = await getUserById(session.user.id)
    if (!user) throw createError({ statusCode: 404, message: 'Utilisateur introuvable' })

    const userAccounts = await db
        .select()
        .from(accounts)
        .where(eq(accounts.userId, user.id))
        .orderBy(accounts.createdAt)

    return { accounts: userAccounts }
})
