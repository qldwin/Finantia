import { db, users } from '@/server/utils/database';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import { SESSION_CONFIG } from '../../middleware/session';

const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
});

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    // Validation des données
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return createError({ 
        statusCode: 400, 
        message: 'Données invalides', 
        data: parsed.error.format() 
      });
    }

    const { email, name, password } = parsed.data;

    // Vérifier si l'email existe déjà
    const existingUser = await db.select().from(users).where(eq(users.email, email)).all();
    if (existingUser.length > 0) {
      return createError({ 
        statusCode: 409, 
        message: 'Cet email est déjà utilisé' 
      });
    }

    // Hachage du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Création de l'utilisateur
    const newUser = await db.insert(users).values({
      email,
      name,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }).returning().get();

    // Obtenir la session depuis le contexte
    const session = event.context.session;
    
    if (!session) {
      console.error('Session non disponible dans le contexte');
      return createError({ 
        statusCode: 500, 
        message: 'Erreur de session' 
      });
    }
    
    // Stocker les données utilisateur dans la session
    try {
      await session.update({
        loggedIn: true,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name || ''
        }
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la session:', error);
      return createError({ 
        statusCode: 500, 
        message: 'Erreur de mise à jour de session' 
      });
    }

    return { 
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        createdAt: newUser.createdAt 
      },
      message: 'Inscription réussie'
    };
  } catch (error) {
    console.error('Erreur d\'inscription:', error);
    return createError({ 
      statusCode: 500, 
      message: 'Erreur serveur lors de l\'inscription' 
    });
  }
}); 