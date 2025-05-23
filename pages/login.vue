<script setup lang="ts">
import { ref } from 'vue';

const { isLoading, error } = auth;

const form = ref({
  email: '',
  password: '',
  remember: false
});

const handleLogin = async () => {
  try {
    await auth.login({
      email: form.value.email,
      password: form.value.password,
      remember: form.value.remember
    });
  } catch (err) {
    console.error('Erreur de connexion:', err);
  }
};
</script>

<template>
  <div class="flex justify-center items-center py-12">
    <div class="card w-full max-w-md">
      <div class="text-center mb-6">
        <h1 class="text-3xl font-bold text-neutral-900 dark:text-neutral-50">Se connecter</h1>
        <p class="text-neutral-600 dark:text-neutral-400 mt-2">Accédez à votre tableau de bord</p>
      </div>
      
      <form @submit.prevent="handleLogin" class="space-y-6">
        <div v-if="error" class="p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg text-sm mb-4">
          {{ error }}
        </div>
        
        <div>
          <label for="email" class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Email</label>
          <input 
            type="email" 
            id="email" 
            v-model="form.email" 
            required 
            class="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
            placeholder="votre@email.com"
          />
        </div>
        
        <div>
          <div class="flex items-center justify-between mb-1">
            <label for="password" class="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Mot de passe</label>
            <a href="#" class="text-sm text-primary-600 dark:text-primary-400 hover:underline">Mot de passe oublié?</a>
          </div>
          <input 
            type="password" 
            id="password" 
            v-model="form.password" 
            required 
            class="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
            placeholder="••••••••"
          />
        </div>
        
        <div class="flex items-center">
          <input 
            type="checkbox" 
            id="remember" 
            v-model="form.remember" 
            class="h-4 w-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500" 
          />
          <label for="remember" class="ml-2 block text-sm text-neutral-700 dark:text-neutral-300">Se souvenir de moi</label>
        </div>
        
        <button 
          type="submit" 
          class="w-full btn btn-primary flex justify-center"
          :disabled="isLoading"
        >
          <span v-if="isLoading">Chargement...</span>
          <span v-else>Se connecter</span>
        </button>
      </form>
      
      <div class="mt-6 text-center">
        <p class="text-sm text-neutral-600 dark:text-neutral-400">
          Pas encore de compte? 
          <NuxtLink to="/register" class="text-primary-600 dark:text-primary-400 hover:underline font-medium">Créer un compte</NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

