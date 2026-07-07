import L from 'leaflet'

export type TileFallbackEntry = {
  id: string
  label: string
  create: () => L.Layer
}

export type MountedTileLayer = {
  readonly layer: L.Layer
  readonly label: string
  destroy: () => void
}

const TILE_ERROR_THRESHOLD = 4

export function mountTileLayerWithFallback(
  map: L.Map,
  entries: TileFallbackEntry[],
  onSwitch?: (label: string) => void
): MountedTileLayer {
  if (!entries.length) {
    throw new Error('mountTileLayerWithFallback requires at least one entry')
  }

  let index = 0
  let errorCount = 0
  let currentLayer: L.Layer = entries[0].create()
  let currentLabel = entries[0].label
  const handlers = new Map<L.Layer, () => void>()

  const switchTo = (nextIndex: number) => {
    if (nextIndex === index || nextIndex >= entries.length) return

    const prevHandler = handlers.get(currentLayer)
    if (prevHandler) currentLayer.off('tileerror', prevHandler)
    if (map.hasLayer(currentLayer)) map.removeLayer(currentLayer)

    index = nextIndex
    errorCount = 0
    currentLayer = entries[index].create()
    currentLabel = entries[index].label
    currentLayer.addTo(map)
    attachErrorHandler(currentLayer)
    onSwitch?.(currentLabel)
  }

  const attachErrorHandler = (layer: L.Layer) => {
    const handler = () => {
      if (layer !== currentLayer) return
      errorCount += 1
      if (errorCount >= TILE_ERROR_THRESHOLD) {
        switchTo(index + 1)
      }
    }
    handlers.set(layer, handler)
    layer.on('tileerror', handler)
  }

  currentLayer.addTo(map)
  attachErrorHandler(currentLayer)
  onSwitch?.(currentLabel)

  return {
    get layer() {
      return currentLayer
    },
    get label() {
      return currentLabel
    },
    destroy() {
      handlers.forEach((handler, layer) => {
        layer.off('tileerror', handler)
        if (map.hasLayer(layer)) map.removeLayer(layer)
      })
      handlers.clear()
    },
  }
}