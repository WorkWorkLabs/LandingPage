<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useTypewriter } from '@/composables/useTypewriter'
import { useScrollParallax } from '@/composables/useScrollParallax'
import {
  fetchFeaturedArticles,
  fetchPublishedArticles,
  fetchTrendingArticles,
  fetchPodcastEpisodes,
  fetchCategories,
  subscribe,
} from '@/composables/useSupabaseQuery'
import type { Article, PodcastEpisode, Category } from '@/types/database'
import { optimizeImage } from '@/utils/image'

const { currentText: heroTitle } = useTypewriter(
  ['数字游民 × OPC 一人公司新范式', '赋予每个人自由工作的权利'],
  { typeSpeed: 120, deleteSpeed: 60, pauseDuration: 2500 }
)

// --- 滚动视差：Hero 标题区域随滚动逐渐隐藏到下方板块 ---
const heroHeadlineRef = ref<HTMLElement | null>(null)
const { opacity: heroOpacity, translateY: heroTranslateY, scale: heroScale } = useScrollParallax(heroHeadlineRef, {
  distance: 350,
  maxTranslateY: 80,
})

// --- 数据加载状态（分区域独立加载，不互相阻塞） ---
const featuredArticles = ref<Article[]>([])
const articles = ref<Article[]>([])
const podcastEpisodes = ref<PodcastEpisode[]>([])
const categories = ref<Category[]>([])
const trendingArticles = ref<Article[]>([])
const featuredLoaded = ref(false)
const articlesLoaded = ref(false)
const podcastsLoaded = ref(false)
const categoriesLoaded = ref(false)
const trendingLoaded = ref(false)

// --- 邮件订阅 ---
const subscriberEmail = ref('')
const subscribing = ref(false)
const subscribeMessage = ref('')

async function handleSubscribe() {
  if (!subscriberEmail.value) return
  subscribing.value = true
  subscribeMessage.value = ''
  const { error } = await subscribe(subscriberEmail.value)
  subscribeMessage.value = error ?? '订阅成功！'
  subscribing.value = false
  if (!error) subscriberEmail.value = ''
}

// --- 图片懒加载 ---
const loadedImages = ref<string[]>([])
const markImageLoaded = (id: string) => {
  if (!loadedImages.value.includes(id)) {
    loadedImages.value = [...loadedImages.value, id]
  }
}
const isImageLoaded = (id: string) => loadedImages.value.includes(id)

// --- 格式化浏览量 ---
function formatViews(views: number): string {
  if (views >= 1000) return `${(views / 1000).toFixed(1)}k 阅读`
  return `${views} 阅读`
}

