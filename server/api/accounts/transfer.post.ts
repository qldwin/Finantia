import { z } from 'zod'
import { getUserById } from '#server/services/user.service'
import { db } from '#server/db'
import { accounts, transactions } from '#server/db/schema'
import { eq, and } from 'drizzle-orm'

const transferSchema = z.object({
    fromAccountId: z.string().uuid(),
    toAccountId: z.string().uuid(),
    amount: z.number().positive('Le montant doit être positif'),
    description: z.string().min(1, 'La description est requise').max(255),
    date: z.coerce.date().optional()
})

export default defineEventHandler(async (event) => {
    const session = await getUserSession(event)
    if (!session.user) throw createError({ statusCode: 401, message: 'Non authentifié' })

    const user = await getUserById(session.user.id)
    if (!user) throw createError({ statusCode: 404, message: 'Utilisateur introuvable' })

    const result = await readValidatedBody(event, body => transferSchema.safeParse(body))
    if (!result.success) {
        throw createError({
            statusCode: 400,
            message: 'Données invalides',
            data: result.error.format()
        })
    }

    const { fromAccountId, toAccountId, amount, description, date } = result.data
    const transferDate = date || new Date()

    // Verify both accounts exist and belong to user
    const [fromAccount, toAccount] = await Promise.all([
        db.select().from(accounts).where(and(
            eq(accounts.id, fromAccountId),
            eq(accounts.userId, user.id)
        )).then(r => r[0]),
        db.select().from(accounts).where(and(
            eq(accounts.id, toAccountId),
            eq(accounts.userId, user.id)
        )).then(r => r[0])
    ])

    if (!fromAccount) throw createError({ statusCode: 404, message: 'Compte source introuvable' })
    if (!toAccount) throw createError({ statusCode: 404, message: 'Compte destination introuvable' })

    // Check if fromAccount has enough balance
    const [fromBalance] = await db
        .select({
            balance: db.fn('SUM', db.fn('CASE', [
                db.fn('WHEN', db.fn('=', db.column('typeTransaction'), 'revenu'), db.column('amount')),
                db.fn('ELSE', db.fn('NEG', db.column('amount')))
            ]))
        })
        .from(transactions)
        .where(eq(transactions.accountId, fromAccountId))

    const currentFromBalance = parseFloat(fromAccount.balance) + parseFloat(fromBalance?.balance || '0')
    if (currentFromBalance < amount) {
        throw createError({
            statusCode: 400,
            message: `Solde insuffisant sur le compte ${fromAccount.accountName}. Solde actuel: ${currentFromBalance.toFixed(2)}`
        })
    }

    // Create two transactions: one for each account
    const now = new Date()
    const transferDescription = `Transfert vers ${toAccount.accountName}: ${description}`
    const receiveDescription = `Transfert de ${fromAccount.accountName}: ${description}`

    try {
        await db.transaction(async (tx) => {
            // Withdrawal from source account
            await tx.insert(transactions).values({
                userId: user.id,
                accountId: fromAccountId,
                description: transferDescription,
                amount: String(amount),
                date: transferDate,
                typeTransaction: 'depense',
                devise: fromAccount.currency || 'EUR',
                recurrence: 'Aucune',
                startRecurrence: transferDate,
                endRecurrence: null,
                createdAt: now,
                updatedAt: now
            })

            // Deposit to destination account
            await tx.insert(transactions).values({
                userId: user.id,
                accountId: toAccountId,
                description: receiveDescription,
                amount: String(amount),
                date: transferDate,
                typeTransaction: 'revenu',
                devise: toAccount.currency || 'EUR',
                recurrence: 'Aucune',
                startRecurrence: transferDate,
                endRecurrence: null,
                createdAt: now,
                updatedAt: now
            })
        })

        return {
            success: true,
            message: `Transfert de ${amount} ${fromAccount.currency} effectué avec succès`,
            fromAccount: {
                id: fromAccount.id,
                name: fromAccount.accountName,
                newBalance: currentFromBalance - amount
            },
            toAccount: {
                id: toAccount.id,
                name: toAccount.accountName
            },
            amount,
            date: transferDate
        }
    } catch (error) {
        console.error('Erreur lors du transfert:', error)
        throw createError({
            statusCode: 500,
            message: 'Impossible d\'effectuer le transfert'
        })
    }
})
