/**
 * WHY: Orchestration composable for InstancesTab.vue to keep component script thin (vue-architecture audit).
 */
import { computed, ref, provide, watch, toValue, type MaybeRefOrGetter } from 'vue'
import type { BlockShapeType } from '@/constants/blockShapeTypes'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'
import { useInstanceGrouping } from '@/composables/admin/useInstanceGrouping'
import { useInstanceBulkEdit } from '@/composables/admin/useInstanceBulkEdit'
import { useExpansionState } from '@/composables/admin/useExpansionState'
import { useEntityCrud } from '@/composables/entityCrud/useEntityCrud'
import { useGlobal } from '@/composables/useGlobal'
import { useInstanceFiltering } from '@/composables/admin/useInstanceFiltering'
import { useOrchestratorAwareInstanceMaps } from '@/composables/admin/useOrchestratorAwareInstanceMaps'
import { useInstanceTabHandlers } from '@/utils/admin/instanceTabHandlers'
import { useInstancesTabCreateModal } from '@/composables/admin/useInstancesTabCreateModal'
import { useInstanceDragAndDrop } from '@/composables/admin/useInstanceDragAndDrop'
import { instancesTabContextKey, type InstancesTabContext } from '@/types/admin/adminInjectionKeys'
import { asEmptyArray } from '@/utils/safeDefaults'
import type { UseInstancesTabReturn } from '@/types/admin/instancesTab'

export function useInstancesTab(options?: {
  allowedBlockShapeTypes?: MaybeRefOrGetter<readonly BlockShapeType[] | undefined>
  orchestratorInstancesOnly?: MaybeRefOrGetter<boolean | undefined>
  splitOrchestratorAtomic?: MaybeRefOrGetter<boolean | undefined>
}): UseInstancesTabReturn {
  const activeTab = ref<string>('')
  const splitOrchestratorAtomicEnabled = computed(() => toValue(options?.splitOrchestratorAtomic) === true)
  const orchestratorAtomicSubTab = ref<'orchestrator' | 'atomic'>('orchestrator')

  const instanceGroupingComposable = useInstanceGrouping({
    activeTab,
    allowedBlockShapeTypes: options?.allowedBlockShapeTypes,
    orchestratorInstancesOnly: options?.orchestratorInstancesOnly,
  })
  const {
    blockInstancesByShape,
    blockInstancesCountByShape,
    blockShapeComposable,
    blockShapeStateControl,
    blockShapeValidBookingCascades,
  } = instanceGroupingComposable

  const expansionStateComposable = useExpansionState()
  const { expandedEntities: expandedInstances, isPanelExpanded } = expansionStateComposable

  const instanceBulkEditComposable = useInstanceBulkEdit({ blockInstancesByShape })
  const {
    bulkEditMode,
    bulkEditData,
    getBulkEditData,
    toggleBulkEditMode,
    applyBulkEdit,
  } = instanceBulkEditComposable

  const { patchOrderIndex: patchBlockInstanceOrderIndex } = useEntityCrud('blockInstance')
  useEntityCrud('blockShape')
  useGlobal()

  const handleBulkEditConfirm = (blockShapeId: string, data: Record<string, number | null | undefined>): void => {
    bulkEditData.value.set(blockShapeId, data as { baseSqFt?: number })
    applyBulkEdit(blockShapeId)
  }

  const standardFiltering = useInstanceFiltering({ blockInstancesByShape })
  const orchestratorAwareFiltering = useOrchestratorAwareInstanceMaps({
    blockInstancesByShape,
    activeShapeTab: activeTab,
    orchestratorAtomicSubTab,
  })

  const mainInstancesByShape = computed(() =>
    splitOrchestratorAtomicEnabled.value
      ? orchestratorAwareFiltering.mainInstancesByShape.value
      : standardFiltering.mainInstancesByShape.value
  )
  const groupedInstancesByShape = computed(() =>
    splitOrchestratorAtomicEnabled.value
      ? orchestratorAwareFiltering.groupedInstancesByShape.value
      : standardFiltering.groupedInstancesByShape.value
  )

  watch(activeTab, () => {
    if (splitOrchestratorAtomicEnabled.value) {
      orchestratorAtomicSubTab.value = 'orchestrator'
    }
  })

  const {
    blockInstancesLists,
    groupContainers,
    groupPanelsContainers,
    groupPanelsGroupedContainers,
  } = useInstanceDragAndDrop({
    mainInstancesByShape,
    groupedInstancesByShape,
    blockInstancesByShape,
    patchBlockInstanceOrderIndex,
    activeTab,
    orchestratorAtomicSubTab,
  })

  const handleDeleteBlockInstance = (_id: string): void => {}
  const handleExistingBlockInstanceSaved = (_entity: GlobalEntity<GlobalEntityKey>): void => {}

  const createModal = useInstancesTabCreateModal()
  const {
    createModalOpen,
    createModalBlockShapeId,
    createModalSourceEntity,
    handleCreateClick,
    handleDuplicateClick,
    handleInstanceCreated,
  } = createModal
  const setCreateModalOpen = (value: boolean): void => {
    createModalOpen.value = value
  }

  const { handleTabClick } = useInstanceTabHandlers({ activeTab })

  function shapeCascadeColor(blockShape: { id: string }): 'info' | 'default' {
    return asEmptyArray(blockShapeValidBookingCascades.value.get(blockShape.id)).length > 0 ? 'info' : 'default'
  }

  const instancesTabContext: InstancesTabContext = {
    blockShapeComposable,
    blockShapeStateControl,
    blockShapeValidBookingCascades,
    bulkEditMode,
    toggleBulkEditMode,
    handleCreateClick,
    groupContainers,
    blockInstancesLists,
    mainInstancesByShape,
    expandedInstances,
    isPanelExpanded,
    groupPanelsContainers,
    groupPanelsGroupedContainers,
    groupedInstancesByShape,
    handleExistingBlockInstanceSaved,
    handleDeleteBlockInstance,
    handleDuplicateClick,
    shapeCascadeColor,
  }
  provide(instancesTabContextKey, instancesTabContext)

  return {
    instancesTabContext,
    activeTab,
    sortedBlockShapes: instanceGroupingComposable.sortedBlockShapes,
    blockInstancesCountByShape,
    bulkEditMode,
    getBulkEditData,
    handleBulkEditConfirm,
    handleTabClick,
    createModalOpen,
    setCreateModalOpen,
    createModalBlockShapeId,
    createModalSourceEntity,
    handleInstanceCreated,
    splitOrchestratorAtomicEnabled,
    orchestratorAtomicSubTab,
    hasOrchestratorForShape: orchestratorAwareFiltering.shapeHasOrchestratorInstances,
  }
}
