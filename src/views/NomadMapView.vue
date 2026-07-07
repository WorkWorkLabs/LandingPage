<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  MAP_CATEGORIES,
  DEFAULT_ZOOM,
  type MapLocation,
  type MapCategory,
} from '@/constants/map'
import { useMapRegion } from '@/composables/useMapRegion'
import { runtimeConfig } from '@/config/app'
import {
  createBaseLayerForRegion,
  fromMapDisplayCoords,
  getDefaultCenterForRegion,
  getInitialZoom,
  getSearchProviderForRegion,
  toMapDisplayCoords,
  type MapRegionMode,
} from '@/utils/mapProviders'
import { createNomadSpot, fetchActiveNomadSpots, updateNomadSpotRegion } from '@/services/nomadSpots'
import type { NomadSpot } from '@/types/database'
import {
  geocode,
  reverseGeocode,
  resolveLocation,
  searchPlaces,
  type PlaceSearchResult,
} from '@/utils/locationParser'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'

const router = useRouter()
const authStore = useAuthStore()
const {
  mapRegion,
  regionMenuOpen,
  regionLabel,
  providerLabel,
  setMapRegion,
  toggleRegionMenu,
  closeRegionMenu,
  applyRegionFromCoords,
} = useMapRegion()

// ============================================
// 状态
// ============================================
const mapContainer = ref<HTMLElement | null>(null)
const activeCategory = ref<MapCategory>('all')
const searchQuery = ref('')
const selectedLocation = ref<MapLocation | null>(null)
const showDetail = ref(false)
const showAddSpot = ref(false)
const mapReady = ref(false)
const mapInitializing = ref(true)
const mapLoading = ref(false)
const mapError = ref('')
const locating = ref(false)
const locationError = ref('')
const userLocation = ref<{ lat: number; lng: number } | null>(null)
const savingSpot = ref(false)
const addSpotError = ref('')
const addSpotName = ref('')
const addSpotDescription = ref('')
const addSpotCategory = ref<MapCategory>('work')
const addSpotLat = ref(getDefaultCenterForRegion(mapRegion.value).lat)
const addSpotLng = ref(getDefaultCenterForRegion(mapRegion.value).lng)

// 用于外部地图搜索
const searchName = ref('')

// 搜索提供商和结果（随国内/国外模式自动切换）
const searchProvider = computed(() => getSearchProviderForRegion(mapRegion.value))
const searchResults = ref<PlaceSearchResult[]>([])
const searchEmpty = ref(false)
const isSearching = ref(false)
const detailRegionLoading = ref(false)
const showLoginReminder = ref(false)
const switchingRegion = ref(false)

const hasGoogleMapsKey = computed(() => Boolean(runtimeConfig.maps.googleMapsKey))
const hasAmapKey = computed(() => Boolean(runtimeConfig.maps.amapKey))

const searchEmptyMessage = computed(() => {
  if (mapRegion.value === 'china') {
    return hasAmapKey.value
      ? '未找到相关地点。可尝试更简短的关键词、补充城市名，或粘贴高德/百度地图分享链接。'
      : '未找到相关地点。请配置高德 Key，或粘贴地图分享链接。'
  }

  return hasGoogleMapsKey.value
    ? '未找到相关地点。可尝试更简短的关键词、补充城市或地区名，也可以直接粘贴 Google 地图分享链接。'
    : '未找到相关地点。请配置 Google Maps Key，或粘贴 Google 地图分享链接。'
})

const searchHintMessage = computed(() => {
  if (mapRegion.value === 'china') {
    return '当前使用高德地图搜索中国大陆地点，也可直接粘贴地图链接。'
  }
  return '当前使用 Google Maps 搜索海外地点，也可直接粘贴 Google 地图分享链接。'
})

function displayLatLng(lat: number, lng: number): [number, number] {
  return toMapDisplayCoords(lat, lng, mapRegion.value)
}

const regionResolveCache = new Map<string, { city: string; country: string }>()
let loginReminderTimer: number | null = null

// 添加地点方式：地图搜索 | 地图选点
const addLocationMode = ref<'search' | 'click'>('search')
let addPreviewMarker: L.Marker | null = null
let mapInstance: L.Map | null = null
let baseTileLayer: L.Layer | null = null
let markerGroup: L.LayerGroup | null = null
let userLocationMarker: L.CircleMarker | null = null
let mapResizeObserver: ResizeObserver | null = null
let mapRefreshTimer: number | null = null
let markerRefreshFrame: number | null = null

function isValidCoord(lat: number, lng: number): boolean {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180 &&
    !(lat === 0 && lng === 0)
  )
}

function refreshMapTiles() {
  if (!mapInstance) return

  if (mapRefreshTimer) {
    window.clearTimeout(mapRefreshTimer)
  }

  mapRefreshTimer = window.setTimeout(() => {
    mapRefreshTimer = null
    if (!mapInstance) return
    mapInstance.invalidateSize({ animate: false, pan: false })
    if (baseTileLayer && 'redraw' in baseTileLayer && typeof baseTileLayer.redraw === 'function') {
      baseTileLayer.redraw()
    }
  }, 32)
}

function focusMapOnPoint(lat: number, lng: number, zoom = 16, animate = true) {
  if (!mapInstance || !isValidCoord(lat, lng)) return

  const [dLat, dLng] = displayLatLng(lat, lng)
  const targetZoom = Math.min(zoom, mapInstance.getMaxZoom())

  const onMoveComplete = () => {
    refreshMapTiles()
  }

  if (animate) {
    mapInstance.flyTo([dLat, dLng], targetZoom, { duration: 0.6 })
    mapInstance.once('moveend', onMoveComplete)
    window.setTimeout(onMoveComplete, 800)
  } else {
    mapInstance.setView([dLat, dLng], targetZoom)
    void nextTick(onMoveComplete)
  }
}

// ============================================
// 模拟数据（后续从 Supabase 加载）
// ============================================
const locations = ref<MapLocation[]>([
  {
    id: '1',
    name: 'Calm Cafe & Workspace',
    description: '清迈古城内最受欢迎的数字游民工作空间，WiFi 稳定，咖啡好喝，插座充足。',
    category: 'cafe',
    lat: 18.7883,
    lng: 98.9853,
    city: '清迈',
    country: '泰国',
    images: ['https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&auto=format&q=75'],
    author: { name: '小明', avatar: '' },
    likes: 42,
    tags: ['咖啡', '办公', 'WiFi'],
    createdAt: '2025-06-15',
  },
  {
    id: '2',
    name: '宁曼路共享办公',
    description: '清迈宁曼路上的联合办公空间，月卡 3500 泰铢，24 小时开放。',
    category: 'work',
    lat: 18.7953,
    lng: 98.9693,
    city: '清迈',
    country: '泰国',
    images: ['https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&q=75'],
    author: { name: '阿花', avatar: '' },
    likes: 28,
    tags: ['办公', '24h', '月卡'],
    createdAt: '2025-06-10',
  },
  {
    id: '3',
    name: '素帖山日落观景台',
    description: '清迈最佳日落观赏点，适合傍晚收工后放松。',
    category: 'outdoor',
    lat: 18.7723,
    lng: 98.9693,
    city: '清迈',
    country: '泰国',
    images: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&auto=format&q=75'],
    author: { name: '旅人A', avatar: '' },
    likes: 65,
    tags: ['日落', '免费', '风景'],
    createdAt: '2025-06-08',
  },
  {
    id: '4',
    name: '周末夜市美食街',
    description: '每周六晚的游民聚会点，各种泰北美食，人均 50-100 泰铢。',
    category: 'event',
    lat: 18.7863,
    lng: 98.9883,
    city: '清迈',
    country: '泰国',
    images: ['https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&q=75'],
    author: { name: '美食家', avatar: '' },
    likes: 38,
    tags: ['夜市', '聚会', '便宜'],
    createdAt: '2025-06-05',
  },
  {
    id: '5',
    name: '上海武康路咖啡馆',
    description: '武康路上适合远程办公的安静咖啡馆，拿铁 32 元。',
    category: 'cafe',
    lat: 31.2089,
    lng: 121.4378,
    city: '上海',
    country: '中国',
    images: ['https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=600&auto=format&q=75'],
    author: { name: '沪漂', avatar: '' },
    likes: 19,
    tags: ['咖啡', '安静', '上海'],
    createdAt: '2025-06-12',
  },
  {
    id: '6',
    name: '巴厘岛 Canggu 联合办公',
    description: 'Canggu 最热门的游民办公空间，泳池+健身房，月卡 $150。',
    category: 'work',
    lat: -8.6478,
    lng: 115.1385,
    city: 'Canggu',
    country: '印尼',
    images: ['https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&auto=format&q=75'],
    author: { name: 'Digital Nomad', avatar: '' },
    likes: 87,
    tags: ['办公', '泳池', '月卡'],
    createdAt: '2025-06-01',
  },
])

