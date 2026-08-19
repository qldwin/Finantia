<template>
  <div
      class="card p-6 rounded-lg shadow-xl border border-neutral-200 dark:border-neutral-750 bg-white dark:bg-neutral-900 transition-all duration-300 hover:shadow-md hover:scale-[1.01]"
      :class="{ 'cursor-pointer': clickable }"
      @click="clickable ? $emit('click') : null"
  >
    <div class="flex items-start justify-between mb-4">
      <div class="flex items-center gap-3">
        <div 
            class="p-3 rounded-full bg-primary-50 dark:bg-primary-900/30"
            :class="getAccountTypeColor(account.accountType)"
        >
          <Banknote class="h-6 w-6 text-primary-600 dark:text-primary-400" />
        </div>
        <div>
          <h3 class="text-lg font-semibold text-neutral-900 dark:text-white">
            {{ account.accountName }}
          </h3>
          <p class="text-sm text-neutral-500 dark:text-neutral-400">
            {{ account.accountType }}
          </p>
        </div>
      </div>
      
      <div v-if="showActions" class="flex gap-2">
        <slot name="actions">
          <Button
              v-if="showView"
              variant="ghost"
              size="icon"
              class="h-8 w-8"
              @click.stop="$emit('view')"
          >
            <EyeIcon class="h-4 w-4" />
          </Button>
          <Button
              v-if="showEdit"
              variant="ghost"
              size="icon"
              class="h-8 w-8"
              @click.stop="$emit('edit')"
          >
            <SquarePen class="h-4 w-4" />
          </Button>
          <Button
              v-if="showDelete"
              variant="ghost"
              size="icon"
              class="h-8 w-8 text-red-500 hover:text-red-600"
              @click.stop="$emit('delete')"
          >
            <TrashIcon class="h-4 w-4" />
          </Button>
        </slot>
      </div>
    </div>

    <div class="space-y-3">
      <div class="flex justify-between items-center">
        <span class="text-sm text-neutral-500 dark:text-neutral-400">Solde initial</span>
        <span class="font-medium text-neutral-700 dark:text-neutral-300">
          {{ formatCurrency(parseFloat(account.balance || 0)) }}
        </span>
      </div>

      <div class="flex justify-between items-center">
        <span class="text-sm text-neutral-500 dark:text-neutral-400">Solde actuel</span>
        <span 
            class="text-xl font-bold"
            :class="getBalanceColor(account.currentBalance || parseFloat(account.balance || 0))"
        >
          {{ formatCurrency(account.currentBalance || parseFloat(account.balance || 0)) }}
        </span>
      </div>

      <div v-if="showProgress" class="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
        <div
            class="bg-primary-600 dark:bg-primary-400 h-2 rounded-full transition-all duration-500"
            :style="{ width: getProgressPercentage() + '%' }"
        ></div>
      </div>

      <div v-if="showStats" class="flex justify-between text-xs text-neutral-500 dark:text-neutral-400 pt-2 border-t border-neutral-200 dark:border-neutral-700">
        <span>Revenus: {{ formatCurrency(getIncome()) }}</span>
        <span>Dépenses: {{ formatCurrency(getExpense()) }}</span>
      </div>
    </div>

    <div v-if="showFooter" class="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700 flex justify-between items-center text-xs text-neutral-500 dark:text-neutral-400">
      <span>{{ account.currency }}</span>
      <span>{{ formatDate(account.createdAt) }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Banknote, EyeIcon, SquarePen, TrashIcon } from 'lucide-vue-next'

const props = defineProps({
  account: {
    type: Object,
    required: true
  },
  clickable: {
    type: Boolean,
    default: false
  },
  showActions: {
    type: Boolean,
    default: true
  },
  showView: {
    type: Boolean,
    default: true
  },
  showEdit: {
    type: Boolean,
    default: true
  },
  showDelete: {
    type: Boolean,
    default: true
  },
  showProgress: {
    type: Boolean,
    default: false
  },
  showStats: {
    type: Boolean,
    default: false
  },
  showFooter: {
    type: Boolean,
    default: false
  },
  transactions: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['click', 'view', 'edit', 'delete'])

// Computed properties
const getBalanceColor = (balance) => {
  if (balance > 0) return 'text-primary-600 dark:text-primary-400'
  if (balance < 0) return 'text-red-500 dark:text-red-400'
  return 'text-neutral-700 dark:text-neutral-300'
}

const getAccountTypeColor = (type) => {
  const type = (type || '').toLowerCase()
  if (type.includes('courant')) return 'bg-blue-50 dark:bg-blue-900/30'
  if (type.includes('livret') || type.includes('epargne')) return 'bg-green-50 dark:bg-green-900/30'
  if (type.includes('credit')) return 'bg-red-50 dark:bg-red-900/30'
  return 'bg-neutral-50 dark:bg-neutral-800'
}

const getProgressPercentage = () => {
  if (!props.showProgress) return 0
  const initial = parseFloat(props.account.balance || 0)
  const current = props.account.currentBalance ? parseFloat(props.account.currentBalance) : initial
  if (initial === 0) return 100
  return Math.min(100, ((current - initial) / Math.abs(initial)) * 100 + 100)
}

const getIncome = () => {
  if (!props.showStats || !props.transactions) return 0
  return props.transactions
      .filter(t => t.typeTransaction === 'revenu' && t.accountId === props.account.id)
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0)
}

const getExpense = () => {
  if (!props.showStats || !props.transactions) return 0
  return props.transactions
      .filter(t => t.typeTransaction === 'depense' && t.accountId === props.account.id)
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0)
}

// Format helpers
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: props.account.currency || 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date)
}
</script>

<style scoped>
.card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
}
</style>
