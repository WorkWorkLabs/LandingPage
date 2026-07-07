import L from 'leaflet'
import { runtimeConfig } from '@/config/app'
import { DEFAULT_CENTER, DEFAULT_ZOOM } from '@/constants/map'
import { gcj02ToWgs84, wgs84ToGcj02 } from '@/utils/locationParser'
import {
  getAmapTileStyleParam,
  getCartoVariant,
  type MapThemeId,
} from '@/utils/mapStyles'

export type MapRegionMode = 'china' | 'global'
export type MapSearchProvider = 'amap' | 'google'

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

/** 地点搜索/地理编码统一走 Google（有 Key 时） */
export function getMapSearchProvider(): MapSearchProvider {
  if (runtimeConfig.maps.googleMapsKey) return 'google'
  return 'amap'
}

/** @deprecated 搜索已与区域解耦，请使用 getMapSearchProvider */
export function getSearchProviderForRegion(_mode: MapRegionMode): MapSearchProvider {
  return getMapSearchProvider()
}

export function getDefaultCenterForRegion(mode: MapRegionMode): { lat: number; lng: number } {
  return mode === 'china' ? CHINA_DEFAULT_CENTER : GLOBAL_DEFAULT_CENTER
}

export function getRegionLabel(mode: MapRegionMode): string {
  return mode === 'china' ? '国内' : '国外'
}

/** 底图瓦片来源（不含搜索数据源） */
export function getBaseMapLabel(mode: MapRegionMode): string {
  return mode === 'china' ? '高德地图' : 'CARTO'
}

export function getSearchProviderLabel(): string {
  return runtimeConfig.maps.googleMapsKey ? 'Google 搜索' : '高德搜索'
}

/** @deprecated 使用 getBaseMapLabel */
export function getProviderLabel(mode: MapRegionMode): string {
  return getBaseMapLabel(mode)
}

/** WGS84 存储坐标 → 当前底图显示坐标 */
export function toMapDisplayCoords(
  lat: number,
  lng: number,
  mode: MapRegionMode
): [number, number] {
  if (mode === 'china') {
    const [gcjLng, gcjLat] = wgs84ToGcj02(lng, lat)
    return [gcjLat, gcjLng]
  }
  return [lat, lng]
}

/** 底图点击坐标 → WGS84 存储坐标 */
export function fromMapDisplayCoords(
  lat: number,
  lng: number,
  mode: MapRegionMode
): { lat: number; lng: number } {
  if (mode === 'china') {
    const [wgsLng, wgsLat] = gcj02ToWgs84(lng, lat)
    return { lat: wgsLat, lng: wgsLng }
  }
  return { lat, lng }
}

const FAST_TILE_OPTIONS = {
  updateWhenZooming: false,
  updateWhenIdle: true,
  keepBuffer: 2,
  maxNativeZoom: 18,
} as const

export function createAmapBaseLayer(theme: MapThemeId = 'journal'): L.TileLayer {
  const style = getAmapTileStyleParam(theme)
  return L.tileLayer(
    `https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=${style}&x={x}&y={y}&z={z}`,
    {
      subdomains: ['1', '2', '3', '4'],
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.amap.com/">高德地图</a>',
      ...FAST_TILE_OPTIONS,
    }
  )
}

export function createCartoLayerForTheme(theme: MapThemeId = 'journal'): L.TileLayer {
  const variant = getCartoVariant(theme)
  return L.tileLayer(`https://{s}.basemaps.cartocdn.com/${variant}/{z}/{x}/{y}{r}.png`, {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
    maxZoom: 19,
    subdomains: 'abcd',
    ...FAST_TILE_OPTIONS,
  })
}

/** @deprecated 使用 createCartoLayerForTheme */
export function createCartoFallbackLayer(): L.TileLayer {
  return createCartoLayerForTheme('journal')
}

/** 同步快速底图 — 用于首屏，绝不阻塞 */
export function createFastBaseLayerForRegion(
  mode: MapRegionMode,
  theme: MapThemeId = 'journal'
): L.Layer {
  return mode === 'china' ? createAmapBaseLayer(theme) : createCartoLayerForTheme(theme)
}

export async function createBaseLayerForRegion(
  mode: MapRegionMode,
  options: { preferFast?: boolean; theme?: MapThemeId } = {}
): Promise<L.Layer> {
  const theme = options.theme ?? 'journal'
  return createFastBaseLayerForRegion(mode, theme)
}

export function getInitialZoom(): number {
  return runtimeConfig.maps.defaultZoom || DEFAULT_ZOOM
}