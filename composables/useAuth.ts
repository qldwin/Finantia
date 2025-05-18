import { useRouter } from 'vue-router';
import { ref, readonly } from 'vue';

// Types pour les utilisateurs et les réponses des API
interface User {
  id: number;
  email: string;
  name?: string;
  createdAt?: string;
}

interface RegisterData {
  email: string;
  name: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
  remember?: boolean;
}

// État global partagé entre tous les composants
const user = ref<User | null>(null);
const isLoading = ref(false);
const error = ref<string | null>(null);
const isAuthenticated = ref(false);

export const useAuth = () => {
  const router = useRouter();

  // Vérifier si l'utilisateur est connecté
  const checkAuth = async () => {
    if (user.value) return user.value;

    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await $fetch<{ user: User }>('/api/auth/user');
      user.value = response.user;
      isAuthenticated.value = true;
      return user.value;
    } catch (err: any) {
      isAuthenticated.value = false;
      user.value = null;
      
      // Ne pas afficher d'erreur s'il s'agit simplement d'un utilisateur non connecté
      if (err.statusCode !== 401) {
        error.value = err.statusMessage || 'Une erreur est survenue';
      }
      
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  // Inscription
  const register = async (data: RegisterData) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await $fetch<{ user: User, message: string }>('/api/auth/register', {
        method: 'POST',
        body: data
      });
      
      user.value = response.user;
      isAuthenticated.value = true;
      
      // Rediriger vers le tableau de bord
      router.push('/dashboard');
      
      return response;
    } catch (err: any) {
      isAuthenticated.value = false;
      error.value = err.statusMessage || 'Erreur lors de l\'inscription';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Connexion
  const login = async (data: LoginData) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await $fetch<{ user: User, message: string }>('/api/auth/login', {
        method: 'POST',
        body: data
      });
      
      user.value = response.user;
      isAuthenticated.value = true;
      
      // Rediriger vers le tableau de bord
      router.push('/dashboard');
      
      return response;
    } catch (err: any) {
      isAuthenticated.value = false;
      error.value = err.statusMessage || 'Identifiants incorrects';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Déconnexion
  const logout = async () => {
    try {
      await $fetch('/api/auth/logout', { method: 'POST' });
      user.value = null;
      isAuthenticated.value = false;
      router.push('/login');
    } catch (err: any) {
      error.value = err.statusMessage || 'Erreur lors de la déconnexion';
      throw err;
    }
  };

  return {
    user: readonly(user),
    isLoading: readonly(isLoading),
    error: readonly(error),
    isAuthenticated: readonly(isAuthenticated),
    checkAuth,
    register,
    login,
    logout
  };
}; 