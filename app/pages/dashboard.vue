<template>
  <div class="py-8">
    <div class="max-w-6xl mx-auto">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 class="text-4xl font-black tracking-tighter">Tableau de bord</h1>
          <p class="text-neutral-500 dark:text-neutral-400 mt-2">
            Vue d'ensemble de vos finances
          </p>
        </div>

        <!-- Account Selector -->
        <div class="flex items-center gap-4">
          <Select v-model="selectedAccountId" @update:model-value="onAccountChange">
            <SelectTrigger class="w-[200px]">
              <SelectValue placeholder="Tous les comptes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les comptes</SelectItem>
              <SelectItem 
                  v-for="account in accounts" 
                  :key="account.id" 
                  :value="account.id"
              >
                {{ account.accountName }}
              </SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
              variant="outline"
              @click="navigateTo('/accounts')"
          >
            <Banknote class="h-4 w-4 mr-2" />
            Gérer les comptes
          </Button>
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div
            class="card p-4 rounded-lg shadow-xl border border-neutral-200 dark:border-neutral-750 bg-white dark:bg-neutral-900"
        >
          <h3 class="text-lg font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Solde total
          </h3>
          <div v-if="loading" class="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"/>
          <p v-else class="text-3xl font-bold text-primary-550">{{ formatCurrency(totalBalance) }}</p>

          <div v-if="!loading && balanceChange !== null" class="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            <span :class="balanceChange >= 0 ? 'text-primary-550' : 'text-red-500'">
              {{ formatPercent(balanceChange) }}
            </span> vs mois dernier
          </div>
        </div>

        <div
            class="card p-4 bg-white dark:bg-neutral-900 rounded-lg shadow-xl border border-neutral-200 dark:border-neutral-750"
        >
          <h3 class="text-lg font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Revenus (ce mois)
          </h3>
          <div v-if="loading" class="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"/>
          <p v-else class="text-3xl font-bold text-primary-550">{{ formatCurrency(monthlyIncome) }}</p>

          <div v-if="!loading && incomeChange !== null" class="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            <span :class="incomeChange >= 0 ? 'text-primary-550' : 'text-red-500'">
              {{ formatPercent(incomeChange) }}
            </span> vs mois dernier
          </div>
        </div>

        <div
            class="card p-4 bg-white dark:bg-neutral-900 rounded-lg shadow-xl border border-neutral-200 dark:border-neutral-750"
        >
          <h3 class="text-lg font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Dépenses (ce mois)
          </h3>
          <div v-if="loading" class="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"/>
          <p v-else class="text-3xl font-bold text-red-500">{{ formatCurrency(monthlyExpense) }}</p>

          <div v-if="!loading && expenseChange !== null" class="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            <span :class="expenseChange <= 0 ? 'text-green-600' : 'text-red-500'">
              {{ formatPercent(expenseChange) }}
            </span> vs mois dernier
          </div>
        </div>
      </div>

      <!-- Account Balance Cards -->
      <div v-if="accounts.length > 0" class="mb-8">
        <h2 class="text-xl font-semibold mb-4">Soldes par compte</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
              v-for="account in accounts" 
              :key="account.id"
              class="card p-4 rounded-lg shadow-xl border border-neutral-200 dark:border-neutral-750 bg-white dark:bg-neutral-900 cursor-pointer hover:shadow-md transition-shadow"
              @click="navigateTo(`/accounts/${account.id}`)"
          >
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-lg font-medium text-neutral-700 dark:text-neutral-300">
                {{ account.accountName }}
              </h3>
              <Banknote class="h-5 w-5 text-primary-550" />
            </div>
            <p class="text-sm text-neutral-500 dark:text-neutral-400 mb-2">
              {{ account.accountType }}
            </p>
            <div class="flex items-center justify-between">
              <p class="text-2xl font-bold" :class="getAccountBalance(account) >= 0 ? 'text-primary-550' : 'text-red-500'">
                {{ formatCurrency(getAccountBalance(account)) }}
              </p>
              <span class="text-sm text-neutral-500 dark:text-neutral-400">
                {{ account.currency }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div v-if="!loading" class="bg-white dark:bg-neutral-800 shadow-sm rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
        <h2 class="text-xl font-semibold mb-6">Analyse des transactions</h2>
        <reportsStats :transactions="filteredTransactions" />
      </div>

      <div v-if="loading" class="flex justify-center py-12">
        <div class="animate-spin rounded-lg h-12 w-12 border-t-2 border-b-2 border-primary-600"/>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { Banknote } from 'lucide-vue-next'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'

useHead({
  title: 'AirGap | Tableau de bord',
})

definePageMeta({
  middleware: ['authenticated']
})

const selectedAccountId = ref('all')
const accounts = ref([])
const allTransactions = ref([])
const loading = ref(true)

// Load data
const loadData = async () => {
  try {
    loading.value = true
    
    // Load accounts
    const accountsResponse = await $fetch('/api/accounts')
    accounts.value = accountsResponse.accounts || []
    
    // Load transactions
    const transactionsResponse = await $fetch('/api/transactions')
    allTransactions.value = transactionsResponse.transactions || []
  } catch (error) {
    console.error('Erreur chargement données:', error)
  } finally {
    loading.value = false
  }
}

// Computed properties
const filteredTransactions = computed(() => {
  if (selectedAccountId.value === 'all') {
    return allTransactions.value
  }
  return allTransactions.value.filter(t => t.accountId === selectedAccountId.value)
})

const now = new Date()
const currentMonth = now.getMonth()
const currentYear = now.getFullYear()

const getPreviousMonth = (year, month) => month === 0 ? {year: year - 1, month: 11} : {year, month: month - 1}
const {year: prevYear, month: prevMonth} = getPreviousMonth(currentYear, currentMonth)

const totalBalance = computed(() => {
  return filteredTransactions.value.reduce((total, t) => {
    const amount = parseFloat(t.amount) || 0
    return total + (t.typeTransaction === 'revenu' ? amount : -amount)
  }, 0)
})

const monthlyIncome = computed(() => {
  return filteredTransactions.value
      .filter(t => t.typeTransaction === 'revenu' && 
          new Date(t.date).getMonth() === currentMonth && 
          new Date(t.date).getFullYear() === currentYear)
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0)
})

