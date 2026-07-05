import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Lazy load views for better performance
const Home = () => import('@/views/HomeView.vue')
const Login = () => import('@/views/LoginView.vue')
const ArticleDetail = () => import('@/views/ArticleDetailView.vue')
const ArticlePublish = () => import('@/views/ArticlePublishView.vue')
const NomadMap = () => import('@/views/NomadMapView.vue')

let nomadMapPrefetch: Promise<unknown> | null = null
export function prefetchNomadMap() {
  if (!nomadMapPrefetch) {
    nomadMapPrefetch = NomadMap()
  }
  return nomadMapPrefetch
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: 'WorkWork - Global Remote Work Ecosystem',
      description: 'Building a global remote work ecosystem for digital nomads, remote workers, freelancers, and super individuals.'
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      title: '登录 - WorkWork',
      description: '登录 WorkWork 数字游民社区'
    }
  },
  {
    path: '/article/:id',
    name: 'ArticleDetail',
    component: ArticleDetail,
    meta: {
      title: '文章详情 - WorkWork',
      description: '阅读文章详情'
    }
  },
  {
    path: '/publish',
    name: 'ArticlePublish',
    component: ArticlePublish,
    meta: {
      title: '投稿 - WorkWork',
      description: '投稿你的文章',
      requiresAuth: true
    }
  },
  {
    path: '/map',
    name: 'NomadMap',
    component: NomadMap,
    meta: {
      title: '游牧者地图 - WorkWork',
      description: '数字游民全球工作地点地图'
    }
  },
  {
    // Catch all route for 404 pages
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // Handle anchor links
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
        top: 80 // Account for fixed header
      }
    }
    
    // Handle saved position (back button)
    if (savedPosition) {
      return savedPosition
    }
    
    // Default to top
    return { top: 0 }
  }
})

// Navigation guards
router.beforeEach(async (to) => {
  // Set page title
  if (to.meta?.title) {
    document.title = to.meta.title as string
  }
  
  // Set meta description
  if (to.meta?.description) {
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', to.meta.description as string)
    }
  }

  if (to.meta?.requiresAuth) {
    const authStore = useAuthStore()
    await authStore.initialize()

    if (!authStore.isAuthenticated) {
      return {
        name: 'Login',
        query: { redirect: to.fullPath },
      }
    }
  }

  return true
})

export default router
