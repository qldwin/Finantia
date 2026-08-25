<template>
  <div class="py-8">
    <div class="max-w-6xl mx-auto">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 class="text-4xl font-black tracking-tighter">Transactions</h1>
        </div>

        <TransactionToolbar
            v-model:search-query="searchQuery"
            :is-parsing="isParsing"
            @file-selected="handleFileUpload"
            @create="openTransactionModal"
        />
      </div>

      <TransactionTable
          :loading="loading"
          :transactions="filteredTransactions"
          @edit="editTransaction"
          @delete="confirmDeleteTransaction"
      />
    </div>

    <TransactionModal
        v-model="showTransactionModal"
        :transaction="selectedTransaction"
        @transaction-added="onTransactionSaved"
        @transaction-updated="onTransactionSaved"
    />
  </div>
</template>

<script setup>
import {ref, onMounted, computed} from 'vue';
import Papa from 'papaparse';
import TransactionToolbar from '~/components/transactions/TransactionToolbar.vue';
import TransactionTable from '~/components/transactions/TransactionTable.vue';

useHead({
  title: 'AirGap | Transactions',
})

const searchQuery = ref('');

const filteredTransactions = computed(() => {
  const all = transactions.value || [];
  if (!searchQuery.value.trim()) return all;

  const q = searchQuery.value.toLowerCase();

  return all.filter(t =>
      (t.description && t.description.toLowerCase().includes(q)) ||
      (t.category && t.category.toLowerCase().includes(q)) ||
      (t.amount && t.amount.toString().includes(q))
  );
});

// --- CONFIGURATION ---
definePageMeta({
  middleware: ['authenticated']
});

// --- ÉTAT ---
const isImporting = ref(false);
const isParsing = ref(false);

const transactions = ref([]);
const loading = ref(true);
const showTransactionModal = ref(false);
const selectedTransaction = ref(null);

// --- CHARGEMENT DONNÉES ---
const loadTransactions = async () => {
  try {
    loading.value = true;
    const response = await $fetch('/api/transactions');
    transactions.value = (response.transactions || []).map(t => ({
      ...t,
      category: t.category?.name || '',
      amount: Number(t.amount),
      typeTransaction: t.typeTransaction
    }));
  } catch (error) {
    console.error('Erreur chargement transactions:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadTransactions();
});

// --- IMPORT CSV : LECTURE + CLASSIFICATION ---
/**
 * Extrait et nettoie les données d'une ligne CSV brute.
 * (Niveau 1 de profondeur)
 */
const transformCSVRow = (row) => {
  const keys = Object.keys(row);
  const amountKey = keys.find(k => k.toLowerCase().includes('montant') || k.toLowerCase().includes('amount'));
  const dateKey = keys.find(k => k.toLowerCase().includes('date') && !k.toLowerCase().includes('valeur'));
  const descKey = keys.find(k => k.toLowerCase().includes('libell') || k.toLowerCase().includes('label'));

  const rawAmount = row[amountKey];
  const cleanAmount = typeof rawAmount === 'string'
      ? Number.parseFloat(rawAmount.replaceAll(/\s/g, '').replace(',', '.'))
      : Number(rawAmount);

  let cleanDate = new Date();
  if (dateKey && row[dateKey]) {
    const dateStr = row[dateKey];
    cleanDate = dateStr.includes('/')
        ? new Date(dateStr.split('/').reverse().join('-'))
        : new Date(dateStr);
  }

  return {
    date: cleanDate,
    description: descKey ? (row[descKey] || 'Import CSV') : 'Import CSV',
    amount: cleanAmount,
    accountId: null,
    selectedCategoryId: null,
    status: 'missing_category'
  };
};

/**
 * Version promisifiée de Papa.parse pour aplatir le flux asynchrone.
 */
const parseCSV = (file) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      encoding: "ISO-8859-1",
      worker: false,
      complete: resolve,
      error: reject
    });
  });
};

/**
 * Fonction principale simplifiée (Niveau 1).
 */
const handleFileUpload = async (file) => {
  if (!file) return;

  isParsing.value = true;

  try {
    await new Promise(resolve => setTimeout(resolve, 50));

    const results = await parseCSV(file);

    const formattedTransactions = results.data
        .filter(row => Object.keys(row).some(k =>
            k.toLowerCase().includes('montant') ||
            k.toLowerCase().includes('amount') ||
            k.toLowerCase().includes('solde')
        ))
        .map(transformCSVRow);

    const response = await $fetch('/api/transactions/classify', {
      method: 'POST',
      body: {transactions: formattedTransactions}
    });

    await saveTransactions(response.transactions);

  } catch (err) {
    console.error("Erreur mapping/classification:", err);
    alert(`Erreur: ${err.message}`);
  } finally {
    isParsing.value = false;
  }
};

// --- IMPORT CSV : SAUVEGARDE ---
const saveTransactions = async (data) => {
  if (!data || data.length === 0) {
    console.error("❌ Erreur : Tentative d'importation d'un tableau vide !");
    return;
  }

  try {
    isImporting.value = true;
    const response = await $fetch('/api/transactions/import', {
      method: 'POST',
      body: {transactions: data}
    });

    alert(`${response.count} transactions importées avec succès !`);
    await loadTransactions();

  } catch (err) {
    console.error("Erreur lors de la sauvegarde :", err);
    alert("Erreur lors de l'enregistrement des transactions.");
  } finally {
    isImporting.value = false;
  }
};

// --- CRUD UNITAIRE ---
const openTransactionModal = () => {
  selectedTransaction.value = null;
  showTransactionModal.value = true;
};

const editTransaction = (transaction) => {
  selectedTransaction.value = {...transaction};
  showTransactionModal.value = true;
};

const onTransactionSaved = () => {
  loadTransactions();
  showTransactionModal.value = false;
};

const confirmDeleteTransaction = async (transaction) => {
  if (confirm(`Supprimer "${transaction.description}" ?`)) {
    try {
      await $fetch(`/api/transactions/${transaction.id}`, {method: 'DELETE'});
      transactions.value = transactions.value.filter(t => t.id !== transaction.id);
    } catch (error) {
      alert("Erreur suppression.");
      console.log('erreur suppression transaction:', error);
    }
  }
};
</script>
<style>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 10px;
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: #262626;
}
</style>
