import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'
import type { Profile } from '@/types/database'
import { getAuthRedirectUrl, hasSupabaseConfig } from '@/config/app'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const session = ref<Session | null>(null)
  const profile = ref<Profile | null>(null)
  const loading = ref(false)
  const initialized = ref(false)
  let authSubscription: { unsubscribe: () => void } | null = null

  // Computed
  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => profile.value?.role === 'admin')
  const isEditor = computed(() => profile.value?.role === 'editor' || isAdmin.value)

  // Initialize auth state
  async function initialize() {
    if (initialized.value) return

    if (!hasSupabaseConfig()) {
      initialized.value = true
      return
    }

    loading.value = true
    try {
      // Get initial session
      const { data: { session: initialSession }, error } = await supabase.auth.getSession()
      if (error) throw error
      session.value = initialSession
      user.value = initialSession?.user ?? null

      // Listen for auth changes
      if (!authSubscription) {
        const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
          session.value = newSession
          user.value = newSession?.user ?? null

          if (newSession?.user) {
            void fetchProfile(newSession.user.id)
          } else {
            profile.value = null
          }
        })
        authSubscription = data.subscription
      }

      // Fetch profile if user exists
      if (user.value) {
        await fetchProfile(user.value.id)
      }
    } catch (error) {
      console.error('Error initializing auth:', error)
    } finally {
      loading.value = false
      initialized.value = true
    }
  }

  // Refresh current auth state after direct auth calls
  async function refreshSession() {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error

    const newSession = data.session
    session.value = newSession
    user.value = newSession?.user ?? null

    if (newSession?.user) {
      await fetchProfile(newSession.user.id)
    } else {
      profile.value = null
    }
  }

  function dispose() {
    authSubscription?.unsubscribe()
    authSubscription = null
  }

  // Fetch user profile
  async function fetchProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      profile.value = data
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  // Sign up with email
  async function signUp(email: string, password: string, username?: string, redirectPath = '/') {
    loading.value = true
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: getAuthRedirectUrl(redirectPath),
          data: {
            username: username || email.split('@')[0],
          },
        },
      })

      if (error) throw error
      await refreshSession()
      return { data, error: null }
    } catch (error: any) {
      return { data: null, error: error.message }
    } finally {
      loading.value = false
    }
  }

  // Sign in with email
  async function signIn(email: string, password: string) {
    loading.value = true
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
      await refreshSession()
      return { data, error: null }
    } catch (error: any) {
      return { data: null, error: error.message }
    } finally {
      loading.value = false
    }
  }

  // Sign in with magic link
  async function signInWithMagicLink(email: string, redirectPath = '/') {
    loading.value = true
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: getAuthRedirectUrl(redirectPath),
        },
      })

      if (error) throw error
      return { data, error: null }
    } catch (error: any) {
      return { data: null, error: error.message }
    } finally {
      loading.value = false
    }
  }

  const missingSupabaseConfigError =
    'Supabase 未正确配置。请在部署环境设置 VITE_SUPABASE_URL 与 VITE_SUPABASE_ANON_KEY 后重新构建部署，勿使用 placeholder.supabase.co。'

  function ensureSupabaseReady() {
    if (!hasSupabaseConfig()) {
      throw new Error(missingSupabaseConfigError)
    }
  }

  // Sign in with Google (OAuth)
  async function signInWithGoogle(redirectPath = '/') {
    loading.value = true
    try {
      ensureSupabaseReady()
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: getAuthRedirectUrl(redirectPath),
        },
      })

      if (error) throw error
      return { data, error: null }
    } catch (error: any) {
      return { data: null, error: error.message }
    } finally {
      loading.value = false
    }
  }

  // Sign in with GitHub (OAuth)
  async function signInWithGitHub(redirectPath = '/') {
    loading.value = true
    try {
      ensureSupabaseReady()
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: getAuthRedirectUrl(redirectPath),
        },
      })

      if (error) throw error
      return { data, error: null }
    } catch (error: any) {
      return { data: null, error: error.message }
    } finally {
      loading.value = false
    }
  }

  // Sign in with Telegram (OAuth)
  async function signInWithTelegram(redirectPath = '/') {
    loading.value = true
    try {
      ensureSupabaseReady()
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'telegram',
        options: {
          redirectTo: getAuthRedirectUrl(redirectPath),
        },
      })

      if (error) throw error
      return { data, error: null }
    } catch (error: any) {
      return { data: null, error: error.message }
    } finally {
      loading.value = false
    }
  }

  // Sign out
  async function signOut() {
    loading.value = true
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      user.value = null
      session.value = null
      profile.value = null
    } catch (error: any) {
      console.error('Error signing out:', error)
    } finally {
      loading.value = false
    }
  }

  // Update profile
  async function updateProfile(updates: Partial<Profile>) {
    if (!user.value) return { error: 'Not authenticated' }

    loading.value = true
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.value.id)
        .select()
        .single()

      if (error) throw error
      profile.value = data
      return { data, error: null }
    } catch (error: any) {
      return { data: null, error: error.message }
    } finally {
      loading.value = false
    }
  }

  // Reset password
  async function resetPassword(email: string) {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email)
      if (error) throw error
      return { data, error: null }
    } catch (error: any) {
      return { data: null, error: error.message }
    }
  }

  // Update password
  async function updatePassword(newPassword: string) {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      })
      if (error) throw error
      return { data, error: null }
    } catch (error: any) {
      return { data: null, error: error.message }
    }
  }

  return {
    // State
    user,
    session,
    profile,
    loading,
    initialized,
    
    // Computed
    isAuthenticated,
    isAdmin,
    isEditor,
    
    // Actions
    initialize,
    refreshSession,
    dispose,
    fetchProfile,
    signUp,
    signIn,
    signInWithMagicLink,
    signInWithGoogle,
    signInWithGitHub,
    signInWithTelegram,
    signOut,
    updateProfile,
    resetPassword,
    updatePassword,
  }
})
