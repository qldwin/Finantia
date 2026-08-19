<template>
  <div class="py-8">
    <div class="max-w-6xl mx-auto">
      <!-- Header with back button -->
      <div class="flex items-center gap-4 mb-8">
        <Button
            variant="outline"
            size="icon"
            @click="goBack"
            class="h-10 w-10"
        >
          <ArrowLeft class="h-4 w-4" />
        </Button>
        <div>
          <h1 class="text-4xl font-black tracking-tighter">{{ account?.accountName }}</h1>
          <p class="text-neutral-500 dark:text-neutral-400 mt-1">
            {{ account?.accountType }} - {{ account?.currency }}
          </p>
        </div>
      </div>

      <!-- Account Summary -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div
            class="card p-6 rounded-lg shadow-xl border border-neutral-200 dark:border-neutral-750 bg-white dark:bg-neutral-900"
        >
          <h3 class="text-lg font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Solde initial
          </h3>
          <div v-if="loading" class="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"/>
          <p v-else class="text-3xl font-bold text-primary-550">
            {{ formatCurrency(parseFloat(account?.balance || 0)) }}
          </p>
        </div>

        <div
            class="card p-6 rounded-lg shadow-xl border border-neutral-200 dark:border-neutral-750 bg-white dark:bg-neutral-900"
        >
          <h3 class="text-lg font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Solde actuel
          </h3>
          <div v-if="loading" class="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"/>
          <p v-else class="text-3xl font-bold" :class="currentBalance >= 0 ? 'text-primary-550' : 'text-red-500'">
            {{ formatCurrency(currentBalance) }}
          </p>
        </div>

        <div
            class="card p-6 rounded-lg shadow-xl border border-neutral-200 dark:border-neutral-750 bg-white dark:bg-neutral-900"
        >
          <h3 class="text-lg font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Revenus (ce mois)
          </h3>
          <div v-if="loading" class="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"/>
          <p v-else class="text-3xl font-bold text-primary-550">
            {{ formatCurrency(monthlyIncome) }}
          </p>
        </div>

        <div
            class="card p-6 rounded-lg shadow-xl border border-neutral-200 dark:border-neutral-750 bg-white dark:bg-neutral-900"
        >
          <h3 class="text-lg font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Dépenses (ce mois)
          </h3>
          <div v-if="loading" class="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"/>
          <p v-else class="text-3xl font-bold text-red-500">
            {{ formatCurrency(monthlyExpense) }}
          </p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-wrap gap-4 mb-8">
        <Button
            class="bg-primary-700 hover:bg-primary-500 text-white"
            @click="openTransactionModal"
        >
          <PlusIcon class="h-4 w-4 stroke-[3] mr-2"/>
          Nouvelle transaction
        </Button>
        <Button
            variant="outline"
            @click="editAccount"
        >
          <SquarePen class="h-4 w-4 mr-2"/>
          Modifier le compte
        </Button>
        <Button
            variant="outline"
            class="text-red-500 hover:text-red-600"
            @click="confirmDeleteAccount"
        >
          <TrashIcon class="h-4 w-4 mr-2"/>
          Supprimer
        </Button>
      </div>

      <!-- Account Transactions -->
      <div class="bg-white dark:bg-neutral-800 shadow-sm rounded-lg border border-neutral-200 dark:border-neutral-700">
        <div class="p-6 border-b border-neutral-200 dark:border-neutral-700">
          <h2 class="text-xl font-semibold">Transactions du compte</h2>
        </div>

        <div v-if="loading" class="flex justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"/>
        </div>

        <div v-else-if="filteredTransactions.length === 0" class="py-8 text-center text-neutral-500">
          <p>Aucune transaction pour ce compte.</p>
        </div>

        <div v-else class="overflow-x-auto">
          <Table class="w-full" aria-hidden="true">
            <TableHeader>
              <TableRow
                  class="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-750"
              >
                <TableHead
                    class="text-left py-3 px-4 text-neutral-700 dark:text-neutral-300 text-xs uppercase tracking-wider font-semibold"
                >
                  Date
                </TableHead>
                <TableHead
                    class="text-left py-3 px-4 text-neutral-700 dark:text-neutral-300 text-xs uppercase tracking-wider font-semibold"
                >
                  Description
                </TableHead>
                <TableHead
                    class="text-right py-3 px-4 text-neutral-700 dark:text-neutral-300 text-xs uppercase tracking-wider font-semibold"
                >
                  Catégorie
                </TableHead>
                <TableHead
                    class="text-right py-3 px-4 text-neutral-700 dark:text-neutral-300 text-xs uppercase tracking-wider font-semibold"
                >
                  Montant
                </TableHead>
                <TableHead
                    class="text-right py-3 px-4 text-neutral-700 dark:text-neutral-300 text-xs uppercase tracking-wider font-semibold"
                >
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody class="divide-y divide-neutral-200 dark:divide-neutral-800">
              <TableRow
                  v-for="transaction in filteredTransactions"
                  :key="transaction.id"
                  class="hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
              >
                <TableCell class="py-3 px-4 text-sm text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                  {{ formatDate(transaction.date) }}
                </TableCell>

                <TableCell class="py-3 px-4 text-sm text-neutral-800 dark:text-neutral-200">
                  <div class="flex items-center">
                    <span class="truncate max-w-[400px]" :title="transaction.description">
                      {{ transaction.description }}
                    </span>
                  </div>
                </TableCell>

                <TableCell class="py-3 px-4 text-sm text-right">
                  <span
                      v-if="transaction.category"
                      class="px-2 py-1 rounded-full text-xs font-medium bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300"
                  >
                    {{ transaction.category }}
                  </span>
                  <span v-else class="text-neutral-500">-</span>
                </TableCell>

                <TableCell
                    class="py-3 px-4 text-sm text-right font-medium whitespace-nowrap"
                    :class="getTransactionClass(transaction)"
                >
                  {{ getTransactionSign(transaction) }} {{ formatCurrency(transaction.amount) }}
                </TableCell>

                <TableCell class="py-3 px-4 text-right whitespace-nowrap">
                  <div class="flex justify-end space-x-2">
                    <Button
                        class="cursor-pointer p-1 text-neutral-500 hover:text-primary-550 transition-colors rounded"
                        @click="editTransaction(transaction)"
                    >
                      <span class="sr-only">Modifier</span>
                      <SquarePen class="h-4 w-4"/>
                    </Button>
                    <Button
                        class="cursor-pointer p-1 text-neutral-500 hover:text-red-500 transition-colors rounded"
                        @click="confirmDeleteTransaction(transaction)"
                    >
                      <span class="sr-only">Supprimer</span>
                      <TrashIcon class="h-4 w-4"/>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

      <!-- Transaction Modal -->
      <TransactionModal
          v-model="showTransactionModal"
          :transaction="selectedTransaction"
          :account-id="accountId"
          @transaction-added="onTransactionSaved"
          @transaction-updated="onTransactionSaved"
      />

      <!-- Account Modal -->
      <AccountModal
          v-model="showAccountModal"
          :account="account"
          @account-saved="onAccountSaved"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import {
  ArrowLeft,
  PlusIcon,
  TrashIcon,
  SquarePen
} from 'lucide-vue-next'

