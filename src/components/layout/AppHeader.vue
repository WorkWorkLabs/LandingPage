<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppLogo from './AppLogo.vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const isDrawerOpen = ref(false)
const scrolled = ref(false)
const activeDropdown = ref<string | null>(null)

const displayName = computed(() => {
  return authStore.profile?.username || authStore.user?.email?.split('@')[0] || '账户'
})

const userInitial = computed(() => displayName.value.slice(0, 1).toUpperCase())

const navItems = [
  { label: '推荐', href: '#hero' },
  {
    label: '内容',
    href: '#about',
    children: [
      { label: '远程工作', href: '#about' },
      { label: '工具箱', href: '#toolbox' },
      { label: '漫游指南', href: '#nomad-guide' },
    ],
  },
  { label: '案例', href: '#articles' },
  { label: '游民地图', href: '/map', isRoute: true },
  { label: '关于 WorkWork', href: '#footer' },
]

const toggleDrawer = () => {
  isDrawerOpen.value = !isDrawerOpen.value
}

const openDropdown = (label: string) => {
  activeDropdown.value = label
}

const closeDropdown = () => {
  activeDropdown.value = null
}

function navigateTo(item: { href: string; isRoute?: boolean }) {
  if (item.isRoute) {
    router.push(item.href)
    return
  }

  if (router.currentRoute.value.path !== '/') {
    router.push({ path: '/', hash: item.href })
  }
}

async function handleSignOut() {
  await authStore.signOut()
  router.push('/')
}

const handleScroll = () => {
  scrolled.value = window.scrollY > 8
}

