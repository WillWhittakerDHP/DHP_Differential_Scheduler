<!--
  LEARNING: Instances Tab Component with BlockInstance Grouping by BlockShape Tabs
  WHY: Displays BlockInstances grouped by BlockShape in separate tabs for better organization
  PATTERN: VTabs/VWindow for tab navigation, composables for data access
  COMPARISON: React uses Ant Design Tabs. Vue uses Vuetify VTabs with VWindow
  RESOURCE: https://vuetifyjs.com/en/components/tabs/
-->
<script setup lang="ts">
import { ref, type ComponentPublicInstance } from 'vue'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'
import EntityCard from '@/components/admin/generic/EntityCard.vue'
import InstanceBulkEditModal from '@/components/admin/InstanceBulkEditModal.vue'
import MetadataEditModal from '@/components/admin/MetadataEditModal.vue'
import { useInstanceGrouping } from '@/composables/admin/useInstanceGrouping'
import { useInstanceBulkEdit } from '@/composables/admin/useInstanceBulkEdit'
import { useExpansionState } from '@/composables/admin/useExpansionState'
import { useEntityCrud } from '@/composables/useEntity'
import { useGlobal } from '@/composables/useGlobal'
import { useInstanceFiltering } from '@/composables/admin/useInstanceFiltering'
import { useInstanceDeletion } from '@/composables/admin/useInstanceDeletion'
import BlockInstanceCreateModal from '@/components/admin/BlockInstanceCreateModal.vue'
import { useInstanceSaveHandlers } from '@/composables/admin/useInstanceSaveHandlers'
import { useInstanceTabHandlers } from '@/composables/admin/useInstanceTabHandlers'
import { useInstanceDragAndDrop } from '@/composables/admin/useInstanceDragAndDrop'
import { useShapeEditModal } from '@/composables/admin/useShapeEditModal'
import { BLOCK_INSTANCE_GLOBAL_CONFIG_ID } from '@/utils/entities/entityTypeMapping'

/**
 * LEARNING: Reactive active tab state
 * WHY: Tracks which tab is currently active (BlockShape ID)
 * PATTERN: ref for reactive string value
 */
const activeTab = ref<string>('')

/**
 * LEARNING: Use instance grouping composable for grouping logic and metadata
 * WHY: Moves grouping logic out of component into reusable composable
 * PATTERN: Composable handles BlockInstance grouping and metadata (expansion state moved to useExpansionState)
 */
/**
 * LEARNING: Use instance grouping composable for grouping logic and metadata
 * WHY: Moves grouping logic out of component into reusable composable
 * PATTERN: Composable handles BlockInstance grouping and metadata (expansion state moved to useExpansionState)
 * NOTE: blockInstancesByShape is exported from useInstanceGrouping to avoid duplicate computation
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
 * LEARNING: Use expansion state composable for expansion state management
 * WHY: Moves expansion state logic out of component into reusable composable
 * PATTERN: Composable handles expansion state (single shared array, like ShapesTab)
 */
const expansionStateComposable = useExpansionState()
const { expandedEntities: expandedInstances, isPanelExpanded } = expansionStateComposable

/**
 * LEARNING: Use instance bulk edit composable for bulk edit logic
 * WHY: Moves bulk edit logic out of component into reusable composable
 * PATTERN: Composable handles bulk edit state, form data, and operations
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
 * LEARNING: Entity CRUD composable for BlockInstance
 * WHY: Provides orderIndex operations for drag-and-drop
 * PATTERN: useEntityCrud composable wraps Vue Query mutations
 */
const { patchOrderIndex: patchBlockInstanceOrderIndex } = useEntityCrud('blockInstance')

/**
 * LEARNING: Entity CRUD composable for BlockShape
 * WHY: Provides access to BlockShape entities for entity card display
 * PATTERN: useEntityCrud composable wraps Vue Query queries
 */
const { entities: _blockShapes } = useEntityCrud('blockShape')

const { globalData: _globalData } = useGlobal()

// Component-child detection moved to useInstanceFiltering composable

/**
 * LEARNING: Expansion state for BlockShape entity cards
 * WHY: Separate expansion state for BlockShape entity cards (different from BlockInstances)
 * PATTERN: Use separate expansion state composable instance
 */
