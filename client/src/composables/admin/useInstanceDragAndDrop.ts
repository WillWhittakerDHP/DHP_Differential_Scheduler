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
    activeTab,
    orchestratorAtomicSubTab,
  } = options

  const state = useInstanceDragAndDropState()

  registerInstanceDragShapeLayoutWatch({
    mainInstancesByShape,
    groupedInstancesByShape,
    blockInstancesByShape,
    patchBlockInstanceOrderIndex,
    blockInstancesLists: state.layout.blockInstancesLists,
    blockInstanceIdsMap: state.layout.blockInstanceIdsMap,
    groupDragHandlers: state.layout.groupDragHandlers,
    groupDragInstances: state.layout.groupDragInstances,
    shapeDragBoundNonce: state.layout.shapeDragBoundNonce,
    dragReinitNonce: state.layout.dragReinitNonce,
  })

  registerInstanceDragFormKitBindWatch({
    groupContainers: state.layout.groupContainers,
    dragReinitNonce: state.layout.dragReinitNonce,
    isMounted: state.isMounted,
    panelRefSnapshotForWatch: state.layout.panelRefSnapshotForWatch,
    blockInstanceIdsMap: state.layout.blockInstanceIdsMap,
    groupPanelsContainers: state.layout.groupPanelsContainers,
    groupPanelsGroupedContainers: state.layout.groupPanelsGroupedContainers,
    formKitDeps: state.formKitDeps,
    activeTab,
    orchestratorAtomicSubTab,
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
    state.layout.groupDragInstances.value.clear()
  })

  onUnmounted(() => {
    state.layout.groupContainers.value.clear()
    state.layout.groupPanelsContainers.value.clear()
    state.layout.groupPanelsGroupedContainers.value.clear()
    state.layout.blockInstancesLists.value.clear()
    state.layout.blockInstanceIdsMap.value.clear()
    state.layout.groupDragHandlers.value.clear()
    state.formKitDeps.formKitParentElByZone.value.clear()
  })

  return {
    blockInstancesLists: state.layout.blockInstancesLists,
    blockInstanceIdsMap: state.layout.blockInstanceIdsMap,
    groupContainers: state.layout.groupContainers,
    groupPanelsContainers: state.layout.groupPanelsContainers,
    groupPanelsGroupedContainers: state.layout.groupPanelsGroupedContainers,
    groupDragHandlers: state.layout.groupDragHandlers,
    groupDragInstances: state.layout.groupDragInstances,
    isMounted: state.isMounted,
  }
}
