/**
 * WHY: Ref bundle for instance drag-and-drop (thin useInstanceDragAndDrop).
 */

import { ref, type Ref, type ComponentPublicInstance } from 'vue'
import { dragAndDrop } from '@formkit/drag-and-drop/vue'
import { panelRefSnapshot, type InstanceDragFormKitBinderDeps } from '@/utils/admin/instanceDragAndDropFormKitBind'
import type { BlockInstanceZoneDragHandlers } from '@/utils/admin/instanceDragAndDropShapeMapsSync'
import type { GlobalEntity } from '@/types/entities'

/** Grouped refs for layout + FormKit watches (keeps composable return surface small). */
interface UseInstanceDragAndDropLayoutState {
  blockInstancesLists: Ref<Map<string, Ref<GlobalEntity<'blockInstance'>[]>>>
  blockInstanceIdsMap: Ref<Map<string, Ref<string[]>>>
  groupContainers: Ref<Map<string, HTMLElement | null>>
  groupPanelsContainers: Ref<Map<string, Ref<ComponentPublicInstance | HTMLElement | null>>>
  groupPanelsGroupedContainers: Ref<Map<string, Ref<ComponentPublicInstance | HTMLElement | null>>>
  groupDragHandlers: Ref<Map<string, BlockInstanceZoneDragHandlers>>
  groupDragInstances: Ref<Map<string, ReturnType<typeof dragAndDrop>>>
  dragReinitNonce: Ref<number>
  shapeDragBoundNonce: Ref<Map<string, number>>
  panelRefSnapshotForWatch: () => Array<string | ComponentPublicInstance | HTMLElement | null>
}

export interface UseInstanceDragAndDropStateReturn {
  layout: UseInstanceDragAndDropLayoutState
  formKitDeps: InstanceDragFormKitBinderDeps
  isMounted: Ref<boolean>
}

export function useInstanceDragAndDropState(): UseInstanceDragAndDropStateReturn {
  const blockInstancesLists = ref<Map<string, Ref<GlobalEntity<'blockInstance'>[]>>>(new Map())
  const blockInstanceIdsMap = ref<Map<string, Ref<string[]>>>(new Map())
  const groupContainers = ref<Map<string, HTMLElement | null>>(new Map())
  const groupPanelsContainers = ref<Map<string, Ref<ComponentPublicInstance | HTMLElement | null>>>(new Map())
  const groupPanelsGroupedContainers = ref<Map<string, Ref<ComponentPublicInstance | HTMLElement | null>>>(new Map())
  const groupDragHandlers = ref<Map<string, BlockInstanceZoneDragHandlers>>(new Map())
  const groupDragInstances = ref<Map<string, ReturnType<typeof dragAndDrop>>>(new Map())
  const formKitParentElByZone = ref<Map<string, HTMLElement>>(new Map())
  const isMounted = ref(false)
  const dragReinitNonce = ref(0)
  const shapeDragBoundNonce = ref<Map<string, number>>(new Map())

  const formKitDeps: InstanceDragFormKitBinderDeps = {
    isMounted,
    dragReinitNonce,
    blockInstancesLists,
    blockInstanceIdsMap,
    groupDragHandlers,
    groupDragInstances,
    formKitParentElByZone,
    shapeDragBoundNonce,
  }

  const panelRefSnapshotForWatch = (): Array<string | ComponentPublicInstance | HTMLElement | null> => [
    ...panelRefSnapshot(groupPanelsContainers.value),
    ...panelRefSnapshot(groupPanelsGroupedContainers.value),
  ]

  const layout: UseInstanceDragAndDropLayoutState = {
    blockInstancesLists,
    blockInstanceIdsMap,
    groupContainers,
    groupPanelsContainers,
    groupPanelsGroupedContainers,
    groupDragHandlers,
    groupDragInstances,
    dragReinitNonce,
    shapeDragBoundNonce,
    panelRefSnapshotForWatch,
  }

  return {
    layout,
    formKitDeps,
    isMounted,
  }
}
