<template>
  <div :is-open="isOpen" @update:isOpen="updateIsOpen">
    <div class="p-6 max-w-md mx-auto text-center">
      <h3 class="text-lg font-medium leading-6 text-gray-900 dark:text-white" id="modal-title">Gestion des Comptes Bancaires</h3>
      <div class="mt-2">
        <form @submit.prevent="addAccount">
          <div class="mb-4">
            <label for="accountName" class="block text-sm font-medium text-gray-700">Nom du Compte</label>
            <input v-model="newAccount.name" type="text" id="accountName" class="mt-1 p-2 block w-full border rounded-md" required />
          </div>
          <div class="mb-4">
            <label for="typeAccount" class="block text-sm font-medium text-gray-700">Type de Compte</label>
            <select v-model="newAccount.type" id="typeAccount" class="mt-1 p-2 block w-full border rounded-md" required>
              <option value="">Sélectionnez un type</option>
              <option v-for="(label, key) in accountLabels" :key="key" :value="key">{{ label }}</option>
            </select>
          </div>
          <button type="submit" class="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600">Ajouter Compte</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { accountLabels } from '~/utils/accountLabels';

// --- PROPS ---
const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  }
});

// --- EMITS ---
const emit = defineEmits(['update:isOpen']);

// --- STATE ---
const newAccount = ref({
  name: '',
  type: ''
});

// --- METHODS ---
const updateIsOpen = (value) => {
  emit('update:isOpen', value);
};

async function addAccount() {
  if (newAccount.value.name && newAccount.value.type) {
    try {
      await $fetch('/api/account', {
        method: 'POST',
        body: {
          accountName: newAccount.value.name,
          typeAccount: newAccount.value.type
        }
      });
      newAccount.value = { name: '', type: '' };
      updateIsOpen(false);
    } catch (error) {
      console.error('Erreur lors de l\'ajout du compte', error);
    }
  }
}
</script>