/** Conservative mainland China + Hainan + HK / Macau / Taiwan. Excludes SEA, India, Mongolia. */
export function isInChina(lng: number, lat: number): boolean {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false

  // Hainan
  if (lng >= 108.6 && lng <= 111.4 && lat >= 18.05 && lat <= 20.2) return true

  if (lng < 73.6 || lng > 134.8 || lat < 20.4 || lat > 53.6) return false
  // Vietnam / Laos / Thailand / Myanmar
  if (lat < 22.85 && lng < 107.7) return false
  // Bangladesh / India / Bhutan / Nepal
  if (lng < 97.2 && lat < 27.6) return false
  // Mongolia
  if (lat > 46.6 && lng < 123.5) return false
  // Japan / Korea / open sea east of Shanghai at low latitudes
  if (lng > 124.2 && lat < 39.8) return false

  return true
}

export function isCoordinateOnlyInput(text: string): boolean {
  return /^[-+\d\s,./°′″'NSEW]+$/i.test(text.trim())
}

/** Normalize pasted coordinates only. Never strip letters from URLs or place names. */
export function normalizeCoordinateText(text: string): string {
  return text
    .replace(/[°′″']/g, '')
    .replace(/\s*([NSEW])\s*/gi, ',')
    .replace(/[,\s]+/g, ',')
    .replace(/^,|,$/g, '')
    .trim()
}
