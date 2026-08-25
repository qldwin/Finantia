import type { H3Event } from 'h3'
import { establishUserSession } from '#server/utils/auth'

type OAuthUser = {
    id: string
    email: string
    name?: string | null
    authProvider: string
    twoFactorEnabled: boolean
}

export const establishOAuthSession = async (event: H3Event, user: OAuthUser) => {
    await establishUserSession(event, user)
    return sendRedirect(event, '/')
}
