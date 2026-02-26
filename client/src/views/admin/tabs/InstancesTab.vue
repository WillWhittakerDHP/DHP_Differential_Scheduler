<!--
  LEARNING: Instances Tab Component with BlockInstance Grouping by BlockShape Tabs
  WHY: Displays BlockInstances grouped by BlockShape in separate tabs for better organization
  PATTERN: VTabs/VWindow for tab navigation, composables for data access
  COMPARISON: React uses Ant Design Tabs. Vue uses Vuetify VTabs with VWindow
  RESOURCE: https://vuetifyjs.com/en/components/tabs/
-->
<script setup lang="ts">
import { ref, computed, provide } from 'vue'
import { toGlobalEntityId } from '@/utils/globalEntity'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'
import InstanceBulkEditModal from '@/components/admin/InstanceBulkEditModal.vue'
import MetadataEditModal from '@/components/admin/MetadataEditModal.vue'
import { useInstanceGrouping } from '@/composables/admin/useInstanceGrouping'
import { useInstanceBulkEdit } from '@/composables/admin/useInstanceBulkEdit'
import { useExpansionState } from '@/composables/admin/useExpansionState'
import { useEntityCrud } from '@/composables/entityCrud/useEntityCrud'
import { useGlobal } from '@/composables/useGlobal'
import { useInstanceFiltering } from '@/composables/admin/useInstanceFiltering'
import BlockInstanceCreateModal from '@/components/admin/BlockInstanceCreateModal.vue'
import { useInstanceTabHandlers } from '@/composables/admin/useInstanceTabHandlers'
import { useInstancesTabCreateModal } from '@/composables/admin/useInstancesTabCreateModal'
import { useInstancesTabEventInstance } from '@/composables/admin/useInstancesTabEventInstance'
import { useInstancesTabEventInstanceDrag } from '@/composables/admin/useInstancesTabEventInstanceDrag'
import { useInstanceDragAndDrop } from '@/composables/admin/useInstanceDragAndDrop'
import { useShapeEditModal } from '@/composables/admin/useShapeEditModal'
import { createBlockInstanceConfigSentinel } from '@/utils/entities/entityTypeMapping'
import { createLogger } from '@/utils/logger'
import FeeCalibrationPanel from './components/FeeCalibrationPanel.vue'
import BlockInstancesGroup from './components/BlockInstancesGroup.vue'
import EventInstancesSection from './components/EventInstancesSection.vue'
import { instancesTabContextKey } from '@/composables/admin/injectionKeys'
import { asEmptyArray } from '@/utils/safeDefaults'

const logger = createLogger('InstancesTab')

/**
 * LEARNING: Reactive active tab state
 */
const activeTab = ref<string>('')

/**
 * WHY: Use instance grouping composable for grouping logic and metadata
WHY: Mo...
 */
const instanceGroupingComposable = useInstanceGrouping({ activeTab })
const {
  sortedBlockShapes,
  blockInstancesByShape,
  blockInstancesCountByShape,
  blockShapeComposable,
  blockShapeStateControl,
  blockShapeValidCascades
} = instanceGroupingComposable

/**
 * WHY: Use expansion state composable for expansion state management
WHY: Moves...
 */
const expansionStateComposable = useExpansionState()
const { expandedEntities: expandedInstances, isPanelExpanded } = expansionStateComposable

/**
 * WHY: Use instance bulk edit composable for bulk edit logic
WHY: Moves bulk ed...
 */
const instanceBulkEditComposable = useInstanceBulkEdit({
  blockInstancesByShape
})
const {
  bulkEditMode,
  bulkEditData,
  getBulkEditData,
  toggleBulkEditMode,
  applyBulkEdit
} = instanceBulkEditComposable

/**
 * WHY: Entity CRUD composable for BlockInstance
PATTERN: useEntityCrud composab...
 */
const { patchOrderIndex: patchBlockInstanceOrderIndex } = useEntityCrud('blockInstance')

/**
 * WHY: Entity CRUD composable for BlockShape
PATTERN: useEntityCrud composable ...
 */
const { entities: _blockShapes } = useEntityCrud('blockShape')

