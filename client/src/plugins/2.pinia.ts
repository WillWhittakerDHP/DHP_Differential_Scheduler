
import type { App } from 'vue'
import type { Pinia } from 'pinia'

let piniaInstance: Pinia | null = null

export function setPiniaInstance(instance: Pinia) {
  piniaInstance = instance
}

export default function (app: App) {
  if (piniaInstance) {
    app.use(piniaInstance)
  }
}
