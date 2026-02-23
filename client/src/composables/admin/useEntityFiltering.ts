/**
 * PATTERN: useEntityFiltering Composable

PATTERN: Generic composable that works fo...
 */
import { computed, type ComputedRef } from 'vue'
import { useGlobal } from '@/composables/useGlobal'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'

export interface UseEntityFilteringReturn<EntityKey extends GlobalEntityKey> {
  filteredEntities: ComputedRef<GlobalEntity<EntityKey>[]>
}

/**
 * WHY: useEntityFiltering composable

WHY: Extracts filtering logic from compon...
 */
export function useEntityFiltering<EntityKey extends GlobalEntityKey>(
  entityKey: EntityKey
): UseEntityFilteringReturn<EntityKey> {
  const { getGlobalEntities } = useGlobal()

  /**
   * NOTE: Must copy array before sorting because getGlobalEntities returns readonly Vue Query proxy
   */
  const filteredEntities = computed(() => {
    const entities = getGlobalEntities(entityKey)
    
    // PATTERN: Spread operator creates new array
    return [...entities].sort((a, b) => a.orderIndex - b.orderIndex)
  })

  return {
    filteredEntities
  }
}

