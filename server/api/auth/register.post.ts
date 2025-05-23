import {z} from 'zod';
import {eq} from 'drizzle-orm';
import {db} from "~/server/db";
import {users} from "~/drizzle/schema";

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

        const {email, name, password} = parsed.data;

        // Vérifier si l'email existe déjà
        const existingUser = await db.select().from(users).where(eq(users.email, email));
        if (existingUser.length > 0) {
            return createError({
                statusCode: 409,
                message: 'Cet email est déjà utilisé'
            });
        }

        // Hachage du mot de passe
        const hashedPassword = await hashPassword(password);

        // Création de l'utilisateur
        await db.insert(users).values({
            email: email,
            name: name,
            password: hashedPassword
        });

        return {
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