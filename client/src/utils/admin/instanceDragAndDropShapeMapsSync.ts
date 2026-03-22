/**
 * WHY: Vue composables (useEntityDragHandlers) must run in setup; this module holds the branching logic only.
 * PLACEMENT: utils/admin — not a `use*` composable file; avoids composable-health false positives on inner ref().
 */
import { computed, ref, type ComputedRef, type Ref } from 'vue'
import { dragAndDrop } from '@formkit/drag-and-drop/vue'
import type { GlobalEntity } from '@/types/entities'
import type { PatchOrderIndex } from '@/types/admin/entityDragHandlers'
import { useEntityDragHandlers } from '@/composables/admin/useEntityDragHandlers'
import { useEntityTabState } from '@/composables/admin/useEntityTabState'
import {
  createGroupedZoneDragEndHandler,
  groupedInstanceDragZoneKey,
} from '@/composables/admin/useInstanceDragAndDropGrouped'

type BlockInstanceDragHandlers = ReturnType<typeof useEntityDragHandlers<'blockInstance'>>

export function syncBlockInstanceShapeMapsFromSources(params: {
  mainMap: Map<string, GlobalEntity<'blockInstance'>[]>
  groupedMap: Map<string, GlobalEntity<'blockInstance'>[]>
  blockInstancesLists: Ref<Map<string, Ref<GlobalEntity<'blockInstance'>[]>>>
  blockInstanceIdsMap: Ref<Map<string, Ref<string[]>>>
  groupDragHandlers: Ref<Map<string, BlockInstanceDragHandlers>>
  groupDragInstances: Ref<Map<string, ReturnType<typeof dragAndDrop>>>
  shapeDragBoundNonce: Ref<Map<string, number>>
  mainInstancesByShape: ComputedRef<Map<string, GlobalEntity<'blockInstance'>[]>>
  groupedInstancesByShape: ComputedRef<Map<string, GlobalEntity<'blockInstance'>[]>>
  blockInstancesByShape: ComputedRef<Map<string, GlobalEntity<'blockInstance'>[]>>
  patchBlockInstanceOrderIndex: PatchOrderIndex
}): void {
  const {
    mainMap,
    groupedMap,
    blockInstancesLists,
    blockInstanceIdsMap,
    groupDragHandlers,
    groupDragInstances,
    shapeDragBoundNonce,
    mainInstancesByShape,
    groupedInstancesByShape,
    blockInstancesByShape,
    patchBlockInstanceOrderIndex,
  } = params

  mainMap.forEach((instances, blockShapeId) => {
    if (!blockInstancesLists.value.has(blockShapeId)) {
      blockInstancesLists.value.set(blockShapeId, ref([...instances]))
      blockInstanceIdsMap.value.set(blockShapeId, ref(instances.map((i) => i.id)))

      const filteredInstances = computed(() => {
        const raw = mainInstancesByShape.value.get(blockShapeId)
        return raw !== undefined ? raw : []
      })

      const dragHandlers = useEntityDragHandlers({
        entityIds: blockInstanceIdsMap.value.get(blockShapeId)!,
        entityList: blockInstancesLists.value.get(blockShapeId)!,
        filteredEntities: filteredInstances,
        patchOrderIndex: patchBlockInstanceOrderIndex
      })
      groupDragHandlers.value.set(blockShapeId, dragHandlers)

      useEntityTabState({
        filteredEntities: filteredInstances,
        dragHandlers
      })
    } else {
      const handlers = groupDragHandlers.value.get(blockShapeId)
      if (handlers) {
        handlers.syncArrays()
      }
    }
  })

  groupedMap.forEach((instances, blockShapeId) => {
    const zoneKey = groupedInstanceDragZoneKey(blockShapeId)
    if (instances.length > 0) {
      if (!blockInstancesLists.value.has(zoneKey)) {
        blockInstancesLists.value.set(zoneKey, ref([...instances]))
        blockInstanceIdsMap.value.set(zoneKey, ref(instances.map((i) => i.id)))

        const filteredGrouped = computed(() => {
          const raw = groupedInstancesByShape.value.get(blockShapeId)
          return raw !== undefined ? raw : []
        })

        const baseHandlers = useEntityDragHandlers({
          entityIds: blockInstanceIdsMap.value.get(zoneKey)!,
          entityList: blockInstancesLists.value.get(zoneKey)!,
          filteredEntities: filteredGrouped,
          patchOrderIndex: patchBlockInstanceOrderIndex
        })

        const groupedDragHandlers: BlockInstanceDragHandlers = {
          syncArrays: baseHandlers.syncArrays,
          handleDragEnd: createGroupedZoneDragEndHandler({
            blockShapeId,
            groupedEntityIds: blockInstanceIdsMap.value.get(zoneKey)!,
            groupedEntityList: blockInstancesLists.value.get(zoneKey)!,
            blockInstancesByShape,
            patchOrderIndex: patchBlockInstanceOrderIndex
          })
        }

        groupDragHandlers.value.set(zoneKey, groupedDragHandlers)

        useEntityTabState({
          filteredEntities: filteredGrouped,
          dragHandlers: groupedDragHandlers
        })
      } else {
        const handlers = groupDragHandlers.value.get(zoneKey)
        if (handlers) {
          handlers.syncArrays()
        }
      }
    } else {
      groupDragInstances.value.delete(zoneKey)
      shapeDragBoundNonce.value.delete(zoneKey)
      blockInstancesLists.value.delete(zoneKey)
      blockInstanceIdsMap.value.delete(zoneKey)
      groupDragHandlers.value.delete(zoneKey)
    }
  })

  blockInstanceIdsMap.value.forEach((_idsRef, dragKey) => {
    if (_idsRef.value.length === 0) {
      groupDragInstances.value.delete(dragKey)
      shapeDragBoundNonce.value.delete(dragKey)
    }
  })
}
