# WorkWork 数字游民社区

面向数字游民与 OPC 一人公司的内容平台，集成了认证系统、文章投稿、播客和游民地图。

## 技术栈

| 项目 | 技术 |
|------|------|
| 框架 | Vue 3 + TypeScript + Composition API |
| 构建工具 | Vite 5 |
| 样式 | Tailwind CSS v4 |
| 状态管理 | Pinia |
| 路由 | Vue Router |
| 后端服务 | Supabase（Auth + PostgreSQL + RLS） |

## 快速开始

```bash
# 安装依赖
npm install

# 复制环境变量
cp .env.example .env
# 编辑 .env，填入你的 Supabase URL 和 Anon Key

# 启动开发服务器
npm run dev
```

## 环境变量

在项目根目录创建 `.env` 文件：

```env
VITE_SUPABASE_URL="https://xxx.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJ..."
```

- `VITE_SUPABASE_URL`：Supabase 项目 URL（在 Project Settings → API 中获取）
- `VITE_SUPABASE_ANON_KEY`：Supabase 匿名公钥（同上）
- **不要**使用 `service_role` key，那只能用在服务端

## 项目结构

```
src/
├── views/                          # 页面
│   ├── HomeView.vue                # 首页（Hero + 播客 + 文章流 + 侧边栏）
│   └── LoginView.vue               # 登录/注册页（邮箱 + Google + GitHub）
├── components/layout/              # 布局组件
│   ├── AppHeader.vue               # 顶部导航栏
│   ├── AppFooter.vue               # 页脚
│   └── AppLogo.vue                 # Logo
├── composables/
│   └── useTypewriter.ts            # 打字机动画效果
├── stores/                         # Pinia 状态管理
│   ├── auth.ts                     # 认证状态（Supabase Auth）
│   └── app.ts                      # 全局 UI 状态
├── lib/
│   └── supabase.ts                 # Supabase 客户端
├── types/                          # TypeScript 类型定义
│   ├── database.ts                 # 数据库表结构类型
│   └── index.ts                    # 通用类型
├── assets/styles/main.css          # 全局样式
├── legacy/                         # 旧版首页组件归档（不再使用）
│   ├── sections/                   # 旧版区块组件
│   ├── base/                       # 旧版基础组件
│   ├── composables/                # 旧版组合式函数
│   ├── stores/                     # 旧版状态管理
│   └── README.md                   # 旧版文件说明
├── App.vue                         # 根组件
├── main.ts                         # 入口文件
└── router/index.ts                 # 路由配置
```

## 数据库结构

SQL 文件位于 `supabase/` 目录，需要在 Supabase Dashboard 的 SQL Editor 中执行：

| 文件 | 说明 |
|------|------|
| `supabase/schema.sql` | 表结构（profiles、articles、podcast_episodes、nomad_spots、bookmarks） |
| `supabase/rls-policies.sql` | 行级安全策略 |

### 数据表

- **profiles**：用户资料（注册时自动创建）
- **articles**：文章（支持草稿→审核→发布流程）
- **podcast_episodes**：播客节目
- **nomad_spots**：游民地图标记点
- **bookmarks**：收藏/点赞

## 认证系统

支持以下登录方式（需在 Supabase Dashboard → Authentication → Providers 中启用）：

- **邮箱 + 密码**：注册后需邮箱验证
- **Google OAuth**：需要在 Google Cloud Console 创建 OAuth Client
- **GitHub OAuth**：需要在 GitHub Settings → Developer Settings 创建 OAuth App

密码要求：至少 8 个字符，包含小写字母、大写字母、数字和特殊符号。

## 可用脚本

```bash
npm run dev         # 启动开发服务器
npm run build       # 构建生产版本
npm run preview     # 预览生产版本
```

## 部署

项目通过 GitHub Actions 自动部署到 GitHub Pages。推送到 `main` 分支会触发自动构建和部署。

工作流配置：`.github/workflows/deploy.yml`

## 协作开发

1. Fork 本仓库
2. 创建功能分支：`git checkout -b feature/你的功能`
3. 提交更改：`git commit -m 'feat: 添加某个功能'`
4. 推送分支：`git push origin feature/你的功能`
5. 提交 Pull Request

## 开源协议

本项目基于 [AGPL-3.0](LICENSE) 协议开源。使用、修改或分发本项目代码时，必须遵守该协议的全部条款，包括公开修改后的完整源码。
