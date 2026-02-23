/**
 * Router Plugin - Adapted for our existing router
 * 
 */

import type { App } from 'vue'
import router from '@/router'

export default function (app: App) {
  app.use(router)
}
