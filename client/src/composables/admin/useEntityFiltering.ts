/**
 * useEntityFiltering Composable
 * 
 * LEARNING: Generic filtering and sorting logic for any entity type
 * WHY: All entities filter and sort the same way - by orderIndex
 * PATTERN: Generic composable that works for any GlobalEntity type
 */

import { computed, type ComputedRef } from 'vue'
import { useGlobal } from '@/composables/useGlobal'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'

/**
 * useEntityFiltering composable return type
 */
export interface UseEntityFilteringReturn<EntityKey extends GlobalEntityKey> {
  /**
   * Filtered and sorted entities
   */
  filteredEntities: ComputedRef<GlobalEntity<EntityKey>[]>
}

/**
 * useEntityFiltering composable
 * 
 * LEARNING: Provides filtered and sorted entity arrays
 * WHY: Extracts filtering logic from component to reusable generic composable
 * PATTERN: Generic composable that returns reactive computed properties for any entity type
 */
export function useEntityFiltering<EntityKey extends GlobalEntityKey>(
  entityKey: EntityKey
): UseEntityFilteringReturn<EntityKey> {
  const { getGlobalEntities } = useGlobal()

  /**
   * LEARNING: Computed property for filtered and sorted entities
   * WHY: Filters entities and sorts by orderIndex
   * PATTERN: Computed property with data transformation
   * NOTE: Must copy array before sorting because getGlobalEntities returns readonly Vue Query proxy
   */
  const filteredEntities = computed(() => {
    const entities = getGlobalEntities(entityKey)
    
    // LEARNING: Copy array before sorting to avoid readonly proxy errors
    // WHY: Vue Query returns readonly proxies, we need mutable copy for sort()
    // PATTERN: Spread operator creates new array
    return [...entities].sort((a, b) => a.orderIndex - b.orderIndex)
  })

  return {
    filteredEntities
  }
}