// ============================================
// 过滤后的标记点
// ============================================
const filteredLocations = computed(() => {
  return locations.value.filter((loc) => {
    const matchCategory = activeCategory.value === 'all' || loc.category === activeCategory.value
    const matchSearch =
      !searchQuery.value ||
      loc.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      loc.city.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      loc.tags.some((t) => t.includes(searchQuery.value))
    return matchCategory && matchSearch
  })
})

const spotCategories = computed(() => MAP_CATEGORIES.filter((cat) => cat.id !== 'all'))

// ============================================
// 获取用户位置
// ============================================
function getUserLocation(): Promise<{ lat: number; lng: number } | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude })
      },
      () => resolve(null),
      {
        timeout: 5000,
        maximumAge: 120000,
        enableHighAccuracy: false,
      }
    )
  })
}

function setUserLocationMarker(pos: { lat: number; lng: number }) {
  if (!mapInstance) return

  const [dLat, dLng] = displayLatLng(pos.lat, pos.lng)

  if (!userLocationMarker) {
    userLocationMarker = L.circleMarker([dLat, dLng], {
      radius: 9,
      color: '#ffffff',
      weight: 3,
      fillColor: '#2A9D3E',
      fillOpacity: 1,
      opacity: 1,
    })
      .bindTooltip('我的位置', {
        direction: 'top',
        offset: [0, -10],
        opacity: 0.9,
      })
      .addTo(mapInstance)
  } else {
    userLocationMarker.setLatLng([dLat, dLng])
  }
}

async function locateMe(options: { animate?: boolean } = {}) {
  if (!mapInstance || locating.value) return

  locating.value = true
  locationError.value = ''

  const pos = await getUserLocation()
  locating.value = false

  if (!pos) {
    locationError.value = '无法获取你的位置'
    return
  }

  userLocation.value = pos
  applyRegionFromCoords(pos.lat, pos.lng)
  setUserLocationMarker(pos)

  const [dLat, dLng] = displayLatLng(pos.lat, pos.lng)
  const targetZoom = Math.max(mapInstance.getZoom(), runtimeConfig.maps.userZoom)
  if (options.animate) {
    mapInstance.flyTo([dLat, dLng], targetZoom, { duration: 0.8 })
    mapInstance.once('moveend', refreshMapTiles)
  } else {
    mapInstance.setView([dLat, dLng], targetZoom)
    refreshMapTiles()
  }
}

// 点击地图任意位置设置添加坐标（仅地图选点模式生效）
function handleMapClickForAdd(e: L.LeafletMouseEvent) {
  if (!showAddSpot.value || addLocationMode.value !== 'click') return

  const wgs = fromMapDisplayCoords(e.latlng.lat, e.latlng.lng, mapRegion.value)
  addSpotLat.value = Number(wgs.lat.toFixed(6))
  addSpotLng.value = Number(wgs.lng.toFixed(6))
  addSpotError.value = ''
  updateAddPreviewMarker()
}

