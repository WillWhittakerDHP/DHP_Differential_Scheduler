/**
 * Router Plugin - Adapted for our existing router
 * 
 * LEARNING: Vuexy plugin system integration
 * WHY: Integrates our existing router with Vuexy's plugin registration
 * PATTERN: Export default function that registers router with app
 */

import type { App } from 'vue'
import router from '@/router'

export default function (app: App) {
  app.use(router)
}