// --- 格式化日期 ---
function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '昨天'
  if (diffDays === 2) return '前天'
  if (diffDays < 7) return `${diffDays} 天前`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} 周前`
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

// --- 骨架屏组件 ---
const SkeletonBox = 'div'

// --- 加载数据（各区域独立加载，不互相阻塞） ---
onMounted(() => {
  document.title = '数字游民 × OPC 一人公司 | workwork'

  const metaDescription =
    document.querySelector('meta[name="description"]') || document.createElement('meta')
  metaDescription.setAttribute('name', 'description')
  metaDescription.setAttribute(
    'content',
    '面向数字游民与 OPC 一人公司的 WorkWork 演示主页，展示内容流、工具专题与远程工作信息架构。'
  )
  if (!document.head.contains(metaDescription)) {
    document.head.appendChild(metaDescription)
  }

  // 各区域独立加载，先到先渲染
  fetchFeaturedArticles().then((data) => {
    featuredArticles.value = data
    featuredLoaded.value = true
  })

  fetchPublishedArticles(10).then((data) => {
    articles.value = data
    articlesLoaded.value = true
  })

  fetchPodcastEpisodes(3).then((data) => {
    podcastEpisodes.value = data
    podcastsLoaded.value = true
  })

  fetchCategories().then((data) => {
    categories.value = data.length > 0 ? data : [
      { id: '1', slug: 'recommend', label: '推荐', icon: '★', sort_order: 1, is_active: true, created_at: '' },
      { id: '2', slug: 'all', label: '全部内容', icon: '◉', sort_order: 2, is_active: true, created_at: '' },
      { id: '3', slug: 'topics', label: '话题讨论', icon: '◎', sort_order: 3, is_active: true, created_at: '' },
      { id: '4', slug: 'hot', label: '热门内容', icon: '△', sort_order: 4, is_active: true, created_at: '' },
      { id: '5', slug: 'follow', label: '关注', icon: '♡', sort_order: 5, is_active: true, created_at: '' },
    ]
    categoriesLoaded.value = true
  })

  fetchTrendingArticles(6).then((data) => {
    trendingArticles.value = data
    trendingLoaded.value = true
  })
})
</script>

<template>
  <div class="min-h-screen bg-[#F5F5F5]">
    <!-- Hero: Editorial Featured Cards -->
    <section id="hero" class="relative z-10 bg-white">
      <div class="ww-shell py-8">
        <!-- Typewriter headline（滚动视差：向下滚动时逐渐上移并隐藏） -->
        <div
          ref="heroHeadlineRef"
          class="mb-8 text-center"
          :style="{
            opacity: heroOpacity,
            transform: `translateY(${heroTranslateY}px) scale(${heroScale})`,
            willChange: 'transform, opacity',
            transition: 'transform 0.1s ease-out, opacity 0.1s ease-out',
          }"
        >
          <span class="ww-label mb-4 inline-block">Demo home pages</span>
          <h1 class="mx-auto max-w-4xl text-[32px] font-semibold leading-[1.3] tracking-[-0.02em] text-[#1A1A1A] sm:text-[42px]">
            {{ heroTitle }}<span class="animate-pulse text-[#48A9DE]">|</span>
          </h1>
          <p class="mx-auto mt-4 max-w-xl text-base text-[#8C8C8C]">
            Work Anywhere, Work Everytime.
          </p>
        </div>

        <!-- Featured grid -->
        <div class="grid grid-cols-1 gap-4 md:grid-cols-[1fr_1.5fr_1fr]">
          <!-- Left: small featured cards -->
          <div class="flex flex-col gap-4">
            <!-- 骨架屏 -->
            <template v-if="!featuredLoaded">
              <div v-for="n in 2" :key="n" class="aspect-[4/3] animate-pulse rounded-2xl bg-[#F3F6F8]" />
            </template>
            <template v-else>
              <router-link
                v-for="(article, i) in featuredArticles.slice(1, 3)"
                :key="article.id"
                :to="`/article/${article.id}`"
                class="group relative overflow-hidden rounded-2xl bg-[#F3F6F8]"
              >
                <div class="aspect-[4/3] overflow-hidden">
                  <img
                    :src="optimizeImage(article.cover_image, 400, 300)"
                    :alt="article.title"
                    loading="lazy"
                    width="400"
                    height="300"
                    class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    :class="{ 'opacity-0': !isImageLoaded(`featured-${i}`) }"
                    @load="markImageLoaded(`featured-${i}`)"
                  />
                </div>
                <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <div class="absolute bottom-0 left-0 right-0 p-4">
                  <span class="inline-flex items-center rounded-md bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-[#48A9DE]">
                    精选推荐
                  </span>
                  <h3 class="mt-2 text-sm font-semibold leading-[1.4] text-white line-clamp-2">
                    {{ article.title }}
                  </h3>
                </div>
              </router-link>
            </template>
          </div>

          <!-- Center: hero featured -->
          <template v-if="!featuredLoaded">
            <div class="aspect-[16/10] animate-pulse rounded-2xl bg-[#F3F6F8]" />
          </template>
          <router-link
            v-else-if="featuredArticles.length > 0"
            :to="`/article/${featuredArticles[0].id}`"
            class="group relative overflow-hidden rounded-2xl bg-[#1A1A1A]"
          >
            <div class="aspect-[16/10] overflow-hidden">
              <img
                :src="optimizeImage(featuredArticles[0].cover_image, 800, 500)"
                alt="Featured"
                loading="lazy"
                width="800"
                height="500"
                class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                :class="{ 'opacity-0': !isImageLoaded('hero-main') }"
                @load="markImageLoaded('hero-main')"
              />
            </div>
            <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div class="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
              <span class="inline-flex items-center rounded-md bg-[#48A9DE] px-2.5 py-1 text-xs font-semibold text-white">
                编辑精选
              </span>
              <h2 class="mt-3 text-xl font-bold leading-[1.35] text-white sm:text-2xl">
                {{ featuredArticles[0].title }}
              </h2>
              <p class="mt-3 hidden text-sm leading-[1.6] text-white/80 sm:block">
                {{ featuredArticles[0].excerpt }}
              </p>
            </div>
          </router-link>

          <!-- Right: sidebar info（无数据依赖，立即渲染） -->
          <div class="flex flex-col gap-4">
            <div class="rounded-2xl border border-black/6 bg-[#F7F9FB] p-5">
              <p class="text-xs font-semibold uppercase tracking-[0.12em] text-[#8C8C8C]">Remote × OPC</p>
              <h3 class="mt-2 text-lg font-semibold leading-[1.4] text-[#1A1A1A]">
                WorkWork 演示主页
              </h3>
              <p class="mt-2 text-sm leading-[1.6] text-[#595959]">
                面向数字游民与一人公司的内容平台，展示工具、方法与案例。
              </p>
              <router-link
                to="/login"
                class="mt-4 inline-flex items-center rounded-full bg-[#48A9DE] px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-[#3D98C8]"
              >
                立即加入
              </router-link>
            </div>

            <div class="rounded-2xl border border-black/6 bg-white p-5">
              <p class="text-xs font-semibold uppercase tracking-[0.12em] text-[#8C8C8C]">常用建议</p>
              <div class="mt-3 space-y-3">
                <a
                  v-for="topic in ['游民地图', '工具箱', '漫游指南']"
                  :key="topic"
                  href="#about"
                  class="flex items-center justify-between rounded-xl border border-transparent px-3 py-2.5 text-sm font-medium text-[#262626] transition-all hover:border-[#48A9DE]/30 hover:bg-[#48A9DE]/5 hover:text-[#48A9DE]"
                >
                  <span>{{ topic }}</span>
                  <svg class="h-4 w-4 text-[#D9D9D9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m9 5 7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Podcast Section（z-20 覆盖上移的 Hero 标题） -->
    <section class="relative z-20 border-y border-black/6 bg-white py-6">
      <div class="ww-shell">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-[#48A9DE]/10">
              <svg class="h-4 w-4 text-[#48A9DE]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zM5 10a1 1 0 0 0-2 0 9 9 0 0 0 8 8.94V22h2v-3.06A9 9 0 0 0 21 10a1 1 0 0 0-2 0 7 7 0 0 1-14 0z"/>
              </svg>
            </div>
            <h2 class="text-lg font-semibold text-[#1A1A1A]">《游牧者说》播客</h2>
          </div>
          <a href="#" class="text-sm font-medium text-[#8C8C8C] transition-colors hover:text-[#48A9DE]">
            查看全部 →
          </a>
        </div>
        <!-- 骨架屏 -->
        <div v-if="!podcastsLoaded" class="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div v-for="n in 3" :key="n" class="flex gap-4 rounded-2xl border border-black/6 bg-white p-4">
            <div class="h-16 w-16 shrink-0 animate-pulse rounded-xl bg-[#F3F6F8]" />
            <div class="flex-1 space-y-2">
              <div class="h-4 w-3/4 animate-pulse rounded bg-[#F3F6F8]" />
              <div class="h-3 w-1/2 animate-pulse rounded bg-[#F3F6F8]" />
            </div>
          </div>
        </div>
        <div v-else-if="podcastEpisodes.length > 0" class="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <a
            v-for="ep in podcastEpisodes"
            :key="ep.id"
            href="#"
            class="group flex gap-4 rounded-2xl border border-black/6 bg-white p-4 transition-all hover:border-[#48A9DE]/30 hover:shadow-[0_4px_16px_rgba(26,26,26,0.06)]"
          >
            <div class="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#F3F6F8]">
              <img
                :src="optimizeImage(ep.cover_image, 64, 64)"
                :alt="ep.title"
                loading="lazy"
                width="64"
                height="64"
                class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            <div class="min-w-0 flex-1">
              <h3 class="text-sm font-semibold leading-[1.45] text-[#1A1A1A] line-clamp-2 group-hover:text-[#48A9DE]">
                {{ ep.title }}
              </h3>
              <div class="mt-1.5 flex items-center gap-2 text-[11px] text-[#BFBFBF]">
                <span class="font-medium text-[#8C8C8C]">{{ ep.host }}</span>
                <span>{{ ep.duration }}</span>
                <span>{{ formatDate(ep.published_at) }}</span>
              </div>
            </div>
          </a>
        </div>
      </div>
    </section>

    <!-- Content: Three-column layout -->
    <section id="about" class="py-6">
      <div class="ww-shell">
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-[200px_1fr_280px]">
          <!-- Left: Category navigation -->
          <aside class="hidden lg:block">
            <div class="sticky top-24 space-y-1">
              <!-- 骨架屏 -->
              <template v-if="!categoriesLoaded">
                <div v-for="n in 5" :key="n" class="h-11 animate-pulse rounded-xl bg-white" />
              </template>
              <template v-else>
                <a
                  v-for="(cat, index) in categories"
                  :key="cat.id"
                  href="#articles"
                  :class="[
                    'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all',
                    index === 0
                      ? 'bg-white text-[#48A9DE] shadow-[0_2px_8px_rgba(26,26,26,0.06)]'
                      : 'text-[#595959] hover:bg-white hover:text-[#262626]',
                  ]"
                >
                  <span class="text-base">{{ cat.icon }}</span>
                  {{ cat.label }}
                </a>
              </template>
            </div>
          </aside>

          <!-- Center: Article feed -->
          <main id="articles" class="min-w-0">
            <!-- Mobile category chips -->
            <div class="mb-4 flex gap-2 overflow-x-auto pb-2 lg:hidden">
              <template v-if="!categoriesLoaded">
                <div v-for="n in 4" :key="n" class="h-9 w-20 shrink-0 animate-pulse rounded-full bg-white" />
              </template>
              <template v-else>
                <a
                  v-for="(cat, index) in categories"
                  :key="cat.id"
                  href="#articles"
                  :class="[
                    'shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all',
                    index === 0
                      ? 'bg-[#48A9DE] text-white'
                      : 'bg-white text-[#595959] hover:text-[#48A9DE]',
                  ]"
                >
                  {{ cat.label }}
                </a>
              </template>
            </div>

            <!-- 文章骨架屏 -->
            <div v-if="!articlesLoaded" class="space-y-3">
              <div v-for="n in 4" :key="n" class="rounded-2xl bg-white p-4 sm:p-5">
                <div class="flex gap-4">
                  <div class="min-w-0 flex-1 space-y-3">
                    <div class="h-5 w-20 animate-pulse rounded bg-[#F3F6F8]" />
                    <div class="h-5 w-3/4 animate-pulse rounded bg-[#F3F6F8]" />
                    <div class="h-4 w-full animate-pulse rounded bg-[#F3F6F8]" />
                    <div class="h-3 w-32 animate-pulse rounded bg-[#F3F6F8]" />
                  </div>
                  <div class="h-20 w-20 shrink-0 animate-pulse rounded-xl bg-[#F3F6F8] sm:h-24 sm:w-28" />
                </div>
              </div>
            </div>
            <div v-else class="space-y-3">
              <router-link
                v-for="article in articles"
                :key="article.id"
                :to="`/article/${article.id}`"
                class="group block overflow-hidden rounded-2xl bg-white p-4 transition-all hover:shadow-[0_4px_16px_rgba(26,26,26,0.06)] sm:p-5"
              >
                <div class="flex gap-4">
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-2">
                      <span class="inline-flex items-center rounded-md bg-[#48A9DE]/10 px-2 py-0.5 text-[11px] font-semibold text-[#48A9DE]">
                        {{ article.category }}
                      </span>
                      <span class="text-[11px] text-[#BFBFBF]">{{ formatDate(article.published_at) }}</span>
                    </div>
                    <h3 class="mt-2 text-lg font-semibold leading-[1.45] text-[#1A1A1A] transition-colors group-hover:text-[#48A9DE]">
                      {{ article.title }}
                    </h3>
                    <p class="mt-2 text-sm leading-[1.6] text-[#8C8C8C] line-clamp-2">
                      {{ article.excerpt }}
                    </p>
                    <div class="mt-3 flex items-center gap-3 text-xs text-[#BFBFBF]">
                      <span class="font-medium text-[#595959]">{{ article.author_name }}</span>
                      <span>{{ article.read_time }}</span>
                    </div>
                  </div>
                  <div class="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#F3F6F8] sm:h-24 sm:w-28">
                    <img
                      :src="optimizeImage(article.cover_image, 224, 192)"
                      :alt="article.title"
                      loading="lazy"
                      width="112"
                      height="96"
                      class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      :class="{ 'opacity-0': !isImageLoaded(article.id) }"
                      @load="markImageLoaded(article.id)"
                    />
                  </div>
                </div>
              </router-link>
            </div>
          </main>

          <!-- Right: Trending sidebar -->
          <aside class="hidden lg:block">
            <div class="sticky top-24 space-y-5">
              <!-- Trending -->
              <div class="rounded-2xl bg-white p-5">
                <div class="flex items-center justify-between">
                  <h3 class="text-base font-semibold text-[#1A1A1A]">正在讨论</h3>
                  <span class="text-[11px] text-[#BFBFBF]">实时更新</span>
                </div>
                <!-- 骨架屏 -->
                <div v-if="!trendingLoaded" class="mt-4 space-y-3">
                  <div v-for="n in 5" :key="n" class="flex items-start gap-3 px-2 py-2">
                    <div class="h-5 w-5 shrink-0 animate-pulse rounded bg-[#F3F6F8]" />
                    <div class="flex-1 space-y-1.5">
                      <div class="h-4 w-full animate-pulse rounded bg-[#F3F6F8]" />
                      <div class="h-3 w-16 animate-pulse rounded bg-[#F3F6F8]" />
                    </div>
                  </div>
                </div>
                <div v-else class="mt-4 space-y-3">
                  <router-link
                    v-for="(item, index) in trendingArticles"
                    :key="item.id"
                    :to="`/article/${item.id}`"
                    class="flex items-start gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-[#F7F9FB]"
                  >
                    <span
                      :class="[
                        'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded text-[11px] font-bold',
                        index < 3 ? 'bg-[#48A9DE] text-white' : 'bg-[#F3F6F8] text-[#8C8C8C]',
                      ]"
                    >
                      {{ index + 1 }}
                    </span>
                    <div class="min-w-0">
                      <p class="text-sm font-medium leading-[1.5] text-[#262626] line-clamp-2">
                        {{ item.title }}
                      </p>
                      <p class="mt-0.5 text-[11px] text-[#BFBFBF]">{{ formatViews(item.views) }}</p>
                    </div>
                  </router-link>
                </div>
              </div>

              <!-- Topics（无数据依赖，立即渲染） -->
              <div class="rounded-2xl bg-[#1A1A1A] p-5 text-white">
                <p class="text-[11px] uppercase tracking-[0.16em] text-white/50">Remote × OPC</p>
                <h3 class="mt-2 text-base font-semibold leading-[1.4] text-white">
                  从"接远程工作"升级到"经营可移动的一人公司"
                </h3>
                <p class="mt-2 text-xs leading-[1.6] text-white/60">
                  围绕工作、资产、居住与增长，让品牌信息、内容流和行动入口自然协同。
                </p>
                <a
                  href="#footer"
                  class="mt-4 inline-flex items-center rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#1A1A1A] transition-colors hover:text-[#48A9DE]"
                >
                  查看品牌信息
                </a>
              </div>

              <!-- Newsletter（无数据依赖，立即渲染） -->
              <div class="rounded-2xl border border-[#48A9DE]/20 bg-[#48A9DE]/5 p-5">
                <h3 class="text-sm font-semibold text-[#1A1A1A]">订阅周报</h3>
                <p class="mt-1.5 text-xs leading-[1.6] text-[#595959]">
                  每周精选数字游民与一人公司资讯，直达你的收件箱。
                </p>
                <div class="mt-3 flex gap-2">
                  <input
                    v-model="subscriberEmail"
                    type="email"
                    placeholder="your@email.com"
                    class="min-w-0 flex-1 rounded-lg border border-black/8 bg-white px-3 py-2 text-xs text-[#262626] placeholder-[#BFBFBF] outline-none focus:border-[#48A9DE]"
                  />
                  <button
                    type="button"
                    :disabled="subscribing"
                    class="shrink-0 rounded-lg bg-[#48A9DE] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#3D98C8] disabled:opacity-50"
                    @click="handleSubscribe"
                  >
                    {{ subscribing ? '...' : '订阅' }}
                  </button>
                </div>
                <p v-if="subscribeMessage" class="mt-2 text-[11px]" :class="subscribeMessage.includes('成功') ? 'text-green-600' : 'text-red-500'">
                  {{ subscribeMessage }}
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  </div>
</template>
