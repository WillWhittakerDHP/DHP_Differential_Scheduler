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

import '@core/scss/template/index.scss'
import '@styles/styles.scss'

if (typeof window !== 'undefined') {
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
  
  const originalError = console.error
  console.error = function(...args: unknown[]) {
    const errorString = args.join(' ')
    if (errorString.includes('Cannot read properties of undefined') && 
        (errorString.includes('control') || errorString.includes('.control'))) {
      return
    }
    originalError.apply(console, args)
  }
  
  // PATTERN: Override console.log to filter CursorBrowser messages
  const originalLog = console.log
  console.log = function(...args: unknown[]) {
    const logString = args.join(' ')
    if (logString.includes('[CursorBrowser]')) {
      return
    }
    originalLog.apply(console, args)
  }
}

if (typeof MutationObserver !== 'undefined' && typeof document !== 'undefined') {
  /**
   * LEARNING: Extract form patching logic to pure function
   * WHY: Separates DOM mutation logic from iteration logic
   * PATTERN: Pure function that handles single element, returns forms to patch
   */
  const patchElementForms = (element: HTMLElement): HTMLFormElement[] => {
    if (element.tagName === 'FORM' && element.classList.contains('dynamic-form-inputs')) {
      patchFormElements(element as HTMLFormElement)
    }
    
    // LEARNING: Use map to transform NodeList to array functionally
    // WHY: Functional approach - transform array without mutations
    // PATTERN: Map to transform NodeList to array of HTMLFormElement, return directly
    const nestedForms = element.querySelectorAll?.('form.dynamic-form-inputs')
    if (nestedForms) {
      return Array.from(nestedForms).map((form: Element) => form as HTMLFormElement)
    }
    
    return []
  }

  const globalFormObserver = new MutationObserver((mutations) => {
    // WHY: Functional approach - collect all forms first, then patch them
    // PATTERN: flatMap to transform mutations → nodes → elements → forms
    const allFormsToPatch = mutations.flatMap((mutation) =>
      Array.from(mutation.addedNodes)
        .filter((node): node is HTMLElement => node.nodeType === Node.ELEMENT_NODE)
        .flatMap((element) => {
          const forms = patchElementForms(element)
          return forms
        })
    )
    
    allFormsToPatch.forEach((form) => {
      patchFormElements(form)
    })
  })
  
  if (document.documentElement) {
    globalFormObserver.observe(document.documentElement, {
      childList: true,
      subtree: true
    })
  }
  
  // PATTERN: Use for...of when you need side effects, not transformations
  const existingForms = document.querySelectorAll('form.dynamic-form-inputs')
  for (const form of Array.from(existingForms)) {
    patchFormElements(form as HTMLFormElement)
  }
}

const app = createApp(App)

// LEARNING: Pinia is Vue's official state management library
const pinia = createPinia()
setPiniaInstance(pinia)

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})
setQueryClient(queryClient)

// PATTERN: Use Vue transformer to fetch and transform configuration data
const prefetchGlobalData = async () => {
  try {
    const staged = await globalTransformer.stageForHydration()
    
    const globalData = globalTransformer.hydrate(staged)
    
    queryClient.setQueryData<GlobalData>(['globalData'], globalData)
    
  } catch (error) {
    logger.error('Failed to prefetch global data', { error })
  }
}

registerPlugins(app)

// WHY: Mount app immediately for faster initial render
// PATTERN: Mount app first, then prefetch data in background
// LEARNING: Vue Query will deduplicate requests, so components calling useGlobal() 
//           will either get cached data (if prefetch completes first) or share the same request
//           (if components mount first). This provides instant UI with progressive data loading.
app.mount('#app')

// Start prefetch in background (non-blocking)
// WHY: Pre-populate cache so components get data faster, but don't block UI rendering
prefetchGlobalData().catch((error) => {
  logger.error('Failed to prefetch global data', { error })
  // Don't throw - app should continue working even if prefetch fails
  // Components will fetch data themselves via useGlobal() if cache is empty
})

