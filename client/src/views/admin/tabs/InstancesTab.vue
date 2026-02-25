<!--
  LEARNING: Instances Tab Component with BlockInstance Grouping by BlockShape Tabs
  WHY: Displays BlockInstances grouped by BlockShape in separate tabs for better organization
  PATTERN: VTabs/VWindow for tab navigation, composables for data access
  COMPARISON: React uses Ant Design Tabs. Vue uses Vuetify VTabs with VWindow
  RESOURCE: https://vuetifyjs.com/en/components/tabs/
-->
<script setup lang="ts">
import { ref, computed, type ComponentPublicInstance } from 'vue'
import { toGlobalEntityId } from '@/utils/globalEntity'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'
import EntityCard from '@/components/admin/generic/EntityCard.vue'
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
  filteredEventInstances,
} = eventInstanceDrag
void eventInstancesContainer.value
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
        <div class="block-shape-tab-content">
          <!--
            LEARNING: Tab header with BlockShape indicators (left) and action buttons (right)
            WHY: Shows BlockShape-level properties (Composable, State Control, Valid Cascades) and provides actions
            PATTERN: Flex container with indicators on left, buttons on right
          -->
          <div class="d-flex justify-space-between align-center mb-4">
            <!-- BlockShape-Level Indicators -->
            <div class="d-flex align-center gap-2 flex-wrap">
              <!-- Composable Badge -->
              <VChip
                v-if="blockShapeComposable.get(blockShape.id)"
                color="success"
                size="small"
                prepend-icon="tabler-link"
                variant="flat"
              >
                Composable
              </VChip>
              
              <!-- State Control Badge -->
              <VChip
                v-if="blockShapeStateControl.get(blockShape.id)"
                color="secondary"
                size="small"
                prepend-icon="tabler-toggle-left"
                variant="flat"
              >
                State Control
              </VChip>
              
              <!-- Valid Cascades Badge -->
              <VChip
                :color="(blockShapeValidCascades.get(blockShape.id) || []).length > 0 ? 'info' : 'default'"
                size="small"
                prepend-icon="tabler-hierarchy"
                variant="tonal"
              >
                {{ (() => {
                  const cascades = blockShapeValidCascades.get(blockShape.id) || []
                  return cascades.length > 0 
                    ? `Cascades: ${cascades.join(', ')}` 
                    : 'No Cascades'
                })() }}
              </VChip>
            </div>
            
            <!-- Action Buttons -->
            <div class="d-flex align-center gap-2">
              <VBtn
                color="primary"
                prepend-icon="tabler-plus"
                @click="handleCreateClick(blockShape.id)"
              >
                Create
              </VBtn>
              <VBtn
                :color="bulkEditMode.get(blockShape.id) ? 'success' : 'default'"
                :variant="bulkEditMode.get(blockShape.id) ? 'flat' : 'outlined'"
                prepend-icon="tabler-edit"
                @click="toggleBulkEditMode(blockShape.id)"
              >
                {{ bulkEditMode.get(blockShape.id) ? 'Exit Bulk Edit' : 'Bulk Edit' }}
              </VBtn>
              <VBtn
                :color="shapeEditModalOpen.get(blockShape.id) ? 'primary' : 'default'"
                :variant="shapeEditModalOpen.get(blockShape.id) ? 'flat' : 'outlined'"
                prepend-icon="tabler-settings"
                @click="toggleShapeEditModal(blockShape.id)"
              >
                Instance Fields
              </VBtn>
            </div>
          </div>
          
          <!--
            LEARNING: BlockInstance cards container with drag-and-drop and expansion panels
            WHY: Displays BlockInstances for this BlockShape with reordering and expand/collapse capability
            PATTERN: VExpansionPanels directly in tab (matches ShapesTab pattern)
          -->
          <div 
            :ref="el => groupContainers.set(blockShape.id, el as HTMLElement)"
            class="block-instances-container"
          >
            <VExpansionPanels
              v-if="(blockInstancesLists.get(blockShape.id)?.value || mainInstancesByShape.get(blockShape.id) || []).length > 0"
              :ref="el => {
                const blockShapeId = blockShape.id
                if (!groupPanelsContainers.has(blockShapeId)) {
                  groupPanelsContainers.set(blockShapeId, ref(el as ComponentPublicInstance | HTMLElement | null))
                } else {
                  const panelsRef = groupPanelsContainers.get(blockShapeId)
                  if (panelsRef) {
                    panelsRef.value = el as ComponentPublicInstance | HTMLElement | null
                  }
                }
              }"
              v-model="expandedInstances"
              multiple
            >
              <EntityCard
                v-for="instance in (blockInstancesLists.get(blockShape.id)?.value || mainInstancesByShape.get(blockShape.id) || [])"
                :key="instance.id"
                :class="`draggable-instance-${blockShape.id} draggable-instance-item`"
                :data-drag-id="instance.id"
                entity-key="blockInstance"
                :entity="instance"
                :expanded="isPanelExpanded(instance.id)"
                @saved="handleExistingBlockInstanceSaved"
                @delete="handleDeleteBlockInstance"
                @duplicate="handleDuplicateClick"
              />
            </VExpansionPanels>

            <!-- Grouped: Add-On Only & Components (Hidden from Main Booking List) -->
            <VCard
              v-if="(groupedInstancesByShape.get(blockShape.id) || []).length > 0"
              variant="outlined"
              color="warning"
              class="mt-4 grouped-instances-card"
            >
              <VCardTitle class="text-subtitle-1 d-flex align-center gap-2">
                <VIcon icon="tabler-folders" size="small" />
                Add-On Only & Components (Hidden from Main Booking List)
                <VChip size="small" variant="tonal" class="ml-2">
                  {{ (groupedInstancesByShape.get(blockShape.id) || []).length }}
                </VChip>
              </VCardTitle>
              <VCardText>
                <!-- LEARNING: EntityCard is now self-contained with its own VExpansionPanel -->
                <!-- WHY: EntityCard wraps itself in VExpansionPanel and renders its own titleRow fields -->
                <!-- PATTERN: Use VExpansionPanels wrapper, EntityCard handles its own expansion -->
                <VExpansionPanels v-model="expandedInstances" multiple>
                  <EntityCard
                    v-for="instance in (groupedInstancesByShape.get(blockShape.id) || [])"
                    :key="instance.id"
                    entity-key="blockInstance"
                    :entity="instance"
                    :expanded="isPanelExpanded(instance.id)"
                    @saved="handleExistingBlockInstanceSaved"
                    @delete="handleDeleteBlockInstance"
                  />
                </VExpansionPanels>
              </VCardText>
            </VCard>
            
            <!-- Empty state -->
            <VAlert
              v-if="
                (blockInstancesLists.get(blockShape.id)?.value || mainInstancesByShape.get(blockShape.id) || []).length === 0 &&
                (groupedInstancesByShape.get(blockShape.id) || []).length === 0
              "
              type="info"
              variant="tonal"
              class="mt-4"
            >
              No BlockInstances found for {{ blockShape.name }}. Create one to get started.
            </VAlert>
            
            <!--
              LEARNING: BlockShape Fields Preview Card
              WHY: Shows configured blockShape fields at bottom of tab for easy reference
              PATTERN: EntityCard with actual blockShape entity to display that specific shape's field configurations
            -->
            <VDivider class="my-6" />
            <VExpansionPanels v-model="expandedInstances" multiple>
              <EntityCard
                entity-key="blockShape"
                :entity="blockShape"
                :expanded="isPanelExpanded(blockShape.id)"
              />
            </VExpansionPanels>
          </div>
          
        </div>
      </VWindowItem>
      
      <!-- Fee Calibration Tab Content -->
      <VWindowItem value="calibration">
        <FeeCalibrationPanel />
      </VWindowItem>

      <!-- Event Instances Tab Content -->
      <VWindowItem value="eventInstances">
        <div class="event-instances-tab-content">
          <div class="d-flex justify-space-between align-center mb-4">
            <h3 class="text-h6">Event Instances</h3>
            <div class="d-flex gap-2">
              <!-- LEARNING: Global button to configure all EventInstance fields -->
              <!-- WHY: Single config applies to all EventInstances globally -->
              <!-- PATTERN: Global config modal triggered from section header -->
              <VBtn
                :variant="eventInstanceMetadataModalOpen ? 'flat' : 'outlined'"
                :color="eventInstanceMetadataModalOpen ? 'primary' : 'default'"
                prepend-icon="tabler-settings"
                @click="eventInstanceMetadataModalOpen = !eventInstanceMetadataModalOpen"
              >
                Instance Fields
              </VBtn>
              <VBtn
                color="primary"
                prepend-icon="tabler-plus"
                @click="openCreateEventInstanceForm"
              >
                Create Event Instance
              </VBtn>
            </div>
          </div>
          
          <div v-if="isLoadingEventInstances" class="text-center py-4">
            <VProgressCircular indeterminate />
          </div>
          
          <div 
            v-else-if="isCreatingEventInstance || eventInstances.length > 0"
            ref="eventInstancesContainer"
          >
            <VExpansionPanels 
              ref="eventInstancesPanelsContainer"
              v-model="expandedInstances" 
              multiple 
            >
            <!-- Inline creation card for EventInstance -->
            <VExpansionPanel
              v-if="isCreatingEventInstance"
              key="new-eventInstance"
              value="new-eventInstance"
              class="new-shape-card"
            >
              <template #title>
                <div class="d-flex align-center gap-2 flex-grow-1">
                  <VIcon icon="tabler-plus" size="small" color="primary" />
                  <span class="text-primary font-weight-medium">New Event Instance</span>
                </div>
              </template>
              
              <template #text>
                <div v-if="newEventInstanceData" class="d-flex flex-column gap-4">
                  <!-- Identity -->
                  <VSelect
                    v-model="newEventInstanceData.eventShapeRef"
                    :items="eventShapes"
                    item-title="name"
                    item-value="id"
                    label="Event Shape"
                    variant="outlined"
                    density="compact"
                  />
                  <VTextField
                    v-model="newEventInstanceData.name"
                    label="Name"
                    variant="outlined"
                    density="compact"
                    @keyup.enter="handleEventInstanceCreate"
                  />

                  <!-- Content Templates -->
                  <div class="text-subtitle-2 text-medium-emphasis mt-2">Content Templates</div>

                  <VExpansionPanels variant="accordion" class="mb-2">
                    <VExpansionPanel>
                      <VExpansionPanelTitle class="text-caption py-1" style="min-height: 36px">
                        Available Template Variables
                      </VExpansionPanelTitle>
                      <VExpansionPanelText>
                        <div class="text-caption text-medium-emphasis mb-1">
                          Use <code>{'{variableName}'}</code> in templates. Variables are replaced at invite time.
                        </div>
                        <VTable density="compact" class="text-caption">
                          <thead>
                            <tr>
                              <th>Variable</th>
                              <th>Description</th>
                              <th>Example</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="v in templateVariables" :key="v.name">
                              <td><code>{{'{'}}{{ v.name }}{{'}'}}</code></td>
                              <td>{{ v.description }}</td>
                              <td class="text-medium-emphasis">{{ v.example }}</td>
                            </tr>
                          </tbody>
                        </VTable>
                      </VExpansionPanelText>
                    </VExpansionPanel>
                  </VExpansionPanels>

                  <VTextarea
                    v-model="newEventInstanceData.titleTemplate"
                    label="Title Template"
                    variant="outlined"
                    density="compact"
                    rows="2"
                    hint="e.g. '{service} at {streetAddress}'"
                    :error-messages="templateWarnings.titleTemplate"
                  />
                  <VTextarea
                    v-model="newEventInstanceData.descriptionTemplate"
                    label="Description Template"
                    variant="outlined"
                    density="compact"
                    rows="2"
                    hint="e.g. 'Home inspection on {appointmentDate} at {appointmentTime}'"
                    :error-messages="templateWarnings.descriptionTemplate"
                  />
                  <VTextarea
                    v-model="newEventInstanceData.locationTemplate"
                    label="Location Template"
                    variant="outlined"
                    density="compact"
                    rows="2"
                    hint="e.g. '{fullAddress}'"
                    :error-messages="templateWarnings.locationTemplate"
                  />

                  <!-- Display & Status -->
                  <div class="text-subtitle-2 text-medium-emphasis mt-2">Display & Status</div>
                  <VRow dense>
                    <VCol cols="12" sm="6" md="4">
                      <VSelect
                        v-model="newEventInstanceData.visibility"
                        :items="[
                          { title: 'Default', value: 'default' },
                          { title: 'Public', value: 'public' },
                          { title: 'Private', value: 'private' },
                          { title: 'Confidential', value: 'confidential' },
                        ]"
                        label="Visibility"
                        variant="outlined"
                        density="compact"
                      />
                    </VCol>
                    <VCol cols="12" sm="6" md="4">
                      <VSelect
                        v-model="newEventInstanceData.transparency"
                        :items="[
                          { title: 'Busy', value: 'opaque' },
                          { title: 'Free', value: 'transparent' },
                        ]"
                        label="Show As"
                        variant="outlined"
                        density="compact"
                      />
                    </VCol>
                    <VCol cols="12" sm="6" md="4">
                      <VSelect
                        v-model="newEventInstanceData.status"
                        :items="[
                          { title: 'Confirmed', value: 'confirmed' },
                          { title: 'Tentative', value: 'tentative' },
                        ]"
                        label="Event Status"
                        variant="outlined"
                        density="compact"
                      />
                    </VCol>
                    <VCol cols="12" sm="6" md="4">
                      <VSelect
                        v-model="newEventInstanceData.colorId"
                        :items="[
                          { title: 'Default', value: null },
                          { title: '1 - Lavender', value: '1' },
                          { title: '2 - Sage', value: '2' },
                          { title: '3 - Grape', value: '3' },
                          { title: '4 - Flamingo', value: '4' },
                          { title: '5 - Banana', value: '5' },
                          { title: '6 - Tangerine', value: '6' },
                          { title: '7 - Peacock', value: '7' },
                          { title: '8 - Graphite', value: '8' },
                          { title: '9 - Blueberry', value: '9' },
                          { title: '10 - Basil', value: '10' },
                          { title: '11 - Tomato', value: '11' },
                        ]"
                        label="Event Color"
                        variant="outlined"
                        density="compact"
                        clearable
                      />
                    </VCol>
                  </VRow>

                  <!-- Guest Permissions -->
                  <div class="text-subtitle-2 text-medium-emphasis mt-2">Guest Permissions</div>
                  <VRow dense>
                    <VCol cols="12" sm="6" md="4">
                      <VSwitch
                        v-model="newEventInstanceData.guestsCanModify"
                        label="Guests can modify event"
                        density="compact"
                        color="primary"
                        hide-details
                      />
                    </VCol>
                    <VCol cols="12" sm="6" md="4">
                      <VSwitch
                        v-model="newEventInstanceData.guestsCanInviteOthers"
                        label="Guests can invite others"
                        density="compact"
                        color="primary"
                        hide-details
                      />
                    </VCol>
                    <VCol cols="12" sm="6" md="4">
                      <VSwitch
                        v-model="newEventInstanceData.guestsCanSeeOtherGuests"
                        label="Guests can see guest list"
                        density="compact"
                        color="primary"
                        hide-details
                      />
                    </VCol>
                  </VRow>

                  <!-- Notifications & Conferencing -->
                  <div class="text-subtitle-2 text-medium-emphasis mt-2">Notifications & Conferencing</div>
                  <VRow dense>
                    <VCol cols="12" sm="6" md="4">
                      <VSelect
                        v-model="newEventInstanceData.sendUpdates"
                        :items="[
                          { title: 'All — send to everyone', value: 'all' },
                          { title: 'External only', value: 'externalOnly' },
                          { title: 'None — no emails', value: 'none' },
                        ]"
                        label="Send Invitations"
                        variant="outlined"
                        density="compact"
                      />
                    </VCol>
                    <VCol cols="12" sm="6" md="4">
                      <VSwitch
                        v-model="newEventInstanceData.addConferenceLink"
                        label="Add Google Meet link"
                        density="compact"
                        color="primary"
                        hide-details
                      />
                    </VCol>
                  </VRow>

                  <!-- Actions -->
                  <div class="d-flex gap-2 justify-end mt-2">
                    <VBtn
                      color="primary"
                      :loading="isCreatingEventInstanceLoading"
                      :disabled="!newEventInstanceData.name.trim()"
                      @click="handleEventInstanceCreate"
                    >
                      Create
                    </VBtn>
                    <VBtn
                      variant="outlined"
                      @click="handleEventInstanceCancelled"
                    >
                      Cancel
                    </VBtn>
                  </div>
                </div>
              </template>
            </VExpansionPanel>
            
            <!-- Existing EventInstances -->
            <EntityCard
              v-for="eventInstance in (eventInstancesList.length > 0 ? eventInstancesList : filteredEventInstances)"
              :key="String(eventInstance.id)"
              :class="`draggable-event-instance draggable-instance-item`"
              :data-drag-id="String(eventInstance.id)"
              entity-key="eventInstance"
              :entity="eventInstance"
              :expanded="isPanelExpanded(String(eventInstance.id))"
              @saved="handleExistingBlockInstanceSaved"
              @delete="handleDeleteEventInstance"
            />
          </VExpansionPanels>
          </div>
          
          <VAlert
            v-else
            type="info"
            variant="tonal"
            class="mt-4"
          >
            No event instances found. Create one to get started.
          </VAlert>
        </div>
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
      :entity="{ id: toGlobalEntityId('00000000-0000-0000-0000-000000000012'), name: 'Event Instance Fields (Global)', entityKey: 'eventInstance', orderIndex: 0, active: true, eventShapeRef: toGlobalEntityId(''), titleTemplate: null, descriptionTemplate: null, locationTemplate: null, visibility: 'default', transparency: 'opaque', guestsCanModify: false, guestsCanInviteOthers: false, guestsCanSeeOtherGuests: true, addConferenceLink: false, sendUpdates: 'none', colorId: null, status: 'confirmed', reminderOverrides: null }"
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
