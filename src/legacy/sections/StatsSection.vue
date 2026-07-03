<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useContentStore } from '@/stores/content'
import { useIntersectionObserver } from '@/composables/useIntersectionObserver'

const contentStore = useContentStore()
const { communityStats } = storeToRefs(contentStore)

const { isVisible } = useIntersectionObserver()
</script>

<template>
  <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
    <div
      v-for="(stat, index) in communityStats.stats"
      :key="stat.label"
      :class="[
        'text-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/15 transition-all duration-500 hover:-translate-y-1',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      ]"
      :style="{ transitionDelay: `${index * 100}ms` }"
    >
      <div class="text-4xl font-bold text-white mb-2">{{ stat.value }}</div>
      <div class="text-white/70 text-sm">{{ stat.label }}</div>
    </div>
  </div>
</template>
