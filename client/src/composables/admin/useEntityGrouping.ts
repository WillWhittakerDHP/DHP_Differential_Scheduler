/**
 * PATTERN: useEntityGrouping Composable

PATTERN: Generic composable that groups en...
 */
import { computed } from 'vue'
import { useGlobal } from '@/composables/useGlobal'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'
import type { UseEntityGroupingParams, UseEntityGroupingReturn } from '@/types/admin/entityGrouping'

export type { UseEntityGroupingParams, UseEntityGroupingReturn } from '@/types/admin/entityGrouping'

/**
 * WHY: useEntityGrouping composable

WHY: Extracts grouping logic from componen...
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
   * NOTE: Must copy arrays before sorting because getGlobalEntities returns readonly Vue Query proxy
   */
  const entitiesByGroup = computed(() => {
    const groupEntities = getGlobalEntities(groupKey)
    const entities = getGlobalEntities(entityKey)
    
    // WHY: Functional approach avoids mutations, aligns with workspace rules
    // PATTERN: Reduce groupEntities to Map, creating new arrays instead of mutating
    return groupEntities.reduce((map, groupEntity) => {
      const groupId = groupEntity.id
      const groupEntitiesList = entities
        .filter(entity => groupBy(entity) === groupId)
        // PATTERN: Spread operator creates new array
        .map(entity => ({ ...entity }))
        .sort((a, b) => a.orderIndex - b.orderIndex)
      map.set(groupId, groupEntitiesList)
      return map
    }, new Map<string, GlobalEntity<EntityKey>[]>())
  })

  return {
    entitiesByGroup
  }
}

