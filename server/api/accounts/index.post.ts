import { z } from 'zod'
import { getUserById } from '#server/services/user.service'
import { db } from '#server/db'
import { accounts } from '#server/db/schema'

const createAccountSchema = z.object({
    accountName: z.string().min(1, 'Le nom du compte est requis').max(255),
    accountType: z.string().min(1, 'Le type de compte est requis').max(255),
    balance: z.number().or(z.string().transform(val => parseFloat(val))),
    currency: z.string().length(3, 'La devise doit faire 3 caractères')
})

export default defineEventHandler(async (event) => {
    const session = await getUserSession(event)
    if (!session.user) throw createError({ statusCode: 401, message: 'Non authentifié' })

    const user = await getUserById(session.user.id)
    if (!user) throw createError({ statusCode: 404, message: 'Utilisateur introuvable' })

    const result = await readValidatedBody(event, body => createAccountSchema.safeParse(body))
    if (!result.success) {
        throw createError({
            statusCode: 400,
            message: 'Données invalides',
            data: result.error.format()
        })
    }

    const { accountName, accountType, balance, currency } = result.data

    const [newAccount] = await db
        .insert(accounts)
        .values({
            userId: user.id,
            accountName,
            accountType,
            balance: String(balance),
            currency
        })
        .returning()

    return { account: newAccount }
})
