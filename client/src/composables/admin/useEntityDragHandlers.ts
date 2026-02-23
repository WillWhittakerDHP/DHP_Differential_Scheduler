/**
 * WHY: useEntityDragHandlers Composable

WHY: Entities all have the same drag-a...
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
 * PATTERN: useEntityDragHandlers composable

PATTERN: Generic composable that works...
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
   * 
   * FIX: Normalize orderIndex for ALL entities in the group, not just dragged ones
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

