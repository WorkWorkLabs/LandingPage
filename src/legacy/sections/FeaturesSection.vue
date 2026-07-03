<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useContentStore } from '@/stores/content'
import { useIntersectionObserver } from '@/composables/useIntersectionObserver'
import FeatureCard from './FeatureCard.vue'

const contentStore = useContentStore()
const { features } = storeToRefs(contentStore)

const { sectionRef, isVisible } = useIntersectionObserver()
</script>

<template>
  <section
    id="features"
    ref="sectionRef"
    class="relative py-24 bg-background overflow-hidden"
  >
    <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />

    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div
        :class="[
          'text-center mb-16 transition-all duration-700',
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        ]"
      >
        <span class="inline-block px-4 py-1.5 mb-4 text-sm font-medium text-primary bg-primary/10 rounded-full border border-primary/20">
          {{ features.badge }}
        </span>
        <h2 class="text-4xl sm:text-5xl font-bold text-default-900 mb-4">
          {{ features.title }}
        </h2>
        <p class="text-xl text-default-500 max-w-2xl mx-auto">
          {{ features.subtitle }}
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <FeatureCard
          v-for="(feature, index) in features.items"
          :key="feature.title"
          :feature="feature"
          :index="index"
          :is-visible="isVisible"
        />
      </div>
    </div>
  </section>
</template>
