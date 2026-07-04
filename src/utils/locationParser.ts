/**
 * 位置解析工具
 * 支持：
 * - Google Maps / 高德 / 百度 地图链接 → 提取 lat/lng
 * - Plus Code (Google Open Location Code) 全码或短码 + 参考点
 * - 纯地名 → 地理编码 (geocode) 使用可用 key 优先级
 *
 * 返回统一的 WGS84 坐标 (Leaflet / Google 标准)
 */

import { runtimeConfig } from '@/config/app'

export interface ParsedLocation {
  lat: number
  lng: number
  name?: string
  city?: string
  country?: string
  source: 'google' | 'amap' | 'baidu' | 'pluscode' | 'geocode' | 'manual'
  confidence?: number // 0-1
}

// 简单坐标正则 (支持 , 或 空格, 更宽松的小数位)
const COORD_REGEX = /(-?\d{1,3}\.?\d{0,})\s*[,\s]\s*(-?\d{1,3}\.?\d{0,})/

// Google Maps 链接 - 更健壮，支持多种格式
const GOOGLE_REGEX = /(?:@|q=|ll=|query=)([-+]?\d+\.?\d+)[,\s%2C]+([-+]?\d+\.?\d+)/i
const GOOGLE_PLACE_REGEX = /place\/([^/@?]+)/i
const GOOGLE_DATA_REGEX = /!3d([-+]?\d+\.?\d+)!4d([-+]?\d+\.?\d+)/i

// 高德 (AMap)
const AMAP_REGEX = /(?:lonlat=|markers=|location=)([-+]?\d+\.?\d+)[,\s]+([-+]?\d+\.?\d+)/i
const AMAP_COORD = /([-+]?\d+\.?\d+)[,\s]+([-+]?\d+\.?\d+)/

// 百度
const BAIDU_REGEX = /(?:l=)([-+]?\d+\.?\d+)[,\s]+([-+]?\d+\.?\d+)/i
const BAIDU_QUERY = /query=([^&]+)/i

// Plus Code (Open Location Code) e.g. 6PH57VP3+PR or P877+92
const PLUS_CODE_REGEX = /([23456789CFGHJMPQRVWX]{4,8}\+[23456789CFGHJMPQRVWX]{2,3})/i

/** 判断是否是 Google 短链接 */
function isGoogleShortLink(url: string): boolean {
  return /goo\.gl|maps\.app\.goo\.gl/i.test(url)
}

/**
 * 展开 Google 短链接 (goo.gl / maps.app.goo.gl)
 * 优先使用 unshorten.me (免费公开服务)
 * 失败则返回原链接，让后续解析器处理
 */
async function expandGoogleShortLink(shortUrl: string): Promise<string> {
  if (!isGoogleShortLink(shortUrl)) return shortUrl

  // 1. 尝试 unshorten.me（专为短链接展开设计，支持 JSON）
  try {
    const res = await fetch(`https://unshorten.me/json/${encodeURIComponent(shortUrl)}`)
    if (res.ok) {
      const data = await res.json()
      if (data?.url && typeof data.url === 'string') {
        return data.url
      }
    }
  } catch (e) {
    // ignore
  }

  // 2. 回退：尝试一个公共 CORS 代理（某些情况下可拿到最终 URL）
  try {
    const proxy = `https://corsproxy.io/?${encodeURIComponent(shortUrl)}`
    const res = await fetch(proxy, { redirect: 'follow' })
    if (res.url && res.url !== shortUrl && !res.url.includes('corsproxy')) {
      return res.url
    }
  } catch (e) {
    // ignore
  }

  // 无法展开时返回原链接（后续解析仍可尝试直接匹配）
  return shortUrl
}

/**
 * 坐标系转换：GCJ-02 (高德/腾讯) -> WGS84
 * 简化版常用算法，精度足够用于游民地图
 */
export function gcj02ToWgs84(lng: number, lat: number): [number, number] {
  const a = 6378245.0
  const ee = 0.00669342162296594323

  function transformLat(x: number, y: number) {
    let ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x))
    ret += (20.0 * Math.sin(6.0 * x * Math.PI) + 20.0 * Math.sin(2.0 * x * Math.PI)) * 2.0 / 3.0
    ret += (20.0 * Math.sin(y * Math.PI) + 40.0 * Math.sin(y / 3.0 * Math.PI)) * 2.0 / 3.0
    ret += (160.0 * Math.sin(y / 12.0 * Math.PI) + 320 * Math.sin(y * Math.PI / 30.0)) * 2.0 / 3.0
    return ret
  }

  function transformLng(x: number, y: number) {
    let ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x))
    ret += (20.0 * Math.sin(6.0 * x * Math.PI) + 20.0 * Math.sin(2.0 * x * Math.PI)) * 2.0 / 3.0
    ret += (20.0 * Math.sin(x * Math.PI) + 40.0 * Math.sin(x / 3.0 * Math.PI)) * 2.0 / 3.0
    ret += (150.0 * Math.sin(x / 12.0 * Math.PI) + 300.0 * Math.sin(x / 30.0 * Math.PI)) * 2.0 / 3.0
    return ret
  }

  const dLat = transformLat(lng - 105.0, lat - 35.0)
  const dLng = transformLng(lng - 105.0, lat - 35.0)
  const radLat = (lat / 180.0) * Math.PI
  let magic = Math.sin(radLat)
  magic = 1 - ee * magic * magic
  const sqrtMagic = Math.sqrt(magic)
  const dLatFinal = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * Math.PI)
  const dLngFinal = (dLng * 180.0) / (a / sqrtMagic * Math.cos(radLat) * Math.PI)
  return [lng - dLngFinal, lat - dLatFinal]
}

