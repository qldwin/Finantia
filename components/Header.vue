<template>
  <header
      class="fixed w-full top-0 left-0 z-50 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 transition-colors duration-300">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <div class="flex items-center">
          <NuxtLink to="/" class="text-xl font-semibold text-primary-600 dark:text-primary-400">Finantia</NuxtLink>
        </div>

        <!-- Navigation -->
        <nav class="hidden md:flex items-center space-x-1">
          <NuxtLink
              to="/"
              class="px-3 py-2 text-sm rounded-md text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              active-class="text-primary-600 dark:text-primary-400 font-medium"
          >
            Accueil
          </NuxtLink>

          <NuxtLink
              to="/dashboard"
              class="px-3 py-2 text-sm rounded-md text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              active-class="text-primary-600 dark:text-primary-400 font-medium"
          >
            Tableau de bord
          </NuxtLink>


          <NuxtLink
              to="/about"
              class="px-3 py-2 text-sm rounded-md text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              active-class="text-primary-600 dark:text-primary-400 font-medium"
          >
            À propos
          </NuxtLink>
        </nav>

        <div class="flex items-center space-x-3">
          <!-- Boutons d'authentification -->
          <div class="relative">
            <button
                @click="toggleDropdown"
                class="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <span class="text-sm text-neutral-700 dark:text-neutral-300">{{ user?.name || 'Utilisateur' }}</span>
              <svg xmlns="http://www.w3.org/2000/svg"
                   class="h-5 w-5 text-neutral-700 dark:text-neutral-300 transition-transform"
                   :class="{ 'rotate-180': isDropdownOpen }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>

            <div
                v-if="isDropdownOpen"
                class="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-900 rounded-md overflow-hidden shadow-lg border border-neutral-200 dark:border-neutral-800"
            >
              <NuxtLink
                  to="/profile"
                  class="block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  @click="isDropdownOpen = false"
              >
                Mon profil
              </NuxtLink>
              <NuxtLink
                  to="/dashboard"
                  class="block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  @click="isDropdownOpen = false"
              >
                Tableau de bord
              </NuxtLink>
              <button
                  @click="logout"
                  class="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                Déconnexion
              </button>
            </div>
          </div>

          <NuxtLink
              to="/register"
              class="px-3 py-2 text-sm rounded-md text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            Créer un compte
          </NuxtLink>
          <NuxtLink
              to="/login"
              class="px-3 py-2 text-sm rounded-md bg-primary-500 text-white hover:bg-primary-600 transition-colors"
          >
            Se connecter
          </NuxtLink>

          <!-- Theme switcher -->
          <button
              @click="toggleTheme"
              class="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              aria-label="Changer de thème"
          >
            <svg v-if="isDarkTheme" xmlns="http://www.w3.org/2000/svg"
                 class="h-5 w-5 text-neutral-700 dark:text-neutral-300" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd"
                    d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                    clip-rule="evenodd"/>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-neutral-700 dark:text-neutral-300"
                 viewBox="0 0 20 20" fill="currentColor">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
            </svg>
          </button>

          <!-- Menu hamburger pour mobile -->
          <button
              @click="isMobileMenuOpen = !isMobileMenuOpen"
              class="md:hidden p-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-neutral-700 dark:text-neutral-300" fill="none"
                 viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Menu mobile -->
    <div
        v-if="isMobileMenuOpen"
        class="md:hidden bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 transition-colors"
    >
      <div class="px-2 pt-2 pb-3 space-y-1">
        <NuxtLink
            to="/"
            class="block px-3 py-2 text-base rounded-md text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            active-class="text-primary-600 dark:text-primary-400 font-medium bg-neutral-100 dark:bg-neutral-800"
            @click="isMobileMenuOpen = false"
        >
          Accueil
        </NuxtLink>

        <NuxtLink
            to="/dashboard"
            class="block px-3 py-2 text-base rounded-md text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            active-class="text-primary-600 dark:text-primary-400 font-medium bg-neutral-100 dark:bg-neutral-800"
            @click="isMobileMenuOpen = false"
        >
          Tableau de bord
        </NuxtLink>

        <NuxtLink
            to="/profile"
            class="block px-3 py-2 text-base rounded-md text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            active-class="text-primary-600 dark:text-primary-400 font-medium bg-neutral-100 dark:bg-neutral-800"
            @click="isMobileMenuOpen = false"
        >
          Mon profil
        </NuxtLink>

        <NuxtLink
            to="/about"
            class="block px-3 py-2 text-base rounded-md text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            active-class="text-primary-600 dark:text-primary-400 font-medium bg-neutral-100 dark:bg-neutral-800"
            @click="isMobileMenuOpen = false"
        >
          À propos
        </NuxtLink>

        <button
            @click="logout"
            class="w-full text-left block px-3 py-2 text-base rounded-md text-red-600 dark:text-red-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          Déconnexion
        </button>

        <NuxtLink
            to="/login"
            class="block px-3 py-2 text-base rounded-md text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            active-class="text-primary-600 dark:text-primary-400 font-medium bg-neutral-100 dark:bg-neutral-800"
            @click="isMobileMenuOpen = false"
        >
          Se connecter
        </NuxtLink>

        <NuxtLink
            to="/register"
            class="block px-3 py-2 text-base rounded-md text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            active-class="text-primary-600 dark:text-primary-400 font-medium bg-neutral-100 dark:bg-neutral-800"
            @click="isMobileMenuOpen = false"
        >
          Créer un compte
        </NuxtLink>
      </div>
    </div>
  </header>
</template>

<script setup>
import {ref, onMounted, onUnmounted, watch} from 'vue';
// import { useAuth } from '~/composables/useAuth';

// Récupérer l'état d'authentification
// const auth = useAuth();
// const { user, isAuthenticated } = auth;

// État du thème
const isDarkTheme = ref(false);

// États du menu
const isDropdownOpen = ref(false);
const isMobileMenuOpen = ref(false);

// Fermer le dropdown quand on clique ailleurs
const closeDropdown = (event) => {
  if (isDropdownOpen.value && !event.target.closest('.relative')) {
    isDropdownOpen.value = false;
  }
};

// Toggle pour le dropdown
const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

// // Fonction de déconnexion
// const logout = async () => {
//   try {
//     await auth.logout();
//     isDropdownOpen.value = false;
//     isMobileMenuOpen.value = false;
//   } catch (error) {
//     console.error('Erreur lors de la déconnexion:', error);
//   }
// };

onMounted(() => {
  // Initialisation du thème
  isDarkTheme.value = document.documentElement.classList.contains('dark');

  // Ajouter l'écouteur pour fermer le dropdown
  document.addEventListener('click', closeDropdown);
});

onUnmounted(() => {
  // Nettoyer l'écouteur
  document.removeEventListener('click', closeDropdown);
});

// Fonction pour changer de thème
function toggleTheme() {
  const html = document.documentElement;

  if (html.classList.contains('dark')) {
    html.classList.remove('dark');
    isDarkTheme.value = false;
    localStorage.setItem('theme', 'light');
  } else {
    html.classList.add('dark');
    isDarkTheme.value = true;
    localStorage.setItem('theme', 'dark');
  }
}

// Fermer le menu mobile et le dropdown quand on change de route
watch(() => window.location.href, () => {
  isMobileMenuOpen.value = false;
  isDropdownOpen.value = false;
});
</script>