<template>
  <div class="feature-card" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">
    <!-- 编号 -->
    <div class="feature-number">{{ String(feature.number).padStart(2, '0') }}</div>
    
    <!-- 标题区域 -->
    <div class="title-section">
      <h3 class="feature-title">{{ feature.title }}</h3>
      <div class="title-underline" :class="{ 'expanded': isHovered }"></div>
    </div>
    
    <!-- 描述区域 -->
    <p class="feature-description">{{ feature.description }}</p>
    
    <!-- 左下角图标 -->
    <div class="feature-icon">
      <img :src="getIconPath(feature.number)" :alt="feature.title" />
    </div>
    
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Feature } from '@/types'

interface Props {
  feature: Feature
  index?: number
}

const props = defineProps<Props>()
const isHovered = ref(false)

const handleMouseEnter = () => {
  isHovered.value = true
}

const handleMouseLeave = () => {
  isHovered.value = false
}

const getIconPath = (number: string | number) => {
  const num = parseInt(number.toString())
  return `/images/card${num}icon.png`
}
</script>

<style scoped>
/* 卡片主体 */
.feature-card {
  @apply relative cursor-pointer overflow-hidden;
  width: 295px;
  height: 316px;
  padding: 32px;
  border-radius: 24px;
  background: linear-gradient(135deg, 
    rgba(0, 161, 255, 0.15) 0%, 
    rgba(255, 255, 255, 0.9) 50%, 
    rgba(255, 255, 255, 0.95) 100%);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 8px 32px rgba(0, 161, 255, 0.1);
}

.feature-card:hover {
  transform: translateY(-12px) scale(1.02);
  background: linear-gradient(135deg, 
    rgba(0, 161, 255, 0.1) 0%, 
    rgba(255, 255, 255, 0.95) 50%, 
    rgba(0, 161, 255, 0.05) 100%);
  box-shadow: 0 20px 60px rgba(0, 161, 255, 0.25);
  border-color: rgba(0, 161, 255, 0.2);
}

.feature-number {
  @apply text-xl font-bold absolute top-0 right-0;
  padding: 20px 16px 16px 16px;
  color: #00A1FF;
  font-family: 'Roboto', sans-serif;
  font-weight: 700;
  transition: transform 0.3s ease;
}

.feature-card:hover .feature-number {
  transform: scale(1.1);
}

/* 标题区域 */
.title-section {
  @apply mb-6 mt-0;
  position: absolute;
  top: 16px;
  left: 32px;
  right: 70px;
}

.feature-title {
  @apply text-xl font-bold leading-tight;
  color: #000000;
  font-family: 'Roboto', sans-serif;
  font-weight: 700;
  margin: 0;
  transition: color 0.3s ease;
  width: 100%;
}

.feature-card:hover .feature-title {
  color: #00A1FF;
}


/* 描述文本 */
.feature-description {
  @apply leading-relaxed flex-grow;
  color: #000000;
  font-family: 'Roboto', sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 1.5;
  transition: color 0.3s ease;
  margin-top: 70px;
}

.feature-card:hover .feature-description {
  color: #4a5568;
}

/* 图标 */
.feature-icon {
  @apply absolute bottom-0 left-0;
  padding: 16px;
}

.feature-icon img {
  width: 36px;
  height: 36px;
  object-fit: contain;
}


/* 响应式设计 */
@media (max-width: 1024px) {
  .feature-card {
    height: 380px;
    max-width: 340px;
  }
  
  .card-content {
    @apply p-6;
  }
}

@media (max-width: 768px) {
  .feature-card {
    width: 100%;
    max-width: 100%;
    height: auto;
    min-height: 300px;
    padding: 1.5rem;
  }

  .title-section {
    top: 1rem;
    left: 1.5rem;
    right: 4rem;
  }

  .feature-number {
    padding: 1rem 1rem 1rem 1rem;
    font-size: 1.125rem;
  }
  
  .feature-title {
    font-size: 1.125rem;
    line-height: 1.4;
  }
  
  .feature-description {
    font-size: 0.875rem;
    margin-top: 3.5rem;
    line-height: 1.5;
  }

  .feature-icon {
    padding: 1rem;
  }

  .feature-icon img {
    width: 32px;
    height: 32px;
  }
}

@media (max-width: 480px) {
  .feature-card {
    padding: 1.25rem;
    min-height: 280px;
  }

  .feature-title {
    font-size: 1rem;
  }

  .feature-description {
    font-size: 0.8125rem;
    margin-top: 3rem;
  }
}
</style>