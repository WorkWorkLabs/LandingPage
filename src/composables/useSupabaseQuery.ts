import { hasSupabaseConfig } from '@/config/app'
import {
  DEMO_CATEGORIES,
  DEMO_PODCASTS,
  getDemoArticleById,
  getDemoFeaturedArticles,
  getDemoPublishedArticles,
  getDemoTrendingArticles,
} from '@/constants/demoContent'
import { supabase } from '@/lib/supabase'
import type {
  Article,
  PodcastEpisode,
  Category,
  Subscriber,
} from '@/types/database'

const QUERY_TIMEOUT_MS = 5000
const CACHE_TTL_MS = 5 * 60 * 1000

const ARTICLE_LIST_FIELDS =
  'id,title,excerpt,cover_image,author_name,category,read_time,views,is_featured,published_at,status,created_at,updated_at,author_id'
const PODCAST_LIST_FIELDS = 'id,title,host,duration,cover_image,published_at,created_at'
const CATEGORY_FIELDS = 'id,slug,label,icon,sort_order,is_active,created_at'

type CacheEntry<T> = { data: T; expires: number }
const queryCache = new Map<string, CacheEntry<unknown>>()

function getCached<T>(key: string): T | null {
  const entry = queryCache.get(key)
  if (!entry || Date.now() > entry.expires) {
    queryCache.delete(key)
    return null
  }
  return entry.data as T
}

function setCache<T>(key: string, data: T): T {
  queryCache.set(key, { data, expires: Date.now() + CACHE_TTL_MS })
  return data
}

async function withTimeout<T>(promise: Promise<T>, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => {
      window.setTimeout(() => resolve(fallback), QUERY_TIMEOUT_MS)
    }),
  ])
}

function asArticleList(rows: Article[] | null | undefined, fallback: () => Article[]): Article[] {
  if (!rows?.length) return fallback()
  return rows
}

// ============================================
// 文章查询
// ============================================

/** 获取所有已发布文章（按发布时间倒序） */
export async function fetchPublishedArticles(limit = 20): Promise<Article[]> {
  const cacheKey = `published:${limit}`
  const cached = getCached<Article[]>(cacheKey)
  if (cached) return cached

  if (!hasSupabaseConfig()) return setCache(cacheKey, getDemoPublishedArticles(limit))

  const { data, error } = await withTimeout(
    supabase
      .from('articles')
      .select(ARTICLE_LIST_FIELDS)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(limit)
      .then((result) => result),
    { data: null, error: { message: 'timeout' } as { message: string } }
  )

  if (error) {
    console.warn('fetchPublishedArticles fallback:', error)
    return setCache(cacheKey, getDemoPublishedArticles(limit))
  }

  return setCache(cacheKey, asArticleList(data as Article[] | null, () => getDemoPublishedArticles(limit)))
}

/** 获取编辑精选文章（is_featured = true） */
export async function fetchFeaturedArticles(): Promise<Article[]> {
  const cacheKey = 'featured'
  const cached = getCached<Article[]>(cacheKey)
  if (cached) return cached

  if (!hasSupabaseConfig()) return setCache(cacheKey, getDemoFeaturedArticles())

  const { data, error } = await withTimeout(
    supabase
      .from('articles')
      .select(ARTICLE_LIST_FIELDS)
      .eq('status', 'published')
      .eq('is_featured', true)
      .order('published_at', { ascending: false })
      .then((result) => result),
    { data: null, error: { message: 'timeout' } as { message: string } }
  )

  if (error) {
    console.warn('fetchFeaturedArticles fallback:', error)
    return setCache(cacheKey, getDemoFeaturedArticles())
  }

  return setCache(cacheKey, asArticleList(data as Article[] | null, () => getDemoFeaturedArticles()))
}

/** 获取热门文章（按浏览量排序） */
export async function fetchTrendingArticles(limit = 6): Promise<Article[]> {
  const cacheKey = `trending:${limit}`
  const cached = getCached<Article[]>(cacheKey)
  if (cached) return cached

  if (!hasSupabaseConfig()) return setCache(cacheKey, getDemoTrendingArticles(limit))

  const { data, error } = await withTimeout(
    supabase
      .from('articles')
      .select(ARTICLE_LIST_FIELDS)
      .eq('status', 'published')
      .order('views', { ascending: false })
      .limit(limit)
      .then((result) => result),
    { data: null, error: { message: 'timeout' } as { message: string } }
  )

  if (error) {
    console.warn('fetchTrendingArticles fallback:', error)
    return setCache(cacheKey, getDemoTrendingArticles(limit))
  }

  return setCache(cacheKey, asArticleList(data as Article[] | null, () => getDemoTrendingArticles(limit)))
}

