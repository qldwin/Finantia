<script setup lang="ts">
import type { FormError, FormSubmitEvent } from '@nuxt/ui'

const state = reactive({
  email: undefined,
  password: undefined
})

const validate = (state: any): FormError[] => {
  const errors = []
  if (!state.email) errors.push({ name: 'email', message: 'Required' })
  if (!state.password) errors.push({ name: 'password', message: 'Required' })
  return errors
}

const toast = useToast()
async function onSubmit(event: FormSubmitEvent<typeof state>) {
  toast.add({ title: 'Success', description: 'The form has been submitted.', color: 'success' })
  console.log(event.data)
}
</script>

<template>
  <div class="flex justify-center items-center h-screen">
    <div class="text-center h-100 w-100 bg-gray-200">
      <h1 class="underline">Se connecter</h1>
      <UForm :validate="validate" :state="state" class="top-10 text-center space-y-10" @submit="onSubmit">
        <UFormField class="flex justify-center" label="Email" name="email">
          <UInput placeholder="toto@gmail.com" v-model="state.email" />
        </UFormField>

        <UFormField class="flex justify-center" label="Password" name="password">
          <UInput placeholder="Mot de passe" v-model="state.password" type="password" />
        </UFormField>

        <UButton class="cursor-pointer" type="submit">
          Submit
        </UButton>
      </UForm>
    </div>
  </div>
</template>

