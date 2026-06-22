<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useTypewriter } from '@/composables/useTypewriter'

const { currentText: heroTitle } = useTypewriter(
  ['数字游民 × OPC 一人公司新范式', '赋予每个人自由工作的权利'],
  { typeSpeed: 120, deleteSpeed: 60, pauseDuration: 2500 }
)

type Article = {
  id: string
  title: string
  excerpt: string
  image: string
  author: string
  authorAvatar?: string
  readTime: string
  category: string
  date?: string
}

const loadedImages = ref<string[]>([])

const featuredStories = [
  {
    title: '从远程协作到全球结算，重新定义数字游民的一人公司工作流',
    description:
      '围绕工作、资产、居住与增长，WorkWork 将数字游民的行动力与 OPC 一人公司的经营能力收束为一个轻量但完整的操作系统。',
    image: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&h=500&fit=crop&auto=format',
    link: '#articles',
    category: '精选推荐',
  },
  {
    title: '打造可移动事业引擎，让个人品牌、客户关系与交付效率形成闭环',
    description:
      '以内容、工具、社群和支付能力为核心，让一人公司在跨地域、跨时区环境下依然保持稳定输出。',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop&auto=format',
    link: '#toolbox',
    category: '专题',
  },
]

const podcastEpisodes = [
  {
    id: 'p1',
    title: '数字游民的第一年：从辞职到月入五万',
    host: 'WorkWork FM',
    duration: '42:18',
    date: '6月15日',
    image: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&h=400&fit=crop&auto=format',
  },
  {
    id: 'p2',
    title: '一人公司的现金流管理：稳定币与跨境收款',
    host: 'OPC Radio',
    duration: '38:45',
    date: '6月10日',
    image: 'https://images.unsplash.com/photo-1589903308904-1010c2294adc?w=400&h=400&fit=crop&auto=format',
  },
  {
    id: 'p3',
    title: '远程协作工具箱：从 Notion 到 Loom 的最佳实践',
    host: 'WorkWork FM',
    duration: '35:22',
    date: '6月5日',
    image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&h=400&fit=crop&auto=format',
  },
]

const articles: Article[] = [
  {
    id: 'a1',
    title: '一人公司周报系统：如何在旅途中保持信息同步',
    excerpt: '用固定节奏维护项目、现金流与合作状态，让你在移动办公中也能有稳定的经营视角。',
    image: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&h=500&fit=crop&auto=format',
    author: 'WorkWork 编辑部',
    readTime: '6 分钟',
    category: '远程工作',
    date: '昨天 17:23',
  },
  {
    id: 'a2',
    title: '数字游民的异地协作清单：设备、网络与备份',
    excerpt: '把"随时能开工"拆成设备冗余、网络稳定性和数据安全三个层面来准备。',
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=500&fit=crop&auto=format',
    author: 'Yanbo',
    readTime: '8 分钟',
    category: '远程工作',
    date: '昨天 15:00',
  },
  {
    id: 'a3',
    title: 'OPC 客户管理的轻量模板：从初聊到签约',
    excerpt: '不依赖重 CRM，也能把客户线索、跟进节奏与交付阶段管理得清晰可见。',
    image: 'https://images.unsplash.com/photo-1556745757-8d76bdb6984b?w=800&h=500&fit=crop&auto=format',
    author: 'WorkWork Research',
    readTime: '5 分钟',
    category: '远程工作',
    date: '前天 11:30',
  },
  {
    id: 'a4',
    title: '居住即办公：适合数字游民的一周城市切换策略',
    excerpt: '围绕居住成本、社区密度与工作氛围，建立更可持续的城市漫游节奏。',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=500&fit=crop&auto=format',
    author: 'Nomad Lab',
    readTime: '7 分钟',
    category: '远程工作',
    date: '3 天前',
  },
  {
    id: 'a5',
    title: 'AI 助手如何帮助一人公司完成内容生产与提案准备',
    excerpt: '把 AI 放进具体工作流，而不是停留在灵感层，才能真正释放单人团队的效率。',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=500&fit=crop&auto=format',
    author: 'OPC Studio',
    readTime: '9 分钟',
    category: '远程工作',
    date: '3 天前',
  },
  {
    id: 'a6',
    title: '出海独立工作者的收款路径：稳定币、银行卡与风险隔离',
    excerpt: '拆解跨境结算时最常见的成本项与延迟问题，建立更稳妥的现金流路径。',
    image: '/images/mastercard.svg',
    author: 'Payment Desk',
    readTime: '6 分钟',
    category: '远程工作',
    date: '4 天前',
  },
  {
    id: 'a7',
    title: '如何用公开写作替代无效社交，持续获得合作机会',
    excerpt: '将写作视为长期获客机制，而不是阶段性的营销任务。',
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=500&fit=crop&auto=format',
    author: 'WorkWork Community',
    readTime: '4 分钟',
    category: '远程工作',
    date: '5 天前',
  },
  {
    id: 'a8',
    title: '自由职业到一人公司：你需要的不是更多项目，而是更好的系统',
    excerpt: '当工作来源逐渐稳定后，真正的瓶颈会从接单能力变成系统能力。',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=500&fit=crop&auto=format',
    author: 'Growth Notes',
    readTime: '8 分钟',
    category: '远程工作',
    date: '5 天前',
  },
  {
    id: 'a9',
    title: '高频出行者的日程设计：会议、深度工作与内容发布如何共存',
    excerpt: '通过时间块与时区预案，让"人在路上"不再成为业务失速的理由。',
    image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&h=500&fit=crop&auto=format',
    author: 'Flow Team',
    readTime: '5 分钟',
    category: '远程工作',
    date: '1 周前',
  },
  {
    id: 'a10',
    title: '社群即渠道：个人品牌如何在小圈层中建立高信任转化',
    excerpt: '相比泛流量，稳定的高密度社群更适合 OPC 模式下的长期经营。',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=500&fit=crop&auto=format',
    author: 'Brand Sprint',
    readTime: '6 分钟',
    category: '远程工作',
    date: '1 周前',
  },
]