function updateAddPreviewMarker() {
  if (!mapInstance) return

  const [dLat, dLng] = displayLatLng(addSpotLat.value, addSpotLng.value)

  if (addPreviewMarker) {
    addPreviewMarker.setLatLng([dLat, dLng])
  } else {
    addPreviewMarker = L.marker([dLat, dLng], {
      icon: L.divIcon({
        className: 'add-preview-marker',
        html: `
          <div style="
            width: 36px; height: 36px;
            border-radius: 50%;
            border: 3px solid #48A9DE;
            background: rgba(72,169,222,0.2);
            display: flex; align-items: center; justify-content: center;
            font-size: 20px;
            box-shadow: 0 2px 8px rgba(72,169,222,0.5);
          ">
            📍
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36]
      }),
      interactive: false
    }).addTo(mapInstance)
  }
}

function removeAddPreviewMarker() {
  if (addPreviewMarker && mapInstance) {
    mapInstance.removeLayer(addPreviewMarker)
    addPreviewMarker = null
  }
}

function setAddMode(mode: 'search' | 'click') {
  addLocationMode.value = mode
  addSpotError.value = mode === 'click' ? '请在地图上点击选取位置' : ''
  if (showAddSpot.value) {
    updateAddPreviewMarker()
  }
  syncMapPickMode()
}

function syncMapPickMode() {
  if (!mapInstance) return

  mapInstance.off('click', handleMapClickForAdd)
  if (showAddSpot.value && addLocationMode.value === 'click') {
    mapInstance.on('click', handleMapClickForAdd)
  }
}

// ============================================
// Leaflet 地图初始化
// ============================================
function ensureMarkerPaneOnTop() {
  if (!mapInstance) return

  const panes = ['tilePane', 'overlayPane', 'markerPane', 'tooltipPane', 'popupPane'] as const
  const zIndexes = [200, 400, 650, 700, 800]

  panes.forEach((pane, index) => {
    const el = mapInstance!.getPane(pane)
    if (el) el.style.zIndex = String(zIndexes[index])
  })

  markerGroup?.bringToFront()
}

async function swapBaseLayer(mode: MapRegionMode) {
  if (!mapInstance) return

  if (baseTileLayer) {
    mapInstance.removeLayer(baseTileLayer)
    baseTileLayer = null
  }

  const layer = await createBaseLayerForRegion(mode)
  baseTileLayer = layer
  layer.addTo(mapInstance)
  ensureMarkerPaneOnTop()
}

async function switchMapRegion(mode: MapRegionMode) {
  if (mode === mapRegion.value || switchingRegion.value) return

  switchingRegion.value = true
  mapInitializing.value = true
  closeRegionMenu()

  setMapRegion(mode)
  searchResults.value = []
  searchEmpty.value = false

  try {
    await swapBaseLayer(mode)

    const center = getDefaultCenterForRegion(mode)
    const [dLat, dLng] = displayLatLng(center.lat, center.lng)
    mapInstance?.flyTo([dLat, dLng], getInitialZoom(), { duration: 0.7 })

    refreshMarkers()
    if (userLocation.value) setUserLocationMarker(userLocation.value)
    if (showAddSpot.value) updateAddPreviewMarker()
    void nextTick(refreshMapTiles)
  } finally {
    switchingRegion.value = false
    mapInitializing.value = false
  }
}

async function initMap() {
  if (!mapContainer.value) return

  mapInitializing.value = true
  const center = getDefaultCenterForRegion(mapRegion.value)
  const [dLat, dLng] = displayLatLng(center.lat, center.lng)
  const zoom = getInitialZoom()

  mapInstance = L.map(mapContainer.value, {
    center: [dLat, dLng],
    zoom,
    zoomControl: false,
    attributionControl: true,
    fadeAnimation: false,
  })

  await swapBaseLayer(mapRegion.value)

  // 缩放控件放右下角
  L.control.zoom({ position: 'bottomright' }).addTo(mapInstance)

  // 标记图层组
  markerGroup = L.layerGroup().addTo(mapInstance)

  // 添加标记点
  refreshMarkers()
  ensureMarkerPaneOnTop()
  mapReady.value = true
  mapInitializing.value = false

  void nextTick(refreshMapTiles)

  // 后台获取用户位置，不阻塞地图首屏
  void getUserLocation().then((userPos) => {
    if (!userPos || !mapInstance) return
    userLocation.value = userPos
    applyRegionFromCoords(userPos.lat, userPos.lng)
    void swapBaseLayer(mapRegion.value).then(() => {
      if (!mapInstance) return
      setUserLocationMarker(userPos)
      const [flyLat, flyLng] = displayLatLng(userPos.lat, userPos.lng)
      mapInstance.flyTo([flyLat, flyLng], runtimeConfig.maps.userZoom, { duration: 0.8 })
    })
  })
}

function getSpotCategory(tags: string[]): MapCategory {
  const categoryTag = tags.find((tag) => tag.startsWith('category:'))
  const category = categoryTag?.replace('category:', '')
  const match = MAP_CATEGORIES.find((cat) => cat.id === category && cat.id !== 'all')
  return match?.id ?? 'hidden'
}

function getDisplayTags(tags: string[]): string[] {
  return tags.filter((tag) => !tag.startsWith('category:'))
}

function isUnknownRegion(city?: string | null, country?: string | null): boolean {
  const cityValue = city?.trim() ?? ''
  const countryValue = country?.trim() ?? ''
  return !cityValue || cityValue === '未知城市' || !countryValue || countryValue === '未知国家'
}

function isPersistedSpot(id: string): boolean {
  return !/^\d+$/.test(id)
}

function applyLocationRegion(loc: MapLocation, city: string, country: string) {
  loc.city = city
  loc.country = country
  regionResolveCache.set(loc.id, { city, country })

  const index = locations.value.findIndex((item) => item.id === loc.id)
  if (index >= 0) {
    locations.value[index] = { ...locations.value[index], city, country }
  }

  if (selectedLocation.value?.id === loc.id) {
    selectedLocation.value = { ...selectedLocation.value, city, country }
  }
}

async function resolveLocationRegion(
  loc: MapLocation,
  provider: 'google' | 'amap' | 'baidu' = searchProvider.value
): Promise<{ city: string; country: string } | null> {
  const cached = regionResolveCache.get(loc.id)
  if (cached) return cached

  if (!Number.isFinite(loc.lat) || !Number.isFinite(loc.lng)) return null

  const result = await reverseGeocode(loc.lat, loc.lng, provider)
  if (!result || (!result.city && !result.country)) return null

  const city = result.city || loc.city
  const country = result.country || loc.country
  applyLocationRegion(loc, city, country)

  if (isPersistedSpot(loc.id)) {
    void updateNomadSpotRegion(loc.id, city, country)
  }

  return { city, country }
}

function mapSpotToLocation(spot: NomadSpot): MapLocation {
  const tags = spot.tags ?? []
  const city = spot.city?.trim() || '未知城市'
  const country = spot.country?.trim() || '未知国家'

  return {
    id: spot.id,
    name: spot.name,
    description: spot.description ?? '',
    category: getSpotCategory(tags),
    lat: Number(spot.latitude),
    lng: Number(spot.longitude),
    city,
    country,
    images: spot.images ?? [],
    author: { name: 'WorkWork 游民', avatar: '' },
    likes: Math.round(Number(spot.rating ?? 0)),
    tags: getDisplayTags(tags),
    createdAt: spot.created_at?.slice(0, 10) ?? '',
  }
}

async function loadNomadLocations() {
  mapLoading.value = true
  mapError.value = ''

  const { data, error } = await fetchActiveNomadSpots()
  mapLoading.value = false

  if (error) {
    mapError.value = `地图数据加载失败：${error}`
    return
  }

  if (data.length > 0) {
    locations.value = data.map(mapSpotToLocation)
  }
}

// ============================================
// 自定义标记图标
// ============================================
function createMarkerIcon(loc: MapLocation): L.DivIcon {
  const color = getCategoryColor(loc.category)
  const emoji = getCategoryEmoji(loc.category)

  return L.divIcon({
    className: 'nomad-marker',
    html: `
      <div style="
        width: 44px; height: 44px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 12px rgba(0,0,0,0.2);
        background: ${color};
        display: flex; align-items: center; justify-content: center;
        font-size: 18px; cursor: pointer;
        transition: transform 0.2s;
      ">
        ${emoji}
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  })
}

// ============================================
// 标记点管理
// ============================================
function refreshMarkersNow() {
  if (!markerGroup || !mapInstance) return
  markerGroup.clearLayers()

  filteredLocations.value.forEach((loc) => {
    const icon = createMarkerIcon(loc)
    const [dLat, dLng] = displayLatLng(loc.lat, loc.lng)
    const marker = L.marker([dLat, dLng], {
      icon,
      interactive: true,
      riseOnHover: true,
      riseOffset: 1000,
    })
    marker.on('click', (event) => {
      L.DomEvent.stopPropagation(event)
      void openDetail(loc)
    })
    markerGroup!.addLayer(marker)
  })
}

function refreshMarkers() {
  if (markerRefreshFrame !== null) {
    cancelAnimationFrame(markerRefreshFrame)
  }

  markerRefreshFrame = requestAnimationFrame(() => {
    markerRefreshFrame = null
    refreshMarkersNow()
  })
}

watch(filteredLocations, () => {
  refreshMarkers()
})

// 监听添加面板与选点模式，动态绑定/解绑地图点击事件
watch([showAddSpot, addLocationMode], () => {
  syncMapPickMode()
  if (showAddSpot.value) {
    window.setTimeout(refreshMapTiles, 100)
  }
})

// 坐标变化时更新预览标记
watch([addSpotLat, addSpotLng], () => {
  if (showAddSpot.value && mapInstance) {
    updateAddPreviewMarker()
  }
})

// ============================================
// 工具函数
// ============================================
function getCategoryColor(cat: MapCategory): string {
  return MAP_CATEGORIES.find((c) => c.id === cat)?.color ?? '#2A9D3E'
}

function getCategoryEmoji(cat: MapCategory): string {
  return MAP_CATEGORIES.find((c) => c.id === cat)?.emoji ?? '📍'
}

function openInGoogleMaps(loc: MapLocation) {
  const query = encodeURIComponent(loc.name || `${loc.lat},${loc.lng}`);
  const url = `https://www.google.com/maps/search/?api=1&query=${query}&query_place_id=`;
  // Simpler and reliable:
  // const url = `https://www.google.com/maps/@${loc.lat},${loc.lng},17z`;
  window.open(`https://www.google.com/maps/@${loc.lat},${loc.lng},17z`, '_blank');
}

function openInAmap(loc: MapLocation) {
  const name = encodeURIComponent(loc.name);
  const city = encodeURIComponent(loc.city || '');
  // Amap web marker link
  const url = `https://www.amap.com/search?query=${name}&city=${city}&latlng=${loc.lat},${loc.lng}`;
  window.open(url, '_blank');
}

function openInBaidu(loc: MapLocation) {
  const url = `https://map.baidu.com/search?query=${encodeURIComponent(loc.name)}&c=${encodeURIComponent(loc.city || '')}&latlng=${loc.lat},${loc.lng}`;
  window.open(url, '_blank');
}

// 使用 POI API 在页面内搜索并显示结果列表
async function searchPOI() {
  const query = searchName.value.trim()
  if (!query) return

  isSearching.value = true
  searchResults.value = []
  searchEmpty.value = false

  try {
    const center = mapInstance?.getCenter()
    const bias = {
      lat: center?.lat ?? addSpotLat.value,
      lng: center?.lng ?? addSpotLng.value,
    }

    // 支持直接粘贴 Google/高德/百度地图链接
    if (/^https?:\/\//i.test(query) || query.includes('maps.app.goo.gl') || query.includes('goo.gl/maps')) {
      const resolved = await resolveLocation(query, bias)
      if (resolved && isValidCoord(resolved.lat, resolved.lng)) {
        searchResults.value = [{
          name: resolved.name || query,
          lat: resolved.lat,
          lng: resolved.lng,
          address: '',
          source: resolved.source === 'google' || resolved.source === 'amap' || resolved.source === 'baidu'
            ? resolved.source
            : 'geocode',
        }]
        searchEmpty.value = false
        return
      }
    }

    const results = await searchPlaces(query, {
      provider: searchProvider.value as 'google' | 'amap',
      bias,
    })

    searchResults.value = results
    searchEmpty.value = results.length === 0
  } catch (e) {
    console.error('Search failed', e)
    const geo = await geocode(query)
    if (geo && isValidCoord(geo.lat, geo.lng)) {
      searchResults.value = [{
        name: geo.name || query,
        lat: geo.lat,
        lng: geo.lng,
        address: '',
        source: 'geocode',
      }]
      searchEmpty.value = false
    } else {
      searchEmpty.value = true
    }
  } finally {
    isSearching.value = false
    void nextTick(() => {
      window.setTimeout(refreshMapTiles, 50)
    })
  }
}

function selectSearchResult(result: PlaceSearchResult) {
  addSpotLat.value = result.lat;
  addSpotLng.value = result.lng;
  addSpotError.value = ''
  if (!addSpotName.value.trim()) {
    addSpotName.value = result.name;
  }
  if (Number.isFinite(result.lat) && Number.isFinite(result.lng)) {
    updateAddPreviewMarker();
    if (mapInstance) {
      const [dLat, dLng] = displayLatLng(result.lat, result.lng)
      mapInstance.flyTo([dLat, dLng], 16, { duration: 0.6 })
      mapInstance.once('moveend', refreshMapTiles)
      window.setTimeout(refreshMapTiles, 800)
    }
  }
}

async function openDetail(loc: MapLocation) {
  selectedLocation.value = loc
  showDetail.value = true

  if (isUnknownRegion(loc.city, loc.country)) {
    detailRegionLoading.value = true
    try {
      await resolveLocationRegion(loc)
    } finally {
      detailRegionLoading.value = false
    }
  }
}

function dismissLoginReminder() {
  showLoginReminder.value = false
  if (loginReminderTimer !== null) {
    window.clearTimeout(loginReminderTimer)
    loginReminderTimer = null
  }
}

function goToLogin() {
  dismissLoginReminder()
  router.push({ name: 'Login', query: { redirect: '/map' } })
}

function openAddSpotPanel() {
  if (!authStore.isAuthenticated) {
    showLoginReminder.value = true
    if (loginReminderTimer !== null) {
      window.clearTimeout(loginReminderTimer)
    }
    loginReminderTimer = window.setTimeout(dismissLoginReminder, 8000)
    return
  }

  dismissLoginReminder()

  const center = mapInstance?.getCenter()
  const fallback = getDefaultCenterForRegion(mapRegion.value)
  addSpotLat.value = center?.lat ?? userLocation.value?.lat ?? fallback.lat
  addSpotLng.value = center?.lng ?? userLocation.value?.lng ?? fallback.lng
  addSpotError.value = ''
  searchName.value = ''
  addLocationMode.value = 'search'
  searchResults.value = []
  removeAddPreviewMarker()
  showAddSpot.value = true
  updateAddPreviewMarker()
  syncMapPickMode()

  window.setTimeout(refreshMapTiles, 50)
}

function closeAddSpotPanel() {
  showAddSpot.value = false
  addSpotError.value = ''
  addLocationMode.value = 'search'
  removeAddPreviewMarker()
  syncMapPickMode()
  void nextTick(refreshMapTiles)
}

function resetAddSpotForm() {
  addSpotName.value = ''
  addSpotDescription.value = ''
  addSpotCategory.value = 'work'
  searchName.value = ''
  addLocationMode.value = 'search'
  removeAddPreviewMarker()
}

function getSpotTags(): string[] {
  return [`category:${addSpotCategory.value}`]
}

async function saveSpot() {
  if (!authStore.user) {
    router.push({ name: 'Login', query: { redirect: '/map' } })
    return
  }

  if (!addSpotName.value.trim()) {
    addSpotError.value = '请填写地点名称'
    return
  }

  savingSpot.value = true
  addSpotError.value = ''

  let spotCity = ''
  let spotCountry = ''
  const region = await reverseGeocode(addSpotLat.value, addSpotLng.value, searchProvider.value)
  if (region) {
    spotCity = region.city
    spotCountry = region.country
  }

  const { data, error } = await createNomadSpot({
    creatorId: authStore.user.id,
    name: addSpotName.value.trim(),
    description: addSpotDescription.value.trim(),
    latitude: addSpotLat.value,
    longitude: addSpotLng.value,
    city: spotCity,
    country: spotCountry,
    tags: getSpotTags(),
  })

  savingSpot.value = false

  if (error || !data) {
    addSpotError.value = error ?? '保存地点失败'
    return
  }

  const location = mapSpotToLocation(data)
  locations.value = [location, ...locations.value]
  resetAddSpotForm()
  removeAddPreviewMarker()
  closeAddSpotPanel()
  openDetail(location)
  focusMapOnPoint(location.lat, location.lng, Math.max(mapInstance?.getZoom() ?? 15, 15))
}

function closeDetail() {
  showDetail.value = false
  setTimeout(() => {
    selectedLocation.value = null
  }, 300)
}

// ============================================
// 生命周期
// ============================================
function handleDocumentClick(event: MouseEvent) {
  if (!regionMenuOpen.value) return
  const target = event.target as HTMLElement | null
  if (!target?.closest('.map-region-controls')) {
    closeRegionMenu()
  }
}

onMounted(() => {
  void authStore.initialize()
  void initMap()
  void loadNomadLocations()
  document.addEventListener('click', handleDocumentClick)

  if (mapContainer.value) {
    mapResizeObserver = new ResizeObserver(() => {
      refreshMapTiles()
    })
    mapResizeObserver.observe(mapContainer.value)
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick)
  dismissLoginReminder()
  if (markerRefreshFrame !== null) {
    cancelAnimationFrame(markerRefreshFrame)
    markerRefreshFrame = null
  }
  if (mapRefreshTimer) {
    window.clearTimeout(mapRefreshTimer)
    mapRefreshTimer = null
  }
  mapResizeObserver?.disconnect()
  mapResizeObserver = null
  baseTileLayer = null

  if (mapInstance) {
    mapInstance.off('click', handleMapClickForAdd)
    mapInstance.remove()
    mapInstance = null
  }
})
</script>

<template>
  <div class="map-page">
    <!-- 顶部栏：详情页显示返回，否则显示搜索 -->
    <div class="map-topbar" :class="{ 'map-topbar--detail': showDetail }">
      <button
        v-if="showDetail"
        type="button"
        class="map-back-btn"
        @click="closeDetail"
      >
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        <span>返回地图</span>
      </button>
      <template v-else>
        <div class="map-search">
          <svg class="map-search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索地点、城市或标签..."
            class="map-search-input"
          />
        </div>
        <button class="map-menu-btn" title="返回首页" @click="router.push('/')">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </button>
      </template>
    </div>

    <!-- 右上角：国内/国外地图切换 -->
    <div v-if="!showDetail" class="map-region-controls">
      <button
        type="button"
        class="map-settings-btn"
        :class="{ active: regionMenuOpen }"
        :title="`地图设置：${regionLabel} · ${providerLabel}`"
        aria-label="地图区域设置"
        @click="toggleRegionMenu"
      >
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span class="map-settings-label">{{ regionLabel }}</span>
      </button>

      <Transition name="region-menu">
        <div v-if="regionMenuOpen" class="map-region-menu" role="menu">
          <p class="map-region-menu-title">地图服务</p>
          <button
            type="button"
            class="map-region-option"
            :class="{ active: mapRegion === 'china' }"
            role="menuitem"
            @click="switchMapRegion('china')"
          >
            <span class="map-region-option-name">国内</span>
            <span class="map-region-option-desc">高德地图 · 中国大陆</span>
          </button>
          <button
            type="button"
            class="map-region-option"
            :class="{ active: mapRegion === 'global' }"
            role="menuitem"
            @click="switchMapRegion('global')"
          >
            <span class="map-region-option-name">国外</span>
            <span class="map-region-option-desc">Google Maps · 海外地区</span>
          </button>
        </div>
      </Transition>
    </div>

    <!-- 分类筛选：详情面板打开时隐藏 -->
    <div v-if="!showDetail && !showAddSpot" class="map-categories">
      <button
        v-for="cat in MAP_CATEGORIES"
        :key="cat.id"
        :class="['map-cat-chip', { active: activeCategory === cat.id }]"
        @click="activeCategory = cat.id"
      >
        <span class="map-cat-emoji">{{ cat.emoji }}</span>
        <span>{{ cat.label }}</span>
      </button>
    </div>

    <!-- 地图容器 -->
    <div
      ref="mapContainer"
      class="map-canvas"
      :class="{ 'picking-mode': showAddSpot && addLocationMode === 'click' }"
    />

    <div v-if="mapInitializing" class="map-init-overlay">
      <LoadingSpinner size="lg" text="地图加载中..." />
    </div>

    <!-- 手绘纸张纹理覆盖 -->
    <div class="map-paper-overlay" />



    <!-- 公告按钮：详情面板打开时隐藏 -->
    <button v-if="!showDetail && !showAddSpot" class="map-announce-btn" title="公告">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
      </svg>
    </button>

    <!-- 右侧悬浮操作区：添加地点 + 定位 -->
    <div v-if="!showDetail" class="map-fab-group">
      <button
        v-if="!showAddSpot"
        class="map-add-btn"
        :title="authStore.isAuthenticated ? '添加地点' : '登录后添加地点'"
        :aria-label="authStore.isAuthenticated ? '添加地点' : '登录后添加地点'"
        @click="openAddSpotPanel"
      >
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 5v14M5 12h14" />
        </svg>
        <span class="map-add-btn-text">添加地点</span>
      </button>

      <button
        class="map-locate-btn"
        :class="{ locating }"
        :disabled="locating"
        :title="userLocation ? '回到我的位置' : '定位到我附近'"
        aria-label="定位到我附近"
        @click="locateMe({ animate: true })"
      >
        <LoadingSpinner v-if="locating" size="sm" label="定位中" />
        <svg v-else fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l2.5 2.5M12 2v3m0 14v3m10-10h-3M5 12H2m16.95-6.95l-2.12 2.12M7.17 16.83l-2.12 2.12m0-13.9l2.12 2.12m9.66 9.66l2.12 2.12" />
        </svg>
      </button>
    </div>

    <Transition name="login-reminder">
      <div
        v-if="showLoginReminder && !showDetail && !showAddSpot"
        class="map-login-reminder"
        role="alert"
      >
        <div class="map-login-reminder-content">
          <p class="map-login-reminder-title">请先登录</p>
          <p class="map-login-reminder-text">添加地点需要登录账号，登录后可继续标记和分享你的游牧据点。</p>
        </div>
        <div class="map-login-reminder-actions">
          <button type="button" class="map-login-reminder-btn" @click="goToLogin">立即登录</button>
          <button
            type="button"
            class="map-login-reminder-close"
            aria-label="关闭提示"
            @click="dismissLoginReminder"
          >
            ×
          </button>
        </div>
      </div>
    </Transition>

    <div v-if="(locationError || mapError) && !showDetail && !showAddSpot" class="map-location-error">
      {{ locationError || mapError }}
    </div>

    <div v-if="mapLoading && !showDetail && !showAddSpot" class="map-data-status">
      <LoadingSpinner size="sm" text="加载地点数据..." inline />
    </div>

    <!-- 侧边详情面板 -->
    <Transition name="panel">
      <div v-if="showDetail && selectedLocation" class="map-detail-panel">
        <!-- 返回按钮（面板左上角） -->
        <button class="panel-back" type="button" title="返回地图" aria-label="返回地图" @click="closeDetail">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span class="panel-back-label">返回</span>
        </button>

        <div v-if="selectedLocation.images.length > 0" class="panel-cover">
          <img :src="selectedLocation.images[0]" :alt="selectedLocation.name" />
          <div class="panel-cover-overlay" />
        </div>

        <div class="panel-content">
          <div class="panel-category">
            <span
              class="panel-cat-dot"
              :style="{ background: getCategoryColor(selectedLocation.category) }"
            />
            <span>{{ getCategoryEmoji(selectedLocation.category) }}</span>
            <span class="panel-cat-label">
              {{ MAP_CATEGORIES.find((c) => c.id === selectedLocation.category)?.label }}
            </span>
          </div>

          <h2 class="panel-title">{{ selectedLocation.name }}</h2>
          <p class="panel-location">
            📍
            <span v-if="detailRegionLoading" class="panel-location-loading">
              <LoadingSpinner size="sm" text="识别城市中..." inline />
            </span>
            <span v-else>{{ selectedLocation.city }}，{{ selectedLocation.country }}</span>
          </p>

          <div class="panel-author">
            <div class="panel-avatar">
              {{ selectedLocation.author.name[0] }}
            </div>
            <div>
              <p class="panel-author-name">{{ selectedLocation.author.name }} 的游牧地图</p>
            </div>
          </div>

          <p class="panel-desc">{{ selectedLocation.description }}</p>

          <div class="panel-tags">
            <span v-for="tag in selectedLocation.tags" :key="tag" class="panel-tag">
              {{ tag }}
            </span>
          </div>

          <div class="panel-actions">
            <button class="panel-action">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905a3.61 3.61 0 01-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
              </svg>
              <span>{{ selectedLocation.likes }}</span>
            </button>
            <button class="panel-action">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <span>想去</span>
            </button>
            <button class="panel-action" @click="() => openInGoogleMaps(selectedLocation)">
              <span>🗺️</span>
              <span>Google Maps</span>
            </button>
            <button class="panel-action" @click="() => openInAmap(selectedLocation)">
              <span>🗺️</span>
              <span>高德地图</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 添加地点面板 (浮动毛玻璃) -->
    <Transition name="float">
      <div v-if="showAddSpot" class="map-add-panel">
        <button class="panel-back" @click="closeAddSpotPanel">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div class="map-add-content">
          <h2 class="map-add-title">添加地点</h2>

          <!-- 两种方式切换 -->
          <div class="add-mode-tabs">
            <button
              type="button"
              class="add-mode-tab"
              :class="{ active: addLocationMode === 'search' }"
              @click="setAddMode('search')"
            >
              🔍 地图搜索
            </button>
            <button
              type="button"
              class="add-mode-tab"
              :class="{ active: addLocationMode === 'click' }"
              @click="setAddMode('click')"
            >
              📍 地图选点
            </button>
          </div>

          <!-- 地图搜索 -->
          <div v-if="addLocationMode === 'search'" class="search-linkage">
            <label class="map-field">
              <span>搜索地点</span>
              <input v-model="searchName" type="text" placeholder="例如：加德满都 咖啡馆" @keyup.enter="searchPOI" />
            </label>
            <div class="search-toolbar">
              <div class="search-provider-badge">
                <span class="search-provider-badge-label">当前搜索</span>
                <span class="search-provider-badge-value">{{ providerLabel }}</span>
              </div>
              <button type="button" class="search-submit-btn" @click="searchPOI" :disabled="isSearching">
                <LoadingSpinner v-if="isSearching" size="sm" inline label="搜索中" />
                <span>{{ isSearching ? '搜索中' : '搜索' }}</span>
              </button>
            </div>

            <div v-if="isSearching && !searchResults.length" class="search-loading">
              <LoadingSpinner size="md" text="正在搜索地点..." />
            </div>

            <div v-if="searchResults.length" class="search-results">
              <div v-for="(r, idx) in searchResults" :key="idx" class="result-item" @click="selectSearchResult(r)">
                <div class="result-name">{{ r.name }}</div>
                <div class="result-address">{{ r.address }}</div>
              </div>
            </div>
            <p v-else-if="searchEmpty && !isSearching" class="search-empty">
              {{ searchEmptyMessage }}
            </p>
            <small class="search-hint">
              {{ searchHintMessage }}
            </small>
          </div>

          <!-- 地图选点 -->
          <div v-if="addLocationMode === 'click'" class="click-mode-hint">
            <p>👆 在地图上<strong>点击任意位置</strong>选取坐标</p>
            <small>可拖动地图后点击，坐标会实时更新</small>
          </div>

          <form class="map-add-form" @submit.prevent="saveSpot">
            <label class="map-field">
              <span>地点名称</span>
              <input v-model="addSpotName" type="text" placeholder="例如：安静咖啡馆" />
            </label>

            <label class="map-field">
              <span>分类</span>
              <select v-model="addSpotCategory">
                <option v-for="cat in spotCategories" :key="cat.id" :value="cat.id">
                  {{ cat.emoji }} {{ cat.label }}
                </option>
              </select>
            </label>

            <label class="map-field">
              <span>描述</span>
              <textarea v-model="addSpotDescription" rows="4" placeholder="补充 WiFi、插座、价格或适合工作的原因" />
            </label>

            <p v-if="addSpotError" class="map-form-error">{{ addSpotError }}</p>

            <button class="map-save-btn" type="submit" :disabled="savingSpot">
              <LoadingSpinner v-if="savingSpot" size="sm" inline label="保存中" />
              <span>{{ savingSpot ? '保存中' : '保存地点' }}</span>
            </button>
          </form>
        </div>
      </div>
    </Transition>

    <!-- 底部归属信息 -->
    <div v-if="mapReady" class="map-engine-badge">
      {{ providerLabel }} · Leaflet · Supabase
    </div>
  </div>
</template>

<style scoped>
/* ============================================
   全局布局
   ============================================ */
.map-page {
  position: fixed;
  inset: 0;
  z-index: 40;
  background: #F8F5F0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  overflow: hidden;
}

.map-canvas {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.map-init-overlay {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(248, 245, 240, 0.82);
  backdrop-filter: blur(4px);
  pointer-events: none;
}

.map-data-status {
  position: absolute;
  left: 16px;
  bottom: 28px;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

/* 手绘纸张覆盖层 */
.map-paper-overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background:
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 3px,
      rgba(139, 119, 101, 0.015) 3px,
      rgba(139, 119, 101, 0.015) 4px
    );
  mix-blend-mode: multiply;
}

/* ============================================
   顶部搜索栏
   ============================================ */
.map-topbar {
  position: absolute;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1200;
  display: flex;
  align-items: center;
  gap: 12px;
  width: min(90%, 480px);
}

.map-topbar--detail {
  left: 16px;
  transform: none;
  width: auto;
  max-width: calc(100vw - 32px);
}

/* ============================================
   右上角地图区域切换
   ============================================ */
.map-region-controls {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 1250;
}

.map-settings-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 44px;
  padding: 0 14px 0 12px;
  border: none;
  border-radius: 999px;
  background: white;
  color: #262626;
  cursor: pointer;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04);
  transition: all 0.2s;
}

.map-settings-btn:hover,
.map-settings-btn.active {
  color: #48A9DE;
  box-shadow: 0 4px 20px rgba(72, 169, 222, 0.18);
}

.map-settings-btn svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.map-settings-label {
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}

.map-region-menu {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 220px;
  padding: 10px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.98);
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 12px 32px rgba(26, 26, 26, 0.12);
  backdrop-filter: blur(8px);
}

