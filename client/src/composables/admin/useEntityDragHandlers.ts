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

import type { OrderIndexUpdate } from '@/composables/entityCrud/useEntityCrudTypes'
import { createLogger } from '@/utils/logger'

const logger = createLogger('useEntityDragHandlers')

export type PatchOrderIndex = (updates: OrderIndexUpdate) => Promise<void>

export interface UseEntityDragHandlersParams<EntityKey extends GlobalEntityKey> {
  entityIds: Ref<string[]>
  entityList: Ref<GlobalEntity<EntityKey>[]>
  filteredEntities: ComputedRef<GlobalEntity<EntityKey>[]>
  patchOrderIndex: PatchOrderIndex
}

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
   * 
   * FIX: Normalize orderIndex for ALL entities in the group, not just dragged ones
   * WHY: Ensures all entities have sequential orderIndex values, preventing gaps that cause
   *      incorrect ordering on page reload
   */
  const handleDragEnd = async (): Promise<void> => {
    try {
      // LEARNING: Use filteredEntities as source of truth for all entities in the group
      // PATTERN: Read from filteredEntities to ensure we update all entities
      const allEntities = filteredEntities.value
      
      // PATTERN: Map for O(1) lookup
      const entityMap = new Map<string, GlobalEntity<EntityKey>>()
      allEntities.forEach(entity => {
        entityMap.set(entity.id, entity)
      })
      
      // PATTERN: Set for O(1) membership check
      const draggedIds = new Set(entityIds.value)
      
      // PATTERN: Map dragged IDs to entities, then append non-dragged entities
      const draggedEntities = entityIds.value
        .map(id => entityMap.get(id))
        .filter((entity): entity is GlobalEntity<EntityKey> => entity !== undefined)
      
      const nonDraggedEntities = allEntities.filter(
        entity => !draggedIds.has(entity.id)
      )
      
      // PATTERN: Spread operator to combine arrays
      const reordered = [...draggedEntities, ...nonDraggedEntities]
      
      // PATTERN: Map over all entities and assign sequential indices
      const normalized = reordered.map((entity, index) => ({
        ...entity,
        orderIndex: index
      }))
      
      entityList.value = normalized as typeof entityList.value
      
      // PATTERN: Map all normalized entities to updates
      const updates = normalized.map((entity, index) => ({
        id: entity.id,
        orderIndex: index
      }))
      
      await patchOrderIndex(updates)
    } catch (_error) {
      logger.error('Failed to patch order index after drag', { error: _error })
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
    entityIds.value = filteredEntities.value.map(entity => entity.id)
  }

  return {
    handleDragEnd,
    syncArrays
  }
}

