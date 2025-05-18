import { db, transactions } from '@/server/utils/database';
import { useSession } from 'h3';
import { SESSION_CONFIG } from '../../middleware/session';
import { z } from 'zod';

const transactionSchema = z.object({
  description: z.string().min(1, 'Description requise'),
  amount: z.number().min(0.01, 'Le montant doit être supérieur à 0'),
  type: z.enum(['income', 'expense']),
  category: z.string().optional(),
  date: z.string().optional(),
});

export default defineEventHandler(async (event) => {
  try {
    // Récupérer la session
    const session = await useSession(event, SESSION_CONFIG);
    
    // Vérifier si l'utilisateur est connecté
    if (!session.data.loggedIn || !session.data.user || !session.data.user.id) {
      return createError({
        statusCode: 401,
        statusMessage: 'Non authentifié'
      });
    }
    
    const userId = session.data.user.id;
    
    // Récupérer les données du body
    const body = await readBody(event);
    
    // Valider les données
    const result = transactionSchema.safeParse(body);
    if (!result.success) {
      return createError({
        statusCode: 400,
        statusMessage: 'Données invalides',
        data: result.error.format()
      });
    }
    
    const { description, amount, type, category, date } = result.data;
    
    // Créer la transaction
    const transaction = await db.insert(transactions).values({
      userId,
      description,
      amount,
      type,
      category: category || null,
      date: date || new Date().toISOString(),
      createdAt: new Date().toISOString()
    }).returning().get();
    
    return {
      transaction,
      message: 'Transaction créée avec succès'
    };
  } catch (error) {
    console.error('Erreur lors de la création de la transaction:', error);
    return createError({
      statusCode: 500,
      statusMessage: 'Erreur serveur'
    });
  }
});