/** WGS84 -> GCJ-02 (高德/腾讯) */
export function wgs84ToGcj02(lng: number, lat: number): [number, number] {
  const a = 6378245.0
  const ee = 0.00669342162296594323

  function transformLat(x: number, y: number) {
    let ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x))
    ret += (20.0 * Math.sin(6.0 * x * Math.PI) + 20.0 * Math.sin(2.0 * x * Math.PI)) * 2.0 / 3.0
    ret += (20.0 * Math.sin(y * Math.PI) + 40.0 * Math.sin(y / 3.0 * Math.PI)) * 2.0 / 3.0
    ret += (160.0 * Math.sin(y / 12.0 * Math.PI) + 320 * Math.sin(y * Math.PI / 30.0)) * 2.0 / 3.0
    return ret
  }

  function transformLng(x: number, y: number) {
    let ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x))
    ret += (20.0 * Math.sin(6.0 * x * Math.PI) + 20.0 * Math.sin(2.0 * x * Math.PI)) * 2.0 / 3.0
    ret += (20.0 * Math.sin(x * Math.PI) + 40.0 * Math.sin(x / 3.0 * Math.PI)) * 2.0 / 3.0
    ret += (150.0 * Math.sin(x / 12.0 * Math.PI) + 300.0 * Math.sin(x / 30.0 * Math.PI)) * 2.0 / 3.0
    return ret
  }

  const dLat = transformLat(lng - 105.0, lat - 35.0)
  const dLng = transformLng(lng - 105.0, lat - 35.0)
  const radLat = (lat / 180.0) * Math.PI
  let magic = Math.sin(radLat)
  magic = 1 - ee * magic * magic
  const sqrtMagic = Math.sqrt(magic)
  const dLatFinal = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * Math.PI)
  const dLngFinal = (dLng * 180.0) / (a / sqrtMagic * Math.cos(radLat) * Math.PI)
  return [lng + dLngFinal, lat + dLatFinal]
}

/** BD-09 (百度) -> GCJ-02 */
export function bd09ToGcj02(lng: number, lat: number): [number, number] {
  const x = lng - 0.0065
  const y = lat - 0.006
  const z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * Math.PI * 3000.0 / 180.0)
  const theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * Math.PI * 3000.0 / 180.0)
  return [z * Math.cos(theta), z * Math.sin(theta)]
}

/** 百度坐标转 WGS84 */
export function bd09ToWgs84(lng: number, lat: number): [number, number] {
  const [gcjLng, gcjLat] = bd09ToGcj02(lng, lat)
  return gcj02ToWgs84(gcjLng, gcjLat)
}

/**
 * 解码 Plus Code (Open Location Code)
 * - 全码 (如 6PH57VP3+PR)：全球唯一，可直接解码
 * - 短码 (如 P8C3+CJ)：必须提供参考点（附近城市坐标），否则会用默认清迈
 * 返回 WGS84 [lng, lat] 数组
 */
export function decodePlusCode(code: string, refLat = 0, refLng = 0): [number, number] | null {
  const clean = code.trim().toUpperCase().replace(/\s+/g, '')
  if (!PLUS_CODE_REGEX.test(clean)) return null

  const ALPHABET = '23456789CFGHJMPQRVWX'

  let lat = -90
  let lng = -180
  let res = 20
  const parts = clean.split('+')
  const codePart = parts[0]

  // Decode the provided code digits (each pair adds resolution)
  for (let i = 0; i < Math.min(codePart.length, 8); i += 2) {
    if (i + 1 >= codePart.length) break
    const vLat = ALPHABET.indexOf(codePart[i])
    const vLng = ALPHABET.indexOf(codePart[i + 1])
    if (vLat === -1 || vLng === -1) return null

    lat += vLat * res
    lng += vLng * res
    res /= 20
  }

  // For short codes, snap to the grid cell containing the reference point
  if (codePart.length < 8 && refLat && refLng) {
    const latCell = res * 20
    const lngCell = res * 20
    lat = refLat + ((lat - refLat) % latCell + latCell) % latCell
    lng = refLng + ((lng - refLng) % lngCell + lngCell) % lngCell
  }

  // Move to center of the smallest cell
  lat += res / 2
  lng += res / 2

  lat = Math.max(-90, Math.min(90, lat))
  lng = Math.max(-180, Math.min(180, lng))

  return [lng, lat]
}

