<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useContentStore } from '@/stores/content'
import { useIntersectionObserver } from '@/composables/useIntersectionObserver'

const contentStore = useContentStore()
const { testimonial } = storeToRefs(contentStore)

const { sectionRef, isVisible } = useIntersectionObserver()
</script>

<template>
  <section
    ref="sectionRef"
    class="relative py-24 bg-background overflow-hidden"
  >
    <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />

    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div
        :class="[
          'text-center mb-16 transition-all duration-700',
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        ]"
      >
        <span class="inline-block px-4 py-1.5 mb-4 text-sm font-medium text-primary bg-primary/10 rounded-full border border-primary/20">
          {{ testimonial.badge }}
        </span>
        <h2 class="text-4xl sm:text-5xl font-bold text-default-900 mb-4">
          {{ testimonial.title }}
        </h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="(item, index) in testimonial.items"
          :key="item.name"
          :class="[
            'group p-6 bg-content1 rounded-2xl border border-default-200 hover:shadow-lg transition-all duration-500 hover:-translate-y-1',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          ]"
          :style="{ transitionDelay: `${index * 100}ms` }"
        >
          <div class="flex items-center gap-1 mb-4">
            <span
              v-for="star in 5"
              :key="star"
              class="text-warning text-sm"
            >★</span>
          </div>

          <p class="text-default-600 mb-6 leading-relaxed italic">
            "{{ item.quote }}"
          </p>

          <div class="flex items-center gap-3 pt-4 border-t border-default-100">
            <div class="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold text-sm">
              {{ item.name.charAt(0) }}
            </div>
            <div>
              <div class="font-semibold text-default-900 text-sm">{{ item.name }}</div>
              <div class="text-xs text-default-500">{{ item.role }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
