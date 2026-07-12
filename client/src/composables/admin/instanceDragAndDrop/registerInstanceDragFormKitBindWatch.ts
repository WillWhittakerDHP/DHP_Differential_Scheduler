/**
 * WHY: FormKit bind watch extracted from useInstanceDragAndDrop (length / nesting audit).
 * PATTERN: Watch includes `activeTab` (and optional orchestrator/atomic sub-tab) so lazy `VWindowItem` mounts re-trigger bind post-flush.
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
  activeTab: Ref<string>
  orchestratorAtomicSubTab?: Ref<'orchestrator' | 'atomic'>
}): void {
  watch(
    () =>
      [
        input.groupContainers.value,
        input.dragReinitNonce.value,
        input.isMounted.value,
        input.activeTab.value,
        input.orchestratorAtomicSubTab?.value,
        ...input.panelRefSnapshotForWatch(),
      ] as const,
    ([containers]) => {
      if (!input.isMounted.value) {
        return
      }
      if (!containers || !(containers instanceof Map)) {
        return
      }

      bindFormKitZonesForInstanceDragContainers(
        containers,
        {
          blockInstanceIdsMap: input.blockInstanceIdsMap,
          groupPanelsContainers: input.groupPanelsContainers,
          groupPanelsGroupedContainers: input.groupPanelsGroupedContainers,
          formKitDeps: input.formKitDeps,
        },
        { activeBlockShapeId: input.activeTab.value }
      )
    },
    { immediate: true, deep: true, flush: 'post' }
  )
}