const { globalData: _globalData } = useGlobal()


/**
 * WHY: Expansion state for BlockShape entity cards
WHY: Separate expansion stat...
 */
const blockShapeExpansionState = useExpansionState()
const { expandedEntities: expandedBlockShapes } = blockShapeExpansionState

/**
 * WHY: Use shape edit modal composable
WHY: Modal handlers moved to composable
 */
const {
  shapeEditModalOpen,
  toggleShapeEditModal,
  handleExistingBlockShapeSaved
} = useShapeEditModal({ expandedBlockShapes })

const handleBulkEditConfirm = (blockShapeId: string, data: Record<string, number | null | undefined>): void => {
  bulkEditData.value.set(blockShapeId, data as { baseSqFt?: number })
  applyBulkEdit(blockShapeId)
}


/**
 * WHY: Use instance filtering composable
WHY: Filtering logic moved to composable
 */
const {
  mainInstancesByShape,
  groupedInstancesByShape
} = useInstanceFiltering({
  blockInstancesByShape
})

/**
 * WHY: Use instance drag-and-drop composable
WHY: Drag-and-drop setup logic mov...
 */
const {
  blockInstancesLists,
  blockInstanceIdsMap: _blockInstanceIdsMap,
  groupContainers,
  groupPanelsContainers,
  groupDragHandlers: _groupDragHandlers,
  groupDragInstances: _groupDragInstances,
  isMounted: _isMounted
} = useInstanceDragAndDrop({
  mainInstancesByShape,
  patchBlockInstanceOrderIndex
})


/** No-op handlers (previously empty composable stubs). */
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

const { handleTabClick } = useInstanceTabHandlers({ activeTab })

const eventInstanceMetadataModalOpen = ref(false)
const eventInstanceCrud = useEntityCrud('eventInstance')
const { entities: eventInstances, create: createEventInstance, patchOrderIndex: patchEventInstanceOrderIndex } = eventInstanceCrud
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
  reminderOverrides: null
}))

provide(instancesTabContextKey, {
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
  eventInstancesPanelsContainer: eventInstancesPanelsContainer as unknown
})
</script>

