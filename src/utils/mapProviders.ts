import L from 'leaflet'
import { runtimeConfig } from '@/config/app'
import { DEFAULT_CENTER, DEFAULT_ZOOM } from '@/constants/map'
import { loadGoogleMapsJs } from '@/utils/googleMapsLoader'
import { getCartoVariant, getGoogleMapStyle } from '@/utils/mapStyles'
import { mountTileLayerWithFallback, type MountedTileLayer } from '@/utils/tileFallback'

export type MapRegionMode = 'china' | 'global'
export type MapSearchProvider = 'osm' | 'amap' | 'google'

export const MAP_REGION_STORAGE_KEY = 'workwork-map-region'

export const CHINA_DEFAULT_CENTER = { lat: 31.2304, lng: 121.4737 }
export const GLOBAL_DEFAULT_CENTER = DEFAULT_CENTER

export function readStoredMapRegion(): MapRegionMode | null {
  if (typeof window === 'undefined') return null
  const value = localStorage.getItem(MAP_REGION_STORAGE_KEY)
  return value === 'china' || value === 'global' ? value : null
}

export function persistMapRegion(mode: MapRegionMode): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(MAP_REGION_STORAGE_KEY, mode)
}

/** 地点搜索数据源（与底图瓦片解耦） */
export function getMapSearchProvider(_region: MapRegionMode = 'global'): MapSearchProvider {
  if (runtimeConfig.maps.googleMapsKey) return 'google'
  if (runtimeConfig.maps.amapKey) return 'amap'
  return 'osm'
}

/** @deprecated 搜索已与区域解耦，请使用 getMapSearchProvider */
export function getSearchProviderForRegion(mode: MapRegionMode): MapSearchProvider {
  return getMapSearchProvider(mode)
}

export function getDefaultCenterForRegion(mode: MapRegionMode): { lat: number; lng: number } {
  return mode === 'china' ? CHINA_DEFAULT_CENTER : GLOBAL_DEFAULT_CENTER
}

export function getRegionLabel(mode: MapRegionMode): string {
  return mode === 'china' ? '国内' : '国外'
}

/** 底图瓦片来源（国内/国外统一 CARTO 手绘风） */
export function getBaseMapLabel(_mode: MapRegionMode): string {
  return 'CARTO'
}

export function getSearchProviderLabel(region: MapRegionMode = 'global'): string {
  const provider = getMapSearchProvider(region)
  if (provider === 'google') return 'Google 搜索'
  if (provider === 'amap') return 'OSM + 高德搜索'
  return 'OSM 搜索'
}

/** @deprecated 使用 getBaseMapLabel */
export function getProviderLabel(mode: MapRegionMode): string {
  return getBaseMapLabel(mode)
}

/** WGS84 存储坐标 → 底图显示坐标（统一 WGS84，与 CARTO/OSM 对齐） */
export function toMapDisplayCoords(lat: number, lng: number, _mode: MapRegionMode): [number, number] {
  return [lat, lng]
}

/** 底图点击坐标 → WGS84 存储坐标 */
export function fromMapDisplayCoords(
  lat: number,
  lng: number,
  _mode: MapRegionMode
): { lat: number; lng: number } {
  return { lat, lng }
}

const FAST_TILE_OPTIONS = {
  updateWhenZooming: false,
  updateWhenIdle: true,
  keepBuffer: 3,
  maxNativeZoom: 18,
  className: 'hand-drawn-tile-layer',
} as const

export function createOsmBaseLayer(): L.TileLayer {
  return L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    subdomains: ['a', 'b', 'c'],
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    ...FAST_TILE_OPTIONS,
  })
}

export function createCartoBaseLayer(): L.TileLayer {
  const variant = getCartoVariant()
  return L.tileLayer(`https://{s}.basemaps.cartocdn.com/${variant}/{z}/{x}/{y}{r}.png`, {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
    maxZoom: 19,
    subdomains: 'abcd',
    ...FAST_TILE_OPTIONS,
  })
}

/** @deprecated 国内已统一 CARTO 底图，保留仅供兼容 */
export function createAmapBaseLayer(): L.TileLayer {
  return createCartoBaseLayer()
}

/** @deprecated 使用 createCartoBaseLayer */
export function createCartoFallbackLayer(): L.TileLayer {
  return createCartoBaseLayer()
}

/** @deprecated 使用 createCartoBaseLayer */
export function createCartoLayerForTheme(): L.TileLayer {
  return createCartoBaseLayer()
}

export async function createGoogleMutantLayer(): Promise<L.Layer | null> {
  if (!runtimeConfig.maps.googleMapsKey) return null

  const ready = await loadGoogleMapsJs()
  if (!ready) return null

  try {
    const { default: GoogleMutant } = await import(
      'leaflet.gridlayer.googlemutant/src/Leaflet.GoogleMutant.mjs'
    )
    return new GoogleMutant({
      type: 'roadmap',
      styles: getGoogleMapStyle(),
      maxZoom: 19,
    }) as unknown as L.Layer
  } catch (error) {
    console.warn('Google Mutant layer failed:', error)
    return null
  }
}

/** 同步快速底图（国内/国外统一） */
export function createFastBaseLayerForRegion(_mode: MapRegionMode): L.Layer {
  return createCartoBaseLayer()
}

/** 带自动回退的底图：CARTO → OSM（国内/国外相同） */
export function mountBaseLayerForRegion(
  map: L.Map,
  _mode: MapRegionMode,
  onSwitch?: (label: string) => void
): MountedTileLayer {
  return mountTileLayerWithFallback(
    map,
    [
      { id: 'carto', label: 'CARTO', create: () => createCartoBaseLayer() },
      { id: 'osm', label: 'OpenStreetMap', create: () => createOsmBaseLayer() },
    ],
    onSwitch
  )
}

/** 瓦片仍未显示时，尝试 Google 底图（仅作最后兜底） */
export async function promoteGoogleTileFallback(
  map: L.Map,
  mounted: MountedTileLayer | null,
  onSwitch?: (label: string) => void
): Promise<L.Layer | null> {
  const googleLayer = await createGoogleMutantLayer()
  if (!googleLayer || !map) return null

  mounted?.destroy()
  googleLayer.addTo(map)
  onSwitch?.('Google 底图')
  return googleLayer
}

export async function createBaseLayerForRegion(
  mode: MapRegionMode,
  options: { preferFast?: boolean } = {}
): Promise<L.Layer> {
  void options
  return createFastBaseLayerForRegion(mode)
}

export function getInitialZoom(): number {
  return runtimeConfig.maps.defaultZoom || DEFAULT_ZOOM
}