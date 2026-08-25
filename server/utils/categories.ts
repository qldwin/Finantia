import { and, eq, inArray, isNull, or } from 'drizzle-orm'
import { db } from '#server/db'
import { categories } from '~~/drizzle/schema'

const visibleToUser = (userId: string) =>
    or(eq(categories.userId, userId), isNull(categories.userId))

/** Vérifie qu'une catégorie est globale ou appartient à l'utilisateur. */
export const assertCategoryOwnership = async (categoryId: string | null | undefined, userId: string) => {
    if (!categoryId) return

    const category = await db.query.categories.findFirst({
        where: and(eq(categories.id, categoryId), visibleToUser(userId))
    })

    if (!category) {
        throw createError({ statusCode: 403, message: 'Catégorie invalide ou non autorisée' })
    }
}

/** Vérifie une liste complète en une seule requête, sans laisser passer de doublon invalide. */
export const assertCategoriesOwnership = async (categoryIds: string[] | undefined, userId: string) => {
    if (!categoryIds?.length) return

    const uniqueIds = [...new Set(categoryIds)]
    const ownedCategories = await db.select({ id: categories.id })
        .from(categories)
        .where(and(inArray(categories.id, uniqueIds), visibleToUser(userId)))

    if (ownedCategories.length !== uniqueIds.length) {
        throw createError({ statusCode: 403, message: 'Une catégorie est invalide ou non autorisée' })
    }
}
