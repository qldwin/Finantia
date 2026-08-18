import { useRuntimeConfig } from '#imports'

/**
 * Validation des secrets critiques au démarrage du serveur.
 * Refuse de démarrer si un secret est manquant ou trop faible,
 * évitant qu'un déploiement oublie de surcharger les valeurs par défaut
 * (ex. NUXT_SESSION_PASSWORD composé de zéros dans .env.example).
 */
export default defineNitroPlugin(() => {
    const config = useRuntimeConfig()

    const sessionPassword = config.session?.password as string | undefined

    if (!sessionPassword || sessionPassword.length < 32) {
        throw new Error(
            '🚨 ERREUR CRITIQUE : NUXT_SESSION_PASSWORD doit faire au moins 32 caractères. ' +
            'Générez une valeur aléatoire forte (ex. `openssl rand -base64 32`).'
        )
    }

    // Valeur par défaut documentée dans .env.example : refus explicite.
    if (/^0+$/.test(sessionPassword)) {
        throw new Error(
            '🚨 ERREUR CRITIQUE : NUXT_SESSION_PASSWORD contient la valeur par défaut. ' +
            'Générez une valeur aléatoire forte avant de déployer.'
        )
    }
})
