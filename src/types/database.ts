export type UserRole = 'user' | 'editor' | 'admin'
export type ArticleStatus = 'draft' | 'pending' | 'published' | 'rejected'
export type SpotStatus = 'active' | 'flagged' | 'deleted'
export type BookmarkTargetType = 'article' | 'spot' | 'podcast'

export interface Profile {
  id: string
  username: string | null
  avatar_url: string | null
  bio: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export interface Article {
  id: string
  author_id: string | null
  title: string
  excerpt: string | null
  content: string | null
  cover_image: string | null
  category: string
  status: ArticleStatus
  read_time: string | null
  published_at: string | null
  created_at: string
  updated_at: string
  // Joined fields
  author?: Profile
}

export interface PodcastEpisode {
  id: string
  title: string
  host: string | null
  duration: string | null
  cover_image: string | null
  audio_url: string | null
  description: string | null
  published_at: string | null
  created_at: string
}

export interface NomadSpot {
  id: string
  creator_id: string | null
  name: string
  description: string | null
  latitude: number
  longitude: number
  city: string | null
  country: string | null
  tags: string[]
  rating: number
  images: string[]
  status: SpotStatus
  created_at: string
  updated_at: string
  // Joined fields
  creator?: Profile
}

export interface Bookmark {
  id: string
  user_id: string
  target_type: BookmarkTargetType
  target_id: string
  created_at: string
}

// Database type for Supabase
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>
      }
      articles: {
        Row: Article
        Insert: Omit<Article, 'id' | 'created_at' | 'updated_at' | 'author'>
        Update: Partial<Omit<Article, 'id' | 'author_id' | 'created_at' | 'updated_at' | 'author'>>
      }
      podcast_episodes: {
        Row: PodcastEpisode
        Insert: Omit<PodcastEpisode, 'id' | 'created_at'>
        Update: Partial<Omit<PodcastEpisode, 'id' | 'created_at'>>
      }
      nomad_spots: {
        Row: NomadSpot
        Insert: Omit<NomadSpot, 'id' | 'created_at' | 'updated_at' | 'creator'>
        Update: Partial<Omit<NomadSpot, 'id' | 'creator_id' | 'created_at' | 'updated_at' | 'creator'>>
      }
      bookmarks: {
        Row: Bookmark
        Insert: Omit<Bookmark, 'id' | 'created_at'>
        Update: never
      }
    }
    Enums: {
      user_role: UserRole
      article_status: ArticleStatus
      spot_status: SpotStatus
      bookmark_target_type: BookmarkTargetType
    }
  }
}

// Helper types for queries
export type ArticleWithAuthor = Article & {
  author: Profile
}

export type SpotWithCreator = NomadSpot & {
  creator: Profile
}

// Pagination type
export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  pageSize: number
  totalPages: number
}

// API response type
export interface ApiResponse<T> {
  data: T | null
  error: string | null
}
