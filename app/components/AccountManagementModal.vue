<template>
  <div v-if="isOpen" @update:isOpen="updateIsOpen" class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="fixed inset-0 dark:bg-neutral-900/60 backdrop-blur-sm" @click="closeModal"/>
    <Card class="w-full max-w-md mx-auto relative bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-gray-500 dark:border-neutral-700 hover:shadow-md transition-shadow duration-300">
      <CardHeader>
        <CardTitle class="text-neutral-900 dark:text-neutral-50">Ajouter un Compte Bancaire</CardTitle>
      </CardHeader>


      <form class="space-y-4" @submit.prevent="addAccount">
        <CardContent>
          <Field>
            <FieldLabel for="accountName" class="block text-sm font-medium text-gray-700">Nom du Compte</FieldLabel>
            <Input v-model="newAccount.name" type="text" id="accountName"
                   class="mt-1 p-2 block w-full border rounded-md" required
                   aria-label="Nom du Compte" placeholder="Ex: Compte Courant"
            />
          </Field>
          <Field>
            <FieldLabel for="typeAccount" class="block text-sm font-medium text-gray-700">Type de Compte</FieldLabel>
            <Select v-model="newAccount.type" id="typeAccount" class="mt-1 p-2 block w-full border rounded-md" aria-label="Type de Compte" required>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un type" />
              </SelectTrigger>
              <SelectContent class="dark:bg-neutral-700 bg-white cursor-pointer">
                <SelectItem class="hover:dark:bg-neutral-600 hover:bg-neutral-400 cursor-pointer" v-for="(label, key) in accountLabels" :key="key" :value="key">
                  {{ label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <div class="gap-5">
            <Button
                type="submit"
                class="cursor-pointer w-full text-white border-neutral-200 dark:border-neutral-750 bg-primary-700 hover:bg-primary-500"
            >
              Ajouter Compte
            </Button>
            <Button
                type="button"
                class="w-full cursor-pointer text-white border-neutral-200 dark:border-neutral-750 bg-primary-700 hover:bg-primary-500"
                @click="closeModal"
            >
              Fermer
            </Button>
          </div>
        </CardContent>
      </form>
    </Card>
  </div>
</template>

<script setup>
import {ref} from 'vue';
import {accountLabels} from '~/utils/accountLabels';

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

const closeModal = () => {
  emit('update:isOpen', false);
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
      newAccount.value = {name: '', type: ''};
      updateIsOpen(false);
    } catch (error) {
      console.error('Erreur lors de l\'ajout du compte', error);
    }
  }
}
</script>