/** 提取 URL 中的坐标 */
function extractCoordsFromUrl(url: string): { lat: number; lng: number; name?: string } | null {
  let match: RegExpMatchArray | null = null

  // Google - 尝试多种格式
  match = url.match(GOOGLE_REGEX) || url.match(GOOGLE_DATA_REGEX)
  if (match) {
    let lat = parseFloat(match[1])
    let lng = parseFloat(match[2])
    if (isFinite(lat) && isFinite(lng)) {
      // 有些情况下顺序可能反了（少见）
      if (Math.abs(lat) > 90) [lat, lng] = [lng, lat]
      if (Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
        const placeMatch = url.match(GOOGLE_PLACE_REGEX)
        const name = placeMatch ? decodeURIComponent(placeMatch[1].replace(/\+/g, ' ')) : undefined
        return { lat, lng, name }
      }
    }
  }

  // Amap / 高德
  match = url.match(AMAP_REGEX) || url.match(AMAP_COORD)
  if (match) {
    let lat = parseFloat(match[1])
    let lng = parseFloat(match[2])
    // 高德常见顺序有时是 lat,lng 或反过来，尝试判断
    if (Math.abs(lat) > 90) [lat, lng] = [lng, lat]
    const [wgsLng, wgsLat] = gcj02ToWgs84(lng, lat)
    return { lat: wgsLat, lng: wgsLng }
  }

  // Baidu
  match = url.match(BAIDU_REGEX)
  if (match) {
    let lat = parseFloat(match[1])
    let lng = parseFloat(match[2])
    const [wgsLng, wgsLat] = bd09ToWgs84(lng, lat)
    return { lat: wgsLat, lng: wgsLng }
  }

  // 通用坐标 fallback (支持直接粘贴坐标)
  match = url.match(COORD_REGEX)
  if (match) {
    let lat = parseFloat(match[1])
    let lng = parseFloat(match[2])
    if (Math.abs(lat) > 90) [lat, lng] = [lng, lat]
    if (isFinite(lat) && isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
      return { lat, lng }
    }
  }

  return null
}

/** 尝试从 URL 提取名称 */
function extractNameFromUrl(url: string): string | undefined {
  try {
    const u = new URL(url)
    const path = decodeURIComponent(u.pathname)
    const place = path.match(/place\/([^/]+)/)?.[1] || path.match(/\/([^/]+)\/@/)?.[1]
    if (place) return place.replace(/\+/g, ' ').slice(0, 60)
  } catch {}
  return undefined
}

/** 使用可用地图服务进行地理编码 */
export async function geocode(query: string): Promise<ParsedLocation | null> {
  const q = encodeURIComponent(query.trim())
  const keys = runtimeConfig.maps

  // 1. Google
  if (keys.googleMapsKey) {
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${q}&key=${keys.googleMapsKey}`
      )
      const json = await res.json()
      if (json.results?.[0]) {
        const loc = json.results[0].geometry.location
        return {
          lat: loc.lat,
          lng: loc.lng,
          name: json.results[0].formatted_address?.split(',')[0],
          source: 'geocode',
        }
      }
    } catch {}
  }

  // 2. 高德 (中文友好)
  if (keys.amapKey) {
    try {
      const res = await fetch(
        `https://restapi.amap.com/v3/geocode/geo?address=${q}&key=${keys.amapKey}&output=json`
      )
      const json = await res.json()
      if (json.geocodes?.[0]) {
        const [lng, lat] = json.geocodes[0].location.split(',').map(Number)
        const [wgsLng, wgsLat] = gcj02ToWgs84(lng, lat)
        return {
          lat: wgsLat,
          lng: wgsLng,
          name: json.geocodes[0].formatted_address,
          source: 'geocode',
        }
      }
    } catch {}
  }

  // 3. 百度
  if (keys.baiduMapKey) {
    try {
      const res = await fetch(
        `https://api.map.baidu.com/geocoding/v3/?address=${q}&output=json&ak=${keys.baiduMapKey}`
      )
      const json = await res.json()
      if (json.result?.location) {
        const { lng, lat } = json.result.location
        const [wgsLng, wgsLat] = bd09ToWgs84(lng, lat)
        return {
          lat: wgsLat,
          lng: wgsLng,
          name: json.result.formatted_address,
          source: 'geocode',
        }
      }
    } catch {}
  }

  // 4. 免费 OSM Nominatim (fallback)
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${q}&limit=1`,
      { headers: { 'User-Agent': 'WorkWork-NomadMap/1.0' } }
    )
    const json = await res.json()
    if (json[0]) {
      return {
        lat: parseFloat(json[0].lat),
        lng: parseFloat(json[0].lon),
        name: json[0].display_name?.split(',')[0],
        source: 'geocode',
      }
    }
  } catch {}

  return null
}

export interface ReverseGeocodeResult {
  city: string
  country: string
  district?: string
  formattedAddress?: string
  source: 'google' | 'amap' | 'baidu' | 'nominatim'
}

type MapProvider = 'google' | 'amap' | 'baidu'

function isLikelyChina(lat: number, lng: number): boolean {
  return lat >= 18 && lat <= 54 && lng >= 73 && lng <= 135
}

function pickCityName(...candidates: Array<string | string[] | undefined | null>): string {
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate.trim()
    }
    if (Array.isArray(candidate) && candidate[0]) {
      return String(candidate[0]).trim()
    }
  }
  return ''
}

function parseGoogleAddressComponents(
  components: Array<{ long_name: string; short_name: string; types: string[] }>
): { city: string; country: string } {
  const byType = (type: string) => components.find((item) => item.types.includes(type))?.long_name ?? ''

  const city =
    pickCityName(
      byType('locality'),
      byType('postal_town'),
      byType('administrative_area_level_2'),
      byType('administrative_area_level_3'),
      byType('sublocality')
    ) || byType('administrative_area_level_1')

  const country = byType('country')
  return { city, country }
}

async function reverseGeocodeWithAmap(lat: number, lng: number): Promise<ReverseGeocodeResult | null> {
  const key = runtimeConfig.maps.amapKey
  if (!key) return null

  const [gcjLng, gcjLat] = wgs84ToGcj02(lng, lat)
  const url = `https://restapi.amap.com/v3/geocode/regeo?location=${gcjLng},${gcjLat}&key=${key}&extensions=base&output=json`

  try {
    const res = await fetch(url)
    const json = await res.json()
    if (json.status !== '1' || !json.regeocode?.addressComponent) return null

    const component = json.regeocode.addressComponent
    const city = pickCityName(component.city, component.district, component.township, component.province)
    const country = pickCityName(component.country) || (isLikelyChina(lat, lng) ? '中国' : '')

    if (!city && !country) return null

    return {
      city,
      country,
      district: pickCityName(component.district),
      formattedAddress: json.regeocode.formatted_address,
      source: 'amap',
    }
  } catch {
    return null
  }
}

