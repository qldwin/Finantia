<template>
  <div class="flex justify-center items-center py-12">
    <div class="card w-full max-w-md">
      <div class="text-center mb-6">
        <h1 class="text-3xl font-bold text-neutral-900 dark:text-neutral-50">Créer un compte</h1>
        <p class="text-neutral-600 dark:text-neutral-400 mt-2">Rejoignez Finantia pour gérer vos finances</p>
      </div>
      
      <form @submit.prevent="handleRegister" class="space-y-5">
        <div v-if="error" class="p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg text-sm mb-4">
          {{ error }}
        </div>
        
        <div>
          <label for="name" class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Nom</label>
          <input 
            type="text" 
            id="name" 
            v-model="form.name" 
            required 
            class="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
            placeholder="Votre nom"
          />
        </div>
        
        <div>
          <label for="reg-email" class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Email</label>
          <input 
            type="email" 
            id="reg-email" 
            v-model="form.email" 
            required 
            class="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
            placeholder="votre@email.com"
          />
        </div>
        
        <div>
          <label for="reg-password" class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Mot de passe</label>
          <input 
            type="password" 
            id="reg-password" 
            v-model="form.password" 
            required 
            class="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
            placeholder="8 caractères minimum"
            minlength="8"
          />
        </div>
        
        <div>
          <label for="confirm-password" class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Confirmer le mot de passe</label>
          <input 
            type="password" 
            id="confirm-password" 
            v-model="form.confirmPassword" 
            required 
            class="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
            placeholder="Confirmer votre mot de passe"
          />
        </div>
        
        <button 
          type="submit" 
          class="w-full btn btn-primary flex justify-center"
          :disabled="isLoading || !formValid"
        >
          <span v-if="isLoading">Création en cours...</span>
          <span v-else>Créer un compte</span>
        </button>
      </form>
      
      <div class="mt-6 text-center">
        <p class="text-sm text-neutral-600 dark:text-neutral-400">
          Vous avez déjà un compte? 
          <NuxtLink to="/login" class="text-primary-600 dark:text-primary-400 hover:underline font-medium">Se connecter</NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuth } from '~/composables/useAuth';

const auth = useAuth();
const { isLoading, error } = auth;

const form = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
});

const formValid = computed(() => {
  return (
    form.value.name.length >= 2 && 
    form.value.email.includes('@') && 
    form.value.password.length >= 8 &&
    form.value.password === form.value.confirmPassword
  );
});

const handleRegister = async () => {
  if (!formValid.value) return;
  
  try {
    await auth.register({
      name: form.value.name,
      email: form.value.email,
      password: form.value.password
    });
  } catch (err) {
    console.error('Erreur lors de l\'inscription:', err);
  }
};
</script> 