<template>
  <div class="instances-tab">
    <!--
      LEARNING: VTabs component for tab navigation
      WHY: Provides tabbed interface to switch between BlockShapes and Shapes
      PATTERN: v-model binds to reactive ref for two-way data binding
    -->
    <VTabs 
      v-model="activeTab" 
      class="mb-4 instances-tabs-container"
    >
      <VTab
        v-for="blockShape in sortedBlockShapes"
        :key="blockShape.id"
        :value="blockShape.id"
        @click="handleTabClick(blockShape.id)"
      >
        {{ blockShape.name }} ({{ blockInstancesCountByShape.get(blockShape.id) || 0 }})
      </VTab>
      <VSpacer />
      <VTab
        value="calibration"
        @click="activeTab = 'calibration'"
        class="calibration-tab"
      >
        Calibration
      </VTab>
      <VTab
        value="eventInstances"
        @click="activeTab = 'eventInstances'"
        class="event-instances-tab"
      >
        Events ({{ filteredEventInstances.length }})
      </VTab>
    </VTabs>
    
    <!--
      LEARNING: VWindow component for tab content container
      WHY: Manages which tab content is visible based on activeTab value
      PATTERN: v-model syncs with VTabs - when tab clicked, VWindow shows matching VWindowItem
    -->
    <VWindow 
      v-model="activeTab"
    >
      <VWindowItem
        v-for="blockShape in sortedBlockShapes"
        :key="blockShape.id"
        :value="blockShape.id"
      >
        <BlockInstancesGroup :block-shape="blockShape" />
      </VWindowItem>
      
      <!-- Fee Calibration Tab Content -->
      <VWindowItem value="calibration">
        <FeeCalibrationPanel />
      </VWindowItem>

      <!-- Event Instances Tab Content -->
      <VWindowItem value="eventInstances">
        <EventInstancesSection />
      </VWindowItem>
    </VWindow>
    
    <!--
      LEARNING: Empty state when no BlockShapes exist
      WHY: Provides feedback when no BlockShapes are configured
      PATTERN: Conditional rendering with v-if
    -->
    <VAlert
      v-if="sortedBlockShapes.length === 0 && activeTab !== 'eventInstances'"
      type="info"
      variant="tonal"
      class="mt-4"
    >
      No BlockShapes found. Create a BlockShape first.
    </VAlert>
    
    <!--
      LEARNING: Bulk Edit Modals
      WHY: Modals for bulk editing BlockInstances per BlockShape
      PATTERN: One modal per BlockShape, conditionally rendered
    -->
    <template v-for="blockShape in sortedBlockShapes" :key="blockShape.id">
      <InstanceBulkEditModal
        :model-value="bulkEditMode.get(blockShape.id) || false"
        :block-shape-id="blockShape.id"
        :block-shape-name="blockShape.name"
        :bulk-edit-data="getBulkEditData(blockShape.id)"
        :instance-count="blockInstancesCountByShape.get(blockShape.id) || 0"
        @update:model-value="(value) => bulkEditMode.set(blockShape.id, value)"
        @confirm="(data) => handleBulkEditConfirm(blockShape.id, data)"
      />
    </template>
    
    <!--
      LEARNING: Metadata Edit Modals
      WHY: Modals for editing field metadata and shape templates
      PATTERN: One modal per BlockShape, conditionally rendered
    -->
    <template v-for="blockShape in sortedBlockShapes" :key="`shape-${blockShape.id}`">
      <MetadataEditModal
        :model-value="shapeEditModalOpen.get(blockShape.id) || false"
        entity-key="blockInstance"
        :entity="createBlockInstanceConfigSentinel(blockShape.id)"
        :block-shape-ref="blockShape.id"
        :entity-name="blockShape.name || `BlockShape ${blockShape.id}`"
        @update:model-value="(value) => shapeEditModalOpen.set(blockShape.id, value)"
        @saved="() => handleExistingBlockShapeSaved(blockShape.id)"
      />
    </template>
    
    <!--
      LEARNING: Block Instance Create Modal
      WHY: Unified modal for creating and duplicating block instances
      PATTERN: Single modal instance, controlled by createModalOpen state
    -->
    <BlockInstanceCreateModal
      :model-value="createModalOpen"
      :block-shape-id="createModalBlockShapeId"
      :source-entity="createModalSourceEntity"
      @update:model-value="(value) => createModalOpen = value"
      @created="handleInstanceCreated"
    />
    
    <!--
      LEARNING: Global EventInstance Metadata Configuration Modal
      WHY: Single modal for configuring all EventInstance field definitions globally
      PATTERN: Global config modal triggered from section header, uses sentinel UUID
    -->
    <MetadataEditModal
      v-model="eventInstanceMetadataModalOpen"
      entity-key="eventInstance"
      :entity="eventInstanceFieldsGlobalEntity"
      entity-name="Event Instance Fields (Global)"
    />
  </div>
</template>

<style scoped>
.instances-tab {
  margin-top: 1rem;
}

.block-shape-tab-content {
  padding: 0.5rem 0;
}

.block-shape-entity-card-wrapper {
  border: 2px solid rgb(var(--v-theme-primary));
  background-color: rgba(var(--v-theme-primary), 0.03);
}

.block-instances-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.draggable-instance-item {
  transition: transform 0.2s;
}


.drag-handle {
  cursor: grab;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.drag-handle:hover {
  opacity: 1;
}

.drag-handle:active {
  cursor: grabbing;
}

.instances-tabs-container :deep(.v-tab) {
  flex: 0 1 auto;
}

.instances-tabs-container :deep(.v-tabs) {
  display: flex;
}

.instances-tabs-container :deep(.v-slide-group__content) {
  display: flex;
  flex: 1;
}

.event-instances-tab {
  margin-left: auto;
  background-color: rgba(var(--v-theme-primary), 0.05);
}

.event-instances-tab:hover {
  background-color: rgba(var(--v-theme-primary), 0.1);
}

.event-instances-tab-content {
  padding: 0.5rem 0;
}
</style>
