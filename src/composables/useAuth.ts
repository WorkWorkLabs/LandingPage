import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export function useAuth(requireAuth = false) {
  const authStore = useAuthStore()
  const router = useRouter()

  // Initialize auth on mount
  onMounted(async () => {
    if (!authStore.initialized) {
      await authStore.initialize()
    }

    // Redirect if auth is required but user is not authenticated
    if (requireAuth && !authStore.isAuthenticated) {
      router.push('/login')
    }
  })

  // Login with email and password
  async function login(email: string, password: string) {
    const result = await authStore.signIn(email, password)
    if (!result.error) {
      router.push('/')
    }
    return result
  }

  // Register with email and password
  async function register(email: string, password: string, username?: string) {
    const result = await authStore.signUp(email, password, username)
    return result
  }

  // Login with magic link
  async function loginWithMagicLink(email: string) {
    return await authStore.signInWithMagicLink(email)
  }

  // Login with Telegram
  async function loginWithTelegram() {
    return await authStore.signInWithTelegram()
  }

  // Logout
  async function logout() {
    await authStore.signOut()
    router.push('/')
  }

  // Update profile
  async function updateProfile(updates: any) {
    return await authStore.updateProfile(updates)
  }

  // Check if user has specific role
  function hasRole(role: 'user' | 'editor' | 'admin'): boolean {
    if (!authStore.profile) return false
    
    const roleHierarchy = { admin: 3, editor: 2, user: 1 }
    const userRoleLevel = roleHierarchy[authStore.profile.role] || 0
    const requiredRoleLevel = roleHierarchy[role] || 0
    
    return userRoleLevel >= requiredRoleLevel
  }

  // Check if user can perform action
  function can(action: string): boolean {
    if (!authStore.isAuthenticated) return false

    const permissions: Record<string, () => boolean> = {
      'write:article': () => authStore.isAuthenticated,
      'edit:article': () => authStore.isAuthenticated,
      'delete:article': () => authStore.isAuthenticated,
      'review:article': () => hasRole('editor'),
      'manage:podcast': () => hasRole('editor'),
      'manage:users': () => hasRole('admin'),
      'create:spot': () => authStore.isAuthenticated,
      'edit:spot': () => authStore.isAuthenticated,
      'delete:spot': () => authStore.isAuthenticated,
      'moderate:spot': () => hasRole('editor'),
    }

    return permissions[action]?.() ?? false
  }

  return {
    // State
    user: authStore.user,
    profile: authStore.profile,
    loading: authStore.loading,
    isAuthenticated: authStore.isAuthenticated,
    isAdmin: authStore.isAdmin,
    isEditor: authStore.isEditor,
    initialized: authStore.initialized,
    
    // Actions
    login,
    register,
    loginWithMagicLink,
    loginWithTelegram,
    logout,
    updateProfile,
    
    // Helpers
    hasRole,
    can,
  }
}
