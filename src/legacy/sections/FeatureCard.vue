<script setup lang="ts">
import { computed } from 'vue'
import type { Feature } from '@/types'

const props = defineProps<{
  feature: Feature
  index: number
  isVisible: boolean
}>()

const colorClasses = computed(() => {
  const colors = {
    blue: {
      bg: 'bg-primary/10',
      text: 'text-primary',
      hover: 'group-hover:shadow-primary/10',
    },
    purple: {
      bg: 'bg-secondary/10',
      text: 'text-secondary',
      hover: 'group-hover:shadow-secondary/10',
    },
    green: {
      bg: 'bg-success/10',
      text: 'text-success',
      hover: 'group-hover:shadow-success/10',
    },
    orange: {
      bg: 'bg-warning/10',
      text: 'text-warning',
      hover: 'group-hover:shadow-warning/10',
    },
    red: {
      bg: 'bg-danger/10',
      text: 'text-danger',
      hover: 'group-hover:shadow-danger/10',
    },
    teal: {
      bg: 'bg-primary/10',
      text: 'text-primary',
      hover: 'group-hover:shadow-primary/10',
    },
  }
  return colors[props.feature.color as keyof typeof colors] || colors.blue
})
</script>

<template>
  <div
    :class="[
      'group relative p-6 bg-content1 rounded-2xl border border-default-200 transition-all duration-700 hover:shadow-xl hover:-translate-y-1 cursor-default',
      colorClasses.hover,
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
    ]"
    :style="{ transitionDelay: `${index * 100}ms` }"
  >
    <div :class="['w-12 h-12 rounded-xl flex items-center justify-center mb-4', colorClasses.bg]">
      <span :class="['text-xl', colorClasses.text]">{{ feature.icon }}</span>
    </div>

    <h3 class="text-lg font-semibold text-default-900 mb-2">
      {{ feature.title }}
    </h3>

    <p class="text-sm text-default-500 leading-relaxed">
      {{ feature.description }}
    </p>

    <div :class="['absolute bottom-0 left-6 right-6 h-0.5 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100', colorClasses.bg]" />
  </div>
</template>