const monthlyExpense = computed(() => {
  return filteredTransactions.value
      .filter(t => t.typeTransaction === 'depense' && 
          new Date(t.date).getMonth() === currentMonth && 
          new Date(t.date).getFullYear() === currentYear)
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0)
})

const prevIncome = computed(() => {
  return filteredTransactions.value
      .filter(t => t.typeTransaction === 'revenu' && 
          new Date(t.date).getMonth() === prevMonth && 
          new Date(t.date).getFullYear() === prevYear)
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0)
})

const prevExpense = computed(() => {
  return filteredTransactions.value
      .filter(t => t.typeTransaction === 'depense' && 
          new Date(t.date).getMonth() === prevMonth && 
          new Date(t.date).getFullYear() === prevYear)
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0)
})

const incomeChange = computed(() => {
  return prevIncome.value === 0 ? null : ((monthlyIncome.value - prevIncome.value) / Math.abs(prevIncome.value)) * 100
})

const expenseChange = computed(() => {
  return prevExpense.value === 0 ? null : ((monthlyExpense.value - prevExpense.value) / Math.abs(prevExpense.value)) * 100
})

const balanceChange = computed(() => {
  const curBal = monthlyIncome.value - monthlyExpense.value
  const prevBal = prevIncome.value - prevExpense.value
  return prevBal === 0 ? null : ((curBal - prevBal) / Math.abs(prevBal)) * 100
})

// Account balance helper
const getAccountBalance = (account) => {
  const accountTransactions = allTransactions.value.filter(t => t.accountId === account.id)
  const initialBalance = parseFloat(account.balance) || 0
  const transactionsBalance = accountTransactions.reduce((sum, t) => {
    const amount = parseFloat(t.amount) || 0
    return sum + (t.typeTransaction === 'revenu' ? amount : -amount)
  }, 0)
  return initialBalance + transactionsBalance
}

// Format helpers
const formatCurrency = (val) => new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR'
}).format(val)

const formatPercent = (val) => {
  if (val === null) return '-'
  const sign = val > 0 ? '+' : ''
  return `${sign}${val.toFixed(1)}%`
}

// Event handlers
const onAccountChange = () => {
  // No need to reload data, computed properties will handle filtering
}

onMounted(() => {
  loadData()
})
</script>
