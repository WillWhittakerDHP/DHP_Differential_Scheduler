/**
 * Composable for status button click handlers
 * WHY: Extracts status button handler logic from ShapesTab
 * PATTERN: Composable that manages status button handlers and click handlers
 */

import { ref, watch, type Ref, type ComputedRef } from 'vue'
import { useStatusButtonToggle } from './useStatusButtonToggle'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'

export interface UseStatusButtonHandlersOptions<GE extends GlobalEntityKey> {
  filteredEntities: ComputedRef<GlobalEntity<GE>[]>
  entityKey: GE
}

export interface UseStatusButtonHandlersReturn<GE extends GlobalEntityKey> {
  statusButtonHandlers: Ref<Map<string, ReturnType<typeof useStatusButtonToggle<GE>>>>
  handleStatusButtonClick: (entityId: string, fieldKey: GlobalFieldKey<GE>, event: Event) => void
}

/**
 * Composable for managing status button handlers
 * WHY: Creates and manages status button toggle handlers for entities
 * PATTERN: Watch entities and create handlers during setup, provide click handler
 */
export function useStatusButtonHandlers<GE extends GlobalEntityKey>(
  options: UseStatusButtonHandlersOptions<GE>
): UseStatusButtonHandlersReturn<GE> {
  const { filteredEntities, entityKey } = options

  /**
   * LEARNING: Status button toggle handlers per entity
   * WHY: Each entity needs its own toggle handler to track pending toggles
   * PATTERN: Map of entity ID to toggle handler composable
   * FIX: Handlers must be created during setup, not in event handlers
   */
  const statusButtonHandlers = ref(new Map<string, ReturnType<typeof useStatusButtonToggle<GE>>>())

  /**
   * LEARNING: Create status button handlers proactively for all entities
   * WHY: Vue composables can only be called during setup, not in event handlers
   * PATTERN: Watch entities and create handlers during setup
   */
  watch(() => filteredEntities.value, (entities) => {
    entities.forEach((entity) => {
      if (!statusButtonHandlers.value.has(entity.id)) {
        statusButtonHandlers.value.set(
          entity.id,
          useStatusButtonToggle({
            entityKey,
            entityId: entity.id
          })
        )
      }
    })
  }, { immediate: true, deep: true })

  /**
   * LEARNING: Handle status button click
   * WHY: Returns handler that was created during setup
   * PATTERN: Get handler from map and call toggleStatusButton
   */
  const handleStatusButtonClick = (entityId: string, fieldKey: GlobalFieldKey<GE>, event: Event): void => {
    const handler = statusButtonHandlers.value.get(entityId)
    if (handler) {
      handler.toggleStatusButton(fieldKey, event)
    }
  }

  return {
    statusButtonHandlers,
    handleStatusButtonClick
  }
}
