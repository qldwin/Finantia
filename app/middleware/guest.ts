export default defineNuxtRouteMiddleware(async () => {
  const { loggedIn, session, fetch: refreshSession } = useUserSession()

  // Revalide toujours la session pour éviter de conserver un état client obsolète
  // après une suppression de compte ou une déconnexion.
  await refreshSession()

  if (!loggedIn.value) return

  if (session.value?.twoFactorPending) {
    return navigateTo('/auth/2fa')
  }

  return navigateTo('/')
})
