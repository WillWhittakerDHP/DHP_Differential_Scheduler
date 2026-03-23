/**
 * WHY: FormKit bind watch extracted from useInstanceDragAndDrop (length / nesting audit).
 */

import { watch, type Ref, type ComponentPublicInstance } from 'vue'
import { bindFormKitZonesForInstanceDragContainers } from '@/utils/admin/instanceDragFormKitBindAllZones'
import type { InstanceDragFormKitBinderDeps } from '@/utils/admin/instanceDragAndDropFormKitBind'

export function registerInstanceDragFormKitBindWatch(input: {
  groupContainers: Ref<Map<string, HTMLElement | null>>
  dragReinitNonce: Ref<number>
  isMounted: Ref<boolean>
  panelRefSnapshotForWatch: () => Array<string | ComponentPublicInstance | HTMLElement | null>
  blockInstanceIdsMap: Ref<Map<string, Ref<string[]>>>
  groupPanelsContainers: Ref<Map<string, Ref<ComponentPublicInstance | HTMLElement | null>>>
  groupPanelsGroupedContainers: Ref<Map<string, Ref<ComponentPublicInstance | HTMLElement | null>>>
  formKitDeps: InstanceDragFormKitBinderDeps
}): void {
  watch(
    () =>
      [
        input.groupContainers.value,
        input.dragReinitNonce.value,
        input.isMounted.value,
        ...input.panelRefSnapshotForWatch(),
      ] as const,
    ([containers]) => {
      if (!input.isMounted.value) {
        return
      }
      if (!containers || !(containers instanceof Map)) {
        return
      }

      bindFormKitZonesForInstanceDragContainers(containers, {
        blockInstanceIdsMap: input.blockInstanceIdsMap,
        groupPanelsContainers: input.groupPanelsContainers,
        groupPanelsGroupedContainers: input.groupPanelsGroupedContainers,
        formKitDeps: input.formKitDeps,
      })
    },
    { immediate: true, deep: true, flush: 'post' }
  )
}
