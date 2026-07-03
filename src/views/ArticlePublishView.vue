<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const title = ref('')
const excerpt = ref('')
const content = ref('')
const coverImage = ref('')
const category = ref('remote-work')
const submitting = ref(false)
const error = ref('')

const categories = [
  { value: 'remote-work', label: '远程工作' },
  { value: 'nomad-life', label: '游民生活' },
  { value: 'tools', label: '工具推荐' },
  { value: 'finance', label: '跨境金融' },
  { value: 'growth', label: '个人成长' },
]

async function handleSubmit() {
  if (!title.value || !content.value) {
    error.value = '请填写标题和正文'
    return
  }

  submitting.value = true
  error.value = ''

  const { error: insertError } = await supabase.from('articles').insert({
    title: title.value,
    excerpt: excerpt.value,
    content: content.value,
    cover_image: coverImage.value || null,
    category: category.value,
    author_id: authStore.user?.id ?? null,
    author_name: authStore.profile?.username ?? authStore.user?.email ?? '匿名',
    status: 'pending',
    read_time: `${Math.max(1, Math.ceil(content.value.length / 500))} 分钟`,
  })

  if (insertError) {
    error.value = insertError.message
    submitting.value = false
    return
  }

  router.push('/')
}
</script>

<template>
  <div class="min-h-screen bg-[#F5F5F5]">
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

        <div class="rounded-2xl bg-white p-6 sm:p-8">
          <h1 class="text-2xl font-bold text-[#1A1A1A]">投稿文章</h1>
          <p class="mt-2 text-sm text-[#8C8C8C]">提交后将进入审核，审核通过后自动发布。</p>

          <!-- Not logged in -->
          <div v-if="!authStore.isAuthenticated" class="mt-8 text-center">
            <p class="text-[#8C8C8C]">请先登录后再投稿</p>
            <router-link
              to="/login"
              class="mt-4 inline-flex items-center rounded-full bg-[#48A9DE] px-6 py-3 text-sm font-semibold text-white"
            >
              去登录
            </router-link>
          </div>

          <!-- Form -->
          <form v-else class="mt-8 space-y-6" @submit.prevent="handleSubmit">
            <!-- Title -->
            <div>
              <label class="block text-sm font-medium text-[#262626]">标题</label>
              <input
                v-model="title"
                type="text"
                placeholder="文章标题"
                class="mt-1.5 w-full rounded-xl border border-black/8 bg-white px-4 py-3 text-sm text-[#262626] placeholder-[#BFBFBF] outline-none focus:border-[#48A9DE]"
              />
            </div>

            <!-- Category -->
            <div>
              <label class="block text-sm font-medium text-[#262626]">分类</label>
              <select
                v-model="category"
                class="mt-1.5 w-full rounded-xl border border-black/8 bg-white px-4 py-3 text-sm text-[#262626] outline-none focus:border-[#48A9DE]"
              >
                <option v-for="cat in categories" :key="cat.value" :value="cat.value">
                  {{ cat.label }}
                </option>
              </select>
            </div>

            <!-- Cover image -->
            <div>
              <label class="block text-sm font-medium text-[#262626]">封面图片 URL</label>
              <input
                v-model="coverImage"
                type="url"
                placeholder="https://..."
                class="mt-1.5 w-full rounded-xl border border-black/8 bg-white px-4 py-3 text-sm text-[#262626] placeholder-[#BFBFBF] outline-none focus:border-[#48A9DE]"
              />
            </div>

            <!-- Excerpt -->
            <div>
              <label class="block text-sm font-medium text-[#262626]">摘要</label>
              <textarea
                v-model="excerpt"
                placeholder="一句话描述文章内容"
                rows="2"
                class="mt-1.5 w-full rounded-xl border border-black/8 bg-white px-4 py-3 text-sm text-[#262626] placeholder-[#BFBFBF] outline-none focus:border-[#48A9DE]"
              />
            </div>

            <!-- Content -->
            <div>
              <label class="block text-sm font-medium text-[#262626]">正文（支持 HTML）</label>
              <textarea
                v-model="content"
                placeholder="在这里撰写文章内容..."
                rows="12"
                class="mt-1.5 w-full rounded-xl border border-black/8 bg-white px-4 py-3 text-sm text-[#262626] placeholder-[#BFBFBF] outline-none focus:border-[#48A9DE] font-mono"
              />
            </div>

            <!-- Error -->
            <p v-if="error" class="text-sm text-red-500">{{ error }}</p>

            <!-- Submit -->
            <button
              type="submit"
              :disabled="submitting"
              class="w-full rounded-xl bg-[#48A9DE] py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#3D98C8] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {{ submitting ? '提交中...' : '提交审核' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
