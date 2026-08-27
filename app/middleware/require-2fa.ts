export default defineNuxtRouteMiddleware(async () => {
    const { session, loggedIn, fetch: refreshSession } = useUserSession()

    if (!loggedIn.value) await refreshSession()

    if (!loggedIn.value) {
        return navigateTo('/login')
    }

    if (!session.value?.twoFactorPending) {
        return navigateTo('/')
    }
})