type ReactionMap = Record<string, number>

const LIKES_KEY = 'workwork-spot-likes'
const WANTS_KEY = 'workwork-spot-wants'

function readSet(key: string): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || '[]') as string[]
    return new Set(Array.isArray(parsed) ? parsed : [])
  } catch {
    return new Set()
  }
}

function writeSet(key: string, value: Set<string>): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify([...value]))
  } catch {
    // quota
  }
}

function readCounts(key: string): ReactionMap {
  if (typeof window === 'undefined') return {}
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || '{}') as ReactionMap
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function writeCounts(key: string, value: ReactionMap): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // quota
  }
}

export function hasLikedSpot(id: string): boolean {
  return readSet(`${LIKES_KEY}-mine`).has(id)
}

export function hasWantedSpot(id: string): boolean {
  return readSet(WANTS_KEY).has(id)
}

export function extraLikesForSpot(id: string): number {
  return readCounts(LIKES_KEY)[id] ?? 0
}

export function toggleLikeSpot(id: string): { liked: boolean; extra: number } {
  const mine = readSet(`${LIKES_KEY}-mine`)
  const counts = readCounts(LIKES_KEY)
  const liked = mine.has(id)
  if (liked) {
    mine.delete(id)
    counts[id] = Math.max(0, (counts[id] ?? 1) - 1)
  } else {
    mine.add(id)
    counts[id] = (counts[id] ?? 0) + 1
  }
  writeSet(`${LIKES_KEY}-mine`, mine)
  writeCounts(LIKES_KEY, counts)
  return { liked: !liked, extra: counts[id] ?? 0 }
}

export function toggleWantSpot(id: string): boolean {
  const wants = readSet(WANTS_KEY)
  if (wants.has(id)) wants.delete(id)
  else wants.add(id)
  writeSet(WANTS_KEY, wants)
  return wants.has(id)
}
