import type { Ref } from 'vue'
import type { ComponentPublicInstance } from 'vue'
import { createSingleClassDraggableChecker, getPanelsElement } from '@/composables/admin/useDragAndDropHelpers'
import { mountFormKitExpansionPanelsDrag } from '@/utils/admin/mountFormKitExpansionPanelsDrag'

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

/** Returns the panels element FormKit bound to, or null if mount was skipped/failed. */
export function useMountDragAndDropOnPanelsIfReady(params: MountDragAndDropOnPanelsParams): HTMLElement | null {
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
    return null
  }

  const panelsEl = getPanelsElement(panelsComponentRef, container, isMounted)
  if (!panelsEl || !(panelsEl instanceof HTMLElement)) {
    return null
  }

  const entityIdsArray = entityIds.value
  if (!entityIdsArray || entityIdsArray.length === 0) {
    return null
  }

  const isDraggableChecker = createSingleClassDraggableChecker(draggableClass)
  const instance = mountFormKitExpansionPanelsDrag({
    panelsEl,
    values: entityIds,
    group,
    dragHandle,
    isPanelDraggable: isDraggableChecker,
    onDragEnd: dragEndHandler,
    logContext: { group },
  })
  return instance ? panelsEl : null
}
