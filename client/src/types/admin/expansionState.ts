import type { Ref } from 'vue'

export interface UseExpansionStateReturn {
  expandedEntities: Ref<string[]>
  isPanelExpanded: (entityId: string) => boolean
}