async function reverseGeocodeWithGoogle(lat: number, lng: number): Promise<ReverseGeocodeResult | null> {
  const key = runtimeConfig.maps.googleMapsKey
  if (!key) return null

  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&language=zh-CN&key=${key}`

  try {
    const res = await fetch(url)
    const json = await res.json()
    const result = json.results?.[0]
    if (!result) return null

    const { city, country } = parseGoogleAddressComponents(result.address_components ?? [])
    if (!city && !country) return null

    return {
      city,
      country,
      formattedAddress: result.formatted_address,
      source: 'google',
    }
  } catch {
    return null
  }
}

async function reverseGeocodeWithBaidu(lat: number, lng: number): Promise<ReverseGeocodeResult | null> {
  const key = runtimeConfig.maps.baiduMapKey
  if (!key) return null

  const url = `https://api.map.baidu.com/reverse_geocoding/v3/?ak=${key}&output=json&coordtype=wgs84ll&location=${lat},${lng}`

  try {
    const res = await fetch(url)
    const json = await res.json()
    if (json.status !== 0 || !json.result?.addressComponent) return null

    const component = json.result.addressComponent
    const city = pickCityName(component.city, component.district, component.town, component.province)
    const country = pickCityName(component.country) || (isLikelyChina(lat, lng) ? '中国' : '')

    if (!city && !country) return null

    return {
      city,
      country,
      district: pickCityName(component.district),
      formattedAddress: json.result.formatted_address,
      source: 'baidu',
    }
  } catch {
    return null
  }
}

