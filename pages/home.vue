<template>
  <div class="rounded-2xl bg-blue-100 flex justify-center items-center h-70 mt-20 w-100 mr-auto ml-auto">
    <div class="flex flex-col">
      <label class="text-5xl">{{ balance }}€</label>
      <USelect placeholder="Type de transaction" :items="items" v-model="selectedType"/>
      <UInput placeholder="Montant" v-model="amount" class="w-25" type="number"></UInput>
      <UButton type="button" @click="applyTransaction">OK</UButton>
    </div>
  </div>
  <div class="rounded-2xl bg-gray-100 flex justify-center items-center h-70 mt-5 w-100 mr-auto ml-auto">
    <ul>
      <li v-for="transaction in transactions" :key="transaction.id">
        {{ transaction.transactionType }} of {{ transaction.amount }}€ on {{ transaction.date }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import prisma from "~/lib/prisma";
import { HistoryTransact } from '@prisma/client';

const balance = ref(0);
const items = ref([{label: 'Débit', value: 'debit'}, {label: 'Crédit', value: 'credit'}]);
const amount = ref(0);
const selectedType = ref('debit');
const transactions = ref<HistoryTransact[]>([]);

onMounted(async () => {
  // Charger l'historique des transactions depuis la base de données
  transactions.value = await prisma.historyTransact.findMany();
});

const applyTransaction = async () => {
  const numericAmount = parseFloat(amount.value);
  if (selectedType.value === 'debit') {
    balance.value -= numericAmount;
  } else if (selectedType.value === 'credit') {
    balance.value += numericAmount;
  }

  // Enregistrer la transaction dans la base de données
  const transaction = await prisma.historyTransact.create({
    data: {
      transactionType: selectedType.value,
      amount: numericAmount,
      date: new Date(),
      description: `${selectedType.value} of ${numericAmount}€`,
    },
  });

  // Ajouter la transaction à l'historique local
  transactions.value.push(transaction);
};
</script>
