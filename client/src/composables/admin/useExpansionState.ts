/**
 * WHY: Expansion State Composable

LEARNING: Extracts expansion state logic fro...
 */
import { ref } from 'vue'
import type { UseExpansionStateReturn } from '@/types/admin/expansionState'

export type { UseExpansionStateReturn } from '@/types/admin/expansionState'

/**
 * WHY: Expansion State Composable

WHY: Moves business logic out of components ...
 */
export function useExpansionState(): UseExpansionStateReturn {
  /**
   * LEARNING: Reactive expanded entities state
   */
  const expandedEntities = ref<string[]>([])

  const isPanelExpanded = (entityId: string): boolean => {
    return expandedEntities.value.includes(entityId)
  }

  return {
    expandedEntities,
    isPanelExpanded
  }
}

