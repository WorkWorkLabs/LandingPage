<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchArticleById, incrementArticleViews } from '@/composables/useSupabaseQuery'
import type { Article } from '@/types/database'
import { optimizeImage } from '@/utils/image'

const route = useRoute()
const router = useRouter()
const article = ref<Article | null>(null)
const loading = ref(true)

onMounted(async () => {
  const id = route.params.id as string
  if (!id) {
    router.push('/')
    return
  }

  article.value = await fetchArticleById(id)
  loading.value = false

  if (article.value) {
    document.title = `${article.value.title} | WorkWork`
    incrementArticleViews(id)
  }
})

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
</script>

<template>
  <div class="min-h-screen bg-[#F5F5F5]">
    <div v-if="loading" class="flex items-center justify-center py-32">
      <div class="h-8 w-8 animate-spin rounded-full border-2 border-[#48A9DE] border-t-transparent" />
    </div>

    <template v-else-if="article">
      <!-- Cover image -->
      <div v-if="article.cover_image" class="relative h-64 overflow-hidden bg-[#1A1A1A] sm:h-80">
        <img
          :src="optimizeImage(article.cover_image, 1200, 600)"
          :alt="article.title"
          width="1200"
          height="600"
          class="h-full w-full object-cover opacity-60"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
      </div>

      <!-- Article content -->
      <div class="ww-shell py-8">
        <div class="mx-auto max-w-3xl">
          <!-- Back link -->
          <router-link
            to="/"
            class="mb-6 inline-flex items-center gap-2 text-sm text-[#8C8C8C] transition-colors hover:text-[#48A9DE]"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m15 19-7-7 7-7" />
            </svg>
            返回首页
          </router-link>

          <!-- Meta -->
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center rounded-md bg-[#48A9DE]/10 px-2 py-0.5 text-[11px] font-semibold text-[#48A9DE]">
              {{ article.category }}
            </span>
            <span class="text-[11px] text-[#BFBFBF]">{{ formatDate(article.published_at) }}</span>
          </div>

          <!-- Title -->
          <h1 class="mt-4 text-2xl font-bold leading-[1.35] text-[#1A1A1A] sm:text-3xl">
            {{ article.title }}
          </h1>

          <!-- Excerpt -->
          <p v-if="article.excerpt" class="mt-4 text-base leading-[1.7] text-[#595959]">
            {{ article.excerpt }}
          </p>

          <!-- Author info -->
          <div class="mt-6 flex items-center gap-3 border-y border-black/6 py-4">
            <div class="h-10 w-10 rounded-full bg-[#48A9DE]/10 flex items-center justify-center">
              <span class="text-sm font-semibold text-[#48A9DE]">
                {{ (article.author_name ?? 'W')[0] }}
              </span>
            </div>
            <div>
              <p class="text-sm font-medium text-[#262626]">{{ article.author_name }}</p>
              <p class="text-xs text-[#BFBFBF]">{{ article.read_time }}</p>
            </div>
          </div>

          <!-- Content -->
          <div class="mt-8 prose prose-slate max-w-none">
            <div v-if="article.content" v-html="article.content" />
            <p v-else class="text-[#8C8C8C] italic">文章内容暂未发布</p>
          </div>

          <!-- Stats -->
          <div class="mt-8 flex items-center gap-4 text-xs text-[#BFBFBF]">
            <span>{{ article.views?.toLocaleString() ?? 0 }} 次阅读</span>
          </div>
        </div>
      </div>
    </template>

    <!-- Not found -->
    <template v-else>
      <div class="flex flex-col items-center justify-center py-32">
        <p class="text-lg text-[#8C8C8C]">文章不存在</p>
        <router-link to="/" class="mt-4 text-sm text-[#48A9DE] hover:underline">
          返回首页
        </router-link>
      </div>
    </template>
  </div>
</template>
