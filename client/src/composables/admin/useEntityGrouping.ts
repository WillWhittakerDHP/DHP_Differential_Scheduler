/**
 * useEntityGrouping Composable
 * 
 * LEARNING: Generic grouping logic for entities grouped by another entity type
 * WHY: Entities can be grouped by other entities (e.g., blockInstances by blockShape)
 * PATTERN: Generic composable that groups entities by a grouping key
 */

import { computed, type ComputedRef } from 'vue'
import { useGlobal } from '@/composables/useGlobal'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'

/**
 * useEntityGrouping composable parameters
 */
export interface UseEntityGroupingParams<
  EntityKey extends GlobalEntityKey,
  GroupKey extends GlobalEntityKey
> {
  /**
   * Entity type to group (e.g., 'blockInstance')
   */
  entityKey: EntityKey
  
  /**
   * Entity type to group by (e.g., 'blockShape')
   */
  groupKey: GroupKey
  
  /**
   * Function to get the group ID from an entity
   * e.g., (instance) => String(instance.blockShapeRef)
   */
  groupBy: (entity: GlobalEntity<EntityKey>) => string
}

/**
 * useEntityGrouping composable return type
 */
export interface UseEntityGroupingReturn<EntityKey extends GlobalEntityKey> {
  /**
   * Entities grouped by group ID, sorted by orderIndex within each group
   */
  entitiesByGroup: ComputedRef<Map<string, GlobalEntity<EntityKey>[]>>
}

/**
 * useEntityGrouping composable
 * 
 * LEARNING: Provides grouped entity arrays
 * WHY: Extracts grouping logic from component to reusable generic composable
 * PATTERN: Generic composable that groups entities by another entity type
 */
export function useEntityGrouping<
  EntityKey extends GlobalEntityKey,
  GroupKey extends GlobalEntityKey
>(
  params: UseEntityGroupingParams<EntityKey, GroupKey>
): UseEntityGroupingReturn<EntityKey> {
  const { entityKey, groupKey, groupBy } = params
  const { getGlobalEntities } = useGlobal()

  /**
   * LEARNING: Computed property for entities grouped by group key
   * WHY: Groups entities by another entity type for display in tabs
   * PATTERN: Computed property with Map data structure
   * NOTE: Must copy arrays before sorting because getGlobalEntities returns readonly Vue Query proxy
   */
  const entitiesByGroup = computed(() => {
    const groupEntities = getGlobalEntities(groupKey)
    const entities = getGlobalEntities(entityKey)
    const map = new Map<string, GlobalEntity<EntityKey>[]>()
    
    groupEntities.forEach(groupEntity => {
      const groupId = String(groupEntity.id)
      const groupEntitiesList = entities
        .filter(entity => groupBy(entity) === groupId)
        // LEARNING: Copy array before sorting to avoid readonly proxy errors
        // WHY: Vue Query returns readonly proxies, we need mutable copy for sort()
        // PATTERN: Spread operator creates new array
        .map(entity => ({ ...entity }))
        .sort((a, b) => a.orderIndex - b.orderIndex)
      map.set(groupId, groupEntitiesList)
    })
    
    return map
  })

  return {
    entitiesByGroup
  }
}

