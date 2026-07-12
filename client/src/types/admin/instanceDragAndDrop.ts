import type { Ref, ComputedRef, ComponentPublicInstance } from 'vue'
import type { GlobalEntity } from '@/types/entities'
import type { PatchOrderIndex } from '@/types/admin/entityDragHandlers'
import type { BlockInstanceZoneDragHandlers } from '@/utils/admin/instanceDragAndDropShapeMapsSync'
import type { dragAndDrop } from '@formkit/drag-and-drop/vue'

export interface UseInstanceDragAndDropOptions {
  mainInstancesByShape: ComputedRef<Map<string, GlobalEntity<'blockInstance'>[]>>
  groupedInstancesByShape: ComputedRef<Map<string, GlobalEntity<'blockInstance'>[]>>
  blockInstancesByShape: ComputedRef<Map<string, GlobalEntity<'blockInstance'>[]>>
  patchBlockInstanceOrderIndex: PatchOrderIndex
  /** Drives FormKit re-bind when VWindow shows a shape tab (lazy mount). */
  activeTab: Ref<string>
  /** When split Orchestrator/Atomic UI is shown, panel layout changes; include in bind watch. */
  orchestratorAtomicSubTab?: Ref<'orchestrator' | 'atomic'>
}

export interface UseInstanceDragAndDropReturn {
  blockInstancesLists: Ref<Map<string, Ref<GlobalEntity<'blockInstance'>[]>>>
  blockInstanceIdsMap: Ref<Map<string, Ref<string[]>>>
  groupContainers: Ref<Map<string, HTMLElement | null>>
  groupPanelsContainers: Ref<Map<string, Ref<ComponentPublicInstance | HTMLElement | null>>>
  groupPanelsGroupedContainers: Ref<Map<string, Ref<ComponentPublicInstance | HTMLElement | null>>>
  groupDragHandlers: Ref<Map<string, BlockInstanceZoneDragHandlers>>
  groupDragInstances: Ref<Map<string, ReturnType<typeof dragAndDrop>>>
  isMounted: Ref<boolean>
}