/** 获取单篇文章详情 */
export async function fetchArticleById(id: string): Promise<Article | null> {
  const demoArticle = getDemoArticleById(id)
  if (!hasSupabaseConfig()) return demoArticle

  const cacheKey = `article:${id}`
  const cached = getCached<Article>(cacheKey)
  if (cached) return cached

  const { data, error } = await withTimeout(
    supabase.from('articles').select('*').eq('id', id).single().then((result) => result),
    { data: null, error: { message: 'timeout' } as { message: string } }
  )

  if (error || !data) {
    console.warn('fetchArticleById fallback:', error)
    return demoArticle
  }

  return setCache(cacheKey, data as Article)
}

/** 增加文章浏览量（直接更新 views 字段） */
export async function incrementArticleViews(id: string): Promise<void> {
  if (!hasSupabaseConfig() || id.startsWith('demo-')) return

  const { data: article } = await supabase
    .from('articles')
    .select('views')
    .eq('id', id)
    .single()

  if (article) {
    await supabase
      .from('articles')
      .update({ views: (article.views ?? 0) + 1 })
      .eq('id', id)
  }
}

// ============================================
// 播客查询
// ============================================

/** 获取所有已发布播客（按发布时间倒序） */
export async function fetchPodcastEpisodes(limit = 10): Promise<PodcastEpisode[]> {
  const cacheKey = `podcasts:${limit}`
  const cached = getCached<PodcastEpisode[]>(cacheKey)
  if (cached) return cached

  if (!hasSupabaseConfig()) return setCache(cacheKey, DEMO_PODCASTS.slice(0, limit))

  const { data, error } = await withTimeout(
    supabase
      .from('podcast_episodes')
      .select(PODCAST_LIST_FIELDS)
      .not('published_at', 'is', null)
      .lte('published_at', new Date().toISOString())
      .order('published_at', { ascending: false })
      .limit(limit)
      .then((result) => result),
    { data: null, error: { message: 'timeout' } as { message: string } }
  )

  if (error) {
    console.warn('fetchPodcastEpisodes fallback:', error)
    return setCache(cacheKey, DEMO_PODCASTS.slice(0, limit))
  }

  if (!data?.length) return setCache(cacheKey, DEMO_PODCASTS.slice(0, limit))
  return setCache(cacheKey, data as PodcastEpisode[])
}

// ============================================
// 分类查询
// ============================================

/** 获取所有活跃分类 */
export async function fetchCategories(): Promise<Category[]> {
  const cacheKey = 'categories'
  const cached = getCached<Category[]>(cacheKey)
  if (cached) return cached

  if (!hasSupabaseConfig()) return setCache(cacheKey, DEMO_CATEGORIES)

  const { data, error } = await withTimeout(
    supabase
      .from('categories')
      .select(CATEGORY_FIELDS)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .then((result) => result),
    { data: null, error: { message: 'timeout' } as { message: string } }
  )

  if (error) {
    console.warn('fetchCategories fallback:', error)
    return setCache(cacheKey, DEMO_CATEGORIES)
  }

  if (!data?.length) return setCache(cacheKey, DEMO_CATEGORIES)
  return setCache(cacheKey, data as Category[])
}

/** 首页关键数据：首屏优先并行拉取 */
export async function fetchHomeCriticalData(): Promise<{
  featured: Article[]
  categories: Category[]
  articles: Article[]
}> {
  const [featured, categories, articles] = await Promise.all([
    fetchFeaturedArticles(),
    fetchCategories(),
    fetchPublishedArticles(8),
  ])
  return { featured, categories, articles }
}

/** 首页次要数据：可延迟加载 */
export async function fetchHomeSecondaryData(): Promise<{
  podcasts: PodcastEpisode[]
  trending: Article[]
}> {
  const [podcasts, trending] = await Promise.all([
    fetchPodcastEpisodes(3),
    fetchTrendingArticles(6),
  ])
  return { podcasts, trending }
}

// ============================================
// 邮件订阅
// ============================================

/** 订阅邮件列表 */
export async function subscribe(email: string): Promise<{ error: string | null }> {
  if (!hasSupabaseConfig()) {
    return { error: '演示模式下暂不支持订阅，请配置 Supabase 后重试' }
  }

  const { error } = await supabase
    .from('subscribers')
    .insert({ email })

  if (error) {
    if (error.code === '23505') {
      return { error: '该邮箱已订阅' }
    }
    return { error: error.message }
  }
  return { error: null }
}