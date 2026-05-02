<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  name: string
  src?: string
  size?: 'sm' | 'md' | 'lg'
}>(), {
  size: 'md'
})

const initials = computed(() => {
  return props.name.charAt(0).toUpperCase()
})

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-14 h-14 text-xl'
  }
  return sizes[props.size]
})
</script>

<template>
  <div :class="['rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center', sizeClasses]">
    <img
      v-if="src"
      :src="src"
      :alt="name"
      class="w-full h-full rounded-full object-cover"
    />
    <span v-else>{{ initials }}</span>
  </div>
</template>
