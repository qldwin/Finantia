import { db, users } from '@/server/utils/database';
import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  try {
    // Utiliser la session initialisée par le middleware
    const session = event.context.session;
    
    // Si pas de session ou pas connecté, renvoyer une erreur
    if (!session || !session.data) {
      return createError({
        statusCode: 401,
        message: 'Session non initialisée'
      });
    }
    
    if (!session.data.loggedIn || !session.data.user) {
      return createError({
        statusCode: 401,
        message: 'Non authentifié'
      });
    }

    // Récupérer les informations de l'utilisateur depuis la base de données
    const userId = session.data.user.id;
    
    // Protection contre les userId null ou non valides
    if (!userId) {
      return createError({
        statusCode: 401,
        message: 'Session invalide - ID utilisateur manquant'
      });
    }
    
    try {
      const user = await db.select({
        id: users.id,
        email: users.email,
        name: users.name,
        createdAt: users.createdAt
      })
      .from(users)
      .where(eq(users.id, userId))
      .get();

      if (!user) {
        // Session avec un utilisateur qui n'existe plus
        try {
          await session.clear();
        } catch (clearError) {
          console.error('Erreur lors de la suppression de session:', clearError);
        }
        
        return createError({
          statusCode: 401,
          message: 'Utilisateur non trouvé'
        });
      }

      return { user };
    } catch (dbError) {
      console.error('Erreur de base de données:', dbError);
      return createError({
        statusCode: 500,
        message: 'Erreur de base de données'
      });
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des informations utilisateur:', error);
    return createError({
      statusCode: 500,
      message: 'Erreur serveur'
    });
  }
}); 