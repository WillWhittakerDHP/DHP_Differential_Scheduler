/**
 * PATTERN: Composable for instance drag-and-drop setup
 * PATTERN: Composable that wires shape maps → entity drag handlers → FormKit bind.
 */
import { onMounted, onBeforeUnmount, onUnmounted } from 'vue'
import { tearDown as formkitTearDown } from '@formkit/drag-and-drop'
import { registerInstanceDragShapeLayoutWatch } from '@/composables/admin/instanceDragAndDrop/registerInstanceDragShapeLayoutWatch'
import { registerInstanceDragFormKitBindWatch } from '@/composables/admin/instanceDragAndDrop/registerInstanceDragFormKitBindWatch'
import { useInstanceDragAndDropState } from '@/composables/admin/instanceDragAndDrop/useInstanceDragAndDropState'
import type { UseInstanceDragAndDropOptions, UseInstanceDragAndDropReturn } from '@/types/admin/instanceDragAndDrop'

export { groupedInstanceDragZoneKey } from './useInstanceDragAndDropGrouped'

/**
 * WHY: Composable for managing instance drag-and-drop
 * WHY: Centralizes drag-and-drop maps and FormKit lifecycle for admin block instances.
 */
export function useInstanceDragAndDrop(options: UseInstanceDragAndDropOptions): UseInstanceDragAndDropReturn {
  const {
    mainInstancesByShape,
    groupedInstancesByShape,
    blockInstancesByShape,
    patchBlockInstanceOrderIndex,
  } = options

  const state = useInstanceDragAndDropState()

  registerInstanceDragShapeLayoutWatch({
    mainInstancesByShape,
    groupedInstancesByShape,
    blockInstancesByShape,
    patchBlockInstanceOrderIndex,
    blockInstancesLists: state.blockInstancesLists,
    blockInstanceIdsMap: state.blockInstanceIdsMap,
    groupDragHandlers: state.groupDragHandlers,
    groupDragInstances: state.groupDragInstances,
    shapeDragBoundNonce: state.shapeDragBoundNonce,
    dragReinitNonce: state.dragReinitNonce,
  })

  registerInstanceDragFormKitBindWatch({
    groupContainers: state.groupContainers,
    dragReinitNonce: state.dragReinitNonce,
    isMounted: state.isMounted,
    panelRefSnapshotForWatch: state.panelRefSnapshotForWatch,
    blockInstanceIdsMap: state.blockInstanceIdsMap,
    groupPanelsContainers: state.groupPanelsContainers,
    groupPanelsGroupedContainers: state.groupPanelsGroupedContainers,
    formKitDeps: state.formKitDeps,
  })

  onMounted(() => {
    state.isMounted.value = true
  })

  onBeforeUnmount(() => {
    state.isMounted.value = false
    state.formKitDeps.formKitParentElByZone.value.forEach((el) => {
      formkitTearDown(el)
    })
    state.formKitDeps.formKitParentElByZone.value.clear()
    state.groupDragInstances.value.clear()
  })

  onUnmounted(() => {
    state.groupContainers.value.clear()
    state.groupPanelsContainers.value.clear()
    state.groupPanelsGroupedContainers.value.clear()
    state.blockInstancesLists.value.clear()
    state.blockInstanceIdsMap.value.clear()
    state.groupDragHandlers.value.clear()
    state.formKitDeps.formKitParentElByZone.value.clear()
  })

  return {
    blockInstancesLists: state.blockInstancesLists,
    blockInstanceIdsMap: state.blockInstanceIdsMap,
    groupContainers: state.groupContainers,
    groupPanelsContainers: state.groupPanelsContainers,
    groupPanelsGroupedContainers: state.groupPanelsGroupedContainers,
    groupDragHandlers: state.groupDragHandlers,
    groupDragInstances: state.groupDragInstances,
    isMounted: state.isMounted,
  }
}