async function reverseGeocodeWithNominatim(lat: number, lng: number): Promise<ReverseGeocodeResult | null> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=zh-CN,en`

  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'WorkWork-NomadMap/1.0' } })
    const json = await res.json()
    if (!json.address) return null

    const address = json.address
    const city = pickCityName(
      address.city,
      address.town,
      address.village,
      address.county,
      address.state_district,
      address.municipality
    )
    const country = pickCityName(address.country)

    if (!city && !country) return null

    return {
      city,
      country,
      district: pickCityName(address.suburb, address.neighbourhood),
      formattedAddress: json.display_name,
      source: 'nominatim',
    }
  } catch {
    return null
  }
}

/**
 * 逆地理编码：坐标 -> 城市 + 国家/地区
 * 优先使用当前地图服务商，再按区域和可用 Key 自动回退
 */
export async function reverseGeocode(
  lat: number,
  lng: number,
  preferredProvider?: MapProvider
): Promise<ReverseGeocodeResult | null> {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null

  const inChina = isLikelyChina(lat, lng)
  const order: MapProvider[] = []

  if (preferredProvider) order.push(preferredProvider)

  if (inChina) {
    for (const provider of ['amap', 'baidu'] as MapProvider[]) {
      if (!order.includes(provider)) order.push(provider)
    }
  }

  if (!order.includes('google')) order.push('google')

  const providerFns: Record<MapProvider, () => Promise<ReverseGeocodeResult | null>> = {
    amap: () => reverseGeocodeWithAmap(lat, lng),
    google: () => reverseGeocodeWithGoogle(lat, lng),
    baidu: () => reverseGeocodeWithBaidu(lat, lng),
  }

  for (const provider of order) {
    const result = await providerFns[provider]()
    if (result && (result.city || result.country)) return result
  }

  return reverseGeocodeWithNominatim(lat, lng)
}

/**
 * 主入口：解析任意用户输入
 * 支持链接、Plus Code、名称
 */
export async function resolveLocation(
  input: string,
  ref: { lat: number; lng: number } = { lat: 18.7883, lng: 98.9853 } // 默认清迈
): Promise<ParsedLocation | null> {
  let trimmed = input.trim()
  if (!trimmed) return null

  // 清理 Google 地图常见的度数符号，便于直接粘贴坐标
  trimmed = trimmed.replace(/[°′″'NSEW\s]/gi, (m) => {
    if (/[NSEW]/i.test(m)) return ''
    if (/[,\s]/.test(m)) return ','
    return ''
  }).replace(/,+/g, ',').replace(/^\s*,\s*|\s*,\s*$/g, '').trim()

  // 优先尝试从任意输入中直接提取坐标（包括用户直接粘贴 "lat, lng"）
  const directCoords = extractCoordsFromUrl(trimmed) || (() => {
    const m = trimmed.match(COORD_REGEX)
    if (m) {
      let lat = parseFloat(m[1])
      let lng = parseFloat(m[2])
      if (Math.abs(lat) > 90) [lat, lng] = [lng, lat]
      if (isFinite(lat) && isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
        return { lat, lng }
      }
    }
    return null
  })()
  if (directCoords && !/^https?:\/\//i.test(trimmed)) {
    return { lat: directCoords.lat, lng: directCoords.lng, source: 'manual' }
  }

  // 1. 先处理 Google 短链接（goo.gl / maps.app.goo.gl）
  if (/^https?:\/\//i.test(trimmed) && isGoogleShortLink(trimmed)) {
    trimmed = await expandGoogleShortLink(trimmed)
  }

  // 2. URL 链接（此时可能是展开后的完整链接）
  if (/^https?:\/\//i.test(trimmed)) {
    const coords = extractCoordsFromUrl(trimmed)
    if (coords) {
      let name = coords.name || extractNameFromUrl(trimmed)
      return {
        lat: coords.lat,
        lng: coords.lng,
        name: name?.slice(0, 80),
        source: trimmed.includes('google') ? 'google' :
                trimmed.includes('amap') || trimmed.includes('gaode') ? 'amap' :
                trimmed.includes('baidu') ? 'baidu' : 'geocode',
      }
    }

    // 如果是 URL 但正则没抓到坐标，尝试在整个 URL 字符串里找两个像坐标的数字
    const generalCoord = trimmed.match(/(-?\d{1,3}\.?\d{2,})[^0-9-]*(-?\d{1,3}\.?\d{2,})/);
    if (generalCoord) {
      let lat = parseFloat(generalCoord[1]);
      let lng = parseFloat(generalCoord[2]);
      if (Math.abs(lat) > 90) [lat, lng] = [lng, lat];
      if (isFinite(lat) && isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
        return { lat, lng, source: 'google' };  // 偏向 google 常见
      }
    }

    // 最后才尝试把 URL 当成名称去地理编码（不太靠谱，但作为 fallback）
    const nameGuess = extractNameFromUrl(trimmed) || trimmed;
    return await geocode(nameGuess);
  }

  // 2. Plus Code
  const plusMatch = trimmed.match(PLUS_CODE_REGEX)
  if (plusMatch) {
    const code = plusMatch[1]
    // 尝试从输入中提取名称 (去掉 code 部分) ，支持 "code 城市" 或 "城市 code"
    const name = trimmed.replace(plusMatch[0], '').trim() || undefined

    // 获取参考点：优先用名称的地理编码结果（对短码至关重要）
    let decodeRef = { lat: ref.lat, lng: ref.lng };
    if (name) {
      const geoRef = await geocode(name);
      if (geoRef) {
        decodeRef = { lat: geoRef.lat, lng: geoRef.lng };
      }
    }

    // 尝试本地解码短码/全码
    const decoded = decodePlusCode(code, decodeRef.lat, decodeRef.lng);
    if (decoded) {
      const [lng, lat] = decoded;
      return {
        lat,
        lng,
        name: name?.slice(0, 80),
        source: 'pluscode',
      };
    }

    // 最后兜底：如果有 Google Key，尝试用完整查询让 Google 直接解析 Plus Code
    const queryForGeo = name ? `${name} ${code}` : code;
    const geo = await geocode(queryForGeo);
    if (geo) {
      return {
        lat: geo.lat,
        lng: geo.lng,
        name: name?.slice(0, 80) || geo.name,
        source: 'pluscode',
      };
    }
  }

  // 3. 直接坐标文本 "lat, lng" （支持用户直接粘贴坐标）
  const coordMatch = trimmed.match(COORD_REGEX)
  if (coordMatch) {
    let lat = parseFloat(coordMatch[1])
    let lng = parseFloat(coordMatch[2])
    if (Math.abs(lat) > 90) [lat, lng] = [lng, lat]
    if (isFinite(lat) && isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
      return { lat, lng, source: 'manual' }
    }
  }

  // 4. 纯名称或 "名称 + Plus Code"
  // 如果包含 plus code 再尝试一次
  if (plusMatch) {
    const code = plusMatch[1]
    const namePart = trimmed.replace(plusMatch[0], '').trim()
    const decoded = decodePlusCode(code, ref.lat, ref.lng)
    if (decoded) {
      const [lng, lat] = decoded
      return { lat, lng, name: namePart || undefined, source: 'pluscode' }
    }
  }

  // 最后走地理编码
  return await geocode(trimmed)
}

// ============================================
// 地点搜索 (POI Search)
// ============================================

export interface PlaceSearchResult {
  name: string
  lat: number
  lng: number
  address: string
  source: 'google' | 'amap' | 'baidu' | 'photon' | 'nominatim' | 'geocode'
}

export type PlaceSearchProvider = 'google' | 'amap' | 'baidu' | 'auto'

export interface PlaceSearchOptions {
  provider?: PlaceSearchProvider
  bias?: { lat: number; lng: number }
  limit?: number
}

const NOMINATIM_HEADERS = { 'User-Agent': 'WorkWork-NomadMap/1.0' }
const PLACE_SEARCH_LIMIT = 10

let googlePlacesScriptPromise: Promise<GoogleMapsNamespace | null> | null = null
let googlePlacesService: GoogleMapsPlacesService | null = null

function isValidPlaceCoord(lat: number, lng: number): boolean {
  return Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180 && !(lat === 0 && lng === 0)
}

function placeResultKey(result: PlaceSearchResult): string {
  return `${result.name.toLowerCase()}|${result.lat.toFixed(4)}|${result.lng.toFixed(4)}`
}

function tokenizeSearchText(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff\s]/gi, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 1)
}

const COMMON_PLACE_WORDS = new Set([
  'the', 'and', 'market', 'night', 'serviced', 'apartments', 'apartment', 'street', 'road',
  'city', 'town', 'center', 'centre', 'mall', 'hotel', 'restaurant', 'cafe', 'coffee',
])

/** 按名称与搜索词重合度排序，减少 Photon 误匹配 */
function rankPlaceResults(results: PlaceSearchResult[], query: string): PlaceSearchResult[] {
  const normalizedQuery = normalizeSearchQuery(query).toLowerCase()
  const queryTokens = tokenizeSearchText(normalizedQuery)
  if (!queryTokens.length) return results

  const distinctiveTokens = queryTokens.filter(
    (token) => token.length >= 4 && !COMMON_PLACE_WORDS.has(token)
  )

  const scored = results.map((result) => {
    const nameText = result.name.toLowerCase()
    const addressTokens = tokenizeSearchText(result.address)
    let score = 0

    for (const token of queryTokens) {
      if (nameText.includes(token)) score += 3
      else if (addressTokens.some((addressToken) => addressToken.includes(token))) score += 1
    }

    if (nameText.includes(normalizedQuery)) score += 8
    if (result.source === 'google') score += 2

    const combinedText = `${nameText} ${result.address.toLowerCase()}`
    const matchedDistinctive = distinctiveTokens.filter((token) => combinedText.includes(token)).length
    if (distinctiveTokens.length > 0 && matchedDistinctive === 0) score = 0

    return { result, score, matchedDistinctive }
  })

  scored.sort((a, b) => b.score - a.score)

  const minScore = Math.max(3, distinctiveTokens.length > 0 ? 4 : 2)
  const filtered = scored.filter((item) => item.score >= minScore)

  return filtered.map((item) => item.result)
}

function mergePlaceResults(target: PlaceSearchResult[], incoming: PlaceSearchResult[], limit: number): void {
  const seen = new Set(target.map(placeResultKey))
  for (const item of incoming) {
    if (!isValidPlaceCoord(item.lat, item.lng)) continue
    const key = placeResultKey(item)
    if (seen.has(key)) continue
    seen.add(key)
    target.push(item)
    if (target.length >= limit) break
  }
}

/** 清理搜索词：去掉 @、多余空格和常见 filler */
function normalizeSearchQuery(query: string): string {
  return query
    .replace(/@/g, ' ')
    .replace(/\b(of|the|at|in)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** 生成多个搜索变体，提高海外 POI 命中率 */
function buildSearchQueryVariants(query: string): string[] {
  const trimmed = query.trim()
  if (!trimmed) return []

  const normalized = normalizeSearchQuery(trimmed)
  const variants = new Set<string>([trimmed, normalized])

  const withoutPrefix = trimmed.replace(/^cq\s*/i, 'Clarke Quay').trim()
  if (withoutPrefix !== trimmed) variants.add(withoutPrefix)

  const words = normalized.split(' ').filter(Boolean)
  if (words.length >= 3) {
    const reversed = [...words].reverse().join(' ')
    variants.add(reversed)

    const core = words.filter((word) => !/^(of|the|at|in|night|market)$/i.test(word)).join(' ')
    if (core) variants.add(core)
  }

  return [...variants].filter(Boolean)
}

async function loadGooglePlacesLibrary(): Promise<GoogleMapsNamespace | null> {
  const key = runtimeConfig.maps.googleMapsKey
  if (!key) return null

  if (typeof window === 'undefined') return null
  if (window.google?.maps?.places) return window.google

  if (!googlePlacesScriptPromise) {
    googlePlacesScriptPromise = new Promise((resolve) => {
      const callbackName = '__gmapsPlacesInit'
      window[callbackName] = () => resolve(window.google ?? null)

      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&libraries=places&callback=${callbackName}`
      script.async = true
      script.onerror = () => resolve(null)
      document.head.appendChild(script)
    })
  }

  return googlePlacesScriptPromise
}

