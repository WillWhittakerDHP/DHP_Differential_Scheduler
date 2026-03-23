/**
 * WHY: Shape map sync watch extracted from useInstanceDragAndDrop (length / nesting audit).
 */

import { watch, type ComputedRef, type Ref } from 'vue'
import type { GlobalEntity } from '@/types/entities'
import { dragLayoutSignature } from '@/composables/admin/useInstanceDragAndDropGrouped'
import { syncBlockInstanceShapeMapsFromSources } from '@/utils/admin/instanceDragAndDropShapeMapsSync'
import type { PatchOrderIndex } from '@/types/admin/entityDragHandlers'
import type { useEntityDragHandlers } from '@/composables/admin/useEntityDragHandlers'
import type { dragAndDrop } from '@formkit/drag-and-drop/vue'
export function registerInstanceDragShapeLayoutWatch(input: {
  mainInstancesByShape: ComputedRef<Map<string, GlobalEntity<'blockInstance'>[]>>
  groupedInstancesByShape: ComputedRef<Map<string, GlobalEntity<'blockInstance'>[]>>
  blockInstancesByShape: ComputedRef<Map<string, GlobalEntity<'blockInstance'>[]>>
  patchBlockInstanceOrderIndex: PatchOrderIndex
  blockInstancesLists: Ref<Map<string, Ref<GlobalEntity<'blockInstance'>[]>>>
  blockInstanceIdsMap: Ref<Map<string, Ref<string[]>>>
  groupDragHandlers: Ref<Map<string, ReturnType<typeof useEntityDragHandlers<'blockInstance'>>>>
  groupDragInstances: Ref<Map<string, ReturnType<typeof dragAndDrop>>>
  shapeDragBoundNonce: Ref<Map<string, number>>
  dragReinitNonce: Ref<number>
}): void {
  let lastLayoutSignature = ''

  watch(
    () => [input.mainInstancesByShape.value, input.groupedInstancesByShape.value] as const,
    ([mainMap, groupedMap]) => {
      const nextSig = dragLayoutSignature(mainMap, groupedMap)
      if (nextSig !== lastLayoutSignature) {
        lastLayoutSignature = nextSig
        input.groupDragInstances.value.clear()
        input.shapeDragBoundNonce.value = new Map()
        input.dragReinitNonce.value += 1
      }

      syncBlockInstanceShapeMapsFromSources({
        mainMap,
        groupedMap,
        blockInstancesLists: input.blockInstancesLists,
        blockInstanceIdsMap: input.blockInstanceIdsMap,
        groupDragHandlers: input.groupDragHandlers,
        groupDragInstances: input.groupDragInstances,
        shapeDragBoundNonce: input.shapeDragBoundNonce,
        mainInstancesByShape: input.mainInstancesByShape,
        groupedInstancesByShape: input.groupedInstancesByShape,
        blockInstancesByShape: input.blockInstancesByShape,
        patchBlockInstanceOrderIndex: input.patchBlockInstanceOrderIndex,
      })
    },
    { immediate: true, deep: true }
  )
}
