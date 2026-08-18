import { eq } from 'drizzle-orm'
import { db } from '#server/db'
import { accounts } from '~~/drizzle/schema'

/**
 * Vérifie qu'un compte appartient bien à l'utilisateur courant.
 * À appeler avant tout rattachement d'une entité (transaction, budget...) à un accountId
 * fourni par le client, pour empêcher l'IDOR cross-user.
 *
 * @throws 403 si le compte n'existe pas ou n'appartient pas à l'utilisateur.
 */
export const assertAccountOwnership = async (accountId: string | null | undefined, userId: string): Promise<void> => {
    if (!accountId) return

    const ownedAccount = await db.query.accounts.findFirst({
        where: eq(accounts.id, accountId)
    })

    if (!ownedAccount || ownedAccount.userId !== userId) {
        throw createError({ statusCode: 403, message: 'Compte invalide ou non autorisé' })
    }
}
