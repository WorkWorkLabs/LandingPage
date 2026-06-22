<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'

const router = useRouter()
const loading = ref<string | null>(null)
const error = ref('')
const success = ref('')
const mode = ref<'login' | 'register'>('login')
const email = ref('')
const password = ref('')

async function signInWithEmail() {
  if (!email.value || !password.value) {
    error.value = '请填写邮箱和密码'
    return
  }
  loading.value = 'email'
  error.value = ''
  success.value = ''

  try {
    const { error: err } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    })
    if (err) throw err
    router.push('/')
  } catch (e: any) {
    error.value = e.message || '登录失败'
    loading.value = null
  }
}

async function signUpWithEmail() {
  if (!email.value || !password.value) {
    error.value = '请填写邮箱和密码'
    return
  }
  if (password.value.length < 8) {
    error.value = '密码至少需要 8 个字符'
    return
  }
  const hasLower = /[a-z]/.test(password.value)
  const hasUpper = /[A-Z]/.test(password.value)
  const hasDigit = /[0-9]/.test(password.value)
  const hasSymbol = /[^a-zA-Z0-9]/.test(password.value)
  if (!hasLower || !hasUpper || !hasDigit || !hasSymbol) {
    error.value = '密码需包含小写字母、大写字母、数字和特殊符号'
    return
  }
  loading.value = 'email'
  error.value = ''
  success.value = ''

  try {
    const { error: err } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
      options: {
        emailRedirectTo: window.location.origin,
      },
    })
    if (err) throw err
    success.value = '注册成功！请检查邮箱中的验证链接。'
    loading.value = null
  } catch (e: any) {
    error.value = e.message || '注册失败'
    loading.value = null
  }
}

async function signInWithGoogle() {
  loading.value = 'google'
  error.value = ''
  try {
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    if (err) throw err
  } catch (e: any) {
    error.value = e.message || 'Google 登录失败'
    loading.value = null
  }
}

async function signInWithGitHub() {
  loading.value = 'github'
  error.value = ''
  try {
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: window.location.origin },
    })
    if (err) throw err
  } catch (e: any) {
    error.value = e.message || 'GitHub 登录失败'
    loading.value = null
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-[#F5F5F5] px-4">
    <div class="w-full max-w-[400px]">
      <!-- Back link -->
      <a
        href="/"
        class="mb-8 inline-flex items-center gap-2 text-sm text-[#8C8C8C] transition-colors hover:text-[#48A9DE]"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m15 19-7-7 7-7" />
        </svg>
        返回首页
      </a>

      <!-- Login card -->
      <div class="rounded-2xl bg-white p-8 shadow-[0_2px_12px_rgba(26,26,26,0.04)]">
        <!-- Header -->
        <div class="text-center">
          <h1 class="text-2xl font-semibold text-[#1A1A1A]">{{ mode === 'login' ? '登录' : '注册' }} WorkWork</h1>
          <p class="mt-2 text-sm text-[#8C8C8C]">
            加入我们，开启自由工作之旅
          </p>
        </div>

        <!-- Email form -->
        <div class="mt-8 space-y-4">
          <div>
            <label for="email" class="block text-sm font-medium text-[#262626]">邮箱</label>
            <input
              id="email"
              v-model="email"
              type="email"
              placeholder="your@email.com"
              class="mt-1.5 w-full rounded-xl border border-black/8 bg-white px-4 py-3 text-sm text-[#262626] placeholder-[#BFBFBF] outline-none transition-colors focus:border-[#48A9DE]"
            />
          </div>
          <div>
            <label for="password" class="block text-sm font-medium text-[#262626]">密码</label>
            <input
              id="password"
              v-model="password"
              type="password"
              :placeholder="mode === 'register' ? '至少 8 个字符' : '输入密码'"
              class="mt-1.5 w-full rounded-xl border border-black/8 bg-white px-4 py-3 text-sm text-[#262626] placeholder-[#BFBFBF] outline-none transition-colors focus:border-[#48A9DE]"
            />
            <p v-if="mode === 'register'" class="mt-2 text-[11px] leading-[1.6] text-[#BFBFBF]">
              最少 8 个字符，需包含小写字母、大写字母、数字和特殊符号
            </p>
          </div>
          <button
            type="button"
            :disabled="!!loading"
            class="w-full rounded-xl bg-[#48A9DE] px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-[#3D98C8] disabled:cursor-not-allowed disabled:opacity-50"
            @click="mode === 'login' ? signInWithEmail() : signUpWithEmail()"
          >
            <span v-if="loading === 'email'" class="animate-pulse">处理中...</span>
            <span v-else>{{ mode === 'login' ? '登录' : '注册' }}</span>
          </button>
          <p class="text-center text-sm text-[#8C8C8C]">
            <template v-if="mode === 'login'">
              还没有账号？
              <button class="font-medium text-[#48A9DE] hover:underline" @click="mode = 'register'; error = ''; success = ''">立即注册</button>
            </template>
            <template v-else>
              已有账号？
              <button class="font-medium text-[#48A9DE] hover:underline" @click="mode = 'login'; error = ''; success = ''">去登录</button>
            </template>
          </p>
        </div>

        <!-- Divider -->
        <div class="my-6 flex items-center gap-4">
          <div class="h-px flex-1 bg-black/8" />
          <span class="text-xs text-[#BFBFBF]">或</span>
          <div class="h-px flex-1 bg-black/8" />
        </div>

        <!-- OAuth buttons -->
        <div class="space-y-3">
          <button
            type="button"
            :disabled="!!loading"
            class="flex w-full items-center justify-center gap-3 rounded-xl border border-black/8 bg-white px-4 py-3.5 text-sm font-medium text-[#262626] transition-all hover:border-black/20 hover:bg-[#F7F9FB] disabled:cursor-not-allowed disabled:opacity-50"
            @click="signInWithGoogle"
          >
            <svg class="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span v-if="loading === 'google'" class="animate-pulse">连接中...</span>
            <span v-else>使用 Google 登录</span>
          </button>

          <button
            type="button"
            :disabled="!!loading"
            class="flex w-full items-center justify-center gap-3 rounded-xl bg-[#24292F] px-4 py-3.5 text-sm font-medium text-white transition-all hover:bg-[#32383f] disabled:cursor-not-allowed disabled:opacity-50"
            @click="signInWithGitHub"
          >
            <svg class="h-5 w-5" fill="white" viewBox="0 0 24 24">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/>
            </svg>
            <span v-if="loading === 'github'" class="animate-pulse">连接中...</span>
            <span v-else>使用 GitHub 登录</span>
          </button>
        </div>

        <!-- Messages -->
        <p v-if="error" class="mt-4 text-center text-sm text-red-500">{{ error }}</p>
        <p v-if="success" class="mt-4 text-center text-sm text-green-600">{{ success }}</p>
      </div>

      <!-- Footer -->
      <p class="mt-6 text-center text-xs text-[#BFBFBF]">
        登录即表示同意
        <a href="#" class="text-[#8C8C8C] underline hover:text-[#48A9DE]">服务条款</a>
        和
        <a href="#" class="text-[#8C8C8C] underline hover:text-[#48A9DE]">隐私政策</a>
      </p>
    </div>
  </div>
</template>
