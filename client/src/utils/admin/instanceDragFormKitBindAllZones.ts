/**
 * WHY: Flatten FormKit bind loop for instance drag (useInstanceDragAndDrop complexity audit).
 */

import type { Ref, ComponentPublicInstance } from 'vue'
import {
  tryBindFormKitForZone,
  type InstanceDragFormKitBinderDeps,
} from '@/utils/admin/instanceDragAndDropFormKitBind'
import { groupedInstanceDragZoneKey } from '@/utils/admin/instanceDragZoneKeys'

export function bindFormKitZonesForInstanceDragContainers(
  containers: Map<string, HTMLElement | null>,
  deps: {
    blockInstanceIdsMap: Ref<Map<string, Ref<string[]>>>
    groupPanelsContainers: Ref<Map<string, Ref<ComponentPublicInstance | HTMLElement | null>>>
    groupPanelsGroupedContainers: Ref<Map<string, Ref<ComponentPublicInstance | HTMLElement | null>>>
    formKitDeps: InstanceDragFormKitBinderDeps
  }
): void {
  const { blockInstanceIdsMap, groupPanelsContainers, groupPanelsGroupedContainers, formKitDeps } = deps

  containers.forEach((_container, blockShapeId) => {
    tryBindFormKitForZone(
      {
        dragKey: blockShapeId,
        blockShapeIdForClass: blockShapeId,
        panelsRefHolder: groupPanelsContainers.value.get(blockShapeId),
      },
      formKitDeps
    )

    const groupedZoneKey = groupedInstanceDragZoneKey(blockShapeId)
    const groupedIds = blockInstanceIdsMap.value.get(groupedZoneKey)?.value
    if (!groupedIds?.length) {
      return
    }

    tryBindFormKitForZone(
      {
        dragKey: groupedZoneKey,
        blockShapeIdForClass: blockShapeId,
        panelsRefHolder: groupPanelsGroupedContainers.value.get(blockShapeId),
      },
      formKitDeps
    )
  })
}
