import { useAuth } from '~/composables/useAuth';

export default defineNuxtPlugin(async () => {
  // Initialiser l'état d'authentification au chargement de l'application
  const auth = useAuth();
  
  try {
    await auth.checkAuth();
  } catch (err) {
    console.error('Erreur lors de l\'initialisation de l\'authentification:', err);
  }
  
  return {
    provide: {
      auth
    }
  };
}); 