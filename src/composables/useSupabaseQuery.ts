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

const QUERY_TIMEOUT_MS = 8000

async function withTimeout<T>(promise: Promise<T>, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => {
      window.setTimeout(() => resolve(fallback), QUERY_TIMEOUT_MS)
    }),
  ])
}

// ============================================
// 文章查询
// ============================================

/** 获取所有已发布文章（按发布时间倒序） */
export async function fetchPublishedArticles(limit = 20): Promise<Article[]> {
  if (!hasSupabaseConfig()) return getDemoPublishedArticles(limit)

  const { data, error } = await withTimeout(
    supabase
      .from('articles')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(limit)
      .then((result) => result),
    { data: null, error: { message: 'timeout' } as { message: string } }
  )

  if (error) {
    console.warn('fetchPublishedArticles fallback:', error)
    return getDemoPublishedArticles(limit)
  }
  if (!data?.length) return getDemoPublishedArticles(limit)
  return data
}

/** 获取编辑精选文章（is_featured = true） */
export async function fetchFeaturedArticles(): Promise<Article[]> {
  if (!hasSupabaseConfig()) return getDemoFeaturedArticles()

  const { data, error } = await withTimeout(
    supabase
      .from('articles')
      .select('*')
      .eq('status', 'published')
      .eq('is_featured', true)
      .order('published_at', { ascending: false })
      .then((result) => result),
    { data: null, error: { message: 'timeout' } as { message: string } }
  )

  if (error) {
    console.warn('fetchFeaturedArticles fallback:', error)
    return getDemoFeaturedArticles()
  }
  if (!data?.length) return getDemoFeaturedArticles()
  return data
}

/** 获取热门文章（按浏览量排序） */
export async function fetchTrendingArticles(limit = 6): Promise<Article[]> {
  if (!hasSupabaseConfig()) return getDemoTrendingArticles(limit)

  const { data, error } = await withTimeout(
    supabase
      .from('articles')
      .select('*')
      .eq('status', 'published')
      .order('views', { ascending: false })
      .limit(limit)
      .then((result) => result),
    { data: null, error: { message: 'timeout' } as { message: string } }
  )

  if (error) {
    console.warn('fetchTrendingArticles fallback:', error)
    return getDemoTrendingArticles(limit)
  }
  if (!data?.length) return getDemoTrendingArticles(limit)
  return data
}

/** 获取单篇文章详情 */
export async function fetchArticleById(id: string): Promise<Article | null> {
  const demoArticle = getDemoArticleById(id)
  if (!hasSupabaseConfig()) return demoArticle

  const { data, error } = await withTimeout(
    supabase.from('articles').select('*').eq('id', id).single().then((result) => result),
    { data: null, error: { message: 'timeout' } as { message: string } }
  )

  if (error || !data) {
    console.warn('fetchArticleById fallback:', error)
    return demoArticle
  }
  return data
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
  if (!hasSupabaseConfig()) return DEMO_PODCASTS.slice(0, limit)

  const { data, error } = await withTimeout(
    supabase
      .from('podcast_episodes')
      .select('*')
      .not('published_at', 'is', null)
      .lte('published_at', new Date().toISOString())
      .order('published_at', { ascending: false })
      .limit(limit)
      .then((result) => result),
    { data: null, error: { message: 'timeout' } as { message: string } }
  )

  if (error) {
    console.warn('fetchPodcastEpisodes fallback:', error)
    return DEMO_PODCASTS.slice(0, limit)
  }
  if (!data?.length) return DEMO_PODCASTS.slice(0, limit)
  return data
}

// ============================================
// 分类查询
// ============================================

/** 获取所有活跃分类 */
export async function fetchCategories(): Promise<Category[]> {
  if (!hasSupabaseConfig()) return DEMO_CATEGORIES

  const { data, error } = await withTimeout(
    supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .then((result) => result),
    { data: null, error: { message: 'timeout' } as { message: string } }
  )

  if (error) {
    console.warn('fetchCategories fallback:', error)
    return DEMO_CATEGORIES
  }
  if (!data?.length) return DEMO_CATEGORIES
  return data
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