const categories = [
  { id: 'recommend', label: '推荐', icon: '★', active: true },
  { id: 'all', label: '全部内容', icon: '◉' },
  { id: 'topics', label: '话题讨论', icon: '◎' },
  { id: 'hot', label: '热门内容', icon: '△' },
  { id: 'follow', label: '关注', icon: '♡' },
]

const trendingItems = [
  { title: '如何搭建个人工作台', views: '2.4k 阅读', hot: true },
  { title: '出海客户的合作 SOP', views: '1.8k 阅读', hot: true },
  { title: '数字游民内容增长路径', views: '1.2k 阅读' },
  { title: '旅居城市成本观察', views: '980 阅读' },
  { title: '一人公司周报模板', views: '856 阅读' },
  { title: '跨境收款最佳实践', views: '743 阅读' },
]

const markImageLoaded = (id: string) => {
  if (!loadedImages.value.includes(id)) {
    loadedImages.value = [...loadedImages.value, id]
  }
}

const isImageLoaded = (id: string) => loadedImages.value.includes(id)

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
})
</script>

<template>
  <div class="min-h-screen bg-[#F5F5F5]">
    <!-- Hero: Editorial Featured Cards -->
    <section id="hero" class="bg-white">
      <div class="ww-shell py-8">
        <!-- Typewriter headline -->
        <div class="mb-8 text-center">
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
          <!-- Left: small cards -->
          <div class="flex flex-col gap-4">
            <a
              v-for="(story, i) in featuredStories"
              :key="story.title"
              :href="story.link"
              class="group relative overflow-hidden rounded-2xl bg-[#F3F6F8]"
            >
              <div class="aspect-[4/3] overflow-hidden">
                <img
                  :src="story.image"
                  :alt="story.title"
                  loading="lazy"
                  class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  :class="{ 'opacity-0': !isImageLoaded(`featured-${i}`) }"
                  @load="markImageLoaded(`featured-${i}`)"
                />
              </div>
              <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div class="absolute bottom-0 left-0 right-0 p-4">
                <span class="inline-flex items-center rounded-md bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-[#48A9DE]">
                  {{ story.category }}
                </span>
                <h3 class="mt-2 text-sm font-semibold leading-[1.4] text-white line-clamp-2">
                  {{ story.title }}
                </h3>
              </div>
            </a>
          </div>

          <!-- Center: hero featured -->
          <a
            href="#articles"
            class="group relative overflow-hidden rounded-2xl bg-[#1A1A1A]"
          >
            <div class="aspect-[16/10] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&h=750&fit=crop&auto=format"
                alt="Featured"
                loading="lazy"
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
                从"接远程工作"升级到"经营可移动的一人公司"
              </h2>
              <p class="mt-3 hidden text-sm leading-[1.6] text-white/80 sm:block">
                用更像媒体首页的结构组织能力、案例与方法，让品牌信息、内容流和行动入口自然协同。
              </p>
            </div>
          </a>

          <!-- Right: sidebar info -->
          <div class="flex flex-col gap-4">
            <div class="rounded-2xl border border-black/6 bg-[#F7F9FB] p-5">
              <p class="text-xs font-semibold uppercase tracking-[0.12em] text-[#8C8C8C]">Remote × OPC</p>
              <h3 class="mt-2 text-lg font-semibold leading-[1.4] text-[#1A1A1A]">
                {{" "}}WorkWork 演示主页
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

    <!-- Podcast Section -->
    <section class="border-y border-black/6 bg-white py-6">
      <div class="ww-shell">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-[#48A9DE]/10">
              <svg class="h-4 w-4 text-[#48A9DE]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zM5 10a1 1 0 0 0-2 0 9 9 0 0 0 8 8.94V22h2v-3.06A9 9 0 0 0 21 10a1 1 0 0 0-2 0 7 7 0 0 1-14 0z"/>
              </svg>
            </div>
            <h2 class="text-lg font-semibold text-[#1A1A1A]">播客</h2>
          </div>
          <a href="#" class="text-sm font-medium text-[#8C8C8C] transition-colors hover:text-[#48A9DE]">
            查看全部 →
          </a>
        </div>
        <div class="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <a
            v-for="ep in podcastEpisodes"
            :key="ep.id"
            href="#"
            class="group flex gap-4 rounded-2xl border border-black/6 bg-white p-4 transition-all hover:border-[#48A9DE]/30 hover:shadow-[0_4px_16px_rgba(26,26,26,0.06)]"
          >
            <div class="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#F3F6F8]">
              <img
                :src="ep.image"
                :alt="ep.title"
                loading="lazy"
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
                <span>{{ ep.date }}</span>
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
              <a
                v-for="cat in categories"
                :key="cat.id"
                href="#articles"
                :class="[
                  'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all',
                  cat.active
                    ? 'bg-white text-[#48A9DE] shadow-[0_2px_8px_rgba(26,26,26,0.06)]'
                    : 'text-[#595959] hover:bg-white hover:text-[#262626]',
                ]"
              >
                <span class="text-base">{{ cat.icon }}</span>
                {{ cat.label }}
              </a>
            </div>
          </aside>

          <!-- Center: Article feed -->
          <main id="articles" class="min-w-0">
            <!-- Mobile category chips -->
            <div class="mb-4 flex gap-2 overflow-x-auto pb-2 lg:hidden">
              <a
                v-for="cat in categories"
                :key="cat.id"
                href="#articles"
                :class="[
                  'shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all',
                  cat.active
                    ? 'bg-[#48A9DE] text-white'
                    : 'bg-white text-[#595959] hover:text-[#48A9DE]',
                ]"
              >
                {{ cat.label }}
              </a>
            </div>

            <div class="space-y-3">
              <article
                v-for="article in articles"
                :key="article.id"
                class="group overflow-hidden rounded-2xl bg-white p-4 transition-all hover:shadow-[0_4px_16px_rgba(26,26,26,0.06)] sm:p-5"
              >
                <div class="flex gap-4">
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-2">
                      <span class="inline-flex items-center rounded-md bg-[#48A9DE]/10 px-2 py-0.5 text-[11px] font-semibold text-[#48A9DE]">
                        {{ article.category }}
                      </span>
                      <span class="text-[11px] text-[#BFBFBF]">{{ article.date }}</span>
                    </div>
                    <h3 class="mt-2 text-lg font-semibold leading-[1.45] text-[#1A1A1A] transition-colors group-hover:text-[#48A9DE]">
                      {{ article.title }}
                    </h3>
                    <p class="mt-2 text-sm leading-[1.6] text-[#8C8C8C] line-clamp-2">
                      {{ article.excerpt }}
                    </p>
                    <div class="mt-3 flex items-center gap-3 text-xs text-[#BFBFBF]">
                      <span class="font-medium text-[#595959]">{{ article.author }}</span>
                      <span>{{ article.readTime }}</span>
                    </div>
                  </div>
                  <div class="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#F3F6F8] sm:h-24 sm:w-28">
                    <img
                      :src="article.image"
                      :alt="article.title"
                      loading="lazy"
                      class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      :class="{ 'opacity-0': !isImageLoaded(article.id) }"
                      @load="markImageLoaded(article.id)"
                    />
                  </div>
                </div>
              </article>
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
                <div class="mt-4 space-y-3">
                  <a
                    v-for="(item, index) in trendingItems"
                    :key="item.title"
                    href="#articles"
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
                      <p class="mt-0.5 text-[11px] text-[#BFBFBF]">{{ item.views }}</p>
                    </div>
                  </a>
                </div>
              </div>

              <!-- Topics -->
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

              <!-- Newsletter -->
              <div class="rounded-2xl border border-[#48A9DE]/20 bg-[#48A9DE]/5 p-5">
                <h3 class="text-sm font-semibold text-[#1A1A1A]">订阅周报</h3>
                <p class="mt-1.5 text-xs leading-[1.6] text-[#595959]">
                  每周精选数字游民与一人公司资讯，直达你的收件箱。
                </p>
                <div class="mt-3 flex gap-2">
                  <input
                    type="email"
                    placeholder="your@email.com"
                    class="min-w-0 flex-1 rounded-lg border border-black/8 bg-white px-3 py-2 text-xs text-[#262626] placeholder-[#BFBFBF] outline-none focus:border-[#48A9DE]"
                  />
                  <button
                    type="button"
                    class="shrink-0 rounded-lg bg-[#48A9DE] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#3D98C8]"
                  >
                    订阅
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  </div>
</template>
