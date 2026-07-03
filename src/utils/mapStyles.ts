/**
 * 手绘风格地图样式配置
 * AMap 和 Google Maps 各自使用不同的样式定义格式
 */

// ============================================
// 高德地图手绘风格（AMap v2.0 自定义样式）
// ============================================
export const AMAP_HAND_DRAWN_STYLE = [
  {
    featureType: 'land',
    elementType: 'geometry',
    stylers: [{ color: '#F8F5F0' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#D4E6EC' }],
  },
  {
    featureType: 'highway',
    elementType: 'geometry',
    stylers: [{ color: '#E8DFD4' }, { weight: 1.5 }],
  },
  {
    featureType: 'arterial',
    elementType: 'geometry',
    stylers: [{ color: '#EDE8E0' }, { weight: 1 }],
  },
  {
    featureType: 'local',
    elementType: 'geometry',
    stylers: [{ color: '#F0EDE7' }, { weight: 0.8 }],
  },
  {
    featureType: 'railway',
    elementType: 'geometry',
    stylers: [{ color: '#D4CFC7' }, { weight: 1 }],
  },
  {
    featureType: 'subway',
    elementType: 'geometry',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'building',
    elementType: 'geometry',
    stylers: [{ color: '#E8E3DB' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels',
    stylers: [{ visibility: 'simplified' }, { color: '#8C8C8C' }],
  },
  {
    featureType: 'road',
    elementType: 'labels',
    stylers: [{ color: '#A0A0A0' }, { weight: 0.8 }],
  },
  {
    featureType: 'administrative',
    elementType: 'labels',
    stylers: [{ color: '#B0A89C' }, { weight: 1.2 }],
  },
  {
    featureType: 'poilabel',
    elementType: 'labels',
    stylers: [{ visibility: 'simplified' }],
  },
  {
    featureType: 'label',
    elementType: 'labels',
    stylers: [{ color: '#999999' }],
  },
]

// ============================================
// Google Maps 手绘风格（styled maps JSON）
// ============================================
export const GOOGLE_MAPS_HAND_DRAWN_STYLE = [
  { featureType: 'landscape', stylers: [{ color: '#F8F5F0' }] },
  { featureType: 'water', stylers: [{ color: '#D4E6EC' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#E8DFD4' }, { weight: 1.5 }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#EDE8E0' }, { weight: 1 }] },
  { featureType: 'road.local', elementType: 'geometry', stylers: [{ color: '#F0EDE7' }, { weight: 0.8 }] },
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'simplified' }, { color: '#8C8C8C' }] },
  { featureType: 'poi.park', stylers: [{ color: '#E2EDDA' }] },
  { featureType: 'administrative', elementType: 'labels', stylers: [{ color: '#B0A89C' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'labels', stylers: [{ color: '#A0A0A0' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#EDEAE4' }] },
]
