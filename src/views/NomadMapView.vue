<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  MAP_CATEGORIES,
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
  type MapLocation,
  type MapCategory,
} from '@/constants/map'
import { runtimeConfig } from '@/config/app'
import { createNomadSpot, fetchActiveNomadSpots } from '@/services/nomadSpots'
import type { NomadSpot } from '@/types/database'
import { geocode, gcj02ToWgs84, bd09ToWgs84 } from '@/utils/locationParser'

const router = useRouter()
const authStore = useAuthStore()

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
const addSpotLat = ref(DEFAULT_CENTER.lat)
const addSpotLng = ref(DEFAULT_CENTER.lng)

// 用于外部地图搜索
const searchName = ref('')

// 搜索提供商和结果
const searchProvider = ref<'google' | 'amap' | 'baidu'>('amap')
const searchResults = ref<SearchResultItem[]>([])
const isSearching = ref(false)

// 添加地点方式：地图搜索 | 地图选点
const addLocationMode = ref<'search' | 'click'>('search')
interface SearchResultItem {
  name: string
  lat: number
  lng: number
  address: string
  source: string
}

let addPreviewMarker: L.Marker | null = null
let mapInstance: L.Map | null = null
let baseTileLayer: L.TileLayer | null = null
let markerGroup: L.LayerGroup | null = null
let userLocationMarker: L.CircleMarker | null = null
let mapResizeObserver: ResizeObserver | null = null
let mapRefreshTimer: number | null = null

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
    baseTileLayer?.redraw()
  }, 32)
}

function focusMapOnPoint(lat: number, lng: number, zoom = 16, animate = true) {
  if (!mapInstance || !isValidCoord(lat, lng)) return

  const targetZoom = Math.min(zoom, mapInstance.getMaxZoom())

  const onMoveComplete = () => {
    refreshMapTiles()
  }

  if (animate) {
    mapInstance.flyTo([lat, lng], targetZoom, { duration: 0.6 })
    mapInstance.once('moveend', onMoveComplete)
    window.setTimeout(onMoveComplete, 800)
  } else {
    mapInstance.setView([lat, lng], targetZoom)
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
        timeout: 10000,
        maximumAge: 60000,
        enableHighAccuracy: true,
      }
    )
  })
}

