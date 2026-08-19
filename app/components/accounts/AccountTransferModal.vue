<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>Transfert entre comptes</DialogTitle>
        <DialogDescription>
          Transférez des fonds d'un compte à un autre
        </DialogDescription>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="space-y-2">
          <Label for="fromAccountId">Compte source *</Label>
          <Select v-model="form.fromAccountId" required @update:model-value="onAccountChange">
            <SelectTrigger class="w-full">
              <SelectValue placeholder="Sélectionnez un compte source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem 
                  v-for="account in accounts" 
                  :key="account.id" 
                  :value="account.id"
                  :disabled="!account.currentBalance || account.currentBalance <= 0"
              >
                <div class="flex justify-between items-center w-full">
                  <span>{{ account.accountName }}</span>
                  <span class="text-sm text-neutral-500">
                    {{ formatCurrency(account.currentBalance || parseFloat(account.balance)) }}
                  </span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <p v-if="errors.fromAccountId" class="text-red-500 text-sm">{{ errors.fromAccountId }}</p>
        </div>

        <div class="space-y-2">
          <Label for="toAccountId">Compte destination *</Label>
          <Select v-model="form.toAccountId" required :disabled="!form.fromAccountId">
            <SelectTrigger class="w-full">
              <SelectValue placeholder="Sélectionnez un compte destination" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem 
                  v-for="account in accounts" 
                  :key="account.id" 
                  :value="account.id"
                  :disabled="account.id === form.fromAccountId"
              >
                {{ account.accountName }}
              </SelectItem>
            </SelectContent>
          </Select>
          <p v-if="errors.toAccountId" class="text-red-500 text-sm">{{ errors.toAccountId }}</p>
        </div>

        <div class="space-y-2">
          <Label for="amount">Montant *</Label>
          <Input
              id="amount"
              v-model.number="form.amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              required
          />
          <p v-if="errors.amount" class="text-red-500 text-sm">{{ errors.amount }}</p>
        </div>

        <div class="space-y-2">
          <Label for="description">Description</Label>
          <Input
              id="description"
              v-model="form.description"
              type="text"
              placeholder="Ex: Virement, Épargne, etc."
          />
        </div>

        <div class="space-y-2">
          <Label for="date">Date</Label>
          <Popover>
            <PopoverTrigger as-child>
              <Button
                  variant="outline"
                  :class="cn('w-full justify-start text-left font-normal', !form.date && 'text-muted-foreground')"
              >
                <CalendarIcon class="mr-2 h-4 w-4"/>
                {{ form.date ? formatDate(form.date) : 'Aujourd\'hui' }}
              </Button>
            </PopoverTrigger>
            <PopoverContent class="w-auto p-0 dark:bg-neutral-700 bg-white" align="start">
              <Calendar v-model="form.date" />
            </PopoverContent>
          </Popover>
        </div>

        <!-- Summary -->
        <div v-if="form.fromAccountId && form.toAccountId && form.amount > 0" 
             class="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg space-y-2">
          <h3 class="font-semibold text-sm">Résumé du transfert</h3>
          <div class="flex justify-between text-sm">
            <span>De:</span>
            <span>{{ getAccountName(form.fromAccountId) }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span>Vers:</span>
            <span>{{ getAccountName(form.toAccountId) }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span>Montant:</span>
            <span class="font-medium">{{ formatCurrency(form.amount) }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span>Nouveau solde source:</span>
            <span class="font-medium" :class="getNewBalance(form.fromAccountId, form.amount) < 0 ? 'text-red-500' : ''">
              {{ formatCurrency(getNewBalance(form.fromAccountId, form.amount)) }}
            </span>
          </div>
        </div>

        <div class="flex justify-end space-x-4 pt-4">
          <Button
              type="button"
              variant="outline"
              @click="isOpen = false"
          >
            Annuler
          </Button>
          <Button
              type="submit"
              :disabled="isSubmitting || !isFormValid"
              class="bg-primary-700 hover:bg-primary-500 text-white"
          >
            <Loader2 v-if="isSubmitting" class="h-4 w-4 animate-spin mr-2" />
            Effectuer le transfert
          </Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Loader2, CalendarIcon } from 'lucide-vue-next'
import { cn } from '~/lib/utils'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'transfer-completed'])

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const accounts = ref([])
const loading = ref(true)
const form = ref({
  fromAccountId: null,
  toAccountId: null,
  amount: 0,
  description: '',
  date: new Date()
})

const errors = ref({})
const isSubmitting = ref(false)

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

// Computed properties
const isFormValid = computed(() => {
  return form.value.fromAccountId && 
         form.value.toAccountId && 
         form.value.fromAccountId !== form.value.toAccountId &&
         form.value.amount > 0
})

const getAccountName = (accountId) => {
  const account = accounts.value.find(a => a.id === accountId)
  return account ? account.accountName : ''
}

const getAccountBalance = (accountId) => {
  const account = accounts.value.find(a => a.id === accountId)
  if (!account) return 0
  return account.currentBalance ? parseFloat(account.currentBalance) : parseFloat(account.balance || 0)
}

const getNewBalance = (accountId, amount) => {
  return getAccountBalance(accountId) - amount
}

// Event handlers
const onAccountChange = () => {
  form.value.toAccountId = null
}

const validate = () => {
  errors.value = {}
  let isValid = true

  if (!form.value.fromAccountId) {
    errors.value.fromAccountId = 'Le compte source est requis'
    isValid = false
  }

  if (!form.value.toAccountId) {
    errors.value.toAccountId = 'Le compte destination est requis'
    isValid = false
  }

  if (form.value.fromAccountId === form.value.toAccountId) {
    errors.value.toAccountId = 'Les comptes doivent être différents'
    isValid = false
  }

  if (!form.value.amount || form.value.amount <= 0) {
    errors.value.amount = 'Le montant doit être supérieur à 0'
    isValid = false
  }

  if (form.value.amount > getAccountBalance(form.value.fromAccountId)) {
    errors.value.amount = 'Solde insuffisant sur le compte source'
    isValid = false
  }

  return isValid
}

const handleSubmit = async () => {
  if (!validate()) return

  isSubmitting.value = true

  try {
    const payload = {
      fromAccountId: form.value.fromAccountId,
      toAccountId: form.value.toAccountId,
      amount: form.value.amount,
      description: form.value.description || 'Transfert entre comptes',
      date: form.value.date
    }

    const response = await $fetch('/api/accounts/transfer', {
      method: 'POST',
      body: payload
    })

    emit('transfer-completed', response)
    isOpen.value = false
    
    // Reset form
    form.value = {
      fromAccountId: null,
      toAccountId: null,
      amount: 0,
      description: '',
      date: new Date()
    }
    
    alert(`Transfert effectué avec succès: ${response.message}`)
  } catch (error) {
    console.error('Erreur transfert:', error)
    const message = error.data?.message || 'Erreur lors du transfert'
    alert(message)
  } finally {
    isSubmitting.value = false
  }
}

// Format helpers
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

const formatDate = (date) => {
  if (!date) return ''
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(date))
}

// Load accounts on mount
onMounted(() => {
  loadAccounts()
})
</script>
