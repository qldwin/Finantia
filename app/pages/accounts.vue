<template>
  <div class="py-8">
    <div class="max-w-6xl mx-auto">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-bold text-neutral-900 dark:text-neutral-50">Comptes Bancaires</h1>
        <Button
            class="cursor-pointer text-white border-neutral-200 dark:border-neutral-750 bg-primary-700 hover:bg-primary-500"
            @click="openAccountModal"
        >
          Ajouter un compte
        </Button>
      </div>

      <p v-if="pending" class="text-sm text-gray-500">Chargement...</p>
      <p v-else-if="error" class="text-sm text-red-500">Erreur lors du chargement des comptes.</p>
      <p v-else-if="!accountsList.length" class="text-sm text-gray-500">Aucun compte pour le moment.</p>

      <div v-else class="space-y-4">
        <Item
            v-for="account in accountsList"
            :key="account.id"
            variant="outline"
            class="border-neutral-750 shadow-xl"
        >
          <ItemContent class="flex flex-row w-full items-center justify-between">
            <div>
              <ItemTitle>{{ account.accountName }}</ItemTitle>
              <ItemDescription>{{ accountLabels[account.typeAccount] }}</ItemDescription>
            </div>
            <p class="font-mono text-lg text-neutral-900 dark:text-neutral-50">
              {{ account.balance }} {{ account.currency }}
            </p>
          </ItemContent>
        </Item>
      </div>

      <AccountManagementModal
          :is-open="accountModalOpen"
          @update:isOpen="setAccountModalOpen"
          @account-added="refresh"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import AccountManagementModal from '~/components/AccountManagementModal.vue';
import { accountLabels } from '~/utils/accountLabels';

// --- STATE ---
const accountModalOpen = ref(false);

// --- DATA FETCHING ---
const { data, pending, error, refresh } = await useFetch('/api/account', {
  headers: useRequestHeaders(['cookie']), // nécessaire pour que le SSR envoie le cookie de session
});
const accountsList = computed(() => data.value?.accounts ?? []);

// --- ACTIONS ---
const openAccountModal = () => {
  accountModalOpen.value = true;
};
const setAccountModalOpen = (value) => {
  accountModalOpen.value = value;
};
</script>