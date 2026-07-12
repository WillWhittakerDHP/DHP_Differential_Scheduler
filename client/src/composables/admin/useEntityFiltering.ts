/**
 * PATTERN: useEntityFiltering Composable

PATTERN: Generic composable that works fo...
 */
import { computed } from 'vue'
import { useGlobal } from '@/composables/useGlobal'
import type { GlobalEntityKey } from '@/constants/entities'
import type { UseEntityFilteringReturn } from '@/types/admin/entityFiltering'
import { sortEntitiesByOrderIndex } from '@/utils/admin/sortEntitiesByOrderIndex'


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
    // WHY: Same ordering as syncArrays / drag handlers (NaN-safe, stable id tie-break).
    return sortEntitiesByOrderIndex([...entities])
  })

  return {
    filteredEntities
  }
}