.map-region-menu-title {
  margin: 0 0 8px;
  padding: 0 8px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #8C8C8C;
}

.map-region-option {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  width: 100%;
  padding: 10px 12px;
  border: 1px solid transparent;
  border-radius: 12px;
  background: transparent;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;
}

.map-region-option + .map-region-option {
  margin-top: 4px;
}

.map-region-option:hover {
  background: #F7F9FB;
  border-color: rgba(72, 169, 222, 0.15);
}

.map-region-option.active {
  background: #E8F4FD;
  border-color: rgba(72, 169, 222, 0.35);
}

.map-region-option-name {
  font-size: 14px;
  font-weight: 600;
  color: #1A1A1A;
}

.map-region-option-desc {
  font-size: 11px;
  color: #8C8C8C;
}

.region-menu-enter-active,
.region-menu-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.region-menu-enter-from,
.region-menu-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.map-back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border: none;
  border-radius: 24px;
  background: white;
  color: #262626;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04);
  transition: all 0.2s;
}

.map-back-btn svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.map-back-btn:hover {
  color: #48A9DE;
  box-shadow: 0 4px 20px rgba(72, 169, 222, 0.2);
}

.map-search {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  background: white;
  border-radius: 24px;
  padding: 10px 18px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04);
}

.map-search-icon {
  width: 18px;
  height: 18px;
  color: #8C8C8C;
  flex-shrink: 0;
}

