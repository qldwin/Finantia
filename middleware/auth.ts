export default defineNuxtRouteMiddleware(async (to) => {
  const { $auth } = useNuxtApp();
  
  // Routes publiques qui ne nécessitent pas d'authentification
  const publicRoutes = ['/login', '/register', '/', '/about'];
  
  try {
    // Vérifier si l'utilisateur est authentifié
    const user = await $auth.checkAuth();
    
    // Si l'utilisateur n'est pas authentifié et tente d'accéder à une route protégée
    if (!user && !publicRoutes.includes(to.path)) {
      return navigateTo('/');
    }
    
    // Si l'utilisateur est authentifié et tente d'accéder à la page de login ou d'inscription
    if (user && (to.path === '/login' || to.path === '/register')) {
      return navigateTo('/dashboard');
    }
    
    // Redirection automatique de la page d'accueil vers le tableau de bord si connecté
    if (user && to.path === '/') {
      return navigateTo('/dashboard');
    }
  } catch (error) {
    console.error('Erreur dans le middleware d\'authentification:', error);
    
    // En cas d'erreur, rediriger vers la page d'accueil
    if (!publicRoutes.includes(to.path)) {
      return navigateTo('/');
    }
  }
}); 