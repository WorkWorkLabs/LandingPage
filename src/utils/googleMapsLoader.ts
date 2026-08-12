import { runtimeConfig } from '@/config/app'

const LOAD_TIMEOUT_MS = 8000

let mapsScriptPromise: Promise<boolean> | null = null

export function loadGoogleMapsJs(options: { places?: boolean } = {}): Promise<boolean> {
  const key = runtimeConfig.maps.googleMapsKey
  if (!key) return Promise.resolve(false)

  if (typeof window === 'undefined') return Promise.resolve(false)

  if (window.google?.maps?.Map) {
    return Promise.resolve(true)
  }

  if (!mapsScriptPromise) {
    mapsScriptPromise = new Promise((resolve) => {
      let settled = false
      const finish = (ok: boolean) => {
        if (settled) return
        settled = true
        if (!ok) mapsScriptPromise = null
        resolve(ok)
      }

      const callbackName = '__workworkGmapsReady'
      ;(window as Window & { [key: string]: () => void })[callbackName] = () => {
        finish(Boolean(window.google?.maps?.Map))
      }

      void options
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&v=weekly&loading=async&callback=${callbackName}`
      script.async = true
      script.defer = true
      script.onerror = () => finish(false)
      document.head.appendChild(script)

      window.setTimeout(() => finish(Boolean(window.google?.maps?.Map)), LOAD_TIMEOUT_MS)
    })
  }

  return mapsScriptPromise
}