import { computed, ref } from 'vue'
import { isInChina } from '@/constants/map'
import {
  type MapRegionMode,
  getBaseMapLabel,
  getRegionLabel,
  persistMapRegion,
  readStoredMapRegion,
} from '@/utils/mapProviders'

const mapRegion = ref<MapRegionMode>(readStoredMapRegion() ?? 'global')
const regionMenuOpen = ref(false)
let regionPreferenceLocked = Boolean(readStoredMapRegion())

export function useMapRegion() {
  const regionLabel = computed(() => getRegionLabel(mapRegion.value))
  const baseMapLabel = computed(() => getBaseMapLabel(mapRegion.value))
  /** @deprecated 使用 baseMapLabel */
  const providerLabel = baseMapLabel
  const isChinaMode = computed(() => mapRegion.value === 'china')

  function setMapRegion(mode: MapRegionMode, persist = true) {
    mapRegion.value = mode
    if (persist) {
      regionPreferenceLocked = true
      persistMapRegion(mode)
    }
  }

  function toggleRegionMenu() {
    regionMenuOpen.value = !regionMenuOpen.value
  }

  function closeRegionMenu() {
    regionMenuOpen.value = false
  }

  function applyRegionFromCoords(lat: number, lng: number) {
    if (regionPreferenceLocked) return
    setMapRegion(isInChina(lng, lat) ? 'china' : 'global', false)
  }

  return {
    mapRegion,
    regionMenuOpen,
    regionLabel,
    baseMapLabel,
    providerLabel,
    isChinaMode,
    setMapRegion,
    toggleRegionMenu,
    closeRegionMenu,
    applyRegionFromCoords,
  }
}