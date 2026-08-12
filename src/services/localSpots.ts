import type { NomadSpot } from '@/types/database'

export type LocalSpotDraft = {
  creatorId: string
  name: string
  description: string
  latitude: number
  longitude: number
  city?: string
  country?: string
  tags: string[]
  images?: string[]
}

const LOCAL_KEY = 'workwork-local-nomad-spots'

function randomId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export function readLocalNomadSpots(): NomadSpot[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as NomadSpot[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function writeLocalNomadSpots(spots: NomadSpot[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(spots))
  } catch {
    // quota
  }
}

export function upsertLocalNomadSpot(spot: NomadSpot): NomadSpot {
  const spots = readLocalNomadSpots().filter((item) => item.id !== spot.id)
  const next = [spot, ...spots]
  writeLocalNomadSpots(next)
  return spot
}

export function createLocalNomadSpot(input: LocalSpotDraft): NomadSpot {
  const now = new Date().toISOString()
  const spot: NomadSpot = {
    id: randomId(),
    creator_id: input.creatorId,
    name: input.name,
    description: input.description,
    latitude: input.latitude,
    longitude: input.longitude,
    city: input.city ?? null,
    country: input.country ?? null,
    tags: [...input.tags, input.creatorId ? `author:${input.creatorId}` : ''].filter(Boolean),
    rating: 0,
    images: input.images ?? [],
    status: 'active',
    created_at: now,
    updated_at: now,
  }
  return upsertLocalNomadSpot(spot)
}

export function mergeRemoteAndLocalSpots(remote: NomadSpot[]): NomadSpot[] {
  const local = readLocalNomadSpots()
  const remoteIds = new Set(remote.map((spot) => spot.id))
  return [...local.filter((spot) => !remoteIds.has(spot.id)), ...remote]
}
