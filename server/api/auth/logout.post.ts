import { useSession } from 'h3';
import { SESSION_CONFIG } from '../../middleware/session';

export default defineEventHandler(async (event) => {
  try {
    const session = await useSession(event, SESSION_CONFIG);
    
    // Détruire la session
    await session.clear();
    
    return { 
      message: 'Déconnexion réussie' 
    };
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    return createError({ 
      statusCode: 500, 
      statusMessage: 'Erreur serveur lors de la déconnexion' 
    });
  }
}); 