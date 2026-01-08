<template>
  <section id="features" class="features-section">
    <div class="container mx-auto features-container">
      <div class="section-header">
        <h2 class="section-title">What we are doing</h2>
        <p class="section-description">
          WorkWork is building a global remote work ecosystem for digital
          nomads, remote workers, freelancers, and super individuals.
        </p>
      </div>

      <div class="features-grid">
        <FeatureCard
          v-for="(feature, index) in features"
          :key="feature.id"
          :feature="feature"
          :index="index"
          class="feature-item"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import FeatureCard from "@/components/sections/FeatureCard.vue";
import { useContentStore } from "@/stores/content";

const contentStore = useContentStore();
const { features } = storeToRefs(contentStore);
</script>

<style scoped>
.features-section {
  @apply bg-gray-50;
  min-height: calc(100vh - 65px);
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

.section-description {
  @apply text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed;
}

.features-container {
  padding-left: 100px;
  padding-right: 100px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 295px);
  gap: 57px;
  justify-content: center;
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .features-grid {
    grid-template-columns: repeat(2, 295px);
  }
}

@media (max-width: 768px) {
  .features-container {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .features-section {
    padding: 2rem 0;
    min-height: auto;
  }

  .section-header {
    margin-bottom: 2rem;
  }

  .section-title {
    font-size: 1.875rem;
    margin-bottom: 1rem;
  }

  .section-description {
    font-size: 1rem;
    padding: 0 1rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
    max-width: 100%;
  }
}

.feature-item {
  animation: fadeInUp 0.6s ease-out forwards;
  animation-delay: calc(var(--animation-order) * 0.1s);
}

.feature-item:nth-child(1) {
  --animation-order: 1;
}
.feature-item:nth-child(2) {
  --animation-order: 2;
}
.feature-item:nth-child(3) {
  --animation-order: 3;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.text-primary {
  color: #00a1ff;
}
</style>
