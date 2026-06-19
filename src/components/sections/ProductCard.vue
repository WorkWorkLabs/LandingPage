<template>
  <BaseCard
    variant="elevated"
    padding="lg"
    rounded="xl"
    hoverable
    class="product-card h-full"
  >
    <div class="product-content">
      <div class="product-header">
        <h3 class="product-title">
          {{ product.title }}
        </h3>
        <p
          v-if="product.subtitle"
          class="product-subtitle"
        >
          {{ product.subtitle }}
        </p>
      </div>
      
      <p class="product-description">
        {{ product.description }}
      </p>
      
      <!-- Product Features -->
      <div
        v-if="product.features.length > 0"
        class="product-features"
      >
        <div
          v-for="feature in product.features"
          :key="feature.label"
          class="feature-item"
        >
          <span
            v-if="feature.highlight"
            class="feature-highlight"
          >
            {{ feature.value }}
          </span>
          <div class="feature-details">
            <span class="feature-label">{{ feature.label }}</span>
            <span
              v-if="feature.value && !feature.highlight"
              class="feature-value"
            >
              {{ feature.value }}
            </span>
          </div>
        </div>
      </div>
      
      <!-- Product Tags -->
      <div
        v-if="product.tags && product.tags.length > 0"
        class="product-tags"
      >
        <span
          v-for="tag in product.tags"
          :key="tag"
          class="product-tag"
        >
          {{ tag }}
        </span>
      </div>
      
      <!-- Product Link -->
      <div class="product-footer">
        <a
          :href="product.link"
          class="product-link group"
        >
          Details link
          <svg
            class="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </a>
      </div>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import BaseCard from '@/components/base/BaseCard.vue'
import type { Product } from '@/types'

interface Props {
  product: Product
  index?: number
}

defineProps<Props>()
</script>

<style scoped>
.product-card {
  @apply transition-all duration-300 hover:shadow-2xl;
}

.product-content {
  @apply h-full flex flex-col;
}

.product-header {
  @apply mb-4;
}

.product-title {
  @apply text-xl font-bold text-gray-900 mb-2 leading-tight;
}

.product-subtitle {
  @apply text-primary font-medium;
}

.product-description {
  @apply text-gray-600 leading-relaxed mb-6 flex-grow;
}

.product-features {
  @apply space-y-3 mb-6;
}

.feature-item {
  @apply flex items-center gap-3;
}

.feature-highlight {
  @apply text-2xl font-bold text-primary;
}

.feature-details {
  @apply flex flex-col;
}

.feature-label {
  @apply text-sm text-gray-500;
}

.feature-value {
  @apply font-medium text-gray-900;
}

.product-tags {
  @apply flex flex-wrap gap-2 mb-6;
}

.product-tag {
  @apply px-3 py-1 bg-primary/10 text-primary text-sm rounded-full font-medium;
}

.product-footer {
  @apply mt-auto;
}

.product-link {
  @apply inline-flex items-center text-primary font-medium hover:text-primary-dark transition-colors;
}

.text-primary {
  color: #00A1FF;
}

.hover\:text-primary-dark:hover {
  color: #0088CC;
}

.bg-primary\/10 {
  background-color: rgba(0, 161, 255, 0.1);
}
</style>