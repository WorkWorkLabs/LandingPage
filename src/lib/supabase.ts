import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { hasSupabaseConfig, runtimeConfig } from '@/config/app'

const PLACEHOLDER_URL = 'https://placeholder.supabase.co'
const PLACEHOLDER_KEY = 'placeholder-anon-key'

if (!hasSupabaseConfig()) {
  console.warn('Supabase URL or Anon Key is missing. Auth and data features are disabled until env vars are configured.')
}

// 使用宽松类型，避免严格的泛型推断导致 update/insert 类型错误
// 未配置环境变量时使用占位 client，避免 createClient 抛错导致整站白屏
export const supabase: SupabaseClient<any> = createClient<any>(
  runtimeConfig.supabase.url || PLACEHOLDER_URL,
  runtimeConfig.supabase.anonKey || PLACEHOLDER_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
)

export default supabase