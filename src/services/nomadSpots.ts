import { supabase } from '@/lib/supabase'
import type { NomadSpot } from '@/types/database'
import { friendlyNetworkError, withTimeout } from '@/utils/errors'
import {
  createLocalNomadSpot,
  mergeRemoteAndLocalSpots,
  upsertLocalNomadSpot,
} from '@/services/localSpots'

export type CreateNomadSpotInput = {
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

const CACHE_KEY = 'workwork-nomad-spots-cache'
const CACHE_TTL_MS = 5 * 60 * 1000
const SPOT_COLUMNS =
  'id,name,description,latitude,longitude,city,country,tags,images,rating,created_at,status'

type SpotCachePayload = {
  ts: number
  data: NomadSpot[]
}

export function readCachedNomadSpots(): NomadSpot[] | null {
  if (typeof window === 'undefined') return null

  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as SpotCachePayload
    if (!Array.isArray(parsed.data) || Date.now() - parsed.ts > CACHE_TTL_MS) {
      sessionStorage.removeItem(CACHE_KEY)
      return null
    }

    return parsed.data
  } catch {
    return null
  }
}

function writeNomadSpotsCache(data: NomadSpot[]): void {
  if (typeof window === 'undefined' || !data.length) return

  try {
    const payload: SpotCachePayload = { ts: Date.now(), data }
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(payload))
  } catch {
    // quota exceeded — ignore
  }
}

async function fetchNomadSpotsFromNetwork(): Promise<{ data: NomadSpot[]; error: string | null }> {
  try {
    const { data, error } = await withTimeout(
      supabase
        .from('nomad_spots')
        .select(SPOT_COLUMNS)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(200),
      5000,
      '地点服务连接超时'
    )

    if (error) {
      return {
        data: mergeRemoteAndLocalSpots([]),
        error: friendlyNetworkError(error.message, '暂时无法同步云端地点'),
      }
    }

    const spots = mergeRemoteAndLocalSpots((data ?? []) as NomadSpot[])
    writeNomadSpotsCache(spots)
    return { data: spots, error: null }
  } catch (error) {
    return {
      data: mergeRemoteAndLocalSpots([]),
      error: friendlyNetworkError(error, '暂时无法同步云端地点，已显示本地地点'),
    }
  }
}

let prefetchPromise: Promise<{ data: NomadSpot[]; error: string | null }> | null = null

export function prefetchNomadSpots(): Promise<{ data: NomadSpot[]; error: string | null }> {
  if (!prefetchPromise) {
    prefetchPromise = fetchNomadSpotsFromNetwork().finally(() => {
      prefetchPromise = null
    })
  }
  return prefetchPromise
}

export async function fetchActiveNomadSpots(): Promise<{
  data: NomadSpot[]
  error: string | null
  fromCache?: boolean
}> {
  const cached = readCachedNomadSpots()
  if (cached?.length) {
    return { data: cached, error: null, fromCache: true }
  }

  return fetchNomadSpotsFromNetwork()
}

export async function revalidateNomadSpots(): Promise<{ data: NomadSpot[]; error: string | null }> {
  return fetchNomadSpotsFromNetwork()
}

export async function createNomadSpot(input: CreateNomadSpotInput): Promise<{ data: NomadSpot | null; error: string | null }> {
  try {
    const { data, error } = await withTimeout(
      supabase
        .from('nomad_spots')
        .insert({
          creator_id: input.creatorId,
          name: input.name,
          description: input.description,
          latitude: input.latitude,
          longitude: input.longitude,
          city: input.city || null,
          country: input.country || null,
          tags: input.tags,
          images: input.images ?? [],
          status: 'active',
        })
        .select(SPOT_COLUMNS)
        .single(),
      3500,
      '保存超时'
    )

    if (!error && data) {
      upsertLocalNomadSpot(data as NomadSpot)
      return { data: data as NomadSpot, error: null }
    }
  } catch {
    // fall through to local save
  }

  const local = createLocalNomadSpot(input)
  return { data: local, error: null }
}

export async function updateNomadSpotRegion(
  spotId: string,
  city: string,
  country: string
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('nomad_spots')
    .update({ city: city || null, country: country || null })
    .eq('id', spotId)

  return { error: error?.message ?? null }
}