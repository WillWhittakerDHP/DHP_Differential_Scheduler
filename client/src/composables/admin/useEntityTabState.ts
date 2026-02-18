/**
 * Entity Tab State Composable
 * 
 * LEARNING: Generic array syncing watchers for any entity type
 * WHY: All entities need the same array syncing behavior for drag-and-drop
 * PATTERN: Generic composable that watches filtered lists and syncs arrays
 * 
 * This composable handles:
 * - Syncing reactive arrays with filtered results for drag-and-drop
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
 * Entity Tab State Composable
 * 
 * LEARNING: Sets up watchers to sync arrays with filtered results
 * WHY: Extracts watcher logic from component to reusable generic composable
 * PATTERN: Generic composable that sets up watchers during initialization
 */
export function useEntityTabState<EntityKey extends GlobalEntityKey>(
  options: UseEntityTabStateOptions<EntityKey>
): UseEntityTabStateReturn {
  const {
    filteredEntities,
    dragHandlers
  } = options
  
  /**
   * LEARNING: Sync reactive arrays with filtered results
   * WHY: Keep drag-and-drop arrays in sync with filtered/sorted results
   * PATTERN: Watch computed and update ref arrays via drag handlers
   */
  watch(filteredEntities, () => {
    dragHandlers.syncArrays()
  }, { immediate: true })
  
  return {}
}

