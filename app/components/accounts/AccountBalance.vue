<template>
  <div 
      class="account-balance"
      :class="[size, { 'text-center': centered }]"
  >
    <div v-if="loading" class="flex items-center justify-center py-4">
      <div class="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary-600"></div>
    </div>
    
    <template v-else>
      <div v-if="label" class="text-sm text-neutral-500 dark:text-neutral-400 mb-1">
        {{ label }}
      </div>
      
      <div class="flex items-baseline gap-2">
        <span 
            class="balance-amount"
            :class="[getBalanceColor(balance), { 'text-4xl': size === 'lg', 'text-3xl': size === 'md', 'text-2xl': size === 'sm', 'text-xl': size === 'xs' }]"
        >
          {{ formatCurrency(balance) }}
        </span>
        
        <span v-if="showCurrency" class="text-sm text-neutral-500 dark:text-neutral-400">
          {{ currency }}
        </span>
      </div>
      
      <div v-if="showChange && previousBalance !== null" class="text-xs mt-1">
        <span :class="getChangeColor(balance - previousBalance)">
          {{ formatChange(balance - previousBalance) }}
        </span>
        <span class="text-neutral-500 dark:text-neutral-400 ml-1">vs précédemment</span>
      </div>
      
      <div v-if="showDetails" class="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
        <span>Initial: {{ formatCurrency(initialBalance) }}</span>
        <span v-if="showChange" class="mx-2">|</span>
        <span v-if="showChange">Variation: {{ formatCurrency(balance - initialBalance) }}</span>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  balance: {
    type: Number,
    required: true
  },
  initialBalance: {
    type: Number,
    default: 0
  },
  previousBalance: {
    type: Number,
    default: null
  },
  currency: {
    type: String,
    default: 'EUR'
  },
  label: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['xs', 'sm', 'md', 'lg'].includes(value)
  },
  centered: {
    type: Boolean,
    default: false
  },
  showCurrency: {
    type: Boolean,
    default: true
  },
  showChange: {
    type: Boolean,
    default: false
  },
  showDetails: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// Computed properties
const getBalanceColor = (balance) => {
  if (balance > 0) return 'text-primary-600 dark:text-primary-400'
  if (balance < 0) return 'text-red-500 dark:text-red-400'
  return 'text-neutral-700 dark:text-neutral-300'
}

const getChangeColor = (change) => {
  if (change > 0) return 'text-green-600 dark:text-green-400'
  if (change < 0) return 'text-red-600 dark:text-red-400'
  return 'text-neutral-600 dark:text-neutral-400'
}

// Format helpers
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: props.currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

const formatChange = (amount) => {
  const sign = amount > 0 ? '+' : ''
  return `${sign}${formatCurrency(amount)}`
}
</script>

<style scoped>
.account-balance {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.balance-amount {
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
</style>