async function getGooglePlacesService(): Promise<GoogleMapsPlacesService | null> {
  const googleMaps = await loadGooglePlacesLibrary()
  if (!googleMaps?.maps?.places) return null

  if (!googlePlacesService) {
    const host = document.createElement('div')
    googlePlacesService = new googleMaps.maps.places.PlacesService(host)
  }

  return googlePlacesService
}

async function searchWithGooglePlaces(
  query: string,
  bias?: { lat: number; lng: number }
): Promise<PlaceSearchResult[]> {
  const service = await getGooglePlacesService()
  if (!service) return []

  const googleMaps = window.google
  const statusOk = googleMaps?.maps?.places?.PlacesServiceStatus?.OK ?? 'OK'

  const runQuery = (q: string) =>
    new Promise<PlaceSearchResult[]>((resolve) => {
      const request: { query: string; location?: { lat: number; lng: number }; radius?: number } = { query: q }
      if (bias && isValidPlaceCoord(bias.lat, bias.lng)) {
        request.location = { lat: bias.lat, lng: bias.lng }
        request.radius = 50000
      }

      service.textSearch(request, (results, status) => {
        if (status !== statusOk || !results?.length) {
          resolve([])
          return
        }

        resolve(
          results
            .map((item) => {
              const lat = item.geometry?.location?.lat?.() ?? NaN
              const lng = item.geometry?.location?.lng?.() ?? NaN
              return {
                name: item.name ?? q,
                lat,
                lng,
                address: item.formatted_address ?? '',
                source: 'google' as const,
              }
            })
            .filter((item) => isValidPlaceCoord(item.lat, item.lng))
        )
      })
    })

  for (const variant of buildSearchQueryVariants(query)) {
    const results = await runQuery(variant)
    if (results.length) return results.slice(0, PLACE_SEARCH_LIMIT)
  }

  return []
}