.map-search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
  color: #262626;
  background: transparent;
}

.map-search-input::placeholder {
  color: #BFBFBF;
}

.map-menu-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.2s;
}

.map-menu-btn:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}

.map-menu-btn svg {
  width: 20px;
  height: 20px;
  color: #595959;
}

/* ============================================
   分类筛选
   ============================================ */
.map-categories {
  position: absolute;
  top: 72px;
  left: 16px;
  z-index: 1000;
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 4px;
  scrollbar-width: none;
}

.map-categories::-webkit-scrollbar {
  display: none;
}

.map-cat-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 20px;
  border: none;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  font-size: 14px;
  font-weight: 500;
  color: #595959;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.25s ease;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.06);
}

.map-cat-chip:hover {
  background: white;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.map-cat-chip.active {
  background: #2A9D3E;
  color: white;
  box-shadow: 0 4px 16px rgba(42, 157, 62, 0.3);
}

.map-cat-emoji {
  font-size: 16px;
}

/* ============================================
   公告按钮
   ============================================ */
.map-announce-btn {
  position: absolute;
  top: 76px;
  right: 20px;
  z-index: 1000;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.2s;
}

.map-announce-btn:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  transform: scale(1.05);
}

.map-announce-btn svg {
  width: 20px;
  height: 20px;
  color: #595959;
}

