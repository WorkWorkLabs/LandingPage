-- ============================================
-- 种子数据：将前端硬编码数据写入 Supabase
-- 请在执行 migration-001.sql 之后运行此文件
-- ============================================

-- 1. 插入分类数据
INSERT INTO categories (slug, label, icon, sort_order) VALUES
  ('recommend', '推荐', '★', 1),
  ('all', '全部内容', '◉', 2),
  ('topics', '话题讨论', '◎', 3),
  ('hot', '热门内容', '△', 4),
  ('follow', '关注', '♡', 5);

-- 2. 插入播客数据
INSERT INTO podcast_episodes (title, host, duration, cover_image, published_at) VALUES
  ('数字游民的第一年：从辞职到月入五万', 'WorkWork FM', '42:18',
   'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&h=400&fit=crop&auto=format',
   '2025-06-15T10:00:00+00:00'),
  ('一人公司的现金流管理：稳定币与跨境收款', 'OPC Radio', '38:45',
   'https://images.unsplash.com/photo-1589903308904-1010c2294adc?w=400&h=400&fit=crop&auto=format',
   '2025-06-10T10:00:00+00:00'),
  ('远程协作工具箱：从 Notion 到 Loom 的最佳实践', 'WorkWork FM', '35:22',
   'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&h=400&fit=crop&auto=format',
   '2025-06-05T10:00:00+00:00');

-- 3. 插入文章数据（含 is_featured 和 views）
INSERT INTO articles (title, excerpt, cover_image, author_name, category, status, read_time, views, is_featured, published_at) VALUES
  -- 编辑精选文章（Hero 区域）
  ('从"接远程工作"升级到"经营可移动的一人公司"',
   '用更像媒体首页的结构组织能力、案例与方法，让品牌信息、内容流和行动入口自然协同。',
   'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&h=750&fit=crop&auto=format',
   'WorkWork 编辑部', 'remote-work', 'published', '10 分钟', 3200, true,
   '2025-06-20T08:00:00+00:00'),

  -- 侧边推荐文章
  ('从远程协作到全球结算，重新定义数字游民的一人公司工作流',
   '围绕工作、资产、居住与增长，WorkWork 将数字游民的行动力与 OPC 一人公司的经营能力收束为一个轻量但完整的操作系统。',
   'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&h=500&fit=crop&auto=format',
   'WorkWork 编辑部', 'remote-work', 'published', '8 分钟', 2400, true,
   '2025-06-19T10:00:00+00:00'),

  ('打造可移动事业引擎，让个人品牌、客户关系与交付效率形成闭环',
   '以内容、工具、社群和支付能力为核心，让一人公司在跨地域、跨时区环境下依然保持稳定输出。',
   'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop&auto=format',
   'WorkWork 编辑部', 'remote-work', 'published', '7 分钟', 1800, true,
   '2025-06-18T10:00:00+00:00'),

  -- 文章列表
  ('一人公司周报系统：如何在旅途中保持信息同步',
   '用固定节奏维护项目、现金流与合作状态，让你在移动办公中也能有稳定的经营视角。',
   'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&h=500&fit=crop&auto=format',
   'WorkWork 编辑部', 'remote-work', 'published', '6 分钟', 1560, false,
   '2025-06-17T17:23:00+00:00'),

  ('数字游民的异地协作清单：设备、网络与备份',
   '把「随时能开工」拆成设备冗余、网络稳定性和数据安全三个层面来准备。',
   'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=500&fit=crop&auto=format',
   'Yanbo', 'remote-work', 'published', '8 分钟', 1800, false,
   '2025-06-17T15:00:00+00:00'),

  ('OPC 客户管理的轻量模板：从初聊到签约',
   '不依赖重 CRM，也能把客户线索、跟进节奏与交付阶段管理得清晰可见。',
   'https://images.unsplash.com/photo-1556745757-8d76bdb6984b?w=800&h=500&fit=crop&auto=format',
   'WorkWork Research', 'remote-work', 'published', '5 分钟', 1200, false,
   '2025-06-16T11:30:00+00:00'),

  ('居住即办公：适合数字游民的一周城市切换策略',
   '围绕居住成本、社区密度与工作氛围，建立更可持续的城市漫游节奏。',
   'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=500&fit=crop&auto=format',
   'Nomad Lab', 'remote-work', 'published', '7 分钟', 980, false,
   '2025-06-14T10:00:00+00:00'),

  ('AI 助手如何帮助一人公司完成内容生产与提案准备',
   '把 AI 放进具体工作流，而不是停留在灵感层，才能真正释放单人团队的效率。',
   'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=500&fit=crop&auto=format',
   'OPC Studio', 'remote-work', 'published', '9 分钟', 856, false,
   '2025-06-14T10:00:00+00:00'),

  ('出海独立工作者的收款路径：稳定币、银行卡与风险隔离',
   '拆解跨境结算时最常见的成本项与延迟问题，建立更稳妥的现金流路径。',
   '/images/mastercard.svg',
   'Payment Desk', 'remote-work', 'published', '6 分钟', 743, false,
   '2025-06-13T10:00:00+00:00'),

  ('如何用公开写作替代无效社交，持续获得合作机会',
   '将写作视为长期获客机制，而不是阶段性的营销任务。',
   'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=500&fit=crop&auto=format',
   'WorkWork Community', 'remote-work', 'published', '4 分钟', 650, false,
   '2025-06-12T10:00:00+00:00'),

  ('自由职业到一人公司：你需要的不是更多项目，而是更好的系统',
   '当工作来源逐渐稳定后，真正的瓶颈会从接单能力变成系统能力。',
   'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=500&fit=crop&auto=format',
   'Growth Notes', 'remote-work', 'published', '8 分钟', 580, false,
   '2025-06-12T10:00:00+00:00'),

  ('高频出行者的日程设计：会议、深度工作与内容发布如何共存',
   '通过时间块与时区预案，让「人在路上」不再成为业务失速的理由。',
   'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&h=500&fit=crop&auto=format',
   'Flow Team', 'remote-work', 'published', '5 分钟', 490, false,
   '2025-06-10T10:00:00+00:00'),

  ('社群即渠道：个人品牌如何在小圈层中建立高信任转化',
   '相比泛流量，稳定的高密度社群更适合 OPC 模式下的长期经营。',
   'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=500&fit=crop&auto=format',
   'Brand Sprint', 'remote-work', 'published', '6 分钟', 420, false,
   '2025-06-10T10:00:00+00:00');
