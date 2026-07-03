import { supabase } from '@/lib/supabase'
import type {
  Article,
  PodcastEpisode,
  Category,
  Subscriber,
} from '@/types/database'

// ============================================
// 文章查询
// ============================================

/** 获取所有已发布文章（按发布时间倒序） */
export async function fetchPublishedArticles(limit = 20): Promise<Article[]> {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('fetchPublishedArticles error:', error)
    return []
  }
  return data ?? []
}

/** 获取编辑精选文章（is_featured = true） */
export async function fetchFeaturedArticles(): Promise<Article[]> {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('status', 'published')
    .eq('is_featured', true)
    .order('published_at', { ascending: false })

  if (error) {
    console.error('fetchFeaturedArticles error:', error)
    return []
  }
  return data ?? []
}

/** 获取热门文章（按浏览量排序） */
export async function fetchTrendingArticles(limit = 6): Promise<Article[]> {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('status', 'published')
    .order('views', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('fetchTrendingArticles error:', error)
    return []
  }
  return data ?? []
}

/** 获取单篇文章详情 */
export async function fetchArticleById(id: string): Promise<Article | null> {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('fetchArticleById error:', error)
    return null
  }
  return data
}

/** 增加文章浏览量（直接更新 views 字段） */
export async function incrementArticleViews(id: string): Promise<void> {
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
  const { data, error } = await supabase
    .from('podcast_episodes')
    .select('*')
    .not('published_at', 'is', null)
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('fetchPodcastEpisodes error:', error)
    return []
  }
  return data ?? []
}

// ============================================
// 分类查询
// ============================================

/** 获取所有活跃分类 */
export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('fetchCategories error:', error)
    return []
  }
  return data ?? []
}

// ============================================
// 邮件订阅
// ============================================

/** 订阅邮件列表 */
export async function subscribe(email: string): Promise<{ error: string | null }> {
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