/* ============================================
   右侧悬浮操作区
   ============================================ */
.map-fab-group {
  position: absolute;
  right: 16px;
  bottom: 132px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
}

/* ============================================
   定位按钮
   ============================================ */
.map-locate-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: white;
  border: 2px solid rgba(42, 157, 62, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.map-locate-btn:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.14);
  transform: scale(1.05);
}

.map-locate-btn.locating {
  pointer-events: none;
}

.map-locate-btn.locating svg {
  animation: locate-spin 1s linear infinite;
}

.map-locate-btn svg {
  width: 22px;
  height: 22px;
  color: #2A9D3E;
}

/* ============================================
   添加地点按钮
   ============================================ */
.map-add-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 50px;
  padding: 0 20px 0 16px;
  border-radius: 999px;
  background: linear-gradient(135deg, #2A9D3E 0%, #35B84A 55%, #48A9DE 100%);
  border: 2px solid rgba(255, 255, 255, 0.95);
  cursor: pointer;
  box-shadow:
    0 4px 18px rgba(42, 157, 62, 0.42),
    0 2px 8px rgba(0, 0, 0, 0.12);
  transition: transform 0.2s, box-shadow 0.2s;
  color: white;
  animation: map-add-pulse 2.8s ease-in-out infinite;
}

.map-add-btn:hover {
  transform: translateY(-2px) scale(1.03);
  box-shadow:
    0 8px 24px rgba(42, 157, 62, 0.5),
    0 4px 12px rgba(0, 0, 0, 0.14);
}

