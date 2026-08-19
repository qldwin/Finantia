<template>
  <div class="py-8">
    <div class="max-w-6xl mx-auto">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 class="text-4xl font-black tracking-tighter">Mes Comptes Bancaires</h1>
          <p class="text-neutral-500 dark:text-neutral-400 mt-2">
            Gérez tous vos comptes bancaires en un seul endroit
          </p>
        </div>

        <div class="flex gap-4">
          <Button
              class="cursor-pointer text-white border-neutral-200 dark:border-neutral-750 bg-primary-700 hover:bg-primary-500"
              @click="openAccountModal"
          >
            <PlusIcon class="h-4 w-4 stroke-[3]"/>
            <span class="hidden sm:inline">Nouveau compte</span>
          </Button>
          
          <Button
              v-if="accounts.length > 1"
              variant="outline"
              class="border-primary-200 dark:border-primary-800"
              @click="openTransferModal"
          >
            <ArrowLeftRight class="h-4 w-4 mr-2" />
            <span class="hidden sm:inline">Transfert</span>
          </Button>
        </div>
      </div>

      <!-- Account Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div
            class="card p-6 rounded-lg shadow-xl border border-neutral-200 dark:border-neutral-750 bg-white dark:bg-neutral-900"
        >
          <h3 class="text-lg font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Total des comptes
          </h3>
          <div v-if="loading" class="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"/>
          <p v-else class="text-3xl font-bold text-primary-550">
            {{ accounts.length }}
          </p>
        </div>

        <div
            class="card p-6 rounded-lg shadow-xl border border-neutral-200 dark:border-neutral-750 bg-white dark:bg-neutral-900"
        >
          <h3 class="text-lg font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Solde total
          </h3>
          <AccountBalance
              :balance="totalBalance"
              :loading="loading"
              size="md"
          />
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

      <!-- Accounts Grid -->
      <div class="mb-8">
        <h2 class="text-xl font-semibold mb-4">Mes comptes</h2>
        
        <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="n in 3" :key="n" class="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
        </div>

        <div v-else-if="accounts.length === 0" class="py-8 text-center text-neutral-500">
          <p>Aucun compte bancaire enregistré.</p>
          <p class="text-sm mt-2">Commencez par ajouter votre premier compte.</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AccountCard
              v-for="account in accounts"
              :key="account.id"
              :account="account"
              :transactions="allTransactions"
              clickable
              show-stats
              show-footer
              @click="viewAccount(account)"
              @view="viewAccount(account)"
              @edit="editAccount(account)"
              @delete="confirmDeleteAccount(account)"
          />
        </div>
      </div>

      <!-- Accounts Table (Alternative View) -->
      <div class="bg-white dark:bg-neutral-800 shadow-sm rounded-lg border border-neutral-200 dark:border-neutral-700">
        <div class="p-6 border-b border-neutral-200 dark:border-neutral-700">
          <h2 class="text-xl font-semibold">Liste détaillée</h2>
        </div>

        <div v-if="loading" class="flex justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"/>
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
                  Nom du compte
                </TableHead>
                <TableHead
                    class="text-left py-3 px-4 text-neutral-700 dark:text-neutral-300 text-xs uppercase tracking-wider font-semibold"
                >
                  Type
                </TableHead>
                <TableHead
                    class="text-right py-3 px-4 text-neutral-700 dark:text-neutral-300 text-xs uppercase tracking-wider font-semibold"
                >
                  Solde initial
                </TableHead>
                <TableHead
                    class="text-right py-3 px-4 text-neutral-700 dark:text-neutral-300 text-xs uppercase tracking-wider font-semibold"
                >
                  Solde actuel
                </TableHead>
                <TableHead
                    class="text-right py-3 px-4 text-neutral-700 dark:text-neutral-300 text-xs uppercase tracking-wider font-semibold"
                >
                  Devise
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
                  v-for="account in accounts"
                  :key="account.id"
                  class="hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
              >
                <TableCell class="py-3 px-4 text-sm text-neutral-800 dark:text-neutral-200">
                  <div class="flex items-center">
                    <Banknote class="h-4 w-4 mr-3 text-primary-550"/>
                    <span>{{ account.accountName }}</span>
                  </div>
                </TableCell>

                <TableCell class="py-3 px-4 text-sm text-neutral-600 dark:text-neutral-400">
                  <span
                      class="px-2 py-1 rounded-full text-xs font-medium"
                      :class="getAccountTypeClass(account.accountType)"
                  >
                    {{ account.accountType }}
                  </span>
                </TableCell>

                <TableCell class="py-3 px-4 text-sm text-right font-medium text-neutral-700 dark:text-neutral-300">
                  {{ formatCurrency(parseFloat(account.balance)) }}
                </TableCell>

                <TableCell class="py-3 px-4 text-sm text-right font-medium">
                  <span
                      :class="getAccountBalance(account) >= 0 ? 'text-primary-550' : 'text-red-500'"
                  >
                    {{ formatCurrency(getAccountBalance(account)) }}
                  </span>
                </TableCell>

                <TableCell class="py-3 px-4 text-sm text-right text-neutral-600 dark:text-neutral-400">
                  {{ account.currency }}
                </TableCell>

                <TableCell class="py-3 px-4 text-right whitespace-nowrap">
                  <div class="flex justify-end space-x-2">
                    <Button
                        class="cursor-pointer p-1 text-neutral-500 hover:text-primary-550 transition-colors rounded"
                        @click="viewAccount(account)"
                    >
                      <span class="sr-only">Voir</span>
                      <EyeIcon class="h-4 w-4"/>
                    </Button>
                    <Button
                        class="cursor-pointer p-1 text-neutral-500 hover:text-blue-500 transition-colors rounded"
                        @click="editAccount(account)"
                    >
                      <span class="sr-only">Modifier</span>
                      <SquarePen class="h-4 w-4"/>
                    </Button>
                    <Button
                        class="cursor-pointer p-1 text-neutral-500 hover:text-red-500 transition-colors rounded"
                        @click="confirmDeleteAccount(account)"
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
    </div>

    <!-- Account Modal -->
    <AccountModal
        v-model="showAccountModal"
        :account="selectedAccount"
        @account-saved="onAccountSaved"
    />

    <!-- Transfer Modal -->
    <AccountTransferModal
        v-model="showTransferModal"
        @transfer-completed="onTransferCompleted"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import {
  PlusIcon,
  TrashIcon,
  SquarePen,
  EyeIcon,
  Banknote,
  ArrowLeftRight
} from 'lucide-vue-next'

