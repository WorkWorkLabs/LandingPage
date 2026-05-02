export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
}

export interface NavItem {
  id: string
  label: string
  href: string
  external?: boolean
}

export interface Feature {
  id?: string
  number?: string
  title: string
  description: string
  icon?: string
  color?: string
}

export interface Product {
  id?: string
  title: string
  subtitle?: string
  description: string
  features?: ProductFeature[]
  link?: string
  tags?: string[]
  image?: string
  icon?: string
  cta?: { text: string; href: string }
}

export interface ProductFeature {
  label: string
  value?: string
  highlight?: boolean
}

export interface TeamMember {
  id: string
  name: string
  title?: string
  role?: string
  avatar?: string
  bio?: string
  social?: {
    linkedin?: string
    twitter?: string
    github?: string
  }
}

export interface SocialLink {
  platform: 'x' | 'twitter' | 'linkedin' | 'github' | 'email'
  url: string
}

export interface Stat {
  id: string
  number: string
  label: string
  icon?: string
}

export interface NewsletterForm {
  email: string
}

export interface ContactForm {
  name: string
  email: string
  company?: string
  message: string
}

export interface Review {
  id: string
  image: string
  alt: string
}

export interface AppConfig {
  title: string
  description: string
  url: string
  social: SocialLink[]
}

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
