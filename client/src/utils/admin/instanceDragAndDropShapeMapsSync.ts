/**
 * WHY: Block instance drag maps + handlers without calling Vue composables inside watch callbacks.
 * PLACEMENT: utils/admin — invoked from registerInstanceDragShapeLayoutWatch only.
 */
import { computed, ref, type ComputedRef, type Ref } from 'vue'
import { dragAndDrop } from '@formkit/drag-and-drop/vue'
import type { GlobalEntity } from '@/types/entities'
import type { PatchOrderIndex } from '@/types/admin/entityDragHandlers'
import { groupedInstanceDragZoneKey } from '@/composables/admin/useInstanceDragAndDropGrouped'
import { sortEntitiesByOrderIndex } from '@/utils/admin/sortEntitiesByOrderIndex'
import {
  patchBlockInstanceOrderAfterGroupedZoneDrag,
  patchBlockInstanceOrderAfterMainZoneDrag,
  syncGroupedZoneFromFiltered,
  syncMainZoneBlockInstanceLists,
} from '@/utils/admin/blockInstanceDragOrderOrchestrator'

export type BlockInstanceZoneDragHandlers = {
  syncArrays: () => void
  handleDragEnd: () => void | Promise<void>
}

export function syncBlockInstanceShapeMapsFromSources(params: {
  mainMap: Map<string, GlobalEntity<'blockInstance'>[]>
  groupedMap: Map<string, GlobalEntity<'blockInstance'>[]>
  blockInstancesLists: Ref<Map<string, Ref<GlobalEntity<'blockInstance'>[]>>>
  blockInstanceIdsMap: Ref<Map<string, Ref<string[]>>>
  groupDragHandlers: Ref<Map<string, BlockInstanceZoneDragHandlers>>
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
      const sortedMain = sortEntitiesByOrderIndex<'blockInstance'>([...instances])
      blockInstancesLists.value.set(blockShapeId, ref<GlobalEntity<'blockInstance'>[]>(sortedMain))
      blockInstanceIdsMap.value.set(blockShapeId, ref(sortedMain.map((i) => i.id)))

      const filteredInstances = computed(() => {
        const raw = mainInstancesByShape.value.get(blockShapeId)
        return raw !== undefined ? raw : []
      })

      const entityIds = blockInstanceIdsMap.value.get(blockShapeId)!
      const entityList = blockInstancesLists.value.get(blockShapeId)!

      groupDragHandlers.value.set(blockShapeId, {
        syncArrays: () =>
          syncMainZoneBlockInstanceLists({
            entityIds,
            entityList,
            filteredEntities: filteredInstances,
          }),
        handleDragEnd: () =>
          patchBlockInstanceOrderAfterMainZoneDrag({
            entityIds,
            entityList,
            filteredEntities: filteredInstances,
            patchOrderIndex: patchBlockInstanceOrderIndex,
          }),
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
        const groupedSorted = sortEntitiesByOrderIndex<'blockInstance'>([...instances])
        blockInstancesLists.value.set(zoneKey, ref<GlobalEntity<'blockInstance'>[]>(groupedSorted))
        blockInstanceIdsMap.value.set(zoneKey, ref(groupedSorted.map((i) => i.id)))

        const filteredGrouped = computed(() => {
          const raw = groupedInstancesByShape.value.get(blockShapeId)
          return raw !== undefined ? raw : []
        })

        const groupedEntityIds = blockInstanceIdsMap.value.get(zoneKey)!
        const groupedEntityList = blockInstancesLists.value.get(zoneKey)!

        groupDragHandlers.value.set(zoneKey, {
          syncArrays: () =>
            syncGroupedZoneFromFiltered({
              groupedEntityIds,
              groupedEntityList,
              filteredGrouped,
            }),
          handleDragEnd: () =>
            patchBlockInstanceOrderAfterGroupedZoneDrag({
              blockShapeId,
              groupedEntityIds,
              groupedEntityList,
              blockInstancesByShape,
              patchOrderIndex: patchBlockInstanceOrderIndex,
            }),
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
