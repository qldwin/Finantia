import {z} from 'zod'
import {createBudget} from "#server/services/budgets.service";
import {assertAccountOwnership} from "#server/utils/ownership";
import {assertCategoriesOwnership} from "#server/utils/categories";

const createBudgetSchema = z.object({
    name: z.string({message: "Le nom est requis"})
        .min(1, "Le nom ne peut pas être vide"),
    amount: z.number({message: "Le montant est requis"})
        .positive("Le montant doit être positif"),
    startDate: z.coerce.date({message: "La date de début est requise"}),
    endDate: z.coerce.date({message: "La date de fin est requise"}),
    accountId: z.string().uuid().optional().nullable(),
    categoryIds: z.array(z.string().uuid()).optional()
})

export default defineEventHandler(async (event) => {
    const user = await requireAuth(event)
    const body = await readValidatedBody(event, (b) => createBudgetSchema.safeParse(b))

    if (!body.success) {
        throw createError({statusCode: 400, message: body.error.issues[0]?.message})
    }

    const {categoryIds, ...restBody} = body.data

    // Vérifier que le compte (si fourni) appartient bien à l'utilisateur
    await assertAccountOwnership(restBody.accountId, user.id)
    await assertCategoriesOwnership(categoryIds, user.id)

    const budgetData = {
        ...restBody,
        userId: user.id,
        amount: String(restBody.amount),

        recurrence: "Aucune",
        startRecurrence: restBody.startDate,

        createdAt: new Date(),
        updatedAt: new Date(),
    }

    try {
        const newBudget = await createBudget(budgetData, categoryIds)

        return {
            success: true,
            budget: newBudget
        }
    } catch (error) {
        console.error('Erreur création budget:', error)
        throw createError({
            statusCode: 500,
            message: "Impossible de créer le budget"
        })
    }
})
