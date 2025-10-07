<template>
  <section id="products" class="products-section">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="section-header">
        <h2 class="section-title">WorkWork Ecosystem</h2>
        <p class="section-description">
          WorkWork connect users with socially meaningful opportunities
        </p>
        
        <div class="carousel-container" v-if="products.length > 0">
          <div 
            class="carousel-track" 
            :style="{ 
              transform: `translateX(-${currentIndex * (100 / products.length)}%)`,
              width: `${products.length * 100}%`
            }"
          >
            <div 
              v-for="product in products" 
              :key="product.id"
              class="product-slide"
              :style="{ width: `${100 / products.length}%` }"
            >
              <img 
                :src="product.image || '/images/placeholder.svg'" 
                :alt="product.title"
                @click="openLink(product.id)"
                class="clickable-image"
              />
            </div>
          </div>
        </div>
        
        <!-- 指示条 - 只有多于1张图片时才显示 -->
        <div 
          v-if="products.length > 1" 
          class="carousel-indicators"
        >
          <button
            v-for="(product, index) in products"
            :key="product.id"
            :class="['indicator', { active: currentIndex === index }]"
            @click="goToSlide(index)"
            :aria-label="`Go to ${product.title}`"
          ></button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useContentStore } from '@/stores/content'

const contentStore = useContentStore()
const { products } = storeToRefs(contentStore)

const currentIndex = ref(0)
let intervalId: number | null = null

// 动态计算总张数
const totalSlides = computed(() => products.value.length)

const nextSlide = () => {
  if (totalSlides.value > 1) {
    currentIndex.value = (currentIndex.value + 1) % totalSlides.value
  }
}

const goToSlide = (index: number) => {
  currentIndex.value = index
  // 重置自动轮播
  if (intervalId) {
    clearInterval(intervalId)
  }
  // 只有多于1张图片时才自动轮播
  if (totalSlides.value > 1) {
    intervalId = setInterval(nextSlide, 3000)
  }
}

const startAutoPlay = () => {
  // 只有多于1张图片时才启动自动轮播
  if (totalSlides.value > 1) {
    intervalId = setInterval(nextSlide, 3000)
  }
}

const stopAutoPlay = () => {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}

onMounted(() => {
  startAutoPlay()
})

onUnmounted(() => {
  stopAutoPlay()
})

const openLink = (productId: string) => {
  const linkMap: Record<string, string> = {
    '1': 'https://google.com',
    '2': 'https://workwork.works', 
    '3': 'https://yahoo.com',
    '4': 'https://workwork.works'
  }
  
  const url = linkMap[productId]
  if (url) {
    window.open(url, '_blank')
  }
}
</script>

<style scoped>
.products-section {
  @apply bg-white;
  min-height: calc(100vh - 70px);
  display: flex;
  align-items: center;
  padding: 2rem 0;
}

.section-header {
  @apply text-center mb-16;
}

.section-title {
  @apply text-4xl md:text-5xl font-bold text-primary mb-6;
}

.clickable-image {
  cursor: pointer;
  transition: opacity 0.3s ease;
}

.clickable-image:hover {
  opacity: 0.8;
}

.section-description {
  @apply text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed;
}

.carousel-container {
  width: 1000px;
  height: 500px;
  margin: 32px auto;
  overflow: hidden;
}

.carousel-track {
  display: flex;
  height: 100%;
  transition: transform 0.5s ease-in-out;
}

.product-slide {
  height: 100%;
  flex-shrink: 0;
}

.product-slide img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

@media (max-width: 1024px) {
  .carousel-container {
    width: 90vw;
    max-width: 1000px;
    height: calc(90vw * 500 / 1000);
    max-height: 500px;
  }
}

@media (max-width: 768px) {
  .carousel-container {
    width: 95vw;
    height: calc(95vw * 500 / 1000);
  }
}

/* 指示条样式 */
.carousel-indicators {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 24px;
}

.indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: none;
  background-color: #d1d5db;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;
}

.indicator:hover {
  background-color: #9ca3af;
  transform: scale(1.1);
}

.indicator.active {
  background-color: #00A1FF;
  transform: scale(1.2);
}

.indicator:focus {
  outline: 2px solid #00A1FF;
  outline-offset: 2px;
}

.text-primary {
  color: #00A1FF;
}
</style>