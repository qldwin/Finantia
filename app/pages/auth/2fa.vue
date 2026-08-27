<script setup lang="ts">
import TwoFactorVerify from '~/components/2fa.vue'

definePageMeta({
  middleware: ['require-2fa'],
})
</script>

<template>
  <TwoFactorVerify />
</template>