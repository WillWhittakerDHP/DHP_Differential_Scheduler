/**
 * PATTERN: Entity Tab State Composable

PATTERN: Generic composable that watches fi...
 */
import { watch } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { UseEntityTabStateOptions, UseEntityTabStateReturn } from '@/types/admin/entityTabState'


/**
 * WHY: Entity Tab State Composable

WHY: Extracts watcher logic from component ...
 */
export function useEntityTabState<EntityKey extends GlobalEntityKey>(
  options: UseEntityTabStateOptions<EntityKey>
): UseEntityTabStateReturn {
  const {
    filteredEntities,
    dragHandlers
  } = options
  
  watch(filteredEntities, () => {
    dragHandlers.syncArrays()
  }, { immediate: true })
  
  return {}
}

