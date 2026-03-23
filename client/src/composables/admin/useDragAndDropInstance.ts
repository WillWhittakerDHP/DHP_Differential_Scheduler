import { ref, type Ref } from 'vue'
import type { ComponentPublicInstance } from 'vue'
import { animations, handleEnd as formkitHandleEnd, performTransfer as formkitPerformTransfer } from '@formkit/drag-and-drop'
import { dragAndDrop } from '@formkit/drag-and-drop/vue'
import {
  countDraggableNodes,
  createExpansionPanelDraggableChecker,
  createSingleClassDraggableChecker,
  getPanelsElement,
} from '@/composables/admin/useDragAndDropHelpers'
import { createLogger } from '@/utils/logger'

const logger = createLogger('useDragAndDropInstance')

export interface MountDragAndDropOnPanelsParams {
  container: HTMLElement
  panelsComponentRef: ComponentPublicInstance | HTMLElement | null
  isMounted: Ref<boolean>
  entityIds: Ref<string[]>
  group: string
  draggableClass: string
  dragHandle?: string
  dragEndHandler: () => void
}

export function useMountDragAndDropOnPanelsIfReady(params: MountDragAndDropOnPanelsParams): void {
  const {
    container,
    panelsComponentRef,
    isMounted,
    entityIds,
    group,
    draggableClass,
    dragHandle,
    dragEndHandler,
  } = params

  if (!isMounted.value) {
    return
  }

  const panelsEl = getPanelsElement(panelsComponentRef, container, isMounted)
  if (!panelsEl || !(panelsEl instanceof HTMLElement)) {
    return
  }

  const entityIdsArray = entityIds.value
  if (!entityIdsArray || entityIdsArray.length === 0) {
    return
  }

  const isDraggableChecker = createSingleClassDraggableChecker(draggableClass)
  const enabledNodesCount = countDraggableNodes(panelsEl, isDraggableChecker)
  if (enabledNodesCount !== entityIdsArray.length) {
    return
  }

  const panelsRef = ref(panelsEl)

  try {
    dragAndDrop({
      parent: panelsRef,
      values: entityIds,
      group,
      ...(dragHandle ? { dragHandle } : {}),
      draggable: createExpansionPanelDraggableChecker(isDraggableChecker),
      plugins: [animations()],
      performTransfer: (arg) => {
        formkitPerformTransfer(arg)
      },
      handleEnd: (state) => {
        formkitHandleEnd(state)
        dragEndHandler()
      },
    })
  } catch (error) {
    logger.error('Failed to initialize drag and drop', { error, group })
  }
}
