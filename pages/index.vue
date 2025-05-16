<template>
  <div class="rounded-2xl bg-blue-100 flex justify-center items-center h-70 mt-20 w-100 mr-auto ml-auto">
    <div class="flex flex-col">
      <label class="text-5xl">{{ balance }}€</label>
      <USelect placeholder="Type de transaction" :items="items" v-model="selectedType"/>
      <UInput placeholder="Montant" v-model="amount" class="w-25" type="number"></UInput>
      <UButton type="button" @click="applyTransaction">OK</UButton>
      <UInput placeholder="Description" v-model="description" class="w-25" />
    </div>
  </div>
  <div class="rounded-2xl bg-gray-100 flex flex-col items-start gap-2 p-4 h-auto mt-5 w-100 mr-auto ml-auto">
    <h2 class="text-xl font-bold mb-2">Historique des transactions</h2>
    <ul class="w-full space-y-2">
      <li v-for="tx in transactions" :key="tx.id" class="bg-white rounded-xl p-3 shadow flex justify-between items-center">
        <span>{{ tx.transaction_type === 'credit' ? '+' : '-' }}{{ tx.amount }}€</span>
        <span class="text-sm text-gray-500">{{ new Date(tx.date).toLocaleString() }}</span>
      </li>
    </ul>
  </div>

</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

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