useHead({
  title: 'AirGap | Détails du compte',
})

definePageMeta({
  middleware: ['authenticated']
})

const route = useRoute()
const accountId = computed(() => route.params.id)

const account = ref(null)
const transactions = ref([])
const loading = ref(true)
const showTransactionModal = ref(false)
const showAccountModal = ref(false)
const selectedTransaction = ref(null)

// Load data
const loadData = async () => {
  try {
    loading.value = true
    
    // Load account details
    const accountResponse = await $fetch(`/api/accounts/${accountId.value}`)
    account.value = accountResponse.account

    // Load transactions for this account
    const transactionsResponse = await $fetch('/api/transactions')
    transactions.value = (transactionsResponse.transactions || [])
        .filter(t => t.accountId === accountId.value)
        .map(t => ({
          ...t,
          amount: Number(t.amount),
          category: t.category?.name || '',
          typeTransaction: t.typeTransaction
        }))
  } catch (error) {
    console.error('Erreur chargement données:', error)
    alert('Erreur lors du chargement des données')
  } finally {
    loading.value = false
  }
}

// Computed properties
const currentBalance = computed(() => {
  if (!account.value) return 0
  
  const initialBalance = parseFloat(account.value.balance) || 0
  const transactionsBalance = transactions.value.reduce((sum, t) => {
    return sum + (t.typeTransaction === 'revenu' ? t.amount : -t.amount)
  }, 0)
  
  return initialBalance + transactionsBalance
})

const now = new Date()
const currentMonth = now.getMonth()
const currentYear = now.getFullYear()

const monthlyIncome = computed(() => {
  return transactions.value
      .filter(t => t.typeTransaction === 'revenu' && 
          new Date(t.date).getMonth() === currentMonth && 
          new Date(t.date).getFullYear() === currentYear)
      .reduce((sum, t) => sum + t.amount, 0)
})

const monthlyExpense = computed(() => {
  return transactions.value
      .filter(t => t.typeTransaction === 'depense' && 
          new Date(t.date).getMonth() === currentMonth && 
          new Date(t.date).getFullYear() === currentYear)
      .reduce((sum, t) => sum + t.amount, 0)
})

const filteredTransactions = computed(() => {
  return [...transactions.value].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
  )
})

// Helper functions
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: account.value?.currency || 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date)
}

const isIncome = (t) => t.typeTransaction === 'revenu'
const getTransactionClass = (t) => isIncome(t) ? 'text-primary-550' : 'text-red-500'
const getTransactionSign = (t) => isIncome(t) ? '+' : '-'

// Navigation
const goBack = () => {
  navigateTo('/accounts')
}

// Modal functions
const openTransactionModal = () => {
  selectedTransaction.value = {
    accountId: accountId.value,
    typeTransaction: 'depense'
  }
  showTransactionModal.value = true
}

const editTransaction = (transaction) => {
  selectedTransaction.value = { ...transaction }
  showTransactionModal.value = true
}

const editAccount = () => {
  showAccountModal.value = true
}

const onTransactionSaved = () => {
  loadData()
  showTransactionModal.value = false
}

const onAccountSaved = (updatedAccount) => {
  account.value = updatedAccount
  showAccountModal.value = false
}

// Delete functions
const confirmDeleteTransaction = async (transaction) => {
  if (confirm(`Supprimer "${transaction.description}" ?`)) {
    try {
      await $fetch(`/api/transactions/${transaction.id}`, { method: 'DELETE' })
      transactions.value = transactions.value.filter(t => t.id !== transaction.id)
    } catch (error) {
      alert("Erreur suppression.")
      console.log('erreur suppression transaction:', error)
    }
  }
}

const confirmDeleteAccount = async () => {
  if (confirm(`Voulez-vous vraiment supprimer le compte "${account.value?.accountName}" ? Cette action est irréversible.`)) {
    try {
      await $fetch(`/api/accounts/${accountId.value}`, { method: 'DELETE' })
      navigateTo('/accounts')
    } catch (error) {
      console.error('Erreur suppression compte:', error)
      const message = error.data?.message || 'Erreur lors de la suppression du compte'
      alert(message)
    }
  }
}

onMounted(() => {
  loadData()
})
</script>
