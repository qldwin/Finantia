import {eq} from 'drizzle-orm';
import {db} from "~/server/db";
import {users} from "~/drizzle/schema";
import {loginSchema} from '~/server/schemas/loginSchema';

export default defineEventHandler(async (event) => {
    const body = await readBody(event);

    // Validation des données
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
        return createError({
            statusCode: 400,
            statusMessage: 'Invalid input data',
            data: validation.error.issues,
        });
    }

    const {email, password} = validation.data;

    // Rechercher l'utilisateur par email
    try {
        const user = await db.select().from(users).where(eq(users.email, email)).limit(1);
        if (!user.length) {
            return createError({
                statusCode: 401,
                message: 'Identifiants incorrects'
            });
        }
        const isPasswordValid = await verifyPassword(password, user[0].password);

        if (!isPasswordValid) {
            return createError({
                statusCode: 401,
                statusMessage: 'Invalid email or password',
            });
        }

        const token = generateToken(user[0]);
        return {token};
    } catch (error) {
        console.error(error);
        return createError({
            statusCode: 500,
            message: 'Internal Server Error',
        });
    }
});