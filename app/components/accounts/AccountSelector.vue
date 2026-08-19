<template>
  <div class="account-selector">
    <Select 
        v-model="selectedAccountId"
        @update:model-value="onAccountChange"
        :disabled="loading || disabled"
    >
      <SelectTrigger 
          class="w-full md:w-[200px]"
          :class="triggerClass"
      >
        <SelectValue placeholder="Tous les comptes" />
      </SelectTrigger>
      <SelectContent class="dark:bg-neutral-800 bg-white">
        <SelectItem value="all" class="cursor-pointer">
          <div class="flex items-center gap-2">
            <Banknote class="h-4 w-4" />
            <span>Tous les comptes</span>
          </div>
        </SelectItem>
        <SelectItem 
            v-for="account in accounts" 
            :key="account.id" 
            :value="account.id"
            class="cursor-pointer"
        >
          <div class="flex items-center justify-between w-full">
            <div class="flex items-center gap-2">
              <div 
                  class="p-1 rounded-full text-xs"
                  :class="getAccountTypeColor(account.accountType)"
              >
                <Banknote class="h-3 w-3" />
              </div>
              <span>{{ account.accountName }}</span>
            </div>
            <span 
                class="text-xs text-neutral-500 dark:text-neutral-400"
                :class="getBalanceColor(account)"
            >
              {{ formatCurrency(getAccountBalance(account)) }}
            </span>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { Banknote } from 'lucide-vue-next'

const props = defineProps({
  modelValue: {
    type: String,
    default: 'all'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  triggerClass: {
    type: String,
    default: ''
  },
  showBalance: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue', 'account-changed'])

const accounts = ref([])
const loading = ref(true)
const selectedAccountId = ref(props.modelValue)

// Load accounts
const loadAccounts = async () => {
  try {
    loading.value = true
    const response = await $fetch('/api/accounts')
    accounts.value = response.accounts || []
  } catch (error) {
    console.error('Erreur chargement comptes:', error)
  } finally {
    loading.value = false
  }
}

// Event handlers
const onAccountChange = (value) => {
  selectedAccountId.value = value
  emit('update:modelValue', value)
  emit('account-changed', value)
}

// Computed properties
const getAccountBalance = (account) => {
  if (!account) return 0
  const initialBalance = parseFloat(account.balance) || 0
  
  // If we have transactions, we could calculate current balance
  // For now, just return initial balance or currentBalance if available
  if (account.currentBalance !== undefined) {
    return parseFloat(account.currentBalance)
  }
  
  return initialBalance
}

const getBalanceColor = (account) => {
  const balance = getAccountBalance(account)
  if (balance > 0) return 'text-primary-600 dark:text-primary-400'
  if (balance < 0) return 'text-red-500 dark:text-red-400'
  return 'text-neutral-600 dark:text-neutral-400'
}

const getAccountTypeColor = (type) => {
  const typeLower = (type || '').toLowerCase()
  if (typeLower.includes('courant')) return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
  if (typeLower.includes('livret') || typeLower.includes('epargne')) return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
  if (typeLower.includes('credit')) return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
  return 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400'
}

// Format helpers
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

// Watch for prop changes
watch(() => props.modelValue, (newValue) => {
  selectedAccountId.value = newValue
})

// Load accounts on mount
onMounted(() => {
  loadAccounts()
})
</script>

<style scoped>
.account-selector {
  display: inline-block;
}
</style>
