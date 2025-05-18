import { db, users } from '@/server/utils/database';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import { SESSION_CONFIG } from '../../middleware/session';

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
  remember: z.boolean().optional().default(false),
});

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    // Validation des données
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return createError({ 
        statusCode: 400, 
        message: 'Données invalides', 
        data: parsed.error.format() 
      });
    }

    const { email, password, remember } = parsed.data;

    // Rechercher l'utilisateur par email
    const user = await db.select().from(users).where(eq(users.email, email)).get();

    if (!user) {
      return createError({ 
        statusCode: 401, 
        message: 'Identifiants incorrects' 
      });
    }

    // Vérifier le mot de passe
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return createError({ 
        statusCode: 401, 
        message: 'Identifiants incorrects' 
      });
    }

    // Récupérer la session existante qui a été créée par le middleware
    const session = event.context.session;
    
    if (!session) {
      console.error('Session non disponible dans le contexte');
      return createError({ 
        statusCode: 500, 
        message: 'Erreur de session' 
      });
    }
    
    // Mettre à jour la durée de la session selon l'option "remember me"
    const maxAge = remember ? 30 * 24 * 60 * 60 : 24 * 60 * 60; // 30 jours ou 1 jour
    
    // Mettre à jour la session avec les informations utilisateur
    try {
      await session.update({
        loggedIn: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name || ''
        }
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la session:', error);
      return createError({ 
        statusCode: 500, 
        message: 'Erreur de mise à jour de session' 
      });
    }
    
    // Fournir les informations utilisateur
    return { 
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      message: 'Connexion réussie' 
    };
  } catch (error) {
    console.error('Erreur de connexion:', error);
    return createError({ 
      statusCode: 500, 
      message: 'Erreur serveur lors de la connexion' 
    });
  }
}); 