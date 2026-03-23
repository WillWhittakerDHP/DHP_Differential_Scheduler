/**
 * WHY: Ref bundle for instance drag-and-drop (thin useInstanceDragAndDrop).
 */

import { ref, type Ref, type ComponentPublicInstance } from 'vue'
import { useEntityDragHandlers } from '@/composables/admin/useEntityDragHandlers'
import { dragAndDrop } from '@formkit/drag-and-drop/vue'
import { panelRefSnapshot, type InstanceDragFormKitBinderDeps } from '@/utils/admin/instanceDragAndDropFormKitBind'
import type { GlobalEntity } from '@/types/entities'
import type { UseInstanceDragAndDropReturn } from '@/types/admin/instanceDragAndDrop'

export function useInstanceDragAndDropState(): Pick<
  UseInstanceDragAndDropReturn,
  | 'blockInstancesLists'
  | 'blockInstanceIdsMap'
  | 'groupContainers'
  | 'groupPanelsContainers'
  | 'groupPanelsGroupedContainers'
  | 'groupDragHandlers'
  | 'groupDragInstances'
  | 'isMounted'
> & {
  formKitDeps: InstanceDragFormKitBinderDeps
  dragReinitNonce: Ref<number>
  shapeDragBoundNonce: Ref<Map<string, number>>
  panelRefSnapshotForWatch: () => Array<string | ComponentPublicInstance | HTMLElement | null>
} {
  const blockInstancesLists = ref<Map<string, Ref<GlobalEntity<'blockInstance'>[]>>>(new Map())
  const blockInstanceIdsMap = ref<Map<string, Ref<string[]>>>(new Map())
  const groupContainers = ref<Map<string, HTMLElement | null>>(new Map())
  const groupPanelsContainers = ref<Map<string, Ref<ComponentPublicInstance | HTMLElement | null>>>(new Map())
  const groupPanelsGroupedContainers = ref<Map<string, Ref<ComponentPublicInstance | HTMLElement | null>>>(new Map())
  const groupDragHandlers = ref<Map<string, ReturnType<typeof useEntityDragHandlers<'blockInstance'>>>>(new Map())
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

  return {
    blockInstancesLists,
    blockInstanceIdsMap,
    groupContainers,
    groupPanelsContainers,
    groupPanelsGroupedContainers,
    groupDragHandlers,
    groupDragInstances,
    isMounted,
    formKitDeps,
    dragReinitNonce,
    shapeDragBoundNonce,
    panelRefSnapshotForWatch,
  }
}
