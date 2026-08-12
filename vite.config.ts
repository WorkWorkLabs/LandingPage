import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { copyFileSync, existsSync } from 'fs'
import { resolve } from 'path'

function spaFallbackPlugin() {
  return {
    name: 'spa-github-pages-fallback',
    closeBundle() {
      const indexFile = resolve(__dirname, 'dist/index.html')
      if (existsSync(indexFile)) {
        copyFileSync(indexFile, resolve(__dirname, 'dist/404.html'))
      }
    },
  }
}

export default defineConfig({
  base: process.env.GITHUB_PAGES === 'true' ? '/LandingPage/' : '/',
  plugins: [
    vue(),
    spaFallbackPlugin(),
  ],
  server: {
    port: 3000,
    host: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  optimizeDeps: {
    include: ['leaflet'],
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    outDir: 'dist',
    cssCodeSplit: true,
    modulePreload: { polyfill: false },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('@supabase')) return 'supabase'
          if (id.includes('googlemutant') || id.includes('leaflet')) return 'leaflet'
          if (id.includes('vue') || id.includes('pinia') || id.includes('vue-router')) return 'vendor'
        },
      },
    },
  },
})