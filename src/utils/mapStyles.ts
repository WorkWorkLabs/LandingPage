/**
 * 手绘风地图样式 — 高德 StyleJSON / Google Styled Maps / CARTO 瓦片
 */

export const HAND_DRAWN_PAGE_BACKGROUND = '#F8F5F0'

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

type HandDrawnPalette = {
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

const HAND_DRAWN_PALETTE: HandDrawnPalette = {
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
}

function buildAmapStyle(palette: HandDrawnPalette): AmapStyleRule[] {
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

function buildGoogleStyle(palette: HandDrawnPalette): GoogleStyleRule[] {
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

const CARTO_VARIANT = 'light_all'
const AMAP_TILE_STYLE = '8'

export function getGoogleMapStyle(): GoogleStyleRule[] {
  return buildGoogleStyle(HAND_DRAWN_PALETTE)
}

export function getAmapMapStyle(): AmapStyleRule[] {
  return buildAmapStyle(HAND_DRAWN_PALETTE)
}

export function getCartoVariant(): string {
  return CARTO_VARIANT
}

export function getAmapTileStyleParam(): string {
  return AMAP_TILE_STYLE
}

export const GOOGLE_MAPS_HAND_DRAWN_STYLE = getGoogleMapStyle()
export const AMAP_HAND_DRAWN_STYLE = getAmapMapStyle()