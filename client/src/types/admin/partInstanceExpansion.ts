import type { Ref } from 'vue'

export interface UsePartInstanceExpansionOptions {
  expandedPartInstances: Ref<string[]>
}

export interface UsePartInstanceExpansionReturn {
  togglePartInstanceExpansion: (instanceId: string) => void
}
