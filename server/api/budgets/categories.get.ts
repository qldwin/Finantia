// server/api/categories.get.ts
import { db } from '~/server/db';
import { categories } from '~/drizzle/schema';

export default defineEventHandler(async (event) => {
  // Vérifier l'authentification
  await requireUserSession(event);

  const allCategories = await db.select().from(categories);
  return { categories: allCategories };
});
