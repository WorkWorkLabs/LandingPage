<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useContentStore } from '@/stores/content'
import { useIntersectionObserver } from '@/composables/useIntersectionObserver'
import { useTypewriter } from '@/composables/useTypewriter'

const contentStore = useContentStore()
const { hero } = storeToRefs(contentStore)

const { sectionRef, isVisible } = useIntersectionObserver()

const { currentText } = useTypewriter(
  ['everywhere', 'everytime', 'Work'],
  { typeSpeed: 120, deleteSpeed: 60, pauseDuration: 2000 }
)
</script>

<template>
  <section
    ref="sectionRef"
    class="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-content1 to-background"
  >
    <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
    <div class="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
    <div class="absolute bottom-20 right-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />

    <div
      class="absolute inset-0 opacity-[0.03]"
      style="background-image: radial-gradient(circle, #000 1px, transparent 1px); background-size: 32px 32px;"
    />

    <div
      :class="[
        'relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center transition-all duration-1000',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      ]"
    >
      <div class="inline-flex items-center gap-2 px-4 py-1.5 mb-8 bg-primary/10 text-primary text-sm font-medium rounded-full border border-primary/20">
        <span class="w-2 h-2 bg-primary rounded-full animate-pulse" />
        <span>{{ hero.badge }}</span>
      </div>

      <h1 class="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight tracking-tight mb-6">
        <span class="text-default-900">Work </span>
        <span class="bg-gradient-to-r from-primary to-primary-600 bg-clip-text text-transparent">{{ currentText }}<span class="animate-pulse text-primary">|</span></span>
      </h1>

      <p class="text-xl sm:text-2xl text-default-500 max-w-3xl mx-auto mb-10 leading-relaxed">
        🌍 Work smarter. Earn globally. Live freely.
      </p>

      <div class="flex justify-center mb-16">
        <a
          :href="hero.cta.primary.href"
          class="group relative inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-white bg-primary rounded-full hover:bg-primary-600 transition-all duration-200 shadow-[0_4px_16px_rgba(0,161,255,0.3)] hover:shadow-[0_8px_30px_rgba(0,161,255,0.4)] hover:-translate-y-0.5"
        >
          {{ hero.cta.primary.text }}
          <svg class="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </a>
      </div>

      <div class="grid grid-cols-3 gap-6 max-w-lg mx-auto">
        <div
          v-for="(stat, index) in hero.stats"
          :key="stat.label"
          :class="[
            'transition-all duration-700',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          ]"
          :style="{ transitionDelay: `${300 + index * 150}ms` }"
        >
          <div class="text-3xl font-bold text-default-900">{{ stat.value }}</div>
          <div class="text-sm text-default-500 mt-1">{{ stat.label }}</div>
        </div>
      </div>
    </div>

    <div class="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
      <svg class="w-6 h-6 text-default-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    </div>
  </section>
</template>