async function searchWithAmap(query: string): Promise<PlaceSearchResult[]> {
  const key = runtimeConfig.maps.amapKey
  if (!key) return []

  const results: PlaceSearchResult[] = []

  for (const variant of buildSearchQueryVariants(query)) {
    const url = `https://restapi.amap.com/v3/place/text?keywords=${encodeURIComponent(variant)}&key=${key}&offset=${PLACE_SEARCH_LIMIT}&extensions=all`
    try {
      const res = await fetch(url)
      const data = await res.json()
      if (data.status === '1' && data.pois) {
        mergePlaceResults(
          results,
          data.pois.map((p: { name: string; location?: string; address?: string; pname?: string; cityname?: string; adname?: string }) => {
            let lat = 0
            let lng = 0
            if (p.location) {
              const [gcjLng, gcjLat] = p.location.split(',').map(Number)
              ;[lng, lat] = gcj02ToWgs84(gcjLng, gcjLat)
            }
            return {
              name: p.name,
              lat,
              lng,
              address: p.address || `${p.pname ?? ''}${p.cityname ?? ''}${p.adname ?? ''}`,
              source: 'amap' as const,
            }
          }),
          PLACE_SEARCH_LIMIT
        )
      }
    } catch {
      // ignore
    }
    if (results.length) break
  }

  return results
}

async function searchWithBaidu(query: string): Promise<PlaceSearchResult[]> {
  const key = runtimeConfig.maps.baiduMapKey
  if (!key) return []

  const results: PlaceSearchResult[] = []

  for (const variant of buildSearchQueryVariants(query)) {
    const url = `https://api.map.baidu.com/place/v2/search?query=${encodeURIComponent(variant)}&region=全国&output=json&ak=${key}`
    try {
      const res = await fetch(url)
      const data = await res.json()
      if (data.status === 0 && data.results) {
        mergePlaceResults(
          results,
          data.results.map((r: { name: string; location?: { lat: number; lng: number }; address?: string }) => {
            const lat = r.location?.lat ?? 0
            const lng = r.location?.lng ?? 0
            const [wgsLng, wgsLat] = bd09ToWgs84(lng, lat)
            return {
              name: r.name,
              lat: wgsLat,
              lng: wgsLng,
              address: r.address || '',
              source: 'baidu' as const,
            }
          }),
          PLACE_SEARCH_LIMIT
        )
      }
    } catch {
      // ignore
    }
    if (results.length) break
  }

  return results
}

