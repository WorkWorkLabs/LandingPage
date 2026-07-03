<script setup lang="ts">
import { ref } from 'vue'

const email = ref('')
const isSubmitting = ref(false)
const isSubmitted = ref(false)

const handleSubmit = async () => {
  if (!email.value) return

  isSubmitting.value = true
  await new Promise(resolve => setTimeout(resolve, 1000))
  isSubmitting.value = false
  isSubmitted.value = true

  setTimeout(() => {
    email.value = ''
    isSubmitted.value = false
  }, 3000)
}
</script>

<template>
  <div class="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
    <h3 class="text-xl font-bold text-white mb-2">
      订阅我们的动态
    </h3>
    <p class="text-white/70 text-sm mb-6">
      获取最新的远程工作资讯、社区活动和独家资源。
    </p>

    <form @submit.prevent="handleSubmit" class="flex flex-col sm:flex-row gap-3">
      <input
        v-model="email"
        type="email"
        placeholder="your@email.com"
        class="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
        required
      />
      <button
        type="submit"
        :disabled="isSubmitting"
        class="px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-600 transition-all duration-200 shadow-[0_4px_16px_rgba(0,161,255,0.3)] hover:shadow-[0_8px_30px_rgba(0,161,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
      >
        <span v-if="isSubmitting" class="flex items-center gap-2">
          <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          发送中...
        </span>
        <span v-else-if="isSubmitted" class="flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          已订阅
        </span>
        <span v-else>立即订阅</span>
      </button>
    </form>
  </div>
</template>
