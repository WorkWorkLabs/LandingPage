# 旧版首页组件（Legacy）

此文件夹存放的是 WorkWork 旧版首页使用的组件和逻辑，已经不再被当前页面引用。

迁移到新版少数派风格首页后，这些文件被统一归档到此处，以备后续参考或复用。

## 文件清单

### sections/ — 旧版首页区块组件（11 个）

| 文件 | 说明 |
|------|------|
| `HeroSection.vue` | 旧版 Hero 区域（已替换为 HomeView.vue 内联实现） |
| `FeaturesSection.vue` | 功能特性区块 |
| `FeatureCard.vue` | 功能特性卡片 |
| `ProductsSection.vue` | 产品展示区块 |
| `ProductCard.vue` | 产品卡片（引用了 BaseCard） |
| `TeamSection.vue` | 团队介绍区块 |
| `TeamMemberCard.vue` | 团队成员卡片 |
| `TestimonialSection.vue` | 用户评价区块 |
| `CommunityStatsSection.vue` | 社区统计区块 |
| `StatsSection.vue` | 统计数字展示 |
| `ContactSection.vue` | 联系我们区块 |

### base/ — 通用基础组件（7 个）

| 文件 | 说明 |
|------|------|
| `BaseAlert.vue` | 提示框 |
| `BaseAvatar.vue` | 头像组件 |
| `BaseButton.vue` | 按钮组件 |
| `BaseCard.vue` | 卡片容器 |
| `BaseChip.vue` | 标签组件 |
| `BaseInput.vue` | 输入框 |
| `BaseTextarea.vue` | 文本域 |

### forms/ — 表单组件（1 个）

| 文件 | 说明 |
|------|------|
| `NewsletterForm.vue` | 邮件订阅表单 |

### composables/ — 组合式函数（4 个）

| 文件 | 说明 |
|------|------|
| `useAuth.ts` | 认证相关逻辑（LoginView 直接使用 auth store，未引用此文件） |
| `useFormValidation.ts` | 表单验证逻辑 |
| `useTeamMembers.ts` | 团队成员数据 |
| `useIntersectionObserver.ts` | 滚动可见性检测（用于旧版动画入场） |

### stores/ — 状态管理（1 个）

| 文件 | 说明 |
|------|------|
| `content.ts` | 旧版首页内容数据（被旧版 section 组件引用） |

## 当前在用的文件

以下文件仍保留在 `src/` 原位，是当前页面实际使用的：

```
src/views/HomeView.vue              — 新版首页
src/views/LoginView.vue             — 登录页
src/components/layout/AppHeader.vue — 导航栏
src/components/layout/AppFooter.vue — 页脚
src/components/layout/AppLogo.vue   — Logo
src/composables/useTypewriter.ts    — 打字机效果
src/stores/app.ts                   — App 全局状态
src/stores/auth.ts                  — 认证状态（Supabase）
src/lib/supabase.ts                 — Supabase 客户端
src/types/database.ts               — 数据库类型定义
src/types/index.ts                  — 通用类型
```

## 如需删除

如果确认不再需要这些旧文件，可以直接删除整个 `legacy/` 文件夹：

```bash
rm -rf src/legacy
```