.map-add-btn:active {
  transform: scale(0.98);
}

.map-add-btn svg {
  width: 22px;
  height: 22px;
  color: white;
  flex-shrink: 0;
}

.map-add-btn-text {
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.02em;
  white-space: nowrap;
}

.map-login-reminder {
  position: absolute;
  left: 50%;
  bottom: 28px;
  z-index: 1200;
  display: flex;
  align-items: center;
  gap: 14px;
  width: min(92vw, 420px);
  padding: 14px 16px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(72, 169, 222, 0.22);
  box-shadow: 0 8px 28px rgba(26, 26, 26, 0.14);
  transform: translateX(-50%);
  backdrop-filter: blur(8px);
}

.map-login-reminder-content {
  flex: 1;
  min-width: 0;
}

.map-login-reminder-title {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: #1A1A1A;
}

.map-login-reminder-text {
  margin: 4px 0 0;
  font-size: 12px;
  line-height: 1.45;
  color: #595959;
}

.map-login-reminder-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.map-login-reminder-btn {
  border: none;
  border-radius: 999px;
  padding: 8px 14px;
  background: #48A9DE;
  color: white;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s;
}

.map-login-reminder-btn:hover {
  background: #3D98C8;
}

.map-login-reminder-close {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 50%;
  background: #F3F6F8;
  color: #8C8C8C;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
}

.map-login-reminder-close:hover {
  background: #E8EDF1;
  color: #595959;
}

.login-reminder-enter-active,
.login-reminder-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.login-reminder-enter-from,
.login-reminder-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(12px);
}

.map-location-error {
  position: absolute;
  right: 16px;
  bottom: 248px;
  z-index: 1000;
  max-width: 180px;
  padding: 8px 12px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  color: #E85D3A;
  font-size: 12px;
  font-weight: 500;
}

@keyframes locate-spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes map-add-pulse {
  0%, 100% {
    box-shadow:
      0 4px 18px rgba(42, 157, 62, 0.42),
      0 2px 8px rgba(0, 0, 0, 0.12);
  }
  50% {
    box-shadow:
      0 6px 26px rgba(42, 157, 62, 0.55),
      0 2px 10px rgba(0, 0, 0, 0.14);
  }
}

@media (prefers-reduced-motion: reduce) {
  .map-add-btn {
    animation: none;
  }
}

@media (max-width: 768px) {
  .map-fab-group {
    right: 12px;
    bottom: 148px;
    gap: 10px;
  }

  .map-add-btn {
    height: 48px;
    padding: 0 16px 0 14px;
  }

  .map-add-btn-text {
    font-size: 14px;
  }

  .map-locate-btn {
    width: 46px;
    height: 46px;
  }

  .map-location-error {
    bottom: 264px;
    right: 12px;
  }

  .map-login-reminder {
    bottom: 20px;
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .map-login-reminder-actions {
    justify-content: space-between;
  }
}

/* ============================================
   引擎标识
   ============================================ */
.map-engine-badge {
  position: absolute;
  bottom: 16px;
  left: 16px;
  z-index: 1000;
  padding: 4px 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(8px);
  font-size: 11px;
  font-weight: 500;
  color: #8C8C8C;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.06);
}

/* ============================================
   Leaflet 缩放控件样式覆盖
   ============================================ */
:deep(.leaflet-control-zoom) {
  border: none !important;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08) !important;
  border-radius: 12px !important;
  overflow: hidden;
}

:deep(.leaflet-control-zoom a) {
  width: 36px !important;
  height: 36px !important;
  line-height: 36px !important;
  font-size: 18px !important;
  color: #595959 !important;
}

:deep(.leaflet-control-zoom a:hover) {
  background: #F7F9FB !important;
  color: #48A9DE !important;
}

:deep(.leaflet-control-attribution) {
  background: rgba(255, 255, 255, 0.6) !important;
  font-size: 10px !important;
  border-radius: 8px 0 0 0 !important;
}

:deep(.leaflet-control-attribution a) {
  color: #8C8C8C !important;
}

/* ============================================
   详情面板（右侧滑入）
   ============================================ */
.map-detail-panel {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 1100;
  width: min(400px, 100vw);
  max-width: 100%;
  background: white;
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.12);
  overflow-y: auto;
  overflow-x: hidden;
}

@media (max-width: 768px) {
  .map-detail-panel {
    width: 100vw;
    box-shadow: none;
  }

  .map-topbar--detail {
    left: 50%;
    transform: translateX(-50%);
    width: min(90%, 480px);
  }
}

.map-detail-panel .panel-back {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 20;
  min-width: 36px;
  height: 36px;
  padding: 0 12px 0 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(4px);
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
}

.map-detail-panel .panel-back:hover {
  background: white;
  color: #48A9DE;
  box-shadow: 0 4px 16px rgba(72, 169, 222, 0.2);
}

.map-detail-panel .panel-back svg {
  width: 18px;
  height: 18px;
  color: inherit;
}

.panel-back-label {
  font-size: 13px;
  font-weight: 600;
  color: inherit;
}

.panel-cover {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 10;
  overflow: hidden;
}

.panel-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.panel-cover-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40%;
  background: linear-gradient(transparent, white);
}

.panel-content {
  padding: 20px 24px 32px;
}

.panel-category {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #8C8C8C;
}

.panel-cat-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.panel-cat-label {
  font-weight: 500;
}

.panel-title {
  margin-top: 10px;
  font-size: 22px;
  font-weight: 700;
  color: #1A1A1A;
  line-height: 1.3;
}

.panel-location {
  margin-top: 8px;
  font-size: 13px;
  color: #8C8C8C;
}

.panel-author {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 16px;
  padding: 12px;
  background: #F7F9FB;
  border-radius: 12px;
}

.panel-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #48A9DE;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
}

.panel-author-name {
  font-size: 13px;
  color: #595959;
}

.panel-desc {
  margin-top: 16px;
  font-size: 14px;
  line-height: 1.7;
  color: #262626;
}

.panel-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 14px;
}

.panel-tag {
  padding: 4px 10px;
  border-radius: 8px;
  background: #F3F6F8;
  font-size: 12px;
  color: #595959;
}