const blockShapeExpansionState = useExpansionState()
const { expandedEntities: expandedBlockShapes } = blockShapeExpansionState

/**
 * LEARNING: Use shape edit modal composable
 * WHY: Modal handlers moved to composable
 */
const {
  shapeEditModalOpen,
  toggleShapeEditModal,
  handleExistingBlockShapeSaved
} = useShapeEditModal({ expandedBlockShapes })

/**
 * LEARNING: Handle bulk edit modal confirm event
 * WHY: Simple wrapper that updates bulk edit data and applies changes
 * PATTERN: Simple event handler - acceptable to keep in component as it's just a wrapper
 * NOTE: Accepts generic Record type to match modal's declarative field extraction
 */
const handleBulkEditConfirm = (blockShapeId: string, data: Record<string, number | null | undefined>): void => {
  bulkEditData.value.set(blockShapeId, data as { baseSqFt?: number })
  applyBulkEdit(blockShapeId)
}

// Admin config removed - not used in component (only used in composables)

/**
 * LEARNING: EntityCard is now self-contained
 * WHY: EntityCard wraps itself in VExpansionPanel and renders its own titleRow fields
 * PATTERN: No need for refs, readiness maps, or field context access - EntityCard handles everything internally
 */

/**
 * LEARNING: EntityCard is now self-contained
 * WHY: EntityCard wraps itself in VExpansionPanel and renders its own titleRow fields
 * PATTERN: No need for titleRowRenderMap or diagnostic logic - EntityCard handles everything internally
 */

/**
 * LEARNING: Use instance filtering composable
 * WHY: Filtering logic moved to composable
 */
const {
  mainInstancesByShape,
  groupedInstancesByShape
} = useInstanceFiltering({
  blockInstancesByShape
})

/**
 * LEARNING: Use instance drag-and-drop composable
 * WHY: Drag-and-drop setup logic moved to composable
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


/**
 * LEARNING: Use instance deletion composable
 * WHY: Deletion handler moved to composable
 */
const { handleDeleteBlockInstance } = useInstanceDeletion()

/**
 * LEARNING: Use instance save handlers composable
 * WHY: Save handlers moved to composable
 */
const { handleExistingBlockInstanceSaved } = useInstanceSaveHandlers()

/**
 * LEARNING: Modal state for create/duplicate operations
 * WHY: Unified modal approach for both create and duplicate
 * PATTERN: Simple boolean + optional sourceEntity for duplicate
 */
const createModalOpen = ref(false)
const createModalBlockShapeId = ref<string>('')
const createModalSourceEntity = ref<GlobalEntity<'blockInstance'> | undefined>(undefined)

/**
 * LEARNING: Handler for Create button click
 * WHY: Opens modal with empty form for creating new instance
 * PATTERN: Set blockShapeId and open modal
 */
const handleCreateClick = (blockShapeId: string): void => {
  createModalBlockShapeId.value = blockShapeId
  createModalSourceEntity.value = undefined
  createModalOpen.value = true
}

/**
 * LEARNING: Handler for Duplicate button click
 * WHY: Opens modal with pre-filled values from source entity
 * PATTERN: Set blockShapeId and sourceEntity, then open modal
 */
const handleDuplicateClick = (sourceEntity: GlobalEntity<GlobalEntityKey>): void => {
  // LEARNING: EntityCard emits union type, but InstancesTab only handles blockInstance
  // WHY: Type safety - EntityCard can emit any entity type, but we only handle blockInstance
  // PATTERN: Type assertion since InstancesTab only uses EntityCard with entity-key="blockInstance"
  const blockInstanceEntity = sourceEntity as GlobalEntity<'blockInstance'>
  createModalBlockShapeId.value = blockInstanceEntity.blockShapeRef
  createModalSourceEntity.value = blockInstanceEntity
  createModalOpen.value = true
}

/**
 * LEARNING: Handler for instance created event from modal
 * WHY: Closes modal after successful creation
 * PATTERN: Vue Query will automatically refetch and update the list
 */
