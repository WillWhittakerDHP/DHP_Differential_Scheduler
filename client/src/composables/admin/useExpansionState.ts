/**
 * WHY: Expansion State Composable

LEARNING: Extracts expansion state logic fro...
 */
import { ref, type Ref } from 'vue'

export interface UseExpansionStateReturn {
  expandedEntities: Ref<string[]>
  
  isPanelExpanded: (entityId: string) => boolean
}

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