function setUserLocationMarker(pos: { lat: number; lng: number }) {
  if (!mapInstance) return

  if (!userLocationMarker) {
    userLocationMarker = L.circleMarker([pos.lat, pos.lng], {
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
    userLocationMarker.setLatLng([pos.lat, pos.lng])
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
  setUserLocationMarker(pos)

  const targetZoom = Math.max(mapInstance.getZoom(), runtimeConfig.maps.userZoom)
  if (options.animate) {
    mapInstance.flyTo([pos.lat, pos.lng], targetZoom, { duration: 0.8 })
    mapInstance.once('moveend', refreshMapTiles)
  } else {
    mapInstance.setView([pos.lat, pos.lng], targetZoom)
    refreshMapTiles()
  }
}

// 点击地图任意位置设置添加坐标（仅地图选点模式生效）
function handleMapClickForAdd(e: L.LeafletMouseEvent) {
  if (!showAddSpot.value || addLocationMode.value !== 'click') return

  addSpotLat.value = Number(e.latlng.lat.toFixed(6))
  addSpotLng.value = Number(e.latlng.lng.toFixed(6))
  addSpotError.value = ''
  updateAddPreviewMarker()
}

function updateAddPreviewMarker() {
  if (!mapInstance) return

  const lat = addSpotLat.value
  const lng = addSpotLng.value

  if (addPreviewMarker) {
    addPreviewMarker.setLatLng([lat, lng])
  } else {
    addPreviewMarker = L.marker([lat, lng], {
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
async function initMap() {
  if (!mapContainer.value) return

  // 尝试获取用户位置，默认用清迈
  const userPos = await getUserLocation()
  const center = userPos ?? { lat: DEFAULT_CENTER.lat, lng: DEFAULT_CENTER.lng }
  const zoom = userPos ? runtimeConfig.maps.userZoom : runtimeConfig.maps.defaultZoom || DEFAULT_ZOOM

  // CARTO Positron 浅色底图 — 无需 API Key，全球覆盖
  baseTileLayer = L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 19,
      subdomains: 'abcd',
      updateWhenZooming: false,
      keepBuffer: 4,
    }
  )

  mapInstance = L.map(mapContainer.value, {
    center: [center.lat, center.lng],
    zoom,
    zoomControl: false,
    attributionControl: true,
    fadeAnimation: false,
  })

  baseTileLayer.addTo(mapInstance)

  // 缩放控件放右下角
  L.control.zoom({ position: 'bottomright' }).addTo(mapInstance)

  // 标记图层组
  markerGroup = L.layerGroup().addTo(mapInstance)

  // 添加标记点
  refreshMarkers()
  mapReady.value = true

  if (userPos) {
    userLocation.value = userPos
    setUserLocationMarker(userPos)
    mapInstance.setView([userPos.lat, userPos.lng], runtimeConfig.maps.userZoom)
  }

  void nextTick(refreshMapTiles)
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

function mapSpotToLocation(spot: NomadSpot): MapLocation {
  const tags = spot.tags ?? []

  return {
    id: spot.id,
    name: spot.name,
    description: spot.description ?? '',
    category: getSpotCategory(tags),
    lat: Number(spot.latitude),
    lng: Number(spot.longitude),
    city: spot.city ?? '未知城市',
    country: spot.country ?? '未知国家',
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
function refreshMarkers() {
  if (!markerGroup || !mapInstance) return
  markerGroup.clearLayers()

  filteredLocations.value.forEach((loc) => {
    const icon = createMarkerIcon(loc)
    const marker = L.marker([loc.lat, loc.lng], { icon })
    marker.on('click', () => openDetail(loc))
    markerGroup!.addLayer(marker)
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

watch(searchResults, () => {
  void nextTick(() => {
    window.setTimeout(refreshMapTiles, 50)
  })
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
  const query = searchName.value.trim();
  if (!query) return;

  isSearching.value = true;
  searchResults.value = [];

  const keys = runtimeConfig.maps;
  let results: SearchResultItem[] = [];

  try {
    if (searchProvider.value === 'amap' && keys.amapKey) {
      const url = `https://restapi.amap.com/v3/place/text?keywords=${encodeURIComponent(query)}&key=${keys.amapKey}&offset=10&extensions=all`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.status === '1' && data.pois) {
        results = data.pois.flatMap((p: { name: string; location?: string; address?: string; pname?: string; cityname?: string; adname?: string }) => {
          if (!p.location) return []
          const [lng, lat] = p.location.split(',').map(Number)
          if (!isValidCoord(lat, lng)) return []
          const [wgsLng, wgsLat] = gcj02ToWgs84(lng, lat)
          if (!isValidCoord(wgsLat, wgsLng)) return []
          return [{
            name: p.name,
            lat: wgsLat,
            lng: wgsLng,
            address: p.address || `${p.pname ?? ''}${p.cityname ?? ''}${p.adname ?? ''}`,
            source: 'amap'
          }]
        })
      }
    } else if (searchProvider.value === 'baidu' && keys.baiduMapKey) {
      const url = `https://api.map.baidu.com/place/v2/search?query=${encodeURIComponent(query)}&region=全国&output=json&ak=${keys.baiduMapKey}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.status === 0 && data.results) {
        results = data.results.flatMap((r: { name: string; location: { lat: number; lng: number }; address?: string; city?: string; area?: string; province?: string }) => {
          const lat = r.location.lat;
          const lng = r.location.lng;
          if (!isValidCoord(lat, lng)) return []
          const [wgsLng, wgsLat] = bd09ToWgs84(lng, lat);
          if (!isValidCoord(wgsLat, wgsLng)) return []
          return [{
            name: r.name,
            lat: wgsLat,
            lng: wgsLng,
            address: r.address || '',
            source: 'baidu'
          }]
        })
      }
    } else if (searchProvider.value === 'google' && keys.googleMapsKey) {
      // Google Text Search - may have CORS, fallback if fails
      const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${keys.googleMapsKey}`;
      try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.status === 'OK' && data.results) {
          results = data.results.slice(0, 10).flatMap((r: { name: string; geometry: { location: { lat: number; lng: number } }; formatted_address?: string }) => {
            const lat = r.geometry.location.lat
            const lng = r.geometry.location.lng
            if (!isValidCoord(lat, lng)) return []
            return [{
              name: r.name,
              lat,
              lng,
              address: r.formatted_address || '',
              source: 'google'
            }]
          })
        }
      } catch (e) {
        // CORS likely, fallback to geocode
        console.warn('Google Places CORS, falling back to geocode');
      }
    }

    // Fallback to our geocode if no results or no key
    if (results.length === 0) {
      const geo = await geocode(query);
      if (geo && isValidCoord(geo.lat, geo.lng)) {
        results = [{
          name: geo.name || query,
          lat: geo.lat,
          lng: geo.lng,
          address: '',
          source: 'geocode'
        }];
      }
    }

    searchResults.value = results;
  } catch (e) {
    console.error('Search failed', e);
    // final fallback
    const geo = await geocode(query);
    if (geo && isValidCoord(geo.lat, geo.lng)) {
      searchResults.value = [{
        name: geo.name || query,
        lat: geo.lat,
        lng: geo.lng,
        address: '',
        source: 'geocode'
      }];
    }
  } finally {
    isSearching.value = false;
    void nextTick(() => {
      window.setTimeout(refreshMapTiles, 50)
    })
  }
}

function selectSearchResult(result: SearchResultItem) {
  if (!isValidCoord(result.lat, result.lng)) {
    addSpotError.value = '该搜索结果坐标无效，请换一条或改用地图选点'
    return
  }

  addSpotLat.value = result.lat;
  addSpotLng.value = result.lng;
  addSpotError.value = ''
  if (!addSpotName.value.trim()) {
    addSpotName.value = result.name;
  }
  updateAddPreviewMarker();
  focusMapOnPoint(result.lat, result.lng, 16)
}

function openDetail(loc: MapLocation) {
  selectedLocation.value = loc
  showDetail.value = true
}

function openAddSpotPanel() {
  if (!authStore.isAuthenticated) {
    router.push({ name: 'Login', query: { redirect: '/map' } })
    return
  }

  const center = mapInstance?.getCenter()
  addSpotLat.value = center?.lat ?? userLocation.value?.lat ?? DEFAULT_CENTER.lat
  addSpotLng.value = center?.lng ?? userLocation.value?.lng ?? DEFAULT_CENTER.lng
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

  const { data, error } = await createNomadSpot({
    creatorId: authStore.user.id,
    name: addSpotName.value.trim(),
    description: addSpotDescription.value.trim(),
    latitude: addSpotLat.value,
    longitude: addSpotLng.value,
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
onMounted(() => {
  void authStore.initialize()
  void initMap()
  void loadNomadLocations()

  if (mapContainer.value) {
    mapResizeObserver = new ResizeObserver(() => {
      refreshMapTiles()
    })
    mapResizeObserver.observe(mapContainer.value)
  }
})

onUnmounted(() => {
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
    <!-- 顶部搜索栏 -->
    <div class="map-topbar">
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
      <button class="map-menu-btn" title="菜单">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
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

    <!-- 手绘纸张纹理覆盖 -->
    <div class="map-paper-overlay" />



    <!-- 公告按钮：详情面板打开时隐藏 -->
    <button v-if="!showDetail && !showAddSpot" class="map-announce-btn" title="公告">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
      </svg>
    </button>

    <!-- 定位按钮：详情面板打开时隐藏 -->
    <button
      v-if="!showDetail"
      class="map-locate-btn"
      :class="{ locating }"
      :title="userLocation ? '回到我的位置' : '定位到我附近'"
      @click="locateMe({ animate: true })"
    >
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l2.5 2.5M12 2v3m0 14v3m10-10h-3M5 12H2m16.95-6.95l-2.12 2.12M7.17 16.83l-2.12 2.12m0-13.9l2.12 2.12m9.66 9.66l2.12 2.12" />
      </svg>
    </button>

    <!-- 添加地点按钮：详情面板打开时隐藏 -->
    <button
      v-if="!showDetail && !showAddSpot"
      class="map-add-btn"
      :title="authStore.isAuthenticated ? '添加当前位置为地点' : '登录后添加地点'"
      @click="openAddSpotPanel"
    >
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v14M5 12h14" />
      </svg>
    </button>

    <div v-if="(locationError || mapError) && !showDetail && !showAddSpot" class="map-location-error">
      {{ locationError || mapError }}
    </div>

    <div v-if="mapLoading && !showDetail && !showAddSpot" class="map-data-status">
      正在加载地图数据...
    </div>

    <!-- 侧边详情面板 -->
    <Transition name="panel">
      <div v-if="showDetail && selectedLocation" class="map-detail-panel">
        <!-- 返回按钮（面板左上角） -->
        <button class="panel-back" @click="closeDetail">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
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
            📍 {{ selectedLocation.city }}，{{ selectedLocation.country }}
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
              <select v-model="searchProvider" class="search-provider-select">
                <option value="amap">高德地图</option>
                <option value="google">Google Maps</option>
                <option value="baidu">百度地图</option>
              </select>
              <button type="button" class="search-submit-btn" @click="searchPOI" :disabled="isSearching">
                {{ isSearching ? '搜索中...' : '搜索' }}
              </button>
            </div>

            <div v-if="searchResults.length" class="search-results">
              <div v-for="(r, idx) in searchResults" :key="idx" class="result-item" @click="selectSearchResult(r)">
                <div class="result-name">{{ r.name }}</div>
                <div class="result-address">{{ r.address }}</div>
              </div>
            </div>
            <small class="search-hint">
              选择地图服务搜索，点击结果即可填入坐标和名称。
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

            <div class="map-coordinate-box">
              <span>坐标 (可编辑)</span>
              <div class="coord-row">
                <input
                  v-model.number="addSpotLat"
                  type="number"
                  step="0.00001"
                  class="coord-input"
                  placeholder="纬度"
                />
                <input
                  v-model.number="addSpotLng"
                  type="number"
                  step="0.00001"
                  class="coord-input"
                  placeholder="经度"
                />
              </div>
              <div class="coord-hint">可手动微调经纬度</div>
            </div>

            <p v-if="addSpotError" class="map-form-error">{{ addSpotError }}</p>

            <button class="map-save-btn" type="submit" :disabled="savingSpot">
              {{ savingSpot ? '保存中...' : '保存地点' }}
            </button>
          </form>
        </div>
      </div>
    </Transition>

    <!-- 底部归属信息 -->
    <div v-if="mapReady" class="map-engine-badge">
      🍃 Leaflet + CARTO · Supabase
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
  background: #F8F5F0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  overflow: hidden;
}

.map-canvas {
  position: absolute;
  inset: 0;
  z-index: 0;
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
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 12px;
  width: min(90%, 480px);
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
   定位按钮
   ============================================ */
.map-locate-btn {
  position: absolute;
  right: 20px;
  bottom: 88px;
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

.map-locate-btn:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  transform: scale(1.05);
}

.map-locate-btn.locating {
  pointer-events: none;
}

.map-locate-btn.locating svg {
  animation: locate-spin 1s linear infinite;
}

.map-locate-btn svg {
  width: 20px;
  height: 20px;
  color: #2A9D3E;
}

/* ============================================
   添加地点按钮
   ============================================ */
.map-add-btn {
  position: absolute;
  right: 20px;
  bottom: 140px;
  z-index: 1000;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #48A9DE;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.2s;
  color: white;
}

.map-add-btn:hover {
  background: #3D98C8;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  transform: scale(1.05);
}

.map-add-btn svg {
  width: 20px;
  height: 20px;
  color: white;
}

/* 如果未登录，可以给个轻微提示样式（可选） */
.map-add-btn:not(:hover) {
  /* 保持默认 */
}

.map-location-error {
  position: absolute;
  right: 20px;
  bottom: 140px;
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
  width: min(400px, 90vw);
  background: white;
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.12);
  overflow-y: auto;
  overflow-x: hidden;
}

.panel-back {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 5;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.1);
}

.panel-back:hover {
  background: white;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
}

.panel-back svg {
  width: 18px;
  height: 18px;
  color: #595959;
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

.map-coordinate-box {
  background: #F7F9FB;
  border: 1px solid #E5E5E5;
  border-radius: 12px;
  padding: 12px 14px;
  font-size: 13px;
}

.coord-row {
  display: flex;
  gap: 8px;
  margin-top: 6px;
}

.coord-input {
  flex: 1;
  padding: 6px 10px;
  border: 1px solid #D0D0D0;
  border-radius: 8px;
  font-size: 13px;
  font-family: monospace;
  background: white;
}

.coord-input:focus {
  border-color: #48A9DE;
  outline: none;
}

.coord-hint {
  font-size: 11px;
  color: #8C8C8C;
  margin-top: 4px;
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

.search-provider-select {
  flex: 1;
  padding: 8px 10px;
  border: 1px solid #E5E5E5;
  border-radius: 8px;
  font-size: 13px;
  background: white;
}

.search-submit-btn {
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

.search-submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.search-hint {
  color: #666;
  font-size: 11px;
  line-height: 1.4;
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

.map-coordinate-box {
  background: rgba(248, 248, 248, 0.6);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 13px;
}

.coord-row {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}

.coord-input {
  flex: 1;
  padding: 5px 8px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 6px;
  font-size: 13px;
  font-family: ui-monospace, monospace;
  background: rgba(255,255,255,0.8);
}

.map-save-btn {
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
}
</style>
