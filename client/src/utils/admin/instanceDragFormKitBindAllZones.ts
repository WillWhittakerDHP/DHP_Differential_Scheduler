/**
 * WHY: Flatten FormKit bind loop for instance drag (useInstanceDragAndDrop complexity audit).
 * PATTERN: When `activeBlockShapeId` is set, bind only that shape’s zones and tear down others (lazy VWindow).
 */

import type { Ref, ComponentPublicInstance } from 'vue'
import {
  tryBindFormKitForZone,
  tearDownInstanceDragFormKitZone,
  type InstanceDragFormKitBinderDeps,
} from '@/utils/admin/instanceDragAndDropFormKitBind'
import { groupedInstanceDragZoneKey } from '@/utils/admin/instanceDragZoneKeys'

export type BindInstanceDragFormKitZonesOptions = {
  /** When set, only main + grouped zones for this block shape are bound; all other zones are torn down. */
  activeBlockShapeId?: string
}

function collectBoundZoneKeys(deps: InstanceDragFormKitBinderDeps): Set<string> {
  const keys = new Set<string>()
  deps.formKitParentElByZone.value.forEach((_el, k) => {
    keys.add(k)
  })
  deps.groupDragInstances.value.forEach((_inst, k) => {
    keys.add(k)
  })
  return keys
}

function tearDownZonesOutsideAllowed(allowed: ReadonlySet<string>, deps: InstanceDragFormKitBinderDeps): void {
  for (const key of collectBoundZoneKeys(deps)) {
    if (!allowed.has(key)) {
      tearDownInstanceDragFormKitZone(key, deps)
    }
  }
}

export function bindFormKitZonesForInstanceDragContainers(
  containers: Map<string, HTMLElement | null>,
  deps: {
    blockInstanceIdsMap: Ref<Map<string, Ref<string[]>>>
    groupPanelsContainers: Ref<Map<string, Ref<ComponentPublicInstance | HTMLElement | null>>>
    groupPanelsGroupedContainers: Ref<Map<string, Ref<ComponentPublicInstance | HTMLElement | null>>>
    formKitDeps: InstanceDragFormKitBinderDeps
  },
  options?: BindInstanceDragFormKitZonesOptions
): void {
  const { blockInstanceIdsMap, groupPanelsContainers, groupPanelsGroupedContainers, formKitDeps } = deps
  const activeId = options?.activeBlockShapeId

  if (activeId !== undefined) {
    const groupedZoneKey = groupedInstanceDragZoneKey(activeId)
    const groupedIds = blockInstanceIdsMap.value.get(groupedZoneKey)?.value
    const allowed = new Set<string>()
    if (containers.has(activeId)) {
      allowed.add(activeId)
      if (groupedIds?.length) {
        allowed.add(groupedZoneKey)
      }
    }
    tearDownZonesOutsideAllowed(allowed, formKitDeps)
    if (!containers.has(activeId)) {
      return
    }
    tryBindFormKitForZone(
      {
        dragKey: activeId,
        blockShapeIdForClass: activeId,
        panelsRefHolder: groupPanelsContainers.value.get(activeId),
      },
      formKitDeps
    )
    if (groupedIds?.length) {
      tryBindFormKitForZone(
        {
          dragKey: groupedZoneKey,
          blockShapeIdForClass: activeId,
          panelsRefHolder: groupPanelsGroupedContainers.value.get(activeId),
        },
        formKitDeps
      )
    }
    return
  }

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
