const trimEnv = (value: string | undefined): string => value?.trim() ?? ''

const appUrl = trimEnv(import.meta.env.VITE_APP_URL) || 'https://workwork.works'

export const runtimeConfig = {
  app: {
    title: trimEnv(import.meta.env.VITE_APP_TITLE) || 'WorkWork - Global Remote Work Ecosystem',
    url: appUrl,
    apiUrl: trimEnv(import.meta.env.VITE_API_URL),
  },
  supabase: {
    url: trimEnv(import.meta.env.VITE_SUPABASE_URL),
    anonKey: trimEnv(import.meta.env.VITE_SUPABASE_ANON_KEY),
  },
  maps: {
    amapKey: trimEnv(import.meta.env.VITE_AMAP_KEY),
    baiduMapKey: trimEnv(import.meta.env.VITE_BAIDU_MAP_KEY),
    googleMapsKey: trimEnv(import.meta.env.VITE_GOOGLE_MAPS_KEY),
    defaultProvider: trimEnv(import.meta.env.VITE_MAP_PROVIDER) || 'leaflet',
    defaultZoom: Number(trimEnv(import.meta.env.VITE_MAP_DEFAULT_ZOOM)) || 13,
    userZoom: Number(trimEnv(import.meta.env.VITE_MAP_USER_ZOOM)) || 15,
  },
} as const

export function getAppOrigin(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  return runtimeConfig.app.url
}

export function getAuthRedirectUrl(path = '/'): string {
  return new URL(path, getAppOrigin()).toString()
}

export function hasSupabaseConfig(): boolean {
  return Boolean(runtimeConfig.supabase.url && runtimeConfig.supabase.anonKey)
}
