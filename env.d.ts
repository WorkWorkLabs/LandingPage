/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_URL?: string
  readonly VITE_API_URL: string
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_ANON_KEY?: string
  readonly VITE_AMAP_KEY?: string
  readonly VITE_BAIDU_MAP_KEY?: string
  readonly VITE_GOOGLE_MAPS_KEY?: string
  readonly VITE_MAP_PROVIDER?: string
  readonly VITE_MAP_DEFAULT_ZOOM?: string
  readonly VITE_MAP_USER_ZOOM?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
