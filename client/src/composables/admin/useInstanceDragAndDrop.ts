/**
 * PATTERN: Composable for instance drag-and-drop setup
 * PATTERN: Composable that wires shape maps → entity drag handlers → FormKit bind.
 */
import { ref, watch, onMounted, onBeforeUnmount, onUnmounted, type Ref, type ComponentPublicInstance } from 'vue'
import { tearDown as formkitTearDown } from '@formkit/drag-and-drop'
import { dragAndDrop } from '@formkit/drag-and-drop/vue'
import { useEntityDragHandlers } from './useEntityDragHandlers'
import { dragLayoutSignature, groupedInstanceDragZoneKey } from './instanceDragAndDropGrouped'
import { syncBlockInstanceShapeMapsFromSources } from './instanceDragAndDropShapeMapsSync'
import {
  tryBindFormKitForZone,
  panelRefSnapshot,
  type InstanceDragFormKitBinderDeps,
} from './instanceDragAndDropFormKitBind'
import type { GlobalEntity } from '@/types/entities'
import type { UseInstanceDragAndDropOptions, UseInstanceDragAndDropReturn } from '@/types/admin/instanceDragAndDrop'

export { groupedInstanceDragZoneKey } from './instanceDragAndDropGrouped'

/**
 * WHY: Composable for managing instance drag-and-drop
 * WHY: Centralizes drag-and-drop maps and FormKit lifecycle for admin block instances.
 */
export function useInstanceDragAndDrop(
  options: UseInstanceDragAndDropOptions
): UseInstanceDragAndDropReturn {
  const {
    mainInstancesByShape,
    groupedInstancesByShape,
    blockInstancesByShape,
    patchBlockInstanceOrderIndex,
  } = options

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
  let lastLayoutSignature = ''

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

  watch(
    () => [mainInstancesByShape.value, groupedInstancesByShape.value] as const,
    ([mainMap, groupedMap]) => {
      const nextSig = dragLayoutSignature(mainMap, groupedMap)
      if (nextSig !== lastLayoutSignature) {
        lastLayoutSignature = nextSig
        groupDragInstances.value.clear()
        shapeDragBoundNonce.value = new Map()
        dragReinitNonce.value += 1
      }

      syncBlockInstanceShapeMapsFromSources({
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
      })
    },
    { immediate: true, deep: true }
  )

  watch(
    () =>
      [
        groupContainers.value,
        dragReinitNonce.value,
        isMounted.value,
        ...panelRefSnapshot(groupPanelsContainers.value),
        ...panelRefSnapshot(groupPanelsGroupedContainers.value),
      ] as const,
    ([containers]) => {
      if (!isMounted.value) {
        return
      }

      if (!containers || !(containers instanceof Map)) {
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
        if (groupedIds && groupedIds.length > 0) {
          tryBindFormKitForZone(
            {
              dragKey: groupedZoneKey,
              blockShapeIdForClass: blockShapeId,
              panelsRefHolder: groupPanelsGroupedContainers.value.get(blockShapeId),
            },
            formKitDeps
          )
        }
      })
    },
    { immediate: true, deep: true, flush: 'post' }
  )

  onMounted(() => {
    isMounted.value = true
  })

  onBeforeUnmount(() => {
    isMounted.value = false
    formKitParentElByZone.value.forEach((el) => {
      formkitTearDown(el)
    })
    formKitParentElByZone.value.clear()
    groupDragInstances.value.clear()
  })

  onUnmounted(() => {
    groupContainers.value.clear()
    groupPanelsContainers.value.clear()
    groupPanelsGroupedContainers.value.clear()
    blockInstancesLists.value.clear()
    blockInstanceIdsMap.value.clear()
    groupDragHandlers.value.clear()
    formKitParentElByZone.value.clear()
  })

  return {
    blockInstancesLists,
    blockInstanceIdsMap,
    groupContainers,
    groupPanelsContainers,
    groupPanelsGroupedContainers,
    groupDragHandlers,
    groupDragInstances,
    isMounted
  }
}
