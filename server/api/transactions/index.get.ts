import { db, transactions } from '@/server/utils/database';
import { eq, desc } from 'drizzle-orm';
import { useSession } from 'h3';
import { SESSION_CONFIG } from '../../middleware/session';

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
    
    // Récupérer les transactions de l'utilisateur
    const userTransactions = await db.select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.date))
      .all();
    
    return { 
      transactions: userTransactions 
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des transactions:', error);
    return createError({
      statusCode: 500,
      statusMessage: 'Erreur serveur'
    });
  }
}); 