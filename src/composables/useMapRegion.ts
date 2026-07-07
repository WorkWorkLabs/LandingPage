import { computed, ref } from 'vue'
import { isInChina } from '@/constants/map'
import {
  type MapRegionMode,
  getProviderLabel,
  getRegionLabel,
  persistMapRegion,
  readStoredMapRegion,
} from '@/utils/mapProviders'

const mapRegion = ref<MapRegionMode>(readStoredMapRegion() ?? 'global')
const regionMenuOpen = ref(false)
let regionPreferenceLocked = Boolean(readStoredMapRegion())

export function useMapRegion() {
  const regionLabel = computed(() => getRegionLabel(mapRegion.value))
  const providerLabel = computed(() => getProviderLabel(mapRegion.value))
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
    providerLabel,
    isChinaMode,
    setMapRegion,
    toggleRegionMenu,
    closeRegionMenu,
    applyRegionFromCoords,
  }
}