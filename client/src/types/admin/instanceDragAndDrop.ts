import type { Ref, ComputedRef, ComponentPublicInstance } from 'vue'
import type { GlobalEntity } from '@/types/entities'
import type { PatchOrderIndex } from '@/types/admin/entityDragHandlers'
import type { useEntityDragHandlers } from '@/composables/admin/useEntityDragHandlers'
import type { dragAndDrop } from '@formkit/drag-and-drop/vue'

export interface UseInstanceDragAndDropOptions {
  mainInstancesByShape: ComputedRef<Map<string, GlobalEntity<'blockInstance'>[]>>
  groupedInstancesByShape: ComputedRef<Map<string, GlobalEntity<'blockInstance'>[]>>
  blockInstancesByShape: ComputedRef<Map<string, GlobalEntity<'blockInstance'>[]>>
  patchBlockInstanceOrderIndex: PatchOrderIndex
}

export interface UseInstanceDragAndDropReturn {
  blockInstancesLists: Ref<Map<string, Ref<GlobalEntity<'blockInstance'>[]>>>
  blockInstanceIdsMap: Ref<Map<string, Ref<string[]>>>
  groupContainers: Ref<Map<string, HTMLElement | null>>
  groupPanelsContainers: Ref<Map<string, Ref<ComponentPublicInstance | HTMLElement | null>>>
  groupPanelsGroupedContainers: Ref<Map<string, Ref<ComponentPublicInstance | HTMLElement | null>>>
  groupDragHandlers: Ref<Map<string, ReturnType<typeof useEntityDragHandlers<'blockInstance'>>>>
  groupDragInstances: Ref<Map<string, ReturnType<typeof dragAndDrop>>>
  isMounted: Ref<boolean>
}
