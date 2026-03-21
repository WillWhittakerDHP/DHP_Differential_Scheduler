
import type { App } from 'vue'
import { VueQueryPlugin } from '@tanstack/vue-query'
import type { QueryClient } from '@tanstack/vue-query'

let queryClientInstance: QueryClient | null = null

export function setQueryClient(instance: QueryClient) {
  queryClientInstance = instance
}

export function getQueryClient(): QueryClient | null {
  return queryClientInstance
}

export default function (app: App) {
  if (queryClientInstance) {
    app.use(VueQueryPlugin, {
      queryClient: queryClientInstance,
    })
  }
}

