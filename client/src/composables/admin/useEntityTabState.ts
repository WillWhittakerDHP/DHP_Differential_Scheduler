/**
 * PATTERN: Entity Tab State Composable

PATTERN: Generic composable that watches fi...
 */
import { watch, type Ref } from 'vue'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'

export interface UseEntityTabStateOptions<EntityKey extends GlobalEntityKey> {
  filteredEntities: Ref<GlobalEntity<EntityKey>[]>
  
  dragHandlers: {
    syncArrays: () => void
  }
}

export type UseEntityTabStateReturn = Record<string, never>

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
  
  /**
   */
  watch(filteredEntities, () => {
    dragHandlers.syncArrays()
  }, { immediate: true })
  
  return {}
}

