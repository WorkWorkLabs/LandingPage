import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { hasSupabaseConfig, runtimeConfig } from '@/config/app'

/**
 * 未配置真实 Supabase 时使用本地占位，避免 createClient 抛错导致白屏。
 * 注意：OAuth 登录前必须通过 hasSupabaseConfig() 校验，禁止跳转到假域名。
 */
const FALLBACK_URL = 'http://127.0.0.1:54321'
const FALLBACK_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

if (!hasSupabaseConfig()) {
  console.warn(
    '[WorkWork] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY 未配置或仍为占位值。GitHub/Google 登录与数据功能不可用。部署时请在 Vercel/CI 环境变量中写入真实项目地址后重新 build。'
  )
}

// 使用宽松类型，避免严格的泛型推断导致 update/insert 类型错误
export const supabase: SupabaseClient<any> = createClient<any>(
  hasSupabaseConfig() ? runtimeConfig.supabase.url : FALLBACK_URL,
  hasSupabaseConfig() ? runtimeConfig.supabase.anonKey : FALLBACK_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
)

export default supabase