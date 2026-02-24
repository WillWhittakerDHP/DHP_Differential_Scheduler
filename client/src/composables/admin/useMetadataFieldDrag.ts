/**
 * PATTERN: Drag-and-drop setup for metadata field ordering panels.
 * WHY: Keeps AdminPrimitiveMetadataEditor.vue under vue-architecture script line limit.
 */
import { onMounted, onBeforeUnmount, nextTick, type Ref } from 'vue'
import { dragAndDrop } from '@formkit/drag-and-drop/vue'
import { animations } from '@formkit/drag-and-drop'
import { getPanelsElement } from '@/composables/admin/useDragAndDropHelpers'
import type { AppLogger } from '@/utils/logger'

export interface UseMetadataFieldDragParams {
  expansionPanelsRef: Ref<HTMLElement | { $el?: HTMLElement } | null>
  draggableFieldKeys: Ref<string[]>
  handleDragEnd: () => void
  logger: AppLogger
}

export function useMetadataFieldDrag(params: UseMetadataFieldDragParams): void {
  const { expansionPanelsRef, draggableFieldKeys, handleDragEnd, logger } = params
  let dragInstance: ReturnType<typeof dragAndDrop> | null = null

  onMounted(() => {
    nextTick(() => {
      if (!expansionPanelsRef.value) return
      const panelsElement = getPanelsElement(expansionPanelsRef.value, null)
      if (!panelsElement) return
      try {
        dragInstance = dragAndDrop({
          parent: panelsElement,
          values: draggableFieldKeys,
          draggable: (el) =>
            el instanceof HTMLElement && el.classList?.contains('draggable-field-panel'),
          plugins: [animations()],
          handleEnd: () => handleDragEnd(),
        })
      } catch (error) {
        logger.error('Error setting up drag-and-drop', error)
      }
    })
  })

  onBeforeUnmount(() => {
    if (dragInstance) dragInstance = null
  })
}
