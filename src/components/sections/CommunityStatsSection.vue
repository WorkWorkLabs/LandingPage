<template>
  <section id="community-stats" class="community-stats-section">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="section-header">
        <h2 class="section-title">Community norms and development</h2>
        <p class="section-description">
          The WorkWork community brings together remote workers and independent individuals from around the world to create a free, flexible, and mutually supportive global home under the concept of "Work everywhere, Work anytime, WorkWork".
        </p>
      </div>

      <div class="stats-section">
        <h3 class="stats-title">Current community size</h3>
        <div class="stats-grid">
          <div
            v-for="stat in stats"
            :key="stat.id"
            class="stat-item"
          >
            <div class="stat-icon">
              <img :src="stat.icon" :alt="stat.label" />
            </div>
            <div class="stat-number">{{ stat.number }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useContentStore } from '@/stores/content'

const contentStore = useContentStore()
const { stats } = storeToRefs(contentStore)

// #region agent log
import { onMounted } from 'vue';
onMounted(() => {
  const logDataC = {location:'CommunityStatsSection.vue:38',message:'CommunityStatsSection mounted',data:{statsCount:stats.value.length,stats:stats.value.map((s:any)=>({id:s.id,label:s.label,number:s.number}))},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'};
  console.log('[DEBUG]', logDataC);
  fetch('http://127.0.0.1:7242/ingest/353a4726-f634-4d1e-b9bb-65ed440c7233',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logDataC)}).catch(()=>{});
});
// #endregion
</script>

<style scoped>
.community-stats-section {
  @apply bg-white;
  height: 576px;
  display: flex;
  align-items: center;
  padding: 2rem 100px;
  background-image: url('/images/map.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
}

.section-header {
  @apply text-center mb-16;
}

.section-title {
  font-family: 'Roboto', sans-serif;
  font-weight: bold;
  font-size: 36px;
  color: #00A1FF;
  margin-bottom: 1.5rem;
}

.section-description {
  font-family: 'Roboto', sans-serif;
  font-weight: 400;
  font-size: 20px;
  color: #6b7280;
  max-width: 64rem;
  line-height: 1.625;
  text-align: left;
}

.stats-section {
  @apply text-left;
}

.stats-title {
  font-family: 'Roboto', sans-serif;
  font-weight: bold;
  font-size: 24px;
  color: #00A1FF;
  margin-bottom: 1.5rem;
}

.stats-grid {
  @apply flex justify-start gap-16;
}

.stat-item {
  @apply text-center;
}

.stat-icon {
  margin-bottom: 0.5rem;
}

.stat-icon img {
  width: 36px;
  height: 36px;
  margin: 0 auto;
}

.stat-number {
  font-family: 'Roboto', sans-serif;
  font-weight: bold;
  font-size: 32px;
  color: #00A1FF;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-family: 'Roboto', sans-serif;
  font-weight: 500;
  font-size: 20px;
  color: #6b7280;
}

.text-primary {
  color: #00A1FF;
}

@media (max-width: 768px) {
  .stats-grid {
    @apply flex-col gap-8;
  }
  
  .stat-number {
    @apply text-4xl;
  }
  
  .section-title {
    @apply text-3xl;
  }
  
  .section-description {
    @apply text-lg;
  }
}
</style>