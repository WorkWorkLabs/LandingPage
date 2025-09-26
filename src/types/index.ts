// 基础界面元素类型
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
}

// 导航相关类型
export interface NavItem {
  id: string
  label: string
  href: string
  external?: boolean
}

// 特性展示类型
export interface Feature {
  id: string
  number: string
  title: string
  description: string
  icon?: string
}

// 产品类型
export interface Product {
  id: string
  title: string
  subtitle?: string
  description: string
  features: ProductFeature[]
  link: string
  tags?: string[]
  image?: string
}

export interface ProductFeature {
  label: string
  value?: string
  highlight?: boolean
}

// 团队成员类型
export interface TeamMember {
  id: string
  name: string
  title: string
  avatar?: string
  bio?: string
  social?: SocialLink[]
}

export interface SocialLink {
  platform: 'x' | 'twitter' | 'linkedin' | 'github' | 'email'
  url: string
}

// 统计数据类型
export interface Stat {
  id: string
  number: string
  label: string
  icon?: string
}

// 表单类型
export interface NewsletterForm {
  email: string
}

export interface ContactForm {
  name: string
  email: string
  company?: string
  message: string
}

// 评价/评论类型
export interface Review {
  id: string
  image: string
  alt: string
}

// 应用配置类型
export interface AppConfig {
  title: string
  description: string
  url: string
  social: SocialLink[]
}

// 响应式断点
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'