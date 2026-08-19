<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>
          {{ account?.id ? 'Modifier le compte' : 'Nouveau compte bancaire' }}
        </DialogTitle>
        <DialogDescription>
          {{ account?.id ? 'Modifiez les informations de votre compte' : 'Ajoutez un nouveau compte bancaire' }}
        </DialogDescription>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="space-y-2">
          <Label for="accountName">Nom du compte *</Label>
          <Input
              id="accountName"
              v-model="form.accountName"
              type="text"
              placeholder="Ex: Compte Courant - BNP"
              required
          />
          <p v-if="errors.accountName" class="text-red-500 text-sm">{{ errors.accountName }}</p>
        </div>

        <div class="space-y-2">
          <Label for="accountType">Type de compte *</Label>
          <Select v-model="form.accountType" required>
            <SelectTrigger class="w-full">
              <SelectValue placeholder="Sélectionnez un type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Compte Courant">Compte Courant</SelectItem>
              <SelectItem value="Livret A">Livret A</SelectItem>
              <SelectItem value="LDDS">LDDS</SelectItem>
              <SelectItem value="PEL">PEL</SelectItem>
              <SelectItem value="CEL">CEL</SelectItem>
              <SelectItem value="Compte Épargne">Compte Épargne</SelectItem>
              <SelectItem value="Compte Titre">Compte Titre</SelectItem>
              <SelectItem value="Credit">Crédit</SelectItem>
              <SelectItem value="Autre">Autre</SelectItem>
            </SelectContent>
          </Select>
          <p v-if="errors.accountType" class="text-red-500 text-sm">{{ errors.accountType }}</p>
        </div>

        <div class="space-y-2">
          <Label for="balance">Solde initial *</Label>
          <Input
              id="balance"
              v-model="form.balance"
              type="number"
              step="0.01"
              placeholder="0.00"
              required
          />
          <p v-if="errors.balance" class="text-red-500 text-sm">{{ errors.balance }}</p>
        </div>

        <div class="space-y-2">
          <Label for="currency">Devise *</Label>
          <Select v-model="form.currency" required>
            <SelectTrigger class="w-full">
              <SelectValue placeholder="Sélectionnez une devise" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EUR">Euro (€)</SelectItem>
              <SelectItem value="USD">Dollar Américain ($)</SelectItem>
              <SelectItem value="GBP">Livre Sterling (£)</SelectItem>
              <SelectItem value="CHF">Franc Suisse (CHF)</SelectItem>
              <SelectItem value="CAD">Dollar Canadien (CA$)</SelectItem>
            </SelectContent>
          </Select>
          <p v-if="errors.currency" class="text-red-500 text-sm">{{ errors.currency }}</p>
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
              :disabled="isSubmitting"
              class="bg-primary-700 hover:bg-primary-500 text-white"
          >
            <Loader2 v-if="isSubmitting" class="h-4 w-4 animate-spin mr-2" />
            {{ account?.id ? 'Modifier' : 'Créer' }}
          </Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { Loader2 } from 'lucide-vue-next'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  account: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'account-saved'])

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const form = ref({
  accountName: '',
  accountType: '',
  balance: 0,
  currency: 'EUR'
})

const errors = ref({})
const isSubmitting = ref(false)

// Initialize form with account data
watch(() => props.account, (newAccount) => {
  if (newAccount) {
    form.value = {
      accountName: newAccount.accountName || '',
      accountType: newAccount.accountType || '',
      balance: newAccount.balance ? parseFloat(newAccount.balance) : 0,
      currency: newAccount.currency || 'EUR'
    }
  } else {
    form.value = {
      accountName: '',
      accountType: '',
      balance: 0,
      currency: 'EUR'
    }
  }
  errors.value = {}
}, { immediate: true })

const validate = () => {
  errors.value = {}
  let isValid = true

  if (!form.value.accountName.trim()) {
    errors.value.accountName = 'Le nom du compte est requis'
    isValid = false
  }

  if (!form.value.accountType) {
    errors.value.accountType = 'Le type de compte est requis'
    isValid = false
  }

  if (form.value.balance === null || form.value.balance === undefined || isNaN(form.value.balance)) {
    errors.value.balance = 'Le solde initial est requis'
    isValid = false
  }

  if (!form.value.currency) {
    errors.value.currency = 'La devise est requise'
    isValid = false
  }

  return isValid
}

const handleSubmit = async () => {
  if (!validate()) return

  isSubmitting.value = true

  try {
    const payload = {
      accountName: form.value.accountName.trim(),
      accountType: form.value.accountType,
      balance: form.value.balance,
      currency: form.value.currency
    }

    let response
    if (props.account?.id) {
      // Update existing account
      response = await $fetch(`/api/accounts/${props.account.id}`, {
        method: 'PATCH',
        body: payload
      })
    } else {
      // Create new account
      response = await $fetch('/api/accounts', {
        method: 'POST',
        body: payload
      })
    }

    emit('account-saved', response.account)
    isOpen.value = false
  } catch (error) {
    console.error('Erreur sauvegarde compte:', error)
    const message = error.data?.message || 'Une erreur est survenue'
    alert(message)
  } finally {
    isSubmitting.value = false
  }
}
</script>
