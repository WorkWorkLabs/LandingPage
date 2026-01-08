<template>
  <div class="home-view">
    <HeroSection />
    <FeaturesSection />
    <ProductsSection />
    <CommunityStatsSection />
    <TestimonialSection />
    <ContactSection />
  </div>
</template>

<script setup lang="ts">
// Import all sections
import HeroSection from '@/components/sections/HeroSection.vue'
import FeaturesSection from '@/components/sections/FeaturesSection.vue'
import ProductsSection from '@/components/sections/ProductsSection.vue'
import CommunityStatsSection from '@/components/sections/CommunityStatsSection.vue'
import TestimonialSection from '@/components/sections/TestimonialSection.vue'
import ContactSection from '@/components/sections/ContactSection.vue'

// SEO setup (can be extended with vue-head or @unhead/vue later)
import { onMounted } from 'vue'

onMounted(() => {
  document.title = 'WorkWork - Global Remote Work Ecosystem'
  
  // Set meta description
  const metaDescription = document.querySelector('meta[name="description"]') || document.createElement('meta')
  metaDescription.setAttribute('name', 'description')
  metaDescription.setAttribute('content', 'Building a global remote work ecosystem for digital nomads, remote workers, freelancers, and super individuals.')
  if (!document.head.contains(metaDescription)) {
    document.head.appendChild(metaDescription)
  }
})
</script>

<style scoped>
.home-view {
  @apply min-h-screen;
}
</style>