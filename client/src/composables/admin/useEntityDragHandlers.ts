/**
 * useEntityDragHandlers Composable
 * 
 * LEARNING: Generic drag end handler logic for any entity type
 * WHY: Entities all have the same drag-and-drop behavior - no need for separate composables
 * PATTERN: Generic composable that works for any GlobalEntity type
 */

import { type Ref, type ComputedRef } from 'vue'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'

/**
 * Patch order index function type
 */
export type PatchOrderIndex = (updates: Array<{ id: string; orderIndex: number }>) => Promise<void>

/**
 * useEntityDragHandlers composable parameters
 */
export interface UseEntityDragHandlersParams<EntityKey extends GlobalEntityKey> {
  entityIds: Ref<string[]>
  entityList: Ref<GlobalEntity<EntityKey>[]>
  filteredEntities: ComputedRef<GlobalEntity<EntityKey>[]>
  patchOrderIndex: PatchOrderIndex
}

/**
 * useEntityDragHandlers composable return type
 */
export interface UseEntityDragHandlersReturn {
  handleDragEnd: () => Promise<void>
  syncArrays: () => void
}

/**
 * useEntityDragHandlers composable
 * 
 * LEARNING: Provides drag end handlers for any entity type
 * WHY: All entities have the same drag-and-drop behavior - reorder by orderIndex
 * PATTERN: Generic composable that works for blockShape, partShape, blockInstance, etc.
 */
export function useEntityDragHandlers<EntityKey extends GlobalEntityKey>(
  params: UseEntityDragHandlersParams<EntityKey>
): UseEntityDragHandlersReturn {
  const {
    entityIds,
    entityList,
    filteredEntities,
    patchOrderIndex
  } = params

  /**
   * LEARNING: Handle drag end for any entity type
   * WHY: Updates orderIndex values after drag-and-drop operation
   * PATTERN: Reorder array based on new ID order, normalize indices, sync to backend
   */
  const handleDragEnd = async (): Promise<void> => {
    try {
      // Reorder entities based on new ID order
      const reordered = entityIds.value.map(id => 
        entityList.value.find(entity => String(entity.id) === id)!
      ).filter(Boolean)
      
      // Normalize orderIndex values
      const normalized = reordered.map((entity, index) => ({
        ...entity,
        orderIndex: index
      }))
      
      // Update local arrays
      entityList.value = normalized as typeof entityList.value
      
      // Sync to backend
      const updates = normalized.map((entity, index) => ({
        id: entity.id,
        orderIndex: index
      }))
      
      await patchOrderIndex(updates)
    } catch (error) {
      // Revert to original order on error
      syncArrays()
    }
  }

  /**
   * LEARNING: Sync reactive arrays with filtered results
   * WHY: Keep drag-and-drop arrays in sync with filtered/sorted results
   * PATTERN: Update ref arrays from filtered computed
   */
  const syncArrays = (): void => {
    entityList.value = [...filteredEntities.value] as typeof entityList.value
    entityIds.value = filteredEntities.value.map(entity => String(entity.id))
  }

  return {
    handleDragEnd,
    syncArrays
  }
}

