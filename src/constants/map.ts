// 地图 API Keys（在 .env 中配置）
export const AMAP_KEY = import.meta.env.VITE_AMAP_KEY ?? ''
export const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY ?? ''

// 地图分类（数字游民生活场景）
export const MAP_CATEGORIES = [
  { id: 'all', label: '全部', emoji: '📍', color: '#2A9D3E' },
  { id: 'work', label: '办公', emoji: '💻', color: '#2E86AB' },
  { id: 'cafe', label: '咖啡', emoji: '☕', color: '#8B5E3C' },
  { id: 'stay', label: '住宿', emoji: '🏨', color: '#6C5CE7' },
  { id: 'food', label: '美食', emoji: '🍜', color: '#E85D3A' },
  { id: 'community', label: '社群', emoji: '🤝', color: '#00B894' },
  { id: 'event', label: '活动', emoji: '🎉', color: '#9B59B6' },
  { id: 'life', label: '生活', emoji: '🛒', color: '#636E72' },
  { id: 'outdoor', label: '户外', emoji: '🌿', color: '#27AE60' },
  { id: 'fitness', label: '运动', emoji: '💪', color: '#E17055' },
  { id: 'fun', label: '玩乐', emoji: '🎮', color: '#4A8FE7' },
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

export { isInChina } from '@/utils/geoBounds'

// 默认中心点：清迈（游民热门城市）
export const DEFAULT_CENTER = { lat: 18.7883, lng: 98.9853 }
export const DEFAULT_ZOOM = 13
