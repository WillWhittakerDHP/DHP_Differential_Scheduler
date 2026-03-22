/**
 * WHY: Isolates DOM/FormKit wiring from useInstanceDragAndDrop orchestration.
 */
import { nextTick, ref, isRef, type Ref, type ComponentPublicInstance } from 'vue'
import {
  animations,
  handleEnd as formkitHandleEnd,
  performTransfer as formkitPerformTransfer,
  tearDown as formkitTearDown,
} from '@formkit/drag-and-drop'
import { dragAndDrop } from '@formkit/drag-and-drop/vue'
import { createLogger } from '@/utils/logger'
import type { GlobalEntity } from '@/types/entities'
import {
  getPanelsElement,
  countDraggableNodes,
  createMultiClassDraggableChecker,
  createExpansionPanelDraggableChecker,
} from './useDragAndDropHelpers'

const logger = createLogger('instanceDragAndDropFormKitBind')

export type InstanceDragFormKitBinderDeps = {
  isMounted: Ref<boolean>
  dragReinitNonce: Ref<number>
  blockInstancesLists: Ref<Map<string, Ref<GlobalEntity<'blockInstance'>[]>>>
  blockInstanceIdsMap: Ref<Map<string, Ref<string[]>>>
  groupDragHandlers: Ref<
    Map<
      string,
      {
        handleDragEnd: () => void | Promise<void>
      }
    >
  >
  groupDragInstances: Ref<Map<string, ReturnType<typeof dragAndDrop>>>
  formKitParentElByZone: Ref<Map<string, HTMLElement>>
  shapeDragBoundNonce: Ref<Map<string, number>>
}

export function tearDownZoneDrag(dragKey: string, deps: InstanceDragFormKitBinderDeps): void {
  const el = deps.formKitParentElByZone.value.get(dragKey)
  if (el) {
    formkitTearDown(el)
    deps.formKitParentElByZone.value.delete(dragKey)
  }
  deps.groupDragInstances.value.delete(dragKey)
  deps.shapeDragBoundNonce.value.delete(dragKey)
}

export function tryBindFormKitForZone(
  params: {
    dragKey: string
    blockShapeIdForClass: string
    panelsRefHolder: Ref<ComponentPublicInstance | HTMLElement | null> | undefined
  },
  deps: InstanceDragFormKitBinderDeps
): void {
  const { dragKey, blockShapeIdForClass, panelsRefHolder } = params

  const instancesList = deps.blockInstancesLists.value.get(dragKey)
  const instanceIds = deps.blockInstanceIdsMap.value.get(dragKey)
  const dragHandlers = deps.groupDragHandlers.value.get(dragKey)

  if (!instancesList || !instanceIds || !dragHandlers || !panelsRefHolder) {
    tearDownZoneDrag(dragKey, deps)
    return
  }

  const rawHolder = isRef(panelsRefHolder) ? panelsRefHolder.value : panelsRefHolder
  if (rawHolder === null || rawHolder === undefined) {
    tearDownZoneDrag(dragKey, deps)
    return
  }

  nextTick(() => {
    if (!deps.isMounted.value) {
      return
    }

    try {
      const panelsEl = getPanelsElement(
        isRef(panelsRefHolder) ? panelsRefHolder.value : panelsRefHolder,
        null,
        undefined,
        false
      )
      if (!panelsEl || !(panelsEl instanceof HTMLElement)) {
        tearDownZoneDrag(dragKey, deps)
        return
      }

      const layoutNonce = deps.dragReinitNonce.value
      void layoutNonce

      const panelsRefForDrag = ref(panelsEl)

      const instanceIdsArray = instanceIds.value
      if (!instanceIdsArray || instanceIdsArray.length === 0) {
        return
      }

      const draggableClasses = [`draggable-instance-${blockShapeIdForClass}`, 'draggable-instance-item']
      const isDraggableChecker = createMultiClassDraggableChecker(draggableClasses)
      const enabledNodesCount = countDraggableNodes(panelsEl, isDraggableChecker)

      if (enabledNodesCount !== instanceIdsArray.length) {
        return
      }

      deps.groupDragInstances.value.delete(dragKey)

      tearDownZoneDrag(dragKey, deps)
      deps.formKitParentElByZone.value.set(dragKey, panelsEl)
      deps.groupDragInstances.value.set(
        dragKey,
        dragAndDrop({
          parent: panelsRefForDrag,
          values: instanceIds,
          group: `blockInstances-${dragKey}`,
          dragHandle: '.instance-drag-handle',
          draggable: createExpansionPanelDraggableChecker(isDraggableChecker),
          plugins: [animations()],
          performTransfer: (arg) => {
            formkitPerformTransfer(arg)
          },
          handleEnd: (state) => {
            formkitHandleEnd(state)
            void dragHandlers.handleDragEnd()
          },
        })
      )
      deps.shapeDragBoundNonce.value.set(dragKey, layoutNonce)
    } catch (error) {
      logger.debug('Failed to initialize drag and drop for group', { error, dragKey })
    }
  })
}

export function panelRefSnapshot(
  m: Map<string, Ref<ComponentPublicInstance | HTMLElement | null>>
): Array<string | ComponentPublicInstance | HTMLElement | null> {
  const out: Array<string | ComponentPublicInstance | HTMLElement | null> = []
  m.forEach((holder, shapeId) => {
    out.push(shapeId, isRef(holder) ? holder.value : holder)
  })
  return out
}
