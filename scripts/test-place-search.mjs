/**
 * Quick CLI test for global place search fallbacks (Photon + Nominatim).
 * Usage: node scripts/test-place-search.mjs
 */

const QUERIES = [
  'CQ @ Clarke Quay',
  'night market of Tan Hiok Nee',
  'The Mirror Serviced Apartments',
]

const BIAS = { lat: 18.7883, lng: 98.9853 } // Chiang Mai default map center

function normalizeSearchQuery(query) {
  return query
    .replace(/@/g, ' ')
    .replace(/\b(of|the|at|in)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function buildSearchQueryVariants(query) {
  const trimmed = query.trim()
  const normalized = normalizeSearchQuery(trimmed)
  const variants = new Set([trimmed, normalized])

  const withoutPrefix = trimmed.replace(/^cq\s*/i, 'Clarke Quay').trim()
  if (withoutPrefix !== trimmed) variants.add(withoutPrefix)

  const words = normalized.split(' ').filter(Boolean)
  if (words.length >= 3) {
    variants.add([...words].reverse().join(' '))
    const core = words.filter((word) => !/^(of|the|at|in|night|market)$/i.test(word)).join(' ')
    if (core) variants.add(core)
  }

  return [...variants].filter(Boolean)
}

async function searchPhoton(variant, bias) {
  const params = new URLSearchParams({ q: variant, limit: '5' })
  if (bias) {
    params.set('lat', String(bias.lat))
    params.set('lon', String(bias.lng))
  }
  const res = await fetch(`https://photon.komoot.io/api/?${params}`)
  const data = await res.json()
  return (data.features ?? []).map((f) => ({
    name: f.properties?.name,
    address: [f.properties?.street, f.properties?.city, f.properties?.country].filter(Boolean).join(', '),
    lat: f.geometry?.coordinates?.[1],
    lng: f.geometry?.coordinates?.[0],
    source: 'photon',
  }))
}

async function searchNominatim(variant, bias) {
  const params = new URLSearchParams({ format: 'json', q: variant, limit: '5' })
  if (bias) {
    const pad = 0.45
    params.set('viewbox', `${bias.lng - pad},${bias.lat + pad},${bias.lng + pad},${bias.lat - pad}`)
    params.set('bounded', '0')
  }
  const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
    headers: { 'User-Agent': 'WorkWork-NomadMap/1.0' },
  })
  const data = await res.json()
  return (data ?? []).map((item) => ({
    name: item.name || item.display_name?.split(',')[0],
    address: item.display_name,
    lat: Number(item.lat),
    lng: Number(item.lon),
    source: 'nominatim',
  }))
}

const COMMON = new Set(['the','and','market','night','serviced','apartments','apartment','street','road','city','town','center','centre','mall','hotel','restaurant','cafe','coffee'])

function rank(results, query) {
  const normalized = normalizeSearchQuery(query).toLowerCase()
  const tokens = normalized.split(/\s+/).filter((t) => t.length > 1)
  const distinctive = tokens.filter((t) => t.length >= 4 && !COMMON.has(t))
  const scored = results.map((result) => {
    const combined = `${result.name} ${result.address}`.toLowerCase()
    let score = 0
    for (const token of tokens) if (combined.includes(token)) score += 3
    if (distinctive.length && !distinctive.some((t) => combined.includes(t))) score = 0
    return { result, score }
  })
  return scored.filter((x) => x.score >= 3).sort((a, b) => b.score - a.score).map((x) => x.result)
}

async function testQuery(query) {
  console.log(`\n=== ${query} ===`)
  const variants = buildSearchQueryVariants(query)
  console.log('variants:', variants.join(' | '))

  const merged = []
  for (const variant of variants) {
    const [photon, nominatim] = await Promise.all([
      searchPhoton(variant, BIAS),
      searchNominatim(variant, BIAS),
    ])
    merged.push(...photon, ...nominatim)
  }

  const ranked = rank(merged, query)
  if (ranked.length) {
    for (const item of ranked.slice(0, 5)) {
      console.log(`  - (${item.source}) ${item.name} | ${item.address?.slice(0, 70)}`)
    }
    return true
  }

  console.log('  NO RESULTS (configure VITE_GOOGLE_MAPS_KEY or paste Google Maps link)')
  return false
}

const summary = []
for (const query of QUERIES) {
  summary.push({ query, ok: await testQuery(query) })
}

console.log('\n--- Summary ---')
for (const item of summary) {
  console.log(`${item.ok ? '✓' : '✗'} ${item.query}`)
}