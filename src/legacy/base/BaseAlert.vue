<script setup lang="ts">
import { ref } from 'vue'

withDefaults(defineProps<{
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  title?: string
  closable?: boolean
}>(), {
  variant: 'default',
  closable: false
})

const isVisible = ref(true)

const close = () => {
  isVisible.value = false
}
</script>

<template>
  <Transition
    enter-active-class="transition-all duration-300"
    leave-active-class="transition-all duration-300"
    enter-from-class="opacity-0 -translate-y-2"
    leave-to-class="opacity-0 -translate-y-2"
  >
    <div
      v-if="isVisible"
      :class="[
        'p-4 rounded-xl border flex items-start gap-3',
        variant === 'primary' ? 'bg-primary/10 border-primary/20 text-primary' :
        variant === 'secondary' ? 'bg-secondary/10 border-secondary/20 text-secondary' :
        variant === 'success' ? 'bg-success/10 border-success/20 text-success' :
        variant === 'warning' ? 'bg-warning/10 border-warning/20 text-warning' :
        variant === 'danger' ? 'bg-danger/10 border-danger/20 text-danger' :
        'bg-default-100 border-default-200 text-default-700'
      ]"
    >
      <div class="flex-1">
        <h4 v-if="title" class="font-semibold text-sm mb-1">{{ title }}</h4>
        <p class="text-sm">
          <slot />
        </p>
      </div>
      <button
        v-if="closable"
        class="p-1 hover:bg-white/20 rounded-lg transition-colors"
        @click="close"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </Transition>
</template>
