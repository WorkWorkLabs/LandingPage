<template>
  <section id="hero" class="hero-section">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="hero-content">
        <!-- Combined container for text and button -->
        <div class="hero-main-container">
          <!-- Title -->
          <h1 class="hero-title">
            <div class="title-line">Work everywhere</div>
            <div class="title-line">Work anytime</div>
          </h1>

          <!-- Buttons -->
          <div class="button-group">
            <BaseButton
              tag="a"
              :href="hero.ctaLink"
              target="_blank"
              size="lg"
              class="join-button primary"
            >
              {{ hero.ctaText }}
            </BaseButton>
            <BaseButton
              tag="a"
              :href="hero.secondaryCta.link"
              target="_blank"
              size="lg"
              class="docs-button secondary"
            >
              {{ hero.secondaryCta.text }}
            </BaseButton>
          </div>

          <!-- Description -->
          <p class="hero-description">
            The AI x Crypto Super App for Digital Nomads.<br />
            Get paid in stablecoins, and live anywhere. 🌍 Work smarter. Earn globally. Live freely.
          </p>
        </div>
      </div>

      <!-- Scroll indicator -->
      <div class="scroll-indicator animate-bounce">
        <svg
          class="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import { storeToRefs } from "pinia";
import BaseButton from "@/components/base/BaseButton.vue";
import { useContentStore } from "@/stores/content";

const contentStore = useContentStore();
const { hero } = storeToRefs(contentStore);

// #region agent log
import { onMounted as onMountedHero } from "vue";
onMountedHero(() => {
  const logDataD = {location:'HeroSection.vue:71',message:'HeroSection mounted',data:{title:hero.value.title,subtitle:hero.value.subtitle,description:hero.value.description.substring(0,100)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'};
  console.log('[DEBUG]', logDataD);
  fetch('http://127.0.0.1:7242/ingest/353a4726-f634-4d1e-b9bb-65ed440c7233',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logDataD)}).catch(()=>{});
});
// #endregion

// Dog color animation on scroll
const animateDogColor = () => {
  const dogElement = document.getElementById("workwork-dog");
  if (!dogElement) return;

  const scrollY = window.scrollY;
  const maxScroll = 800; // 滚动800px达到完全变色
  const progress = Math.min(scrollY / maxScroll, 1);

  // 从品牌蓝色 #00A1FF 渐变到白色 #FFFFFF
  const startColor = { r: 0, g: 161, b: 255 }; // 品牌蓝色
  const endColor = { r: 255, g: 255, b: 255 }; // 白色

  const currentR = Math.round(
    startColor.r + (endColor.r - startColor.r) * progress,
  );
  const currentG = Math.round(
    startColor.g + (endColor.g - startColor.g) * progress,
  );
  const currentB = Math.round(
    startColor.b + (endColor.b - startColor.b) * progress,
  );

  const currentColor = `rgb(${currentR}, ${currentG}, ${currentB})`;
  dogElement.setAttribute("fill", currentColor);
};

onMounted(() => {
  window.addEventListener("scroll", animateDogColor);
  // Initial call
  animateDogColor();
});

onUnmounted(() => {
  window.removeEventListener("scroll", animateDogColor);
});
</script>

<style scoped>
.hero-section {
  @apply relative flex items-center justify-center overflow-hidden;
  height: calc(100vh - 64px); /* 减去header高度64px */
  background: url("/images/TV - 1.png") no-repeat center bottom;
  background-size: cover; /* 剪裁对齐 */
  background-position: center bottom; /* 底部对齐 */
}

.container {
  @apply relative z-10 h-full;
}

.hero-content {
  @apply relative w-full h-full flex items-center justify-center;
}

/* New container for text and button */
.hero-main-container {
  @apply flex flex-col items-center justify-center text-center z-20;
  gap: 32px; /* Adjust the gap between elements */
  transform: translateY(-10vh); /* Move content up */
}

.hero-title {
  font-family: "Roboto", sans-serif;
  font-size: 64px;
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: 0%;
  color: #ffffff;
  margin: 0;
}

.title-line {
  display: block;
}

.hero-description {
  font-family: "Roboto", sans-serif;
  font-size: 24px;
  font-weight: 400;
  line-height: 1.4;
  letter-spacing: 0%;
  color: #ffffff;
  margin: 0;
  opacity: 0.9;
  max-width: 1000px; /* Ensure it wraps correctly */
}

/* .button-container is no longer needed as it's part of the flex layout */

/* Button group layout */
.button-group {
  display: flex;
  gap: 16px;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
}

/* Primary button styles (Join now) */
.join-button.primary {
  background-color: #00375d !important;
  color: white !important;
  border: none;
  padding: 12px 32px;
  font-size: 24px;
  font-weight: 700;
  border-radius: 999px;
  white-space: nowrap;
  transition: all 0.3s ease;
  text-decoration: none;
  cursor: pointer;
}

.join-button.primary:hover,
.join-button.primary:focus {
  background-color: #0088cc !important;
  color: white !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 136, 204, 0.3);
}

/* Secondary button styles (View Docs) */
.docs-button.secondary {
  background-color: rgba(255, 255, 255, 0.15) !important; /* 稍微深一点的半透明背景 */
  color: white !important;
  border: none !important;
  padding: 12px 32px;
  font-size: 24px;
  font-weight: 500;
  border-radius: 999px;
  white-space: nowrap;
  transition: all 0.3s ease;
  text-decoration: none;
  cursor: pointer;
}

.docs-button.secondary:hover,
.docs-button.secondary:focus {
  background-color: rgba(255, 255, 255, 0.25) !important; /* 悬浮时稍微更深 */
  color: white !important;
  transform: translateY(-1px);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .hero-section {
    height: calc(100vh - 64px);
    min-height: 500px;
    background-size: cover;
    background-position: center;
  }

  .hero-main-container {
    gap: 1.5rem;
    padding: 0 1rem;
    transform: translateY(-5vh);
  }

  .hero-title {
    font-size: 2rem;
    line-height: 1.2;
  }

  .hero-description {
    font-size: 1rem;
    padding: 0 0.5rem;
    line-height: 1.5;
  }

  .button-group {
    gap: 0.75rem;
    flex-direction: column;
    width: 100%;
    align-items: center;
  }

  .join-button.primary,
  .docs-button.secondary {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    width: 100%;
    max-width: 280px;
  }

  .docs-button.secondary {
    font-weight: 400;
  }

  .join-button.primary:hover,
  .docs-button.secondary:hover {
    transform: translateY(-1px);
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 1.75rem;
  }

  .hero-description {
    font-size: 0.875rem;
  }

  .join-button.primary,
  .docs-button.secondary {
    font-size: 0.875rem;
    padding: 0.625rem 1.25rem;
  }
}

/* Clean styles - background handled by SVG */

/* Scroll indicator */
.scroll-indicator {
  @apply absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/70 hover:text-white transition-colors cursor-pointer;
}

/* Animations */
@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

@keyframes floatUpDown {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }
  25% {
    transform: translateY(-10px) rotate(5deg);
  }
  50% {
    transform: translateY(-20px) rotate(0deg);
  }
  75% {
    transform: translateY(-10px) rotate(-5deg);
  }
}

.animate-fade-up {
  animation: fadeUp 0.8s ease-out forwards;
}

.animation-delay-200 {
  animation-delay: 0.2s;
}

.animation-delay-400 {
  animation-delay: 0.4s;
}

.animation-delay-600 {
  animation-delay: 0.6s;
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .hero-title {
    @apply mb-6;
  }

  .cta-button {
    @apply mb-6;
    padding: 0.875rem 2rem;
    font-size: 1.25rem;
  }

  .hero-description {
    @apply text-base px-4;
  }

  .shape-1 {
    @apply w-64 h-64;
  }

  .shape-2 {
    @apply w-48 h-48;
  }
}

.bg-primary {
  background-color: #00a1ff;
}

.bg-secondary {
  background-color: #00375d;
}

.hover\:bg-secondary-dark:hover {
  background-color: #002a47;
}
</style>
