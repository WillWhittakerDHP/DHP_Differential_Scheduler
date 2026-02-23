/**
 * PATTERN: Composable for status button click handlers
PATTERN: Composable that man...
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
 */
export function useStatusButtonHandlers<GE extends GlobalEntityKey>(
  options: UseStatusButtonHandlersOptions<GE>
): UseStatusButtonHandlersReturn<GE> {
  const { filteredEntities, entityKey } = options

  /**
PATTERN: Map of entity ID to toggle handler composable
FIX: Handlers...
   */
  const statusButtonHandlers = ref(new Map<string, ReturnType<typeof useStatusButtonToggle<GE>>>())

  /**
   * WHY: Vue composables can only be called during setup, not in event handlers
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