async function searchWithPhoton(
  query: string,
  bias?: { lat: number; lng: number }
): Promise<PlaceSearchResult[]> {
  const results: PlaceSearchResult[] = []

  for (const variant of buildSearchQueryVariants(query)) {
    const params = new URLSearchParams({ q: variant, limit: String(PLACE_SEARCH_LIMIT) })
    if (bias && isValidPlaceCoord(bias.lat, bias.lng)) {
      params.set('lat', String(bias.lat))
      params.set('lon', String(bias.lng))
    }

    try {
      const res = await fetch(`https://photon.komoot.io/api/?${params.toString()}`)
      const data = await res.json()
      const features = data.features ?? []

      mergePlaceResults(
        results,
        features.map((feature: { properties?: Record<string, string>; geometry?: { coordinates?: [number, number] } }) => {
          const props = feature.properties ?? {}
          const coords = feature.geometry?.coordinates ?? [0, 0]
          const parts = [props.housenumber, props.street, props.city, props.state, props.country].filter(Boolean)

          return {
            name: props.name || variant,
            lat: coords[1] ?? 0,
            lng: coords[0] ?? 0,
            address: parts.join(', '),
            source: 'photon' as const,
          }
        }),
        PLACE_SEARCH_LIMIT * 2
      )
    } catch {
      // ignore
    }
  }

  return results.slice(0, PLACE_SEARCH_LIMIT)
}

async function searchWithNominatim(
  query: string,
  bias?: { lat: number; lng: number }
): Promise<PlaceSearchResult[]> {
  const results: PlaceSearchResult[] = []

  for (const variant of buildSearchQueryVariants(query)) {
    const params = new URLSearchParams({
      format: 'json',
      q: variant,
      limit: String(PLACE_SEARCH_LIMIT),
      addressdetails: '1',
    })

    if (bias && isValidPlaceCoord(bias.lat, bias.lng)) {
      const pad = 0.45
      const left = bias.lng - pad
      const right = bias.lng + pad
      const top = bias.lat + pad
      const bottom = bias.lat - pad
      params.set('viewbox', `${left},${top},${right},${bottom}`)
      params.set('bounded', '0')
    }

    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
        headers: NOMINATIM_HEADERS,
      })
      const data = await res.json()

      mergePlaceResults(
        results,
        (data ?? []).map((item: { display_name?: string; lat?: string; lon?: string; name?: string }) => ({
          name: item.name || item.display_name?.split(',')[0] || variant,
          lat: parseFloat(item.lat ?? '0'),
          lng: parseFloat(item.lon ?? '0'),
          address: item.display_name ?? '',
          source: 'nominatim' as const,
        })),
        PLACE_SEARCH_LIMIT * 2
      )
    } catch {
      // ignore
    }
  }

  return results.slice(0, PLACE_SEARCH_LIMIT)
}

async function searchWithGlobalProviders(
  query: string,
  bias?: { lat: number; lng: number }
): Promise<PlaceSearchResult[]> {
  const results: PlaceSearchResult[] = []

  const [googleResults, photonResults, nominatimResults] = await Promise.all([
    searchWithGooglePlaces(query, bias),
    searchWithPhoton(query, bias),
    searchWithNominatim(query, bias),
  ])

  const merged = [...googleResults, ...photonResults, ...nominatimResults]
  mergePlaceResults(results, rankPlaceResults(merged, query), PLACE_SEARCH_LIMIT)

  if (results.length === 0) {
    const geo = await geocode(query)
    if (geo && isValidPlaceCoord(geo.lat, geo.lng)) {
      results.push({
        name: geo.name || query,
        lat: geo.lat,
        lng: geo.lng,
        address: '',
        source: 'geocode',
      })
    }
  }

  return results
}

/**
 * 统一点搜索入口
 * - 有 Key 时走对应地图商
 * - 无结果时自动回退到全球搜索 (Google JS / Photon / Nominatim)
 */
export async function searchPlaces(
  query: string,
  options: PlaceSearchOptions = {}
): Promise<PlaceSearchResult[]> {
  const trimmed = query.trim()
  if (!trimmed) return []

  const provider = options.provider ?? 'auto'
  const bias = options.bias
  const limit = options.limit ?? PLACE_SEARCH_LIMIT
  const keys = runtimeConfig.maps

  let results: PlaceSearchResult[] = []

  if (provider === 'google' || (provider === 'auto' && keys.googleMapsKey)) {
    results = await searchWithGooglePlaces(trimmed, bias)
  } else if (provider === 'amap' && keys.amapKey) {
    results = await searchWithAmap(trimmed)
  } else if (provider === 'baidu' && keys.baiduMapKey) {
    results = await searchWithBaidu(trimmed)
  }

  if (results.length === 0) {
    results = await searchWithGlobalProviders(trimmed, bias)
  }

  return rankPlaceResults(results, trimmed).slice(0, limit)
}