onMounted(() => {
  handleScroll()
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <header
    :class="[
      'fixed inset-x-0 top-0 z-50 h-16 border-b transition-all duration-300',
      scrolled
        ? 'border-black/6 bg-white/95 shadow-[0_8px_30px_rgba(26,26,26,0.06)] backdrop-blur-xl'
        : 'border-transparent bg-white/85 backdrop-blur-md',
    ]"
  >
    <div class="mx-auto flex h-full max-w-[1440px] items-center px-4 sm:px-6 lg:px-8">
      <div class="flex w-full items-center">
        <div class="hidden shrink-0 md:block md:w-[160px]">
          <AppLogo />
        </div>

        <button
          type="button"
          class="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/8 text-[#1A1A1A] transition-colors hover:border-[#48A9DE] hover:text-[#48A9DE] md:hidden"
          aria-label="打开菜单"
          @click="toggleDrawer"
        >
          <svg
            v-if="!isDrawerOpen"
            class="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M4 7h16M4 12h16M4 17h16" />
          </svg>
          <svg
            v-else
            class="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>

        <div class="mx-auto md:hidden">
          <AppLogo compact />
        </div>

        <nav class="hidden min-w-0 flex-1 items-center justify-center md:flex">
          <div class="flex items-center gap-1 rounded-full border border-black/6 bg-white/80 px-2 py-1 shadow-[0_6px_18px_rgba(26,26,26,0.04)]">
            <div
              v-for="item in navItems"
              :key="item.label"
              class="relative"
              @mouseenter="item.children ? openDropdown(item.label) : closeDropdown()"
              @mouseleave="item.children ? closeDropdown() : undefined"
            >
              <a
                :href="item.href"
                class="inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium text-[#262626] transition-colors duration-200 hover:bg-[#48A9DE]/8 hover:text-[#48A9DE]"
                @click.prevent="navigateTo(item)"
              >
                {{ item.label }}
                <svg
                  v-if="item.children"
                  class="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="m6 9 6 6 6-6" />
                </svg>
              </a>

              <div
                v-if="item.children"
                :class="[
                  'absolute left-1/2 top-[calc(100%+12px)] w-44 -translate-x-1/2 rounded-2xl border border-black/6 bg-white p-2 shadow-[0_16px_40px_rgba(26,26,26,0.10)] transition-all duration-200 ease-out',
                  activeDropdown === item.label
                    ? 'visible translate-y-0 opacity-100'
                    : 'invisible -translate-y-2 opacity-0',
                ]"
              >
                <a
                  v-for="child in item.children"
                  :key="child.href"
                  :href="child.href"
                  class="block rounded-xl px-3 py-2 text-sm text-[#595959] transition-colors duration-200 hover:bg-[#48A9DE]/8 hover:text-[#48A9DE]"
                >
                  {{ child.label }}
                </a>
              </div>
            </div>
          </div>
        </nav>

        <div class="hidden shrink-0 items-center justify-end gap-3 md:flex md:w-[200px]">
          <button
            type="button"
            class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/8 text-[#595959] transition-colors hover:border-[#48A9DE] hover:text-[#48A9DE]"
            aria-label="搜索"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="m21 21-4.35-4.35m1.85-5.15a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />
            </svg>
          </button>
          <template v-if="authStore.isAuthenticated">
            <router-link
              to="/publish"
              class="inline-flex items-center justify-center rounded-full border border-[#48A9DE]/35 px-4 py-2.5 text-sm font-semibold text-[#2E8FBE] transition-colors hover:bg-[#48A9DE]/8"
            >
              投稿
            </router-link>
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-full bg-[#F5F8FA] px-3 py-2 text-sm font-semibold text-[#262626] transition-colors hover:bg-[#EDF4F8]"
              :title="`${displayName}，点击退出`"
              @click="handleSignOut"
            >
              <span class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#48A9DE] text-xs text-white">
                {{ userInitial }}
              </span>
              退出
            </button>
          </template>
          <router-link
            v-else
            to="/login"
            class="inline-flex items-center justify-center rounded-full bg-[#48A9DE] px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-[#3D98C8] hover:shadow-[0_14px_30px_rgba(72,169,222,0.26)]"
          >
            立即加入
          </router-link>
        </div>
      </div>
    </div>

    <transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="-translate-y-2 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition-all duration-200 ease-out"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="-translate-y-2 opacity-0"
    >
      <div
        v-if="isDrawerOpen"
        class="border-t border-black/6 bg-white px-4 py-4 shadow-[0_18px_40px_rgba(26,26,26,0.08)] md:hidden"
      >
        <div class="space-y-2">
          <template v-for="item in navItems" :key="item.label">
            <a
              :href="item.href"
              class="block rounded-2xl px-4 py-3 text-sm font-medium text-[#262626] transition-colors hover:bg-[#48A9DE]/8 hover:text-[#48A9DE]"
              @click.prevent="navigateTo(item); isDrawerOpen = false"
            >
              {{ item.label }}
            </a>
            <div v-if="item.children" class="mt-1 space-y-1 pl-3">
              <a
                v-for="child in item.children"
                :key="child.href"
                :href="child.href"
                class="block rounded-xl px-4 py-2 text-sm text-[#595959] transition-colors hover:bg-[#48A9DE]/8 hover:text-[#48A9DE]"
                @click.prevent="isDrawerOpen = false"
              >
                {{ child.label }}
              </a>
            </div>
          </template>
          <template v-if="authStore.isAuthenticated">
            <router-link
              to="/publish"
              class="mt-3 inline-flex w-full items-center justify-center rounded-full border border-[#48A9DE]/35 px-5 py-3 text-sm font-semibold text-[#2E8FBE]"
              @click="isDrawerOpen = false"
            >
              投稿
            </router-link>
            <button
              type="button"
              class="inline-flex w-full items-center justify-center rounded-full bg-[#F5F8FA] px-5 py-3 text-sm font-semibold text-[#262626]"
              @click="handleSignOut(); isDrawerOpen = false"
            >
              退出登录
            </button>
          </template>
          <router-link
            v-else
            to="/login"
            class="mt-3 inline-flex w-full items-center justify-center rounded-full bg-[#48A9DE] px-5 py-3 text-sm font-semibold text-white"
            @click="isDrawerOpen = false"
          >
            立即加入
          </router-link>
        </div>
      </div>
    </transition>
  </header>
</template>
