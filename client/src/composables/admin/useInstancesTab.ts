/**
 * WHY: Orchestration composable for InstancesTab.vue to keep component script thin (vue-architecture audit).
 */
import { ref, computed, provide } from 'vue'
import { toGlobalEntityId } from '@/utils/globalEntity'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'
import { useInstanceGrouping } from '@/composables/admin/useInstanceGrouping'
import { useInstanceBulkEdit } from '@/composables/admin/useInstanceBulkEdit'
import { useExpansionState } from '@/composables/admin/useExpansionState'
import { useEntityCrud } from '@/composables/entityCrud/useEntityCrud'
import { useGlobal } from '@/composables/useGlobal'
import { useInstanceFiltering } from '@/composables/admin/useInstanceFiltering'
import { useInstanceTabHandlers } from '@/utils/admin/instanceTabHandlers'
import { useInstancesTabCreateModal } from '@/composables/admin/useInstancesTabCreateModal'
import { useInstancesTabEventInstance } from '@/composables/admin/useInstancesTabEventInstance'
import { useInstancesTabEventInstanceDrag } from '@/composables/admin/useInstancesTabEventInstanceDrag'
import { useInstanceDragAndDrop } from '@/composables/admin/useInstanceDragAndDrop'
import { useShapeEditModal } from '@/composables/admin/useShapeEditModal'
import { createLogger } from '@/utils/logger'
import { instancesTabContextKey, type InstancesTabContext } from '@/composables/admin/injectionKeys'
import { asEmptyArray } from '@/utils/safeDefaults'
import type { UseInstancesTabReturn } from '@/types/admin/instancesTab'

const logger = createLogger('InstancesTab')

export function useInstancesTab(): UseInstancesTabReturn {
  const activeTab = ref<string>('')

  const instanceGroupingComposable = useInstanceGrouping({ activeTab })
  const {
    blockInstancesByShape,
    blockInstancesCountByShape,
    blockShapeComposable,
    blockShapeStateControl,
    blockShapeValidCascades,
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

  const blockShapeExpansionState = useExpansionState()
  const { expandedEntities: expandedBlockShapes } = blockShapeExpansionState

  const {
    shapeEditModalOpen,
    toggleShapeEditModal,
    handleExistingBlockShapeSaved,
  } = useShapeEditModal({ expandedBlockShapes: expandedBlockShapes })

  const handleBulkEditConfirm = (blockShapeId: string, data: Record<string, number | null | undefined>): void => {
    bulkEditData.value.set(blockShapeId, data as { baseSqFt?: number })
    applyBulkEdit(blockShapeId)
  }

  const { mainInstancesByShape, groupedInstancesByShape } = useInstanceFiltering({
    blockInstancesByShape,
  })

  const {
    blockInstancesLists,
    groupContainers,
    groupPanelsContainers,
  } = useInstanceDragAndDrop({
    mainInstancesByShape,
    patchBlockInstanceOrderIndex,
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

  const eventInstanceMetadataModalOpen = ref(false)
  const eventInstanceCrud = useEntityCrud('eventInstance')
  const {
    entities: eventInstances,
    create: createEventInstance,
    patchOrderIndex: patchEventInstanceOrderIndex,
  } = eventInstanceCrud
  const { entities: eventShapes } = useEntityCrud('eventShape')
  const isLoadingEventInstances = computed(() => false)

  const eventInstanceForm = useInstancesTabEventInstance({
    expandedInstances,
    eventShapes,
    createEventInstance,
    logger,
  })
  const {
    templateVariables,
    newEventInstanceData,
    isCreatingEventInstance,
    isCreatingEventInstanceLoading,
    templateWarnings,
    openCreateEventInstanceForm,
    handleEventInstanceCreate,
    handleEventInstanceCancelled,
    handleDeleteEventInstance,
  } = eventInstanceForm

  const eventInstanceDrag = useInstancesTabEventInstanceDrag({
    eventInstances,
    patchEventInstanceOrderIndex,
    logger,
  })
  const {
    eventInstancesList,
    eventInstancesContainer,
    eventInstancesPanelsContainer,
    filteredEventInstances,
  } = eventInstanceDrag
  void eventInstancesContainer.value

  function shapeCascadeColor(blockShape: { id: string }): 'info' | 'default' {
    return asEmptyArray(blockShapeValidCascades.value.get(blockShape.id)).length > 0 ? 'info' : 'default'
  }

  const eventInstanceFieldsGlobalEntity = computed((): GlobalEntity<'eventInstance'> => ({
    id: toGlobalEntityId('00000000-0000-0000-0000-000000000012'),
    name: 'Event Instance Fields (Global)',
    entityKey: 'eventInstance',
    orderIndex: 0,
    active: true,
    eventShapeRef: toGlobalEntityId(''),
    titleTemplate: null,
    descriptionTemplate: null,
    locationTemplate: null,
    visibility: 'default',
    transparency: 'opaque',
    guestsCanModify: false,
    guestsCanInviteOthers: false,
    guestsCanSeeOtherGuests: true,
    addConferenceLink: false,
    sendUpdates: 'none',
    colorId: null,
    status: 'confirmed',
    reminderOverrides: null,
    scheduledBy: null,
  }))

  const instancesTabContext: InstancesTabContext = {
    blockShapeComposable,
    blockShapeStateControl,
    blockShapeValidCascades,
    bulkEditMode,
    toggleBulkEditMode,
    shapeEditModalOpen,
    toggleShapeEditModal,
    handleCreateClick,
    groupContainers,
    blockInstancesLists,
    mainInstancesByShape,
    expandedInstances,
    isPanelExpanded,
    groupPanelsContainers,
    groupedInstancesByShape,
    handleExistingBlockInstanceSaved,
    handleDeleteBlockInstance,
    handleDuplicateClick,
    shapeCascadeColor,
    eventInstanceMetadataModalOpen,
    eventInstances,
    eventInstancesList,
    filteredEventInstances,
    isLoadingEventInstances,
    isCreatingEventInstance,
    newEventInstanceData,
    isCreatingEventInstanceLoading,
    templateVariables,
    templateWarnings,
    eventShapes,
    openCreateEventInstanceForm,
    handleEventInstanceCreate,
    handleEventInstanceCancelled,
    handleDeleteEventInstance,
    eventInstancesContainer,
    eventInstancesPanelsContainer,
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
    shapeEditModalOpen,
    createModalOpen,
    setCreateModalOpen,
    createModalBlockShapeId,
    createModalSourceEntity,
    handleInstanceCreated,
    handleExistingBlockShapeSaved,
    filteredEventInstances,
    eventInstanceMetadataModalOpen,
    eventInstanceFieldsGlobalEntity,
  }
}
