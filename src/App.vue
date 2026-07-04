<template>
  <div class="min-h-screen flex flex-col bg-white text-[#262626]">
    <AppHeader v-if="!isMapPage" />

    <main :class="isMapPage ? 'flex-1' : 'flex-1 pt-16'">
      <router-view />
    </main>

    <AppFooter v-if="!isMapPage" />

    <Transition
      enter-active-class="transition-all duration-300"
      leave-active-class="transition-all duration-300"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="loading"
        class="fixed inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-[9999]"
      >
        <div class="text-center">
          <div class="w-10 h-10 border-4 border-gray-200 border-t-[#48A9DE] rounded-full animate-spin mx-auto mb-4" />
          <p class="text-[#8C8C8C] font-medium">Loading...</p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const appStore = useAppStore()
const authStore = useAuthStore()
const { loading } = storeToRefs(appStore)

const isMapPage = computed(() => route.name === 'NomadMap')

const updateBreakpoint = () => {
  const width = window.innerWidth
  if (width < 640) {
    appStore.setBreakpoint('sm')
  } else if (width < 768) {
    appStore.setBreakpoint('md')
  } else if (width < 1024) {
    appStore.setBreakpoint('lg')
  } else if (width < 1280) {
    appStore.setBreakpoint('xl')
  } else {
    appStore.setBreakpoint('2xl')
  }
}

const handleResize = () => {
  updateBreakpoint()
  if (window.innerWidth >= 768) {
    appStore.closeMobileMenu()
  }
}

onMounted(() => {
  updateBreakpoint()
  void authStore.initialize()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  authStore.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>

<style>
*:focus {
  outline: 2px solid var(--color-primary, #00A1FF);
  outline-offset: 2px;
}

::selection {
  background-color: var(--color-primary, #00A1FF);
  color: white;
}
</style>
