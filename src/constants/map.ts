// 地图 API Keys（在 .env 中配置）
export const AMAP_KEY = import.meta.env.VITE_AMAP_KEY ?? ''
export const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY ?? ''

// 地图分类
export const MAP_CATEGORIES = [
  { id: 'all', label: '动态', emoji: '📍', color: '#2A9D3E' },
  { id: 'food', label: '好吃', emoji: '🍜', color: '#E85D3A' },
  { id: 'fun', label: '好玩', emoji: '🎮', color: '#4A8FE7' },
  { id: 'event', label: '活动', emoji: '🎉', color: '#9B59B6' },
  { id: 'hidden', label: '彩蛋', emoji: '🥚', color: '#F4A261' },
] as const

export type MapCategory = (typeof MAP_CATEGORIES)[number]['id']

// 地图标记点类型
export interface MapLocation {
  id: string
  name: string
  description: string
  category: MapCategory
  lat: number
  lng: number
  city: string
  country: string
  images: string[]
  author: {
    name: string
    avatar: string
  }
  likes: number
  tags: string[]
  createdAt: string
}

// 中国大陆边界检测（简化版）
const CHINA_BOUNDS = {
  minLng: 73.0,
  maxLng: 135.5,
  minLat: 3.0,
  maxLat: 53.5,
}

export function isInChina(lng: number, lat: number): boolean {
  return (
    lng >= CHINA_BOUNDS.minLng &&
    lng <= CHINA_BOUNDS.maxLng &&
    lat >= CHINA_BOUNDS.minLat &&
    lat <= CHINA_BOUNDS.maxLat
  )
}

// 默认中心点：清迈（游民热门城市）
export const DEFAULT_CENTER = { lat: 18.7883, lng: 98.9853 }
export const DEFAULT_ZOOM = 13
