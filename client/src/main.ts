/**
 * Main Application Entry Point
 * 
 * LEARNING: Vue 3 app initialization with Vuexy plugin system
 * WHY: Sets up Vue app with Pinia, Vue Query, Vue Router, and Vuetify using Vuexy's plugin registration
 * PATTERN: Create app, register plugins via Vuexy system, mount to DOM
 * COMPARISON: React uses ReactDOM.render. Vue uses createApp().mount()
 */

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { QueryClient } from '@tanstack/vue-query'
import App from './App.vue'
import { registerPlugins } from '@core/utils/plugins'
import { setPiniaInstance } from './plugins/2.pinia'
import { setQueryClient } from './plugins/3.vue-query'
import { globalTransformer } from './utils/transformers/fetchToGlobalTransformer'
import type { GlobalData } from './utils/transformers/fetchToGlobalTransformer'
import { patchFormElements } from './utils/patchFormElements'

// Styles
import '@core/scss/template/index.scss'
import '@styles/styles.scss'

/**
 * Error handler to silence password manager extension errors
 * WHY: Password manager extensions throw errors when scanning forms
 *      We catch these at the window level to silence them
 */
if (typeof window !== 'undefined') {
  // Catch unhandled errors
  window.addEventListener('error', (event) => {
    const errorMessage = event.message || String(event.error)
    if (errorMessage.includes('Cannot read properties of undefined') && 
        (errorMessage.includes('control') || errorMessage.includes('.control'))) {
      event.preventDefault()
      event.stopPropagation()
      return false
    }
  }, true)
  
  // Catch unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const errorMessage = event.reason?.message || String(event.reason)
    if (errorMessage.includes('Cannot read properties of undefined') && 
        (errorMessage.includes('control') || errorMessage.includes('.control'))) {
      event.preventDefault()
    }
  })
  
  // Also override console.error as backup
  const originalError = console.error
  console.error = function(...args: unknown[]) {
    const errorString = args.join(' ')
    if (errorString.includes('Cannot read properties of undefined') && 
        (errorString.includes('control') || errorString.includes('.control'))) {
      return
    }
    originalError.apply(console, args)
  }
  
  // Filter CursorBrowser automation logs
  // WHY: Cursor's browser automation tool injects console logs that add noise
  //      These logs are informational only and not needed for development
  // PATTERN: Override console.log to filter CursorBrowser messages
  const originalLog = console.log
  console.log = function(...args: unknown[]) {
    const logString = args.join(' ')
    // Filter out CursorBrowser automation messages
    if (logString.includes('[CursorBrowser]')) {
      return
    }
    originalLog.apply(console, args)
  }
}

/**
 * Simple form patching: Set autocomplete attributes on forms
 * WHY: May discourage some password managers from scanning forms
 */
if (typeof MutationObserver !== 'undefined' && typeof document !== 'undefined') {
  const globalFormObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as HTMLElement
          
          // Patch forms
          if (element.tagName === 'FORM' && element.classList.contains('dynamic-form-inputs')) {
            patchFormElements(element as HTMLFormElement)
          }
          
          // Patch forms inside added nodes
          const forms = element.querySelectorAll?.('form.dynamic-form-inputs')
          forms?.forEach((form: Element) => {
            patchFormElements(form as HTMLFormElement)
          })
        }
      })
    })
  })
  
  if (document.documentElement) {
    globalFormObserver.observe(document.documentElement, {
      childList: true,
      subtree: true
    })
  }
  
  // Patch existing forms
  const existingForms = document.querySelectorAll('form.dynamic-form-inputs')
  existingForms.forEach((form: Element) => {
    patchFormElements(form as HTMLFormElement)
  })
}

/**
 * Create Vue app instance
 * LEARNING: createApp creates new Vue application instance
 * WHY: Modern Vue 3 API for app creation
 * PATTERN: Create app, register plugins, mount
 */
const app = createApp(App)

// Create Pinia instance for state management
// LEARNING: Pinia is Vue's official state management library
// WHY: Provides reactive state management across components
// PATTERN: Use createPinia() and pass to plugin system
const pinia = createPinia()
setPiniaInstance(pinia)

// Create QueryClient instance for prefetching
// LEARNING: QueryClient manages cache and queries
// WHY: Need access to queryClient to prefetch data before app mounts
// PATTERN: Create QueryClient, prefetch data, then register plugin
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})
setQueryClient(queryClient)

// Prefetch global configuration data before mounting app (matching React's QueryProvider)
// LEARNING: Prefetch configuration data on app initialization to populate cache
// WHY: Ensures configuration data is available when composables read from cache
// PATTERN: Use Vue transformer to fetch and transform configuration data
// ARCHITECTURAL REFACTOR: Only prefetches configuration data (entities, relationships, annotations)
// Business entities (appointments, properties, users) are fetched on-demand by their composables
const prefetchGlobalData = async () => {
  try {
    // Stage: Fetch and transform configuration entities/relationships from API
    const staged = await globalTransformer.stageForHydration()
    
    // Hydrate: Transform to final GlobalData format with nested relationships
    const globalData = globalTransformer.hydrate(staged)
    
    // Store in query cache under ["globalData"] key (matching React app)
    // NOTE: Only contains configuration data, not business entities
    queryClient.setQueryData<GlobalData>(['globalData'], globalData)
    
    // Configuration data prefetched and cached
  } catch (error) {
    // Still mount the UI even if prefetch fails
  }
}

// Register all plugins via Vuexy's plugin system
// LEARNING: Vuexy's registerPlugins auto-discovers and registers plugins
// WHY: Centralized plugin registration, easier to manage
// PATTERN: Plugins are auto-loaded from src/plugins directory
registerPlugins(app)

// Prefetch data and mount app
// LEARNING: Prefetch data before mounting to ensure cache is populated
// WHY: Composables read from cache on mount, so data must be prefetched first
// PATTERN: Async prefetch, then mount
prefetchGlobalData().then(() => {
  // Mount app to DOM
  // LEARNING: mount() attaches Vue app to DOM element
  // WHY: Renders app in browser
  // PATTERN: Mount to #app element in index.html
  app.mount('#app')
})

