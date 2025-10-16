// POST /api/budgets/create
import { db } from '~/server/db';
import { budgets, budgetCategories } from '~/drizzle/schema';
import { z } from 'zod';

// Schéma de validation pour la création de budget
const createBudgetSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(255, 'Le nom est trop long'),
  amount: z.number().positive('Le montant doit être positif'),
  categoryId: z.number().int('L\'ID de catégorie doit être un entier').optional(),
  period: z.enum(['weekly', 'monthly', 'yearly']).optional(),
  startDate: z.string().datetime('La date de début doit être au format ISO'),
  endDate: z.string().datetime('La date de fin doit être au format ISO').optional()
});

export default defineEventHandler(async (event) => {
  // Vérifier l'authentification
  const { user } = await requireUserSession(event);

  if (!user || !user.id) {
    throw createError({
      statusCode: 401,
      message: 'Non authentifié'
    });
  }

  // Lire et valider le corps de la requête
  const body = await readBody(event);
  const validation = createBudgetSchema.safeParse(body);

  if (!validation.success) {
    throw createError({
      statusCode: 400,
      message: 'Données invalides',
      data: validation.error.issues
    });
  }

  const validatedData = validation.data;

  // Créer le budget
  const [newBudget] = await db.insert(budgets)
    .values({
      name: validatedData.name,
      amount: validatedData.amount.toString(),
      userId: user.id,
      startDate: validatedData.startDate,
      endDate: validatedData.endDate || new Date(new Date(validatedData.startDate).setFullYear(new Date(validatedData.startDate).getFullYear() + 1)).toISOString()
    })
    .returning();

  // Créer l'association avec la catégorie choisie
  if (validatedData.categoryId) {
    await db.insert(budgetCategories).values({
      budgetId: newBudget.id,
      categoryId: validatedData.categoryId
    });
  }

  return { budget: newBudget };
});
