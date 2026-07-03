import { createClient } from '@supabase/supabase-js'
import { hasSupabaseConfig, runtimeConfig } from '@/config/app'

if (!hasSupabaseConfig()) {
  console.warn('Supabase URL or Anon Key is missing. Please check your .env file.')
}

// 使用宽松类型，避免严格的泛型推断导致 update/insert 类型错误
export const supabase = createClient<any>(
  runtimeConfig.supabase.url,
  runtimeConfig.supabase.anonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
)

export default supabase
