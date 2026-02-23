
import type { App } from 'vue'
import router from '@/router'

export default function (app: App) {
  app.use(router)
}
