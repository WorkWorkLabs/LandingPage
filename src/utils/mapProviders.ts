import L from 'leaflet'
import { runtimeConfig } from '@/config/app'
import { DEFAULT_CENTER, DEFAULT_ZOOM } from '@/constants/map'
import { gcj02ToWgs84, wgs84ToGcj02 } from '@/utils/locationParser'
import { loadGoogleMapsJs } from '@/utils/googleMapsLoader'
import { GOOGLE_MAPS_HAND_DRAWN_STYLE } from '@/utils/mapStyles'

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

export function getSearchProviderForRegion(mode: MapRegionMode): MapSearchProvider {
  return mode === 'china' ? 'amap' : 'google'
}

export function getDefaultCenterForRegion(mode: MapRegionMode): { lat: number; lng: number } {
  return mode === 'china' ? CHINA_DEFAULT_CENTER : GLOBAL_DEFAULT_CENTER
}

export function getRegionLabel(mode: MapRegionMode): string {
  return mode === 'china' ? '国内' : '国外'
}

export function getProviderLabel(mode: MapRegionMode): string {
  return mode === 'china' ? '高德地图' : 'Google Maps'
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

export function createAmapBaseLayer(): L.TileLayer {
  return L.tileLayer(
    'https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
    {
      subdomains: ['1', '2', '3', '4'],
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.amap.com/">高德地图</a>',
      updateWhenZooming: false,
      keepBuffer: 4,
    }
  )
}

function createCartoFallbackLayer(): L.TileLayer {
  return L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 19,
      subdomains: 'abcd',
      updateWhenZooming: false,
      keepBuffer: 4,
    }
  )
}

export async function createBaseLayerForRegion(mode: MapRegionMode): Promise<L.Layer> {
  if (mode === 'china') {
    if (runtimeConfig.maps.amapKey) {
      return createAmapBaseLayer()
    }
    return createAmapBaseLayer()
  }

  if (runtimeConfig.maps.googleMapsKey) {
    const ready = await loadGoogleMapsJs()
    if (ready) {
      const { default: GoogleMutant } = await import(
        'leaflet.gridlayer.googlemutant/src/Leaflet.GoogleMutant.mjs'
      )
      return new GoogleMutant({
        type: 'roadmap',
        styles: GOOGLE_MAPS_HAND_DRAWN_STYLE,
        maxZoom: 19,
      }) as unknown as L.Layer
    }
  }

  return createCartoFallbackLayer()
}

export function getInitialZoom(): number {
  return runtimeConfig.maps.defaultZoom || DEFAULT_ZOOM
}