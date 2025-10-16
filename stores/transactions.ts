import { defineStore } from 'pinia';

export interface Transaction {
  id: number;
  userId: number;
  description: string;
  amount: number | string;
  type: 'income' | 'expense';
  category: string | null;
  date: string;
  createdAt: string;
}

export const useTransactionStore = defineStore('transactions', () => {
  // État
  const transactions = ref<Transaction[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const sortedTransactions = computed(() => {
    return [...transactions.value].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  });

  const totalIncome = computed(() => {
    return transactions.value
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
  });

  const totalExpenses = computed(() => {
    return transactions.value
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);
  });

  const balance = computed(() => totalIncome.value - totalExpenses.value);

  // Actions
  const loadTransactions = async () => {
    try {
      isLoading.value = true;
      error.value = null;

      const response = await $fetch<{ transactions: Transaction[] }>('/api/transactions');
      transactions.value = response.transactions || [];
    } catch (err: any) {
      error.value = err.message || 'Erreur lors du chargement des transactions';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const addTransaction = async (data: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => {
    try {
      isLoading.value = true;
      error.value = null;

      const response = await $fetch<{ transaction: Transaction }>('/api/transactions/create', {
        method: 'POST',
        body: data
      });

      if (response.transaction) {
        transactions.value.push(response.transaction);
      }

      return response.transaction;
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de la création de la transaction';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const updateTransaction = async (id: number, data: Partial<Transaction>) => {
    try {
      isLoading.value = true;
      error.value = null;

      const response = await $fetch<{ transaction: Transaction }>(`/api/transactions/${id}`, {
        method: 'PUT',
        body: data
      });

      const index = transactions.value.findIndex(t => t.id === id);
      if (index !== -1 && response.transaction) {
        transactions.value[index] = response.transaction;
      }

      return response.transaction;
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de la mise à jour de la transaction';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const deleteTransaction = async (id: number) => {
    try {
      isLoading.value = true;
      error.value = null;

      await $fetch(`/api/transactions/${id}`, {
        method: 'DELETE'
      });

      transactions.value = transactions.value.filter(t => t.id !== id);
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de la suppression de la transaction';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const getTransactionsByPeriod = (startDate: Date, endDate: Date) => {
    return transactions.value.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
  };

  const getTransactionsByCategory = (category: string) => {
    return transactions.value.filter(t => t.category === category);
  };

  const getTransactionsByType = (type: 'income' | 'expense') => {
    return transactions.value.filter(t => t.type === type);
  };

  return {
    // État
    transactions,
    isLoading,
    error,

    // Getters
    sortedTransactions,
    totalIncome,
    totalExpenses,
    balance,

    // Actions
    loadTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactionsByPeriod,
    getTransactionsByCategory,
    getTransactionsByType
  };
});
