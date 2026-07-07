import { readStoredMapRegion } from '@/utils/mapProviders'

const TILE_ORIGINS = {
  china: ['https://webrd01.is.autonavi.com', 'https://webrd02.is.autonavi.com'],
  global: ['https://a.basemaps.cartocdn.com', 'https://b.basemaps.cartocdn.com'],
} as const

let warmed = false

export function warmMapTileConnections(mode = readStoredMapRegion() ?? 'global'): void {
  if (typeof document === 'undefined' || warmed) return
  warmed = true

  const origins = mode === 'china' ? TILE_ORIGINS.china : TILE_ORIGINS.global
  for (const href of origins) {
    if (document.querySelector(`link[rel="preconnect"][href="${href}"]`)) continue
    const link = document.createElement('link')
    link.rel = 'preconnect'
    link.href = href
    link.crossOrigin = 'anonymous'
    document.head.appendChild(link)
  }
}

let bundlePrefetch: Promise<unknown> | null = null

/** 预加载 Leaflet 与地图页 chunk */
export function prefetchMapBundle(): Promise<unknown> {
  if (!bundlePrefetch) {
    warmMapTileConnections()
    bundlePrefetch = Promise.all([
      import('leaflet'),
      import('leaflet/dist/leaflet.css'),
      import('@/views/NomadMapView.vue'),
    ])
  }
  return bundlePrefetch
}