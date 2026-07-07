import { computed, ref } from 'vue'
import {
  MAP_THEMES,
  getMapThemeMeta,
  persistMapTheme,
  readStoredMapTheme,
  type MapThemeId,
} from '@/utils/mapStyles'

const mapTheme = ref<MapThemeId>(readStoredMapTheme() ?? 'journal')

export function useMapTheme() {
  const themeMeta = computed(() => getMapThemeMeta(mapTheme.value))
  const themeLabel = computed(() => themeMeta.value.label)

  function setMapTheme(theme: MapThemeId) {
    mapTheme.value = theme
    persistMapTheme(theme)
  }

  return {
    mapTheme,
    themeMeta,
    themeLabel,
    mapThemes: MAP_THEMES,
    setMapTheme,
  }
}