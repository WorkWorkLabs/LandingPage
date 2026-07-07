import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue(),
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