.panel-actions {
  display: flex;
  gap: 8px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #F0F0F0;
}

.panel-action {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px;
  border: 1px solid #E8E8E8;
  border-radius: 12px;
  background: white;
  font-size: 13px;
  color: #595959;
  cursor: pointer;
  transition: all 0.2s;
}

.panel-action:hover {
  border-color: #48A9DE;
  color: #48A9DE;
  background: #F0F8FF;
}

.panel-action svg {
  width: 18px;
  height: 18px;
}

/* ============================================
   面板过渡动画
   ============================================ */
.panel-enter-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.panel-leave-active {
  transition: transform 0.25s cubic-bezier(0.7, 0, 0.84, 0);
}

.panel-enter-from {
  transform: translateX(100%);
}

.panel-leave-to {
  transform: translateX(100%);
}

/* ============================================
   标记点动画
   ============================================ */
@keyframes marker-bounce {
  0% { transform: scale(0) translateY(20px); opacity: 0; }
  50% { transform: scale(1.2) translateY(-4px); }
  100% { transform: scale(1) translateY(0); opacity: 1; }
}

/* ============================================
   添加地点 - 新增解析输入样式
   ============================================ */
.location-input-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.location-input-row input {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid #E5E5E5;
  border-radius: 10px;
  font-size: 14px;
  background: white;
}

.location-input-row input:focus {
  outline: none;
  border-color: #48A9DE;
}

.parse-btn {
  flex-shrink: 0;
  padding: 10px 16px;
  background: #48A9DE;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.parse-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.parse-btn:not(:disabled):hover {
  background: #3D98C8;
}

.parse-hint {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: #48A9DE;
  font-weight: 500;
}

/* 添加模式点击地图提示 */
.map-add-hint {
  position: absolute;
  top: 120px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1100;
  background: rgba(72, 169, 222, 0.95);
  color: white;
  font-size: 13px;
  padding: 8px 16px;
  border-radius: 999px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  white-space: nowrap;
  pointer-events: none;
}

/* 添加方式切换 */
.add-mode-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 14px;
}

.add-mode-tab {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #E5E5E5;
  border-radius: 10px;
  background: white;
  font-size: 13px;
  font-weight: 500;
  color: #595959;
  cursor: pointer;
  transition: all 0.2s;
}

.add-mode-tab:hover {
  border-color: #48A9DE;
  background: #F0F8FF;
}

.add-mode-tab.active {
  border-color: #48A9DE;
  background: #E8F4FD;
  color: #1A5276;
}

/* 点击模式提示 */
.click-mode-hint {
  background: #E8F4FD;
  border: 1px solid #B8DCFF;
  border-radius: 10px;
  padding: 12px 14px;
  margin-bottom: 12px;
  font-size: 13px;
}
.click-mode-hint p {
  margin: 0;
  color: #1A5276;
}
.click-mode-hint small {
  color: #5DADE2;
}

.map-canvas.picking-mode {
  cursor: crosshair !important;
}

.search-linkage {
  background: rgba(248, 249, 250, 0.7);
  border: 1px solid #e9ecef;
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 12px;
}

.search-linkage .map-field {
  margin-bottom: 8px;
}

.search-toolbar {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
}

.search-provider-badge {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 6px 10px;
  border-radius: 8px;
  background: #F7F9FB;
  border: 1px solid #E9ECEF;
}

.search-provider-badge-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #8C8C8C;
}

.search-provider-badge-value {
  font-size: 13px;
  font-weight: 600;
  color: #1A5276;
}

.search-submit-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 14px;
  border: none;
  border-radius: 8px;
  background: #48A9DE;
  color: white;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
}

.search-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 12px;
  margin-bottom: 8px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.85);
}

.search-submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.search-hint {
  color: #666;
  font-size: 11px;
  line-height: 1.4;
}

.search-empty {
  margin: 0 0 8px;
  padding: 8px 10px;
  border-radius: 8px;
  background: #fff8e6;
  color: #8a6d1d;
  font-size: 12px;
  line-height: 1.45;
}

.search-results {
  max-height: 180px;
  overflow-y: auto;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  margin-bottom: 8px;
  background: white;
}

.result-item {
  padding: 8px 10px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  font-size: 13px;
}

.result-item:last-child {
  border-bottom: none;
}

.result-item:hover {
  background: #f8f9fa;
}

.result-name {
  font-weight: 500;
  color: #222;
}

.result-address {
  font-size: 11px;
  color: #666;
  margin-top: 2px;
}

/* ============================================
   浮动毛玻璃添加表单
   ============================================ */
.map-add-panel {
  position: absolute;
  top: 70px;
  right: 20px;
  z-index: 1200;
  width: 380px;
  max-width: calc(100vw - 40px);
  max-height: calc(100vh - 140px);
  background: rgba(255, 255, 255, 0.97);
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12),
              0 1px 3px rgba(0, 0, 0, 0.06);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.map-add-content {
  padding: 20px 22px 24px;
}

/* 关闭按钮在浮动卡片中放到右上 */
.map-add-panel .panel-back {
  position: absolute;
  top: 12px;
  right: 12px;
  left: auto;
  z-index: 10;
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.95);
}

.map-add-panel .panel-back:hover {
  background: rgba(255, 255, 255, 0.95);
}

.map-add-title {
  font-size: 17px;
  font-weight: 600;
  color: #1A1A1A;
  margin: 0 0 12px;
  padding-right: 36px; /* 留给关闭按钮 */
}

.map-add-subtitle {
  font-size: 12px;
  color: #666;
  line-height: 1.4;
  margin-bottom: 16px;
}

.map-add-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.map-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.map-field > span {
  font-size: 12px;
  font-weight: 500;
  color: #444;
}

.map-field input,
.map-field select,
.map-field textarea {
  padding: 9px 12px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(4px);
  color: #222;
  transition: border 0.2s;
}

.map-field input:focus,
.map-field select:focus,
.map-field textarea:focus {
  outline: none;
  border-color: #48A9DE;
  background: rgba(255, 255, 255, 0.95);
}

.map-field textarea {
  resize: vertical;
  min-height: 70px;
}

.map-field-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.panel-location-loading {
  display: inline-flex;
  align-items: center;
  vertical-align: middle;
}

.map-save-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 8px;
  padding: 11px 20px;
  background: #48A9DE;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.map-save-btn:hover:not(:disabled) {
  background: #3a8bc4;
  transform: translateY(-1px);
}

.map-save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.map-form-error {
  color: #e74c3c;
  font-size: 12px;
  margin: 4px 0;
}

/* 浮动面板过渡 */
.float-enter-active,
.float-leave-active {
  transition: all 0.22s cubic-bezier(0.23, 1, 0.32, 1);
}

.float-enter-from,
.float-leave-to {
  opacity: 0;
  transform: translateY(-12px) scale(0.96);
}
</style>

<style>
/* Leaflet 标记图标样式（不能 scoped，否则不生效） */
.nomad-marker {
  background: transparent !important;
  border: none !important;
  pointer-events: auto !important;
}

.nomad-marker > div {
  pointer-events: auto !important;
}

/*
 * Google Mutant 底图会插入可交互层，挡住 Leaflet 标记点击
 * 参考: leaflet.gridlayer.googlemutant 官方建议
 */
.leaflet-google-mutant,
.leaflet-google-mutant * {
  pointer-events: none !important;
}

.leaflet-pane.leaflet-marker-pane,
.leaflet-pane.leaflet-overlay-pane {
  pointer-events: none;
}

.leaflet-pane.leaflet-marker-pane .leaflet-marker-icon,
.leaflet-pane.leaflet-marker-pane .leaflet-interactive {
  pointer-events: auto !important;
}
</style>
