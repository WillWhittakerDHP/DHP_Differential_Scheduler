/**
 * WHY: Single FormKit + VExpansionPanels drag mount for admin lists (instances, shapes).
 * PATTERN: Shared guard (DOM panel count vs id list) and mount; callers own tearDown lifecycle.
 */
import { ref, type Ref } from 'vue'
import {
  animations,
  handleEnd as formkitHandleEnd,
  performTransfer as formkitPerformTransfer,
} from '@formkit/drag-and-drop'
import { dragAndDrop } from '@formkit/drag-and-drop/vue'
import {
  countDraggableNodes,
  createExpansionPanelDraggableChecker,
} from '@/composables/admin/useDragAndDropHelpers'
import { createLogger } from '@/utils/logger'

const logger = createLogger('mountFormKitExpansionPanelsDrag')

export type MountFormKitExpansionPanelsDragParams = {
  panelsEl: HTMLElement
  values: Ref<string[]>
  group: string
  dragHandle?: string
  /** Return true when the `.v-expansion-panel` root should participate in reorder. */
  isPanelDraggable: (panelElement: Element) => boolean
  onDragEnd: () => void | Promise<void>
  logContext?: Record<string, unknown>
}

export function mountFormKitExpansionPanelsDrag(
  params: MountFormKitExpansionPanelsDragParams
): ReturnType<typeof dragAndDrop> | null {
  const { panelsEl, values, group, dragHandle, isPanelDraggable, onDragEnd, logContext } = params

  const entityIdsArray = values.value
  if (!entityIdsArray || entityIdsArray.length === 0) {
    return null
  }

  const enabledNodesCount = countDraggableNodes(panelsEl, isPanelDraggable)
  if (enabledNodesCount !== entityIdsArray.length) {
    logger.warn('FormKit drag bind skipped: draggable panel count does not match entity id count', {
      enabledNodesCount,
      expectedCount: entityIdsArray.length,
      group,
      ...logContext,
    })
    return null
  }

  const panelsRef = ref(panelsEl)

  try {
    return dragAndDrop({
      parent: panelsRef,
      values,
      group,
      ...(dragHandle ? { dragHandle } : {}),
      draggable: createExpansionPanelDraggableChecker((el: HTMLElement) => isPanelDraggable(el)),
      plugins: [animations()],
      performTransfer: (arg) => {
        formkitPerformTransfer(arg)
      },
      handleEnd: (state) => {
        formkitHandleEnd(state)
        void onDragEnd()
      },
    })
  } catch (error) {
    logger.error('Failed to initialize FormKit drag and drop', { error, group, ...logContext })
    return null
  }
}
