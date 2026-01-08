<template>
  <header class="app-header" :class="{ 'scrolled': isScrolled }">
    <nav class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <div class="flex-shrink-0">
          <router-link to="/" class="logo-link">
            <AppLogo size="md" />
          </router-link>
        </div>

        <!-- Desktop Navigation -->
        <div class="hidden md:block">
          <div class="ml-10 flex items-center space-x-4">
            <a
              v-for="item in navigation"
              :key="item.id"
              :href="item.href"
              class="nav-link"
              :class="{ 
                'active': activeSection === item.id,
                'contact-button': item.id === 'contact'
              }"
              @click="handleNavClick(item.href, $event)"
            >
              {{ item.label }}
            </a>
            
            <!-- Language/Region selector -->
            <div class="language-selector">
              <img src="/images/i8n_icon.svg" alt="Language" class="w-4 h-4" />
              <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Mobile menu button -->
        <div class="md:hidden">
          <button
            type="button"
            class="mobile-menu-button"
            @click="toggleMobileMenu"
            :aria-expanded="mobileMenuOpen"
            aria-controls="mobile-menu"
          >
            <span class="sr-only">Open main menu</span>
            <!-- Hamburger icon -->
            <svg
              class="hamburger-icon"
              :class="{ 'open': mobileMenuOpen }"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line x1="3" y1="6" x2="21" y2="6" class="line-1" />
              <line x1="3" y1="12" x2="21" y2="12" class="line-2" />
              <line x1="3" y1="18" x2="21" y2="18" class="line-3" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile Navigation -->
      <Transition name="mobile-menu">
        <div v-if="mobileMenuOpen" class="md:hidden" id="mobile-menu">
          <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white shadow-lg rounded-lg mt-2">
            <a
              v-for="item in navigation"
              :key="`mobile-${item.id}`"
              :href="item.href"
              class="mobile-nav-link"
              :class="{ 'active': activeSection === item.id }"
              @click="handleMobileNavClick(item.href, $event)"
            >
              {{ item.label }}
            </a>
          </div>
        </div>
      </Transition>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useAppStore } from '@/stores/app'
import { useContentStore } from '@/stores/content'
import AppLogo from '@/components/layout/AppLogo.vue'

const appStore = useAppStore()
const contentStore = useContentStore()

const { mobileMenuOpen } = storeToRefs(appStore)
const { navigation } = storeToRefs(contentStore)

const isScrolled = ref(false)
const activeSection = ref('home')

// Methods
const toggleMobileMenu = () => {
  appStore.toggleMobileMenu()
}

const handleNavClick = (href: string, event: Event) => {
  if (href.startsWith('#')) {
    event.preventDefault()
    smoothScrollToSection(href)
  }
}

const handleMobileNavClick = (href: string, event: Event) => {
  handleNavClick(href, event)
  appStore.closeMobileMenu()
}

const smoothScrollToSection = (href: string) => {
  const targetId = href.substring(1)
  const targetElement = document.getElementById(targetId)
  
  if (targetElement) {
    const headerHeight = 64 // header height
    const targetPosition = targetElement.offsetTop - headerHeight
    
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    })
  }
}

const handleScroll = () => {
  isScrolled.value = window.scrollY > 20
  
  // Update active section based on scroll position
  const sections = navigation.value.map(item => item.href.substring(1))
  const currentSection = sections.find(sectionId => {
    const element = document.getElementById(sectionId)
    if (element) {
      const rect = element.getBoundingClientRect()
      return rect.top <= 100 && rect.bottom >= 100
    }
    return false
  })
  
  if (currentSection) {
    activeSection.value = currentSection
  }
}

// Lifecycle
onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  handleScroll() // Initial call
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.app-header {
  @apply fixed top-0 left-0 right-0 z-50 bg-white transition-all duration-300;
  border-bottom: 1px solid #f0f0f0;
}

.app-header.scrolled {
  @apply shadow-md;
  border-bottom-color: #e0e0e0;
}

.logo-link {
  @apply transition-opacity hover:opacity-80;
}

.text-primary {
  color: #00A1FF;
}

.nav-link {
  @apply text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200;
}

@media (max-width: 768px) {
  .app-header {
    padding: 0 1rem;
  }

  .nav-link {
    font-size: 0.875rem;
    padding: 0.5rem 0.75rem;
  }

  .nav-link.contact-button {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  }
}

.nav-link.active {
  @apply text-primary;
}

.nav-link.contact-button {
  @apply bg-primary text-white px-4 py-2 rounded-full hover:bg-primary-dark transition-all;
}

.nav-link.contact-button:hover {
  @apply text-white;
}

.language-selector {
  @apply flex items-center space-x-2 cursor-pointer;
}

.globe-placeholder {
  @apply w-4 h-4 bg-gray-400 rounded-full;
}

.mobile-menu-button {
  @apply inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-primary hover:bg-gray-100 transition-colors duration-200;
}

.hamburger-icon {
  @apply w-6 h-6 transition-transform duration-300;
}

.hamburger-icon.open {
  @apply rotate-45;
}

.hamburger-icon.open .line-1 {
  @apply translate-y-2 rotate-90;
  transform-origin: center;
}

.hamburger-icon.open .line-2 {
  @apply opacity-0;
}

.hamburger-icon.open .line-3 {
  @apply -translate-y-2;
  transform-origin: center;
}

.mobile-nav-link {
  @apply text-gray-600 hover:text-primary hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200;
}

.mobile-nav-link.active {
  @apply text-primary bg-gray-50;
}

/* Mobile menu transitions */
.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition: all 0.3s ease;
}

.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.hover\:text-primary:hover {
  color: #00A1FF;
}
</style>