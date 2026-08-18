import { z } from 'zod'
import { registerUser } from '#server/services/auth.service'
import { db } from '#server/db'
import { accounts } from '~~/drizzle/schema'
import { checkRateLimit, consumeRateLimitAttempt, resetRateLimit } from '#server/utils/rateLimit'
import { getRequestIP } from 'h3'

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().min(2)
})

export default defineEventHandler(async (event) => {
    const clientIP = getRequestIP(event, { xForwardedFor: true }) || 'unknown'

    const rl = await checkRateLimit('register', clientIP)
    if (!rl.allowed) {
        throw createError({statusCode: 429, message: `Trop de tentatives. Réessayez dans ${rl.retryAfterSec}s.`})
    }

    const result = await readValidatedBody(event, body => registerSchema.safeParse(body))

    if (!result.success) {
        throw createError({ statusCode: 400, message: result.error.issues[0]?.message })
    }

    const newUser = await registerUser({
        email: result.data.email,
        password: result.data.password,
        name: result.data.name
    })

    if (!newUser) {
        await consumeRateLimitAttempt('register', clientIP)
        throw createError({ statusCode: 400, message: 'Cet email est déjà utilisé' })
    }

    await resetRateLimit('register', clientIP)

    try {
        await db.insert(accounts).values({
            userId: newUser.id,
            accountName: 'Compte Courant',
            accountType: 'Courant',
            balance: '0',
            currency: 'EUR'
        })
    } catch (e) {
        console.error('Erreur création compte', e)
    }

    await setUserSession(event, {
        user: {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            authProvider: newUser.authProvider ?? 'local',
            twoFactorEnabled: newUser.twoFactorEnabled ?? false
        },
        secure: { twoFactorPending: false },
        loggedInAt: new Date()
    })

    return { success: true, user: newUser }
})