import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/styles/main.css'

// Create the app instance
const app = createApp(App)

// Install plugins
app.use(createPinia())
app.use(router)

// Mount the app
app.mount('#app')

if (import.meta.env.DEV) {
  app.config.errorHandler = (err, vm, info) => {
    console.error('Vue Error:', err)
    console.error('Vue Info:', info)
    console.error('Component:', vm)
  }
}

// Production error handling
if (import.meta.env.PROD) {
  app.config.errorHandler = (err, vm, info) => {
    // Send to error reporting service in production
    console.error('Production error:', { err, info })
  }
}