import { runtimeConfig } from '@/config/app'

export interface GoogleTextSearchHit {
  name: string
  lat: number
  lng: number
  address: string
}

type GoogleImportLibrary = (name: string) => Promise<Record<string, unknown>>

interface GoogleMapsNamespace {
  maps: {
    importLibrary: GoogleImportLibrary
  }
}

let bootstrapPromise: Promise<boolean> | null = null
let placesLibraryPromise: Promise<Record<string, unknown> | null> | null = null

function getGoogleNamespace(): GoogleMapsNamespace | undefined {
  return (window as Window & { google?: GoogleMapsNamespace }).google
}

function injectGoogleBootstrap(key: string): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false)

  const existing = getGoogleNamespace()
  if (existing?.maps?.importLibrary) {
    return existing.maps.importLibrary('places').then(() => true).catch(() => false)
  }

  if (!bootstrapPromise) {
    bootstrapPromise = new Promise((resolve) => {
      const config = JSON.stringify({ key, v: 'weekly' })
      const script = document.createElement('script')
      script.text = `(g=>{var h,a,k,p="The Google Maps JavaScript API",c="google",l="importLibrary",q="__ib__",m=document,b=window;b=b[c]||(b[c]={});var d=b.maps||(b.maps={}),r=new Set,e=new URLSearchParams,u=()=>h||(h=new Promise(async(f,n)=>{await (a=m.createElement("script"));e.set("libraries",[...r]+"");for(k in g)e.set(k.replace(/[A-Z]/g,t=>"_"+t[0].toLowerCase()),g[k]);e.set("callback",c+".maps."+q);a.src=\`https://maps.\${c}apis.com/maps/api/js?\`+e;d[q]=f;a.onerror=()=>n(Error(p+" could not load."));a.nonce=m.querySelector("script[nonce]")?.nonce||"";m.head.append(a)}));d[l]?console.warn(p+" only loads once. Ignoring:",g):d[l]=(f,...n)=>r.add(f)&&u().then(()=>d[l](f,...n))})(${config});`
      document.head.appendChild(script)

      const googleMaps = getGoogleNamespace()
      if (!googleMaps?.maps?.importLibrary) {
        bootstrapPromise = null
        resolve(false)
        return
      }

      googleMaps.maps
        .importLibrary('places')
        .then(() => resolve(true))
        .catch(() => {
          bootstrapPromise = null
          resolve(false)
        })
    })
  }

  return bootstrapPromise
}

async function loadPlacesLibrary(): Promise<Record<string, unknown> | null> {
  const key = runtimeConfig.maps.googleMapsKey
  if (!key) return null

  const ready = await injectGoogleBootstrap(key)
  if (!ready) return null

  if (!placesLibraryPromise) {
    const googleMaps = getGoogleNamespace()
    if (!googleMaps?.maps?.importLibrary) return null
    placesLibraryPromise = googleMaps.maps.importLibrary('places').catch(() => null)
  }

  return placesLibraryPromise
}

function readLatLng(location: unknown): { lat: number; lng: number } | null {
  if (!location || typeof location !== 'object') return null

  const point = location as {
    lat?: number | (() => number)
    lng?: number | (() => number)
    latitude?: number
    longitude?: number
  }

  const lat = typeof point.lat === 'function' ? point.lat() : point.lat ?? point.latitude
  const lng = typeof point.lng === 'function' ? point.lng() : point.lng ?? point.longitude

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  return { lat: lat as number, lng: lng as number }
}

function readDisplayName(displayName: unknown, fallback: string): string {
  if (typeof displayName === 'string' && displayName.trim()) return displayName
  if (displayName && typeof displayName === 'object' && 'text' in displayName) {
    const text = (displayName as { text?: string }).text
    if (text?.trim()) return text
  }
  return fallback
}

/**
 * Google Places Text Search (New) — 兼容 Maps Demo Key
 */
export async function searchGooglePlacesByText(
  query: string,
  bias?: { lat: number; lng: number }
): Promise<GoogleTextSearchHit[]> {
  const placesLib = await loadPlacesLibrary()
  const Place = placesLib?.Place as {
    searchByText: (request: Record<string, unknown>) => Promise<{ places?: Array<Record<string, unknown>> }>
  } | undefined

  if (!Place?.searchByText) return []

  const request: Record<string, unknown> = {
    textQuery: query,
    fields: ['displayName', 'formattedAddress', 'location'],
    maxResultCount: 10,
    languageCode: 'zh-CN',
  }

  if (bias && Number.isFinite(bias.lat) && Number.isFinite(bias.lng)) {
    request.locationBias = {
      center: { lat: bias.lat, lng: bias.lng },
      radius: 50000,
    }
  }

  try {
    const response = await Place.searchByText(request)
    const places = response.places ?? []

    return places
      .map((place) => {
        const coords = readLatLng(place.location)
        if (!coords) return null

        return {
          name: readDisplayName(place.displayName, query),
          lat: coords.lat,
          lng: coords.lng,
          address: typeof place.formattedAddress === 'string' ? place.formattedAddress : '',
        }
      })
      .filter((item): item is GoogleTextSearchHit => item !== null)
  } catch (error) {
    console.warn('Google Place.searchByText failed:', error)
    return []
  }
}