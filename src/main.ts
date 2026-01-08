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

// Development error handling
if (import.meta.env.DEV) {
  app.config.errorHandler = (err, vm, info) => {
    // #region agent log
    const logDataE = {location:'main.ts:21',message:'Vue error caught',data:{error:String(err),info,component:vm?.$?.type?.__name||'unknown'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'};
    console.error('[DEBUG ERROR]', logDataE);
    fetch('http://127.0.0.1:7242/ingest/353a4726-f634-4d1e-b9bb-65ed440c7233',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logDataE)}).catch(()=>{});
    // #endregion
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