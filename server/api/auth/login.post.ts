import {z} from 'zod'
import {loginUser} from "#server/services/auth.service";
import {checkRateLimit, consumeRateLimitAttempt, resetRateLimit} from '#server/utils/rateLimit';
import {getClientIP} from '#server/utils/clientIP';

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1)
})

export default defineEventHandler(async (event) => {
    const clientIP = getClientIP(event)

    // Rate-limit par IP (anti brute-force depuis une seule source)
    const rl = await checkRateLimit('login', clientIP)
    if (!rl.allowed) {
        throw createError({statusCode: 429, message: `Trop de tentatives. Réessayez dans ${rl.retryAfterSec}s.`})
    }

    const result = await readValidatedBody(event, body => loginSchema.safeParse(body))
    if (!result.success) {
        throw createError({statusCode: 400, message: 'Données invalides'})
    }

    // Rate-limit par email (anti credential stuffing distribué : 1 essai/IP mais
    // des dizaines d'IP sur le même compte cible).
    const emailKey = result.data.email.toLowerCase()
    const rlEmail = await checkRateLimit('login-email', emailKey)
    if (!rlEmail.allowed) {
        throw createError({statusCode: 429, message: `Trop de tentatives sur ce compte. Réessayez dans ${rlEmail.retryAfterSec}s.`})
    }

    const user = await loginUser(result.data.email, result.data.password)

    if (!user) {
        const attempt = await consumeRateLimitAttempt('login', clientIP)
        await consumeRateLimitAttempt('login-email', emailKey)
        throw createError({
            statusCode: 401,
            message: attempt.allowed
                ? `Email ou mot de passe incorrect. ${attempt.remaining} tentative(s) restante(s).`
                : `Trop de tentatives. Compte verrouillé ${attempt.retryAfterSec}s.`
        })
    }

    await resetRateLimit('login', clientIP)
    await resetRateLimit('login-email', emailKey)

    if (user.twoFactorEnabled) {
        await setUserSession(event, {
            secure: { twoFactorPending: true },
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                authProvider: user.authProvider ?? 'local',
                twoFactorEnabled: user.twoFactorEnabled
            },
        })
        return { requiresTwoFactor: true }
    }

    await setUserSession(event, {
        secure: { twoFactorPending: false },
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            authProvider: user.authProvider ?? 'local',
            twoFactorEnabled: user.twoFactorEnabled
        },
        loggedInAt: new Date()
    })

    return {success: true}
})