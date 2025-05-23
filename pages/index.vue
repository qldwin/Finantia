<template>
  <div class="py-8">
    <div class="text-center mb-12">
      <h1 class="text-4xl font-bold mb-3 text-neutral-900 dark:text-neutral-50">Bienvenue sur <span class="text-primary-600 dark:text-primary-400">Finantia</span></h1>
      <p class="text-lg text-neutral-700 dark:text-neutral-300 max-w-2xl mx-auto">
        Votre solution pour gérer vos finances personnelles en toute simplicité
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
      <div class="card hover:shadow-md transition-shadow">
        <div class="flex items-center justify-center mb-4 h-12 w-12 rounded-lg bg-primary-100 dark:bg-primary-900">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 class="text-xl font-semibold mb-2 text-neutral-900 dark:text-neutral-50">Suivi des dépenses</h2>
        <p class="text-neutral-600 dark:text-neutral-400">
          Visualisez vos dépenses et vos revenus en temps réel pour mieux comprendre vos habitudes financières.
        </p>
      </div>
      
      <div class="card hover:shadow-md transition-shadow">
        <div class="flex items-center justify-center mb-4 h-12 w-12 rounded-lg bg-primary-100 dark:bg-primary-900">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h2 class="text-xl font-semibold mb-2 text-neutral-900 dark:text-neutral-50">Rapports et analyses</h2>
        <p class="text-neutral-600 dark:text-neutral-400">
          Obtenez des rapports détaillés sur votre situation financière pour prendre de meilleures décisions.
        </p>
      </div>
      
      <div class="card hover:shadow-md transition-shadow">
        <div class="flex items-center justify-center mb-4 h-12 w-12 rounded-lg bg-primary-100 dark:bg-primary-900">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 class="text-xl font-semibold mb-2 text-neutral-900 dark:text-neutral-50">Planification budgétaire</h2>
        <p class="text-neutral-600 dark:text-neutral-400">
          Créez et suivez facilement vos objectifs financiers pour atteindre vos ambitions.
        </p>
      </div>
    </div>
    
    <div class="text-center">
      <button @click="navigateTo('/register')" class="btn btn-primary">Commencer maintenant</button>
      <button @click="navigateTo('/about')" class="btn btn-outline ml-3">En savoir plus</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { navigateTo } from '#app';

const balance = ref(0);
const items = ref([
  { label: 'Débit', value: 'debit' },
  { label: 'Crédit', value: 'credit' }
]);

const amount = ref<number | null>(null);
const selectedType = ref<'debit' | 'credit'>('debit');
const transactions = ref<any[]>([]);
const accountId = 1; // À remplacer dynamiquement si nécessaire
const description = ref('');

// Charger les transactions existantes depuis l'API
const fetchTransactions = async () => {
  const data = await $fetch(`/api/transactions/history?accountId=${accountId}`);
  transactions.value = data;

  // Met à jour le solde localement (optionnel)
  const newBalance = data.reduce((total: number, tx: any) => {
    return tx.transactionType === 'credit'
        ? total + Number(tx.amount)
        : total - Number(tx.amount);
  }, 0);
  balance.value = newBalance;
};

// Ajouter une transaction
const applyTransaction = async () => {
  const numericAmount = parseFloat(amount.value?.toString() || '');
  if (isNaN(numericAmount) || numericAmount <= 0) return;

  try {
    const newTx = await $fetch('/api/transactions/create', {
      method: 'POST',
      body: {
        accountId,
        transactionType: selectedType.value,
        amount: numericAmount,
        description: description.value,
      },
    });

    transactions.value.unshift(newTx);
    balance.value += selectedType.value === 'credit' ? numericAmount : -numericAmount;
    amount.value = null;
    description.value = '';
  } catch (err) {
    console.error('Erreur lors de la création de la transaction', err);
  }
};
</script>
