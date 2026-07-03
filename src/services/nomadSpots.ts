import { supabase } from '@/lib/supabase'
import type { NomadSpot } from '@/types/database'

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

export async function fetchActiveNomadSpots(): Promise<{ data: NomadSpot[]; error: string | null }> {
  const { data, error } = await supabase
    .from('nomad_spots')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (error) {
    return { data: [], error: error.message }
  }

  return { data: data ?? [], error: null }
}

export async function createNomadSpot(input: CreateNomadSpotInput): Promise<{ data: NomadSpot | null; error: string | null }> {
  const { data, error } = await supabase
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
    .select('*')
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  return { data, error: null }
}
