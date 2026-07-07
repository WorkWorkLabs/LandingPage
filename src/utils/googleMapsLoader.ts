import { runtimeConfig } from '@/config/app'

let mapsScriptPromise: Promise<boolean> | null = null

export function loadGoogleMapsJs(): Promise<boolean> {
  const key = runtimeConfig.maps.googleMapsKey
  if (!key) return Promise.resolve(false)

  if (typeof window === 'undefined') return Promise.resolve(false)
  if (window.google?.maps?.Map) return Promise.resolve(true)

  if (!mapsScriptPromise) {
    mapsScriptPromise = new Promise((resolve) => {
      const callbackName = '__workworkGmapsReady'
      ;(window as Window & { [key: string]: () => void })[callbackName] = () => {
        resolve(Boolean(window.google?.maps?.Map))
      }

      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&callback=${callbackName}`
      script.async = true
      script.defer = true
      script.onerror = () => {
        mapsScriptPromise = null
        resolve(false)
      }
      document.head.appendChild(script)

      window.setTimeout(() => {
        if (!window.google?.maps?.Map) {
          mapsScriptPromise = null
          resolve(false)
        }
      }, 12000)
    })
  }

  return mapsScriptPromise
}