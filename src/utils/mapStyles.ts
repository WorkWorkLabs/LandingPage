/**
 * 地图视觉主题 — 高德 StyleJSON / Google Styled Maps / CARTO 瓦片
 */

export type MapThemeId = 'journal' | 'sky' | 'sketch' | 'coastal' | 'mint' | 'night'

export const MAP_THEME_STORAGE_KEY = 'workwork-map-theme'

export type MapThemeMeta = {
  id: MapThemeId
  label: string
  description: string
  emoji: string
  preview: string
  pageBackground: string
  showPaperOverlay: boolean
}

export const MAP_THEMES: MapThemeMeta[] = [
  {
    id: 'journal',
    label: '手绘旅册',
    description: '暖纸底色，旅行手帐感',
    emoji: '📓',
    preview: '#F8F5F0',
    pageBackground: '#F8F5F0',
    showPaperOverlay: true,
  },
  {
    id: 'sky',
    label: '晴空漫游',
    description: '品牌天蓝，开阔自由',
    emoji: '☁️',
    preview: '#B8DCF0',
    pageBackground: '#F7F9FB',
    showPaperOverlay: false,
  },
  {
    id: 'sketch',
    label: '纸本素描',
    description: '极简留白，据点突出',
    emoji: '✏️',
    preview: '#E8EEF2',
    pageBackground: '#FAFAF8',
    showPaperOverlay: true,
  },
  {
    id: 'coastal',
    label: '地中海午后',
    description: '沙米暖色，海岸旅居',
    emoji: '🌊',
    preview: '#E8DDD0',
    pageBackground: '#F5F0E8',
    showPaperOverlay: true,
  },
  {
    id: 'mint',
    label: '薄荷绿洲',
    description: '清新绿意，适合办公',
    emoji: '🌿',
    preview: '#B8E0C8',
    pageBackground: '#F5F8F5',
    showPaperOverlay: false,
  },
  {
    id: 'night',
    label: '夜景漫游',
    description: '深色底图，夜间规划',
    emoji: '🌙',
    preview: '#2A3F5F',
    pageBackground: '#1E2430',
    showPaperOverlay: false,
  },
]

const THEME_IDS = new Set<MapThemeId>(MAP_THEMES.map((t) => t.id))

export function readStoredMapTheme(): MapThemeId | null {
  if (typeof window === 'undefined') return null
  const value = localStorage.getItem(MAP_THEME_STORAGE_KEY)
  return THEME_IDS.has(value as MapThemeId) ? (value as MapThemeId) : null
}

export function persistMapTheme(theme: MapThemeId): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(MAP_THEME_STORAGE_KEY, theme)
}

export function getMapThemeMeta(theme: MapThemeId): MapThemeMeta {
  return MAP_THEMES.find((t) => t.id === theme) ?? MAP_THEMES[0]
}

type AmapStyleRule = {
  featureType: string
  elementType?: string
  stylers: Record<string, string | number>[]
}

type GoogleStyleRule = {
  featureType?: string
  elementType?: string
  stylers: Record<string, string | number | boolean>[]
}

type ThemePalette = {
  land: string
  water: string
  highway: string
  arterial: string
  local: string
  building: string
  park: string
  poiGeom: string
  label: string
  roadLabel: string
  adminLabel: string
  simplifyPoi: boolean
  hideTransit: boolean
}

const PALETTES: Record<MapThemeId, ThemePalette> = {
  journal: {
    land: '#F8F5F0',
    water: '#D4E6EC',
    highway: '#E8DFD4',
    arterial: '#EDE8E0',
    local: '#F0EDE7',
    building: '#E8E3DB',
    park: '#E2EDDA',
    poiGeom: '#EDEAE4',
    label: '#999999',
    roadLabel: '#A0A0A0',
    adminLabel: '#B0A89C',
    simplifyPoi: true,
    hideTransit: true,
  },
  sky: {
    land: '#F7F9FB',
    water: '#B8DCF0',
    highway: '#FFFFFF',
    arterial: '#E8F4FC',
    local: '#F0F7FC',
    building: '#EEF4F8',
    park: '#D4F0E4',
    poiGeom: '#E8F2F8',
    label: '#8C8C8C',
    roadLabel: '#84C6E9',
    adminLabel: '#48A9DE',
    simplifyPoi: true,
    hideTransit: true,
  },
  sketch: {
    land: '#FAFAF8',
    water: '#E8EEF2',
    highway: '#E5E0D8',
    arterial: '#ECEAE6',
    local: '#F2F0EC',
    building: '#EFEFEC',
    park: '#E8EDE8',
    poiGeom: '#F0F0EE',
    label: '#595959',
    roadLabel: '#B0B0B0',
    adminLabel: '#8C8C8C',
    simplifyPoi: true,
    hideTransit: true,
  },
  coastal: {
    land: '#F5F0E8',
    water: '#7EC8E3',
    highway: '#D4C4B0',
    arterial: '#E0D6C8',
    local: '#EDE8E0',
    building: '#E8DDD0',
    park: '#C8E6C9',
    poiGeom: '#E8E0D4',
    label: '#8C7B6B',
    roadLabel: '#A89888',
    adminLabel: '#B0A090',
    simplifyPoi: true,
    hideTransit: true,
  },
  mint: {
    land: '#F5F8F5',
    water: '#C5E8F0',
    highway: '#E0E8E0',
    arterial: '#E8EEE8',
    local: '#F0F4F0',
    building: '#EEF2EE',
    park: '#B8E0C8',
    poiGeom: '#E8F0EA',
    label: '#6B8C7B',
    roadLabel: '#9AB0A0',
    adminLabel: '#7DAF8C',
    simplifyPoi: true,
    hideTransit: true,
  },
  night: {
    land: '#1E2430',
    water: '#2A3F5F',
    highway: '#3A4555',
    arterial: '#323C4C',
    local: '#2A3340',
    building: '#252D3A',
    park: '#243528',
    poiGeom: '#2A3038',
    label: '#8C8C8C',
    roadLabel: '#6B7A8C',
    adminLabel: '#48A9DE',
    simplifyPoi: true,
    hideTransit: true,
  },
}

function buildAmapStyle(palette: ThemePalette): AmapStyleRule[] {
  const poiLabelVisibility = palette.simplifyPoi ? 'simplified' : 'on'
  return [
    { featureType: 'land', elementType: 'geometry', stylers: [{ color: palette.land }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: palette.water }] },
    { featureType: 'highway', elementType: 'geometry', stylers: [{ color: palette.highway }, { weight: 1.5 }] },
    { featureType: 'arterial', elementType: 'geometry', stylers: [{ color: palette.arterial }, { weight: 1 }] },
    { featureType: 'local', elementType: 'geometry', stylers: [{ color: palette.local }, { weight: 0.8 }] },
    { featureType: 'railway', elementType: 'geometry', stylers: [{ color: palette.arterial }, { weight: 1 }] },
    { featureType: 'subway', elementType: 'geometry', stylers: [{ visibility: palette.hideTransit ? 'off' : 'on' }] },
    { featureType: 'building', elementType: 'geometry', stylers: [{ color: palette.building }] },
    { featureType: 'green', elementType: 'geometry', stylers: [{ color: palette.park }] },
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: poiLabelVisibility }, { color: palette.label }],
    },
    { featureType: 'road', elementType: 'labels', stylers: [{ color: palette.roadLabel }, { weight: 0.8 }] },
    { featureType: 'administrative', elementType: 'labels', stylers: [{ color: palette.adminLabel }, { weight: 1.2 }] },
    { featureType: 'label', elementType: 'labels', stylers: [{ color: palette.label }] },
  ]
}

function buildGoogleStyle(palette: ThemePalette): GoogleStyleRule[] {
  const poiLabelVisibility = palette.simplifyPoi ? 'simplified' : 'on'
  const rules: GoogleStyleRule[] = [
    { featureType: 'landscape', stylers: [{ color: palette.land }] },
    { featureType: 'water', stylers: [{ color: palette.water }] },
    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: palette.highway }, { weight: 1.5 }] },
    { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: palette.arterial }, { weight: 1 }] },
    { featureType: 'road.local', elementType: 'geometry', stylers: [{ color: palette.local }, { weight: 0.8 }] },
    { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: poiLabelVisibility }, { color: palette.label }] },
    { featureType: 'poi.park', stylers: [{ color: palette.park }] },
    { featureType: 'poi', elementType: 'geometry', stylers: [{ color: palette.poiGeom }] },
    { featureType: 'administrative', elementType: 'labels', stylers: [{ color: palette.adminLabel }] },
    { featureType: 'road', elementType: 'labels', stylers: [{ color: palette.roadLabel }] },
  ]
  if (palette.hideTransit) {
    rules.push({ featureType: 'transit', stylers: [{ visibility: 'off' }] })
  }
  return rules
}

const CARTO_VARIANTS: Record<MapThemeId, string> = {
  journal: 'light_all',
  sky: 'voyager',
  sketch: 'positron_nolabels',
  coastal: 'voyager_nolabels',
  mint: 'light_nolabels',
  night: 'dark_all',
}

/** 高德栅格瓦片 style 参数（无 JS API 时的近似） */
const AMAP_TILE_STYLE: Record<MapThemeId, string> = {
  journal: '8',
  sky: '8',
  sketch: '8',
  coastal: '8',
  mint: '8',
  night: '8',
}

export function getGoogleMapStyle(theme: MapThemeId): GoogleStyleRule[] {
  return buildGoogleStyle(PALETTES[theme] ?? PALETTES.journal)
}

export function getAmapMapStyle(theme: MapThemeId): AmapStyleRule[] {
  return buildAmapStyle(PALETTES[theme] ?? PALETTES.journal)
}

export function getCartoVariant(theme: MapThemeId): string {
  return CARTO_VARIANTS[theme] ?? CARTO_VARIANTS.journal
}

export function getAmapTileStyleParam(theme: MapThemeId): string {
  return AMAP_TILE_STYLE[theme] ?? '8'
}

/** @deprecated 使用 getGoogleMapStyle('journal') */
export const GOOGLE_MAPS_HAND_DRAWN_STYLE = getGoogleMapStyle('journal')

/** @deprecated 使用 getAmapMapStyle('journal') */
export const AMAP_HAND_DRAWN_STYLE = getAmapMapStyle('journal')