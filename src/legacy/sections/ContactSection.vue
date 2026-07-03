<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useContentStore } from '@/stores/content'
import { useIntersectionObserver } from '@/composables/useIntersectionObserver'

const contentStore = useContentStore()
const { contact } = storeToRefs(contentStore)

const { sectionRef, isVisible } = useIntersectionObserver()
</script>

<template>
  <section
    id="contact"
    ref="sectionRef"
    class="relative py-24 bg-content1 overflow-hidden"
  >
    <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-secondary/5 via-transparent to-transparent" />

    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div
        :class="[
          'text-center mb-16 transition-all duration-700',
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        ]"
      >
        <span class="inline-block px-4 py-1.5 mb-4 text-sm font-medium text-secondary bg-secondary/10 rounded-full border border-secondary/20">
          {{ contact.badge }}
        </span>
        <h2 class="text-4xl sm:text-5xl font-bold text-default-900 mb-4">
          {{ contact.title }}
        </h2>
        <p class="text-xl text-default-500 max-w-2xl mx-auto mb-10">
          {{ contact.subtitle }}
        </p>
        <a
          href="mailto:yanbo@work-work.org"
          class="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-white bg-primary rounded-full hover:bg-primary-600 transition-all duration-200 shadow-[0_4px_16px_rgba(0,161,255,0.3)] hover:shadow-[0_8px_30px_rgba(0,161,255,0.4)] hover:-translate-y-0.5"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          联系我们
        </a>
      </div>
    </div>
  </section>
</template>
