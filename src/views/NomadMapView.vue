<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useRouter } from 'vue-router'
import {
  MAP_CATEGORIES,
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
  type MapLocation,
  type MapCategory,
} from '@/constants/map'

const router = useRouter()

// ============================================
// 状态
// ============================================
const mapContainer = ref<HTMLElement | null>(null)
const activeCategory = ref<MapCategory>('all')
const searchQuery = ref('')
const selectedLocation = ref<MapLocation | null>(null)
const showDetail = ref(false)
const mapReady = ref(false)
let mapInstance: L.Map | null = null
let markerGroup: L.LayerGroup | null = null

// ============================================
// 模拟数据（后续从 Supabase 加载）
// ============================================
const locations = ref<MapLocation[]>([
  {
    id: '1',
    name: 'Calm Cafe & Workspace',
    description: '清迈古城内最受欢迎的数字游民工作空间，WiFi 稳定，咖啡好喝，插座充足。',
    category: 'food',
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
    category: 'fun',
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
    category: 'hidden',
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
    category: 'food',
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
    category: 'fun',
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
      { timeout: 5000, enableHighAccuracy: false }
    )
  })
}

// ============================================
// Leaflet 地图初始化
// ============================================
async function initMap() {
  if (!mapContainer.value) return

  // 尝试获取用户位置，默认用清迈
  const userPos = await getUserLocation()
  const center = userPos ?? { lat: DEFAULT_CENTER.lat, lng: DEFAULT_CENTER.lng }
  const zoom = userPos ? 13 : DEFAULT_ZOOM

  // CARTO Positron 浅色底图 — 无需 API Key，全球覆盖
  const tileLayer = L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 19,
      subdomains: 'abcd',
    }
  )

  mapInstance = L.map(mapContainer.value, {
    center: [center.lat, center.lng],
    zoom,
    zoomControl: false,
    attributionControl: true,
  })

  tileLayer.addTo(mapInstance)

  // 缩放控件放右下角
  L.control.zoom({ position: 'bottomright' }).addTo(mapInstance)

  // 标记图层组
  markerGroup = L.layerGroup().addTo(mapInstance)

  // 添加标记点
  refreshMarkers()
  mapReady.value = true
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

// ============================================
// 工具函数
// ============================================
function getCategoryColor(cat: MapCategory): string {
  return MAP_CATEGORIES.find((c) => c.id === cat)?.color ?? '#2A9D3E'
}

function getCategoryEmoji(cat: MapCategory): string {
  return MAP_CATEGORIES.find((c) => c.id === cat)?.emoji ?? '📍'
}

function openDetail(loc: MapLocation) {
  selectedLocation.value = loc
  showDetail.value = true
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
  initMap()
})

onUnmounted(() => {
  if (mapInstance) {
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
    <div v-if="!showDetail" class="map-categories">
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
    <div ref="mapContainer" class="map-canvas" />

    <!-- 手绘纸张纹理覆盖 -->
    <div class="map-paper-overlay" />

    <!-- 公告按钮：详情面板打开时隐藏 -->
    <button v-if="!showDetail" class="map-announce-btn" title="公告">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
      </svg>
    </button>

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
            <button class="panel-action">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <span>分享</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 底部归属信息 -->
    <div v-if="mapReady" class="map-engine-badge">
      🍃 Leaflet + CARTO · 免费开源
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
</style>

<style>
/* Leaflet 标记图标样式（不能 scoped，否则不生效） */
.nomad-marker {
  background: transparent !important;
  border: none !important;
}
</style>
