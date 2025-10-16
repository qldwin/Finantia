<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center">
        <div class="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm" @click="handleCancel"></div>
        <div class="bg-white dark:bg-neutral-800 shadow-2xl rounded-lg w-full max-w-md mx-4 z-50 relative animate-scale">
          <div class="p-6">
            <!-- Icône -->
            <div v-if="options.type" class="flex justify-center mb-4">
              <div :class="[
                'w-12 h-12 rounded-full flex items-center justify-center',
                {
                  'bg-red-100 dark:bg-red-900/30': options.type === 'danger',
                  'bg-yellow-100 dark:bg-yellow-900/30': options.type === 'warning',
                  'bg-blue-100 dark:bg-blue-900/30': options.type === 'info'
                }
              ]">
                <svg v-if="options.type === 'danger'" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <svg v-else-if="options.type === 'warning'" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>

            <!-- Titre -->
            <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-2 text-center">
              {{ options.title }}
            </h3>

            <!-- Message -->
            <p class="text-neutral-600 dark:text-neutral-400 mb-6 text-center">
              {{ options.message }}
            </p>

            <!-- Actions -->
            <div class="flex gap-3 justify-end">
              <button
                @click="handleCancel"
                class="px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                {{ options.cancelText }}
              </button>
              <button
                @click="handleConfirm"
                :class="[
                  'px-4 py-2 rounded-lg text-white transition-colors',
                  {
                    'bg-red-600 hover:bg-red-700': options.type === 'danger',
                    'bg-yellow-600 hover:bg-yellow-700': options.type === 'warning',
                    'bg-primary-600 hover:bg-primary-700': options.type === 'info' || !options.type
                  }
                ]"
              >
                {{ options.confirmText }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  options: {
    type: Object,
    default: () => ({
      title: 'Confirmer',
      message: 'Êtes-vous sûr ?',
      confirmText: 'Confirmer',
      cancelText: 'Annuler',
      type: 'info' // 'danger', 'warning', 'info'
    })
  }
});

const emit = defineEmits(['confirm', 'cancel']);

const handleConfirm = () => {
  emit('confirm');
};

const handleCancel = () => {
  emit('cancel');
};
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

@keyframes scale {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.animate-scale {
  animation: scale 0.2s ease-out;
}
</style>