useHead({
  title: 'AirGap | Mes Comptes',
})

definePageMeta({
  middleware: ['authenticated']
})

const accounts = ref([])
const allTransactions = ref([])
const loading = ref(true)
const showAccountModal = ref(false)
const showTransferModal = ref(false)
const selectedAccount = ref(null)

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
    alert('Erreur lors du chargement des données')
  } finally {
    loading.value = false
  }
}

// Computed properties
const totalBalance = computed(() => {
  return accounts.value.reduce((sum, account) => {
    const balance = parseFloat(account.balance) || 0
    const currentBalance = account.currentBalance ? parseFloat(account.currentBalance) : balance
    return sum + currentBalance
  }, 0)
})

const now = new Date()
const currentMonth = now.getMonth()
const currentYear = now.getFullYear()

const monthlyIncome = computed(() => {
  return allTransactions.value
      .filter(t => t.typeTransaction === 'revenu' && 
          new Date(t.date).getMonth() === currentMonth && 
          new Date(t.date).getFullYear() === currentYear)
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0)
})

const monthlyExpense = computed(() => {
  return allTransactions.value
      .filter(t => t.typeTransaction === 'depense' && 
          new Date(t.date).getMonth() === currentMonth && 
          new Date(t.date).getFullYear() === currentYear)
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0)
})

const getAccountBalance = (account) => {
  if (!account) return 0
  const initialBalance = parseFloat(account.balance) || 0
  const accountTransactions = allTransactions.value.filter(t => t.accountId === account.id)
  const transactionsBalance = accountTransactions.reduce((sum, t) => {
    const amount = parseFloat(t.amount) || 0
    return sum + (t.typeTransaction === 'revenu' ? amount : -amount)
  }, 0)
  return initialBalance + transactionsBalance
}

// Helper functions
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

const getAccountTypeClass = (type) => {
  const typeClasses = {
    'compte courant': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    'livret': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    'epargne': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
    'credit': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    'autre': 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
  }
  return typeClasses[type?.toLowerCase()] || typeClasses['autre']
}

// Modal functions
const openAccountModal = () => {
  selectedAccount.value = null
  showAccountModal.value = true
}

const openTransferModal = () => {
  showTransferModal.value = true
}

const editAccount = (account) => {
  selectedAccount.value = { ...account }
  showAccountModal.value = true
}

const viewAccount = (account) => {
  navigateTo(`/accounts/${account.id}`)
}

const onAccountSaved = () => {
  loadData()
  showAccountModal.value = false
}

const onTransferCompleted = () => {
  loadData()
  showTransferModal.value = false
}

// Delete account
const confirmDeleteAccount = async (account) => {
  if (confirm(`Voulez-vous vraiment supprimer le compte "${account.accountName}" ? Cette action est irréversible.`)) {
    try {
      await $fetch(`/api/accounts/${account.id}`, { method: 'DELETE' })
      accounts.value = accounts.value.filter(a => a.id !== account.id)
      alert('Compte supprimé avec succès')
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
