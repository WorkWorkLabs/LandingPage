import type { Article, Category, PodcastEpisode } from '@/types/database'

const NOW = '2025-06-20T08:00:00+00:00'

export const DEMO_CATEGORIES: Category[] = [
  { id: 'demo-cat-1', slug: 'recommend', label: '推荐', icon: '★', sort_order: 1, is_active: true, created_at: NOW },
  { id: 'demo-cat-2', slug: 'all', label: '全部内容', icon: '◉', sort_order: 2, is_active: true, created_at: NOW },
  { id: 'demo-cat-3', slug: 'topics', label: '话题讨论', icon: '◎', sort_order: 3, is_active: true, created_at: NOW },
  { id: 'demo-cat-4', slug: 'hot', label: '热门内容', icon: '△', sort_order: 4, is_active: true, created_at: NOW },
  { id: 'demo-cat-5', slug: 'follow', label: '关注', icon: '♡', sort_order: 5, is_active: true, created_at: NOW },
]

export const DEMO_PODCASTS: PodcastEpisode[] = [
  {
    id: 'demo-pod-1',
    title: '数字游民的第一年：从辞职到月入五万',
    host: 'WorkWork FM',
    duration: '42:18',
    cover_image: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&h=400&fit=crop&auto=format',
    audio_url: null,
    description: null,
    published_at: '2025-06-15T10:00:00+00:00',
    created_at: NOW,
  },
  {
    id: 'demo-pod-2',
    title: '一人公司的现金流管理：稳定币与跨境收款',
    host: 'OPC Radio',
    duration: '38:45',
    cover_image: 'https://images.unsplash.com/photo-1589903308904-1010c2294adc?w=400&h=400&fit=crop&auto=format',
    audio_url: null,
    description: null,
    published_at: '2025-06-10T10:00:00+00:00',
    created_at: NOW,
  },
  {
    id: 'demo-pod-3',
    title: '远程协作工具箱：从 Notion 到 Loom 的最佳实践',
    host: 'WorkWork FM',
    duration: '35:22',
    cover_image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&h=400&fit=crop&auto=format',
    audio_url: null,
    description: null,
    published_at: '2025-06-05T10:00:00+00:00',
    created_at: NOW,
  },
]

function article(
  id: string,
  title: string,
  excerpt: string,
  cover: string,
  author: string,
  readTime: string,
  views: number,
  featured: boolean,
  publishedAt: string,
  content?: string
): Article {
  return {
    id,
    author_id: null,
    title,
    excerpt,
    content:
      content ??
      `<p>${excerpt}</p><p>这是 WorkWork 演示内容。配置 Supabase 环境变量后，将自动切换为数据库中的真实文章。</p>`,
    cover_image: cover,
    category: 'remote-work',
    status: 'published',
    read_time: readTime,
    views,
    is_featured: featured,
    author_name: author,
    published_at: publishedAt,
    created_at: publishedAt,
    updated_at: publishedAt,
  }
}

