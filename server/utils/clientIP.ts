import type { H3Event } from 'h3'
import { getRequestIP } from 'h3'
import { useRuntimeConfig } from '#imports'

/**
 * Récupère l'IP client de manière sécurisée.
 *
 * Par défaut, n'utilise QUE l'IP de connexion socket (non spoofable).
 * L'en-tête X-Forwarded-For n'est lue QUE si TRUST_PROXY_HEADERS est activé
 * (par ex. `TRUST_PROXY_HEADERS=true`), ce qui doit être fait uniquement
 * quand l'application est derrière un reverse proxy de confiance (nginx/Traefik)
 * qui STRIP et RECOLORE le XFF entrant avant de poser le sien.
 *
 * Sans cette précaution, un attaquant peut envoyer son propre
 * `X-Forwarded-For` à chaque requête et contourner tout rate-limit par IP.
 */
export const getClientIP = (event: H3Event): string => {
    const config = useRuntimeConfig()
    const trustProxy = config.trustProxyHeaders === true || process.env.TRUST_PROXY_HEADERS === 'true'

    return getRequestIP(event, { xForwardedFor: trustProxy }) || 'unknown'
}
