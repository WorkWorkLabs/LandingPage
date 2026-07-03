<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useContentStore } from '@/stores/content'
import { useIntersectionObserver } from '@/composables/useIntersectionObserver'

const contentStore = useContentStore()
const { products } = storeToRefs(contentStore)

const { sectionRef, isVisible } = useIntersectionObserver()

const currentIndex = ref(0)
let intervalId: ReturnType<typeof setInterval> | null = null

const nextSlide = () => {
  currentIndex.value = (currentIndex.value + 1) % products.value.items.length
}

const prevSlide = () => {
  currentIndex.value = currentIndex.value === 0 ? products.value.items.length - 1 : currentIndex.value - 1
}

const goToSlide = (index: number) => {
  currentIndex.value = index
  resetInterval()
}

const resetInterval = () => {
  if (intervalId) clearInterval(intervalId)
  intervalId = setInterval(nextSlide, 5000)
}

onMounted(() => {
  intervalId = setInterval(nextSlide, 5000)
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})
</script>

<template>
  <section
    id="products"
    ref="sectionRef"
    class="relative py-24 bg-content1 overflow-hidden"
  >
    <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-secondary/5 via-transparent to-transparent" />

    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div
        :class="[
          'text-center mb-16 transition-all duration-700',
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        ]"
      >
        <span class="inline-block px-4 py-1.5 mb-4 text-sm font-medium text-secondary bg-secondary/10 rounded-full border border-secondary/20">
          {{ products.badge }}
        </span>
        <h2 class="text-4xl sm:text-5xl font-bold text-default-900 mb-4">
          {{ products.title }}
        </h2>
        <p class="text-xl text-default-500 max-w-2xl mx-auto">
          {{ products.subtitle }}
        </p>
      </div>

      <div class="relative max-w-4xl mx-auto">
        <div class="overflow-hidden rounded-2xl">
          <div
            class="flex transition-transform duration-500 ease-out"
            :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
          >
            <div
              v-for="product in products.items"
              :key="product.title"
              class="w-full flex-shrink-0 px-4"
            >
              <div class="bg-background rounded-2xl border border-default-200 p-8 sm:p-10 hover:shadow-lg transition-shadow duration-300">
                <div class="flex flex-col sm:flex-row items-start gap-6">
                  <div class="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <span class="text-2xl">{{ product.icon }}</span>
                  </div>

                  <div class="flex-1">
                    <h3 class="text-2xl font-bold text-default-900 mb-3">
                      {{ product.title }}
                    </h3>
                    <p class="text-default-500 mb-6 leading-relaxed">
                      {{ product.description }}
                    </p>
                    <div class="flex flex-wrap gap-2 mb-6">
                      <span
                        v-for="tag in product.tags"
                        :key="tag"
                        class="px-3 py-1 text-xs font-medium text-primary bg-primary/10 rounded-full border border-primary/20"
                      >
                        {{ tag }}
                      </span>
                    </div>
                    <a
                      :href="product.cta.href"
                      class="inline-flex items-center text-sm font-semibold text-primary hover:text-primary-600 transition-colors group"
                    >
                      {{ product.cta.text }}
                      <svg class="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-center gap-4 mt-8">
          <button
            class="p-2 rounded-full bg-content2 hover:bg-default-200 transition-colors border border-default-200"
            @click="prevSlide(); resetInterval()"
          >
            <svg class="w-5 h-5 text-default-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div class="flex gap-2">
            <button
              v-for="(_, index) in products.items"
              :key="index"
              :class="[
                'w-2.5 h-2.5 rounded-full transition-all duration-300',
                currentIndex === index ? 'bg-primary w-8' : 'bg-default-300 hover:bg-default-400'
              ]"
              @click="goToSlide(index)"
            />
          </div>

          <button
            class="p-2 rounded-full bg-content2 hover:bg-default-200 transition-colors border border-default-200"
            @click="nextSlide(); resetInterval()"
          >
            <svg class="w-5 h-5 text-default-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
