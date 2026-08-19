<script setup>
// Redirect to dashboard
definePageMeta({
  middleware: ['authenticated']
})

onMounted(() => {
  navigateTo('/dashboard')
})
</script>

<template>
  <div class="flex justify-center items-center h-screen">
    <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
  </div>
</template>
