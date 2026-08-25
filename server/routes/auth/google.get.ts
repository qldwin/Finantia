import { db } from "#server/db";
import { users } from "~~/drizzle/schema";
import { eq } from "drizzle-orm";
import { establishOAuthSession } from "#server/utils/oauth";

export default defineOAuthGoogleEventHandler({
    async onSuccess(event, { user }) {

        let dbUser = await db.query.users.findFirst({
            where: eq(users.email, user.email)
        });

        if (dbUser && dbUser.authProvider !== 'google') {
            return sendRedirect(event, `/login?error=wrong_provider`);
        }

        if (!dbUser) {
            const [newUser] = await db.insert(users).values({
                email: user.email ?? '',
                name: user.name ?? '',
                authProvider: 'google',
            }).returning();

            if (!newUser) {
                return sendRedirect(event, '/login?error=oauth');
            }

            dbUser = newUser;
        }

        return establishOAuthSession(event, {
            id: dbUser.id,
            email: dbUser.email,
            name: dbUser.name,
            authProvider: dbUser.authProvider || 'google',
            twoFactorEnabled: dbUser.twoFactorEnabled ?? false
        })
    },

    async onError(event, error) {
        console.error('Google OAuth error:', error);
        return sendRedirect(event, '/login?error=oauth');
    }
});
