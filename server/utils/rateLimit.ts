import { useStorage } from '#imports'

/**
 * Rate-limiting / lockout simple basé sur le storage Nitro (en mémoire par défaut,
 * configurable vers Redis via nitro.storage). Suffisant pour limiter le brute-force
 * sur la 2FA et l'authentification.
 *
 * Format de clé : `rl:<scope>:<key>` (ex. `rl:2fa:<userId>`).
 */
const storage = useStorage('cache')

type RateLimitState = {
    attempts: number
    lockedUntil: number
}

const MAX_ATTEMPTS = 5
const LOCKOUT_MS = 15 * 60 * 1000 // 15 minutes

export const checkRateLimit = async (scope: string, key: string): Promise<{ allowed: boolean; retryAfterSec: number }> => {
    const storageKey = `rl:${scope}:${key}`
    const now = Date.now()
    const state = (await storage.getItem<RateLimitState>(storageKey)) ?? { attempts: 0, lockedUntil: 0 }

    if (state.lockedUntil > now) {
        return { allowed: false, retryAfterSec: Math.ceil((state.lockedUntil - now) / 1000) }
    }

    return { allowed: true, retryAfterSec: 0 }
}

export const consumeRateLimitAttempt = async (scope: string, key: string): Promise<{ allowed: boolean; retryAfterSec: number; remaining: number }> => {
    const storageKey = `rl:${scope}:${key}`
    const now = Date.now()
    const state = (await storage.getItem<RateLimitState>(storageKey)) ?? { attempts: 0, lockedUntil: 0 }

    if (state.lockedUntil > now) {
        return { allowed: false, retryAfterSec: Math.ceil((state.lockedUntil - now) / 1000), remaining: 0 }
    }

    state.attempts += 1
    let remaining = MAX_ATTEMPTS - state.attempts

    if (state.attempts >= MAX_ATTEMPTS) {
        state.lockedUntil = now + LOCKOUT_MS
        state.attempts = 0
        remaining = 0
    }

    await storage.setItem(storageKey, state)

    return { allowed: remaining > 0, retryAfterSec: remaining === 0 ? Math.ceil(LOCKOUT_MS / 1000) : 0, remaining }
}

export const resetRateLimit = async (scope: string, key: string): Promise<void> => {
    await storage.removeItem(`rl:${scope}:${key}`)
}
