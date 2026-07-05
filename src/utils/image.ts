export const FALLBACK_COVER_IMAGE =
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=500&fit=crop&auto=format&q=75'

/**
 * 优化图片 URL，减少传输体积
 * - Unsplash: 自动添加尺寸、裁剪、质量参数
 * - 其他 URL: 原样返回
 */
export function optimizeImage(url: string | null | undefined, width = 400, height = 300): string {
  if (!url?.trim()) return FALLBACK_COVER_IMAGE

  // Unsplash 图片优化（覆盖已有尺寸参数，避免重复拼接）
  if (url.includes('images.unsplash.com')) {
    const base = url.split('?')[0]
    return `${base}?w=${width}&h=${height}&fit=crop&auto=format&q=75`
  }

  return url
}

/**
 * 为 <img> 标签生成优化后的 srcset
 */
export function imageSrcSet(url: string | null | undefined): string | undefined {
  if (!url || !url.includes('images.unsplash.com')) return undefined

  const separator = url.includes('?') ? '&' : '?'
  return [
    `${url}${separator}w=400&fit=crop&auto=format&q=75 400w`,
    `${url}${separator}w=800&fit=crop&auto=format&q=75 800w`,
    `${url}${separator}w=1200&fit=crop&auto=format&q=75 1200w`,
  ].join(', ')
}