export const DEMO_ARTICLES: Article[] = [
  article(
    'demo-article-1',
    '从"接远程工作"升级到"经营可移动的一人公司"',
    '用更像媒体首页的结构组织能力、案例与方法，让品牌信息、内容流和行动入口自然协同。',
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&h=750&fit=crop&auto=format',
    'WorkWork 编辑部',
    '10 分钟',
    3200,
    true,
    '2025-06-20T08:00:00+00:00'
  ),
  article(
    'demo-article-2',
    '从远程协作到全球结算，重新定义数字游民的一人公司工作流',
    '围绕工作、资产、居住与增长，WorkWork 将数字游民的行动力与 OPC 一人公司的经营能力收束为一个轻量但完整的操作系统。',
    'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&h=500&fit=crop&auto=format',
    'WorkWork 编辑部',
    '8 分钟',
    2400,
    true,
    '2025-06-19T10:00:00+00:00'
  ),
  article(
    'demo-article-3',
    '打造可移动事业引擎，让个人品牌、客户关系与交付效率形成闭环',
    '以内容、工具、社群和支付能力为核心，让一人公司在跨地域、跨时区环境下依然保持稳定输出。',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop&auto=format',
    'WorkWork 编辑部',
    '7 分钟',
    1800,
    true,
    '2025-06-18T10:00:00+00:00'
  ),
  article(
    'demo-article-4',
    '一人公司周报系统：如何在旅途中保持信息同步',
    '用固定节奏维护项目、现金流与合作状态，让你在移动办公中也能有稳定的经营视角。',
    'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&h=500&fit=crop&auto=format',
    'WorkWork 编辑部',
    '6 分钟',
    1560,
    false,
    '2025-06-17T17:23:00+00:00'
  ),
  article(
    'demo-article-5',
    '数字游民的异地协作清单：设备、网络与备份',
    '把「随时能开工」拆成设备冗余、网络稳定性和数据安全三个层面来准备。',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=500&fit=crop&auto=format',
    'Yanbo',
    '8 分钟',
    1800,
    false,
    '2025-06-17T15:00:00+00:00'
  ),
  article(
    'demo-article-6',
    'OPC 客户管理的轻量模板：从初聊到签约',
    '不依赖重 CRM，也能把客户线索、跟进节奏与交付阶段管理得清晰可见。',
    'https://images.unsplash.com/photo-1556745757-8d76bdb6984b?w=800&h=500&fit=crop&auto=format',
    'WorkWork Research',
    '5 分钟',
    1200,
    false,
    '2025-06-16T11:30:00+00:00'
  ),
  article(
    'demo-article-7',
    '居住即办公：适合数字游民的一周城市切换策略',
    '围绕居住成本、社区密度与工作氛围，建立更可持续的城市漫游节奏。',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=500&fit=crop&auto=format',
    'Nomad Lab',
    '7 分钟',
    980,
    false,
    '2025-06-14T10:00:00+00:00'
  ),
  article(
    'demo-article-8',
    'AI 助手如何帮助一人公司完成内容生产与提案准备',
    '把 AI 放进具体工作流，而不是停留在灵感层，才能真正释放单人团队的效率。',
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=500&fit=crop&auto=format',
    'OPC Studio',
    '9 分钟',
    856,
    false,
    '2025-06-14T10:00:00+00:00'
  ),
  article(
    'demo-article-9',
    '出海独立工作者的收款路径：稳定币、银行卡与风险隔离',
    '拆解跨境结算时最常见的成本项与延迟问题，建立更稳妥的现金流路径。',
    'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=500&fit=crop&auto=format',
    'Payment Desk',
    '6 分钟',
    743,
    false,
    '2025-06-13T10:00:00+00:00'
  ),
  article(
    'demo-article-10',
    '如何用公开写作替代无效社交，持续获得合作机会',
    '将写作视为长期获客机制，而不是阶段性的营销任务。',
    'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=500&fit=crop&auto=format',
    'WorkWork Community',
    '4 分钟',
    650,
    false,
    '2025-06-12T10:00:00+00:00'
  ),
  article(
    'demo-article-11',
    '自由职业到一人公司：你需要的不是更多项目，而是更好的系统',
    '当工作来源逐渐稳定后，真正的瓶颈会从接单能力变成系统能力。',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=500&fit=crop&auto=format',
    'Growth Notes',
    '8 分钟',
    580,
    false,
    '2025-06-12T10:00:00+00:00'
  ),
  article(
    'demo-article-12',
    '高频出行者的日程设计：会议、深度工作与内容发布如何共存',
    '通过时间块与时区预案，让「人在路上」不再成为业务失速的理由。',
    'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&h=500&fit=crop&auto=format',
    'Flow Team',
    '5 分钟',
    490,
    false,
    '2025-06-10T10:00:00+00:00'
  ),
  article(
    'demo-article-13',
    '社群即渠道：个人品牌如何在小圈层中建立高信任转化',
    '相比泛流量，稳定的高密度社群更适合 OPC 模式下的长期经营。',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=500&fit=crop&auto=format',
    'Brand Sprint',
    '6 分钟',
    420,
    false,
    '2025-06-10T10:00:00+00:00'
  ),
]

export function getDemoFeaturedArticles(): Article[] {
  return DEMO_ARTICLES.filter((item) => item.is_featured)
}

export function getDemoPublishedArticles(limit = 20): Article[] {
  return [...DEMO_ARTICLES]
    .sort((a, b) => new Date(b.published_at ?? 0).getTime() - new Date(a.published_at ?? 0).getTime())
    .slice(0, limit)
}

export function getDemoTrendingArticles(limit = 6): Article[] {
  return [...DEMO_ARTICLES].sort((a, b) => b.views - a.views).slice(0, limit)
}

export function getDemoArticleById(id: string): Article | null {
  return DEMO_ARTICLES.find((item) => item.id === id) ?? null
}