const handleInstanceCreated = (_entity: GlobalEntity<'blockInstance'>): void => {
  createModalOpen.value = false
  // Vue Query will automatically refetch and update the list
}

/**
 * LEARNING: Use instance tab handlers composable
 * WHY: Tab click handler moved to composable
 */
const { handleTabClick } = useInstanceTabHandlers({ activeTab })


// All watch blocks and lifecycle hooks moved to useInstanceDragAndDrop composable
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
      v-if="sortedBlockShapes.length > 0"
    >
      <VTab
        v-for="blockShape in sortedBlockShapes"
        :key="String(blockShape.id)"
        :value="String(blockShape.id)"
        @click="handleTabClick(String(blockShape.id))"
      >
        {{ blockShape.name }} ({{ blockInstancesCountByShape.get(String(blockShape.id)) || 0 }})
      </VTab>
    </VTabs>
    
    <!--
      LEARNING: VWindow component for tab content container
      WHY: Manages which tab content is visible based on activeTab value
      PATTERN: v-model syncs with VTabs - when tab clicked, VWindow shows matching VWindowItem
    -->
    <VWindow 
      v-model="activeTab"
      v-if="sortedBlockShapes.length > 0"
    >
      <VWindowItem
        v-for="blockShape in sortedBlockShapes"
        :key="String(blockShape.id)"
        :value="String(blockShape.id)"
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
                v-if="blockShapeComposable.get(String(blockShape.id))"
                color="success"
                size="small"
                prepend-icon="tabler-link"
                variant="flat"
              >
                Composable
              </VChip>
              
              <!-- State Control Badge -->
              <VChip
                v-if="blockShapeStateControl.get(String(blockShape.id))"
                color="secondary"
                size="small"
                prepend-icon="tabler-toggle-left"
                variant="flat"
              >
                State Control
              </VChip>
              
              <!-- Valid Cascades Badge -->
              <VChip
                :color="(blockShapeValidCascades.get(String(blockShape.id)) || []).length > 0 ? 'info' : 'default'"
                size="small"
                prepend-icon="tabler-hierarchy"
                variant="tonal"
              >
                {{ (() => {
                  const cascades = blockShapeValidCascades.get(String(blockShape.id)) || []
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
                @click="handleCreateClick(String(blockShape.id))"
              >
                Create
              </VBtn>
              <VBtn
                :color="bulkEditMode.get(String(blockShape.id)) ? 'success' : 'default'"
                :variant="bulkEditMode.get(String(blockShape.id)) ? 'flat' : 'outlined'"
                prepend-icon="tabler-edit"
                @click="toggleBulkEditMode(String(blockShape.id))"
              >
                {{ bulkEditMode.get(String(blockShape.id)) ? 'Exit Bulk Edit' : 'Bulk Edit' }}
              </VBtn>
              <VBtn
                :color="shapeEditModalOpen.get(String(blockShape.id)) ? 'primary' : 'default'"
                :variant="shapeEditModalOpen.get(String(blockShape.id)) ? 'flat' : 'outlined'"
                prepend-icon="tabler-settings"
                @click="toggleShapeEditModal(String(blockShape.id))"
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
            :ref="el => groupContainers.set(String(blockShape.id), el as HTMLElement)"
            class="block-instances-container"
          >
            <VExpansionPanels
              v-if="(blockInstancesLists.get(String(blockShape.id))?.value || mainInstancesByShape.get(String(blockShape.id)) || []).length > 0"
              :ref="el => {
                const blockShapeId = String(blockShape.id)
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
              <!-- Existing BlockInstances -->
              <!-- LEARNING: EntityCard is now self-contained with its own VExpansionPanel -->
              <!-- WHY: EntityCard wraps itself in VExpansionPanel and renders its own titleRow fields -->
              <!-- PATTERN: Use EntityCard directly - no need for parent VExpansionPanel wrapper -->
              <EntityCard
                v-for="instance in (blockInstancesLists.get(String(blockShape.id))?.value || mainInstancesByShape.get(String(blockShape.id)) || [])"
                :key="String(instance.id)"
                :class="`draggable-instance-${blockShape.id} draggable-instance-item`"
                :data-drag-id="String(instance.id)"
                entity-key="blockInstance"
                :entity="instance"
                :expanded="isPanelExpanded(String(instance.id))"
                @saved="handleExistingBlockInstanceSaved"
                @delete="handleDeleteBlockInstance"
                @duplicate="handleDuplicateClick"
              />
            </VExpansionPanels>

            <!-- Grouped: Add-On Only & Components (Hidden from Main Booking List) -->
            <VCard
              v-if="(groupedInstancesByShape.get(String(blockShape.id)) || []).length > 0"
              variant="outlined"
              color="warning"
              class="mt-4 grouped-instances-card"
            >
              <VCardTitle class="text-subtitle-1 d-flex align-center gap-2">
                <VIcon icon="tabler-folders" size="small" />
                Add-On Only & Components (Hidden from Main Booking List)
                <VChip size="small" variant="tonal" class="ml-2">
                  {{ (groupedInstancesByShape.get(String(blockShape.id)) || []).length }}
                </VChip>
              </VCardTitle>
              <VCardText>
                <!-- LEARNING: EntityCard is now self-contained with its own VExpansionPanel -->
                <!-- WHY: EntityCard wraps itself in VExpansionPanel and renders its own titleRow fields -->
                <!-- PATTERN: Use VExpansionPanels wrapper, EntityCard handles its own expansion -->
                <VExpansionPanels v-model="expandedInstances" multiple>
                  <EntityCard
                    v-for="instance in (groupedInstancesByShape.get(String(blockShape.id)) || [])"
                    :key="String(instance.id)"
                    entity-key="blockInstance"
                    :entity="instance"
                    :expanded="isPanelExpanded(String(instance.id))"
                    @saved="handleExistingBlockInstanceSaved"
                    @delete="handleDeleteBlockInstance"
                  />
                </VExpansionPanels>
              </VCardText>
            </VCard>
            
            <!-- Empty state -->
            <VAlert
              v-if="
                (blockInstancesLists.get(String(blockShape.id))?.value || mainInstancesByShape.get(String(blockShape.id)) || []).length === 0 &&
                (groupedInstancesByShape.get(String(blockShape.id)) || []).length === 0
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
                :expanded="isPanelExpanded(String(blockShape.id))"
              />
            </VExpansionPanels>
          </div>
          
        </div>
      </VWindowItem>
    </VWindow>
    
    <!--
      LEARNING: Empty state when no BlockShapes exist
      WHY: Provides feedback when no BlockShapes are configured
      PATTERN: Conditional rendering with v-else
    -->
    <VAlert
      v-else
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
    <template v-for="blockShape in sortedBlockShapes" :key="String(blockShape.id)">
      <InstanceBulkEditModal
        :model-value="bulkEditMode.get(String(blockShape.id)) || false"
        :block-shape-id="String(blockShape.id)"
        :block-shape-name="blockShape.name"
        :bulk-edit-data="getBulkEditData(String(blockShape.id))"
        :instance-count="blockInstancesCountByShape.get(String(blockShape.id)) || 0"
        @update:model-value="(value) => bulkEditMode.set(String(blockShape.id), value)"
        @confirm="(data) => handleBulkEditConfirm(String(blockShape.id), data)"
      />
    </template>
    
    <!--
      LEARNING: Metadata Edit Modals
      WHY: Modals for editing field metadata and shape templates
      PATTERN: One modal per BlockShape, conditionally rendered
    -->
    <template v-for="blockShape in sortedBlockShapes" :key="`shape-${blockShape.id}`">
      <MetadataEditModal
        :model-value="shapeEditModalOpen.get(String(blockShape.id)) || false"
        entity-key="blockInstance"
        :entity="{ 
          id: BLOCK_INSTANCE_GLOBAL_CONFIG_ID,
          blockShapeRef: blockShape.id 
        } as GlobalEntity<'blockInstance'>"
        mode="global"
        :block-shape-ref="String(blockShape.id)"
        :entity-name="blockShape.name || `BlockShape ${blockShape.id}`"
        @update:model-value="(value) => shapeEditModalOpen.set(String(blockShape.id), value)"
        @saved="() => handleExistingBlockShapeSaved(String(blockShape.id))"
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
</style>
