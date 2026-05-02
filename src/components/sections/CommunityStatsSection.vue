<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useContentStore } from '@/stores/content'
import { useIntersectionObserver } from '@/composables/useIntersectionObserver'
import StatsSection from './StatsSection.vue'

const contentStore = useContentStore()
const { communityStats } = storeToRefs(contentStore)

const { sectionRef, isVisible } = useIntersectionObserver()
</script>

<template>
  <section
    id="community"
    ref="sectionRef"
    class="relative py-24 bg-gradient-to-br from-secondary via-secondary-light to-secondary overflow-hidden"
  >
    <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent" />

    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div
        :class="[
          'text-center mb-16 transition-all duration-700',
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        ]"
      >
        <span class="inline-block px-4 py-1.5 mb-4 text-sm font-medium text-white/90 bg-white/10 rounded-full border border-white/20">
          {{ communityStats.badge }}
        </span>
        <h2 class="text-4xl sm:text-5xl font-bold text-white mb-4">
          {{ communityStats.title }}
        </h2>
        <p class="text-xl text-white/70 max-w-2xl mx-auto">
          {{ communityStats.subtitle }}
        </p>
        <a
          href="https://t.me/WorkWorkWeb3"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2 mt-8 px-8 py-3.5 text-base font-semibold text-white bg-white/15 backdrop-blur-sm rounded-full border border-white/25 hover:bg-white/25 hover:border-white/40 transition-all duration-200 hover:-translate-y-0.5"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
          </svg>
          Telegram Community
        </a>
      </div>

      <StatsSection />
    </div>
  </section>
</template>
