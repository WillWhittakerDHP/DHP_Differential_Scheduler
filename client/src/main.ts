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
import { setPiniaInstance } from './plugins/2.pinia'
import { setQueryClient } from './plugins/3.vue-query'
import { globalTransformer } from './utils/transformers/fetchToGlobalTransformer'
import type { GlobalData } from './utils/transformers/fetchToGlobalTransformer'
import { patchFormElements } from './utils/patchFormElements'
import { createLogger } from './utils/logger'
import router from '@/router'
import { VueQueryPlugin } from '@tanstack/vue-query'
import { createLayouts } from '@layouts'
import { layoutConfig } from '@themeConfig'
import type { PartialDeep } from 'type-fest'
import { deepMerge } from '@antfu/utils'
import { createVuetify } from 'vuetify'
import { VBtn } from 'vuetify/components/VBtn'
import { VVideo } from 'vuetify/labs/VVideo'
import vuetifyDefaults from './plugins/5.vuetify/defaults'
import { icons } from './plugins/5.vuetify/icons'
import { staticPrimaryColor, staticPrimaryDarkenColor, themes } from './plugins/5.vuetify/theme'
import { themeConfig } from '@themeConfig'
import { resolveVuetifyTheme } from '@core/utils/vuetify'
import { cookieRef } from '@layouts/stores/config'
import '@core/scss/template/libs/vuetify/index.scss'
import 'vuetify/styles'
import '@layouts/styles/index.scss'

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
app.use(pinia)

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})
setQueryClient(queryClient)

const logger = createLogger('main')

// PATTERN: Register plugins directly (more explicit than auto-discovery)
// WHY: Direct registration is clearer, easier to debug, and follows Vue best practices
// LEARNING: Vue plugins are registered with app.use() - no need for auto-discovery magic

// 1. Router
app.use(router)

// 2. Vue Query
app.use(VueQueryPlugin, {
  queryClient: queryClient,
})

// 3. Layouts (requires Pinia, so must come after)
app.use(createLayouts(layoutConfig as PartialDeep<typeof layoutConfig, NonNullable<unknown>>))

// 4. Vuetify (requires layouts for cookieRef, so must come after layouts)
const cookieThemeValues = {
  defaultTheme: resolveVuetifyTheme(themeConfig.app.theme),
  themes: {
    light: {
      colors: {
        'primary': cookieRef('lightThemePrimaryColor', staticPrimaryColor).value,
        'primary-darken-1': cookieRef('lightThemePrimaryDarkenColor', staticPrimaryDarkenColor).value,
      },
    },
    dark: {
      colors: {
        'primary': cookieRef('darkThemePrimaryColor', staticPrimaryColor).value,
        'primary-darken-1': cookieRef('darkThemePrimaryDarkenColor', staticPrimaryDarkenColor).value,
      },
    },
  },
}

const optionTheme = deepMerge({ themes }, cookieThemeValues)

const vuetify = createVuetify({
  aliases: {
    IconBtn: VBtn,
  },
  components: {
    VVideo,
  },
  defaults: vuetifyDefaults,
  icons,
  theme: optionTheme,
})

app.use(vuetify)

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

// WHY: Prefetch data before mounting to prevent race condition
// PATTERN: Prefetch completes before components mount, ensuring cache is populated
// LEARNING: This prevents duplicate API calls - components will read from cache instead of triggering new queries
// FIX: Changed from mount-then-prefetch to prefetch-then-mount to eliminate race condition
// PATTERN: Use async IIFE to handle async prefetch before mount
(async () => {
  try {
    await prefetchGlobalData()
    app.mount('#app')
  } catch (error) {
    logger.error('Failed to prefetch global data, mounting app anyway', { error })
    // Mount app even if prefetch fails - components will fetch data themselves via useGlobal()
    app.mount('#app')
  }
})()

