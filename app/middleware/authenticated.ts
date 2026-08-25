export default defineNuxtRouteMiddleware(async () => {
    const { loggedIn, fetch: refreshSession } = useUserSession()

    if (!loggedIn.value) await refreshSession()

    if (!loggedIn.value) {
        return navigateTo('/login')
    }
})
