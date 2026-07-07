import L from 'leaflet'
import { runtimeConfig } from '@/config/app'
import { DEFAULT_CENTER, DEFAULT_ZOOM } from '@/constants/map'
import { gcj02ToWgs84, wgs84ToGcj02 } from '@/utils/locationParser'
import { loadGoogleMapsJs } from '@/utils/googleMapsLoader'
import {
  getAmapTileStyleParam,
  getCartoVariant,
  getGoogleMapStyle,
} from '@/utils/mapStyles'
import { mountTileLayerWithFallback, type MountedTileLayer } from '@/utils/tileFallback'

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

export function createAmapBaseLayer(): L.TileLayer {
  const style = getAmapTileStyleParam()
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

/** 同步快速底图（无回退链） */
export function createFastBaseLayerForRegion(mode: MapRegionMode): L.Layer {
  return mode === 'china' ? createAmapBaseLayer() : createCartoBaseLayer()
}

/** 带自动回退的底图：国外 CARTO → OSM；国内 高德 → OSM */
export function mountBaseLayerForRegion(
  map: L.Map,
  mode: MapRegionMode,
  onSwitch?: (label: string) => void
): MountedTileLayer {
  if (mode === 'china') {
    return mountTileLayerWithFallback(
      map,
      [
        { id: 'amap', label: '高德地图', create: () => createAmapBaseLayer() },
        { id: 'osm', label: 'OpenStreetMap', create: () => createOsmBaseLayer() },
      ],
      onSwitch
    )
  }

  return mountTileLayerWithFallback(
    map,
    [
      { id: 'carto', label: 'CARTO', create: () => createCartoBaseLayer() },
      { id: 'osm', label: 'OpenStreetMap', create: () => createOsmBaseLayer() },
    ],
    onSwitch
  )
}

/** 瓦片仍未显示时，尝试 Google 底图（仅作最后兜底，搜索仍独立走 Google API） */
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