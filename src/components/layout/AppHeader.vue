<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import AppLogo from './AppLogo.vue'

const isMenuOpen = ref(false)
const scrolled = ref(false)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const handleScroll = () => {
  scrolled.value = window.scrollY > 50
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

const navItems = [
  { label: '功能特性', href: '#features' },
  { label: '产品服务', href: '#products' },
  { label: '社区动态', href: '#community' },
  { label: '联系我们', href: '#contact' },
]
</script>

<template>
  <header
    :class="[
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      scrolled
        ? 'bg-white/80 backdrop-blur-xl shadow-[0_1px_0_rgba(0,0,0,0.06)] border-b border-default-200/50'
        : 'bg-transparent'
    ]"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <AppLogo />

        <nav class="hidden md:flex items-center gap-1">
          <a
            v-for="item in navItems"
            :key="item.href"
            :href="item.href"
            class="px-4 py-2 text-sm font-medium text-default-600 hover:text-primary transition-colors rounded-lg hover:bg-primary/5"
          >
            {{ item.label }}
          </a>
        </nav>

        <div class="hidden md:flex items-center gap-2">
          <a
            href="#contact"
            class="px-5 py-2 text-sm font-semibold text-white bg-primary rounded-full hover:bg-primary-600 transition-all duration-200 shadow-[0_2px_8px_rgba(0,161,255,0.3)] hover:shadow-[0_4px_16px_rgba(0,161,255,0.4)] hover:-translate-y-0.5"
          >
            免费试用
          </a>
        </div>

        <button
          class="md:hidden p-2 text-default-600 hover:text-primary rounded-lg hover:bg-default-100 transition-colors"
          @click="toggleMenu"
        >
          <svg
            v-if="!isMenuOpen"
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <svg
            v-else
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div
        v-if="isMenuOpen"
        class="md:hidden py-4 border-t border-default-200/50 bg-white/90 backdrop-blur-xl -mx-4 px-4"
      >
        <nav class="flex flex-col gap-1">
          <a
            v-for="item in navItems"
            :key="item.href"
            :href="item.href"
            class="px-4 py-2.5 text-sm font-medium text-default-600 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
            @click="isMenuOpen = false"
          >
            {{ item.label }}
          </a>
          <a
            href="#contact"
            class="mt-2 px-5 py-2.5 text-sm font-semibold text-white bg-primary rounded-full text-center hover:bg-primary-600 transition-colors"
            @click="isMenuOpen = false"
          >
            免费试用
          </a>
        </nav>
      </div>
    </div>
  </header>
</template>
