/**
 * WHY: Keeps AdminPrimitiveMetadataEditor.vue under vue-architecture script line limit.
 */
import { onMounted, onBeforeUnmount, nextTick } from 'vue'
import type { ComponentPublicInstance } from 'vue'
import { dragAndDrop } from '@formkit/drag-and-drop/vue'
import { animations } from '@formkit/drag-and-drop'
import { getPanelsElement } from '@/composables/admin/useDragAndDropHelpers'
import type { UseMetadataFieldDragParams } from '@/types/admin/metadataFieldDrag'

function tryCreateMetadataFieldDragInstance(params: UseMetadataFieldDragParams): ReturnType<typeof dragAndDrop> | null {
  const { expansionPanelsRef, draggableFieldKeys, handleDragEnd, logger } = params
  if (!expansionPanelsRef.value) {
    return null
  }
  const panelsElement = getPanelsElement(
    expansionPanelsRef.value as ComponentPublicInstance | HTMLElement | null,
    null
  )
  if (!panelsElement) {
    return null
  }
  try {
    return dragAndDrop({
      parent: panelsElement,
      values: draggableFieldKeys,
      draggable: (el) => el instanceof HTMLElement && el.classList?.contains('draggable-field-panel'),
      plugins: [animations()],
      handleEnd: () => handleDragEnd(),
    })
  } catch (error) {
    logger.error('Error setting up drag-and-drop', error)
    return null
  }
}

export function useMetadataFieldDrag(params: UseMetadataFieldDragParams): void {
  let dragInstance: ReturnType<typeof dragAndDrop> | null = null

  onMounted(() => {
    void nextTick(() => {
      dragInstance = tryCreateMetadataFieldDragInstance(params)
    })
  })

  onBeforeUnmount(() => {
    if (dragInstance) dragInstance = null
  })
}
