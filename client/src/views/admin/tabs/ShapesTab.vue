<!--
  LEARNING: Shapes Tab Component for BlockShape and PartShape Management
  WHY: Provides interface for managing BlockShapes and PartShapes with CRUD operations
  PATTERN: VTabs for tab navigation, VExpansionPanels for grouped display
  COMPARISON: React uses Ant Design Tabs. Vue uses Vuetify VTabs with VWindow
  RESOURCE: https://vuetifyjs.com/en/components/tabs/
-->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useEntityCrud } from '@/composables/useEntity'
import { useEntityFiltering } from '@/composables/admin/useEntityFiltering'
import { useShapeDisplayNames } from '@/composables/admin/useShapeDisplayNames'
import { useDragAndDrop } from '@/composables/admin/useDragAndDrop'
import { useEntityDragHandlers } from '@/composables/admin/useEntityDragHandlers'
import { useExpansionState } from '@/composables/admin/useExpansionState'
import { useEntityTabState } from '@/composables/admin/useEntityTabState'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import EntityCard from '@/components/admin/generic/EntityCard.vue'
import StatusButton from '@/components/admin/generic/StatusButton.vue'
import AnnotationTypeCard from '../components/AnnotationTypeCard.vue'
import MetadataEditModal from '@/components/admin/MetadataEditModal.vue'
import { PART_SHAPE_GLOBAL_CONFIG_ID } from '@/utils/entities/entityTypeMapping'
import { useUpdateAnnotationType } from '@/composables/useAnnotationType'
import { useStatusButtonValue } from '@/composables/admin/useStatusButtonValue'
import { useStatusButtonHandlers } from '@/composables/admin/useStatusButtonHandlers'
import { useShapeCreation } from '@/composables/admin/useShapeCreation'
import { useShapeSaveHandlers } from '@/composables/admin/useShapeSaveHandlers'
import { useShapeDeletion } from '@/composables/admin/useShapeDeletion'
import { useAnnotationTypeFiltering } from '@/composables/admin/useAnnotationTypeFiltering'
import { useMetadataModalHandlers } from '@/composables/admin/useMetadataModalHandlers'
import { useStatusButtonFields } from '@/composables/admin/useStatusButtonFields'

// NOTE: useEntityDisplay removed - display names handled by useShapeDisplayNames

/**
 * LEARNING: Use entity filtering composable for both entity types
 * WHY: Extracts filtering and sorting logic from component to generic composable
 * PATTERN: Generic composable provides filtered and sorted entity arrays
 */
const { filteredEntities: filteredBlockShapes } = useEntityFiltering('blockShape')
const { filteredEntities: filteredPartShapes } = useEntityFiltering('partShape')

/**
 * LEARNING: Use shape display names composable
 * WHY: Extracts display names map logic from component to composable
 * PATTERN: Composable provides computed maps of entity IDs to display names
 */
const { blockShapeDisplayNames, partShapeDisplayNames } = useShapeDisplayNames()

/**
 * LEARNING: Entity CRUD composables for BlockShape and PartShape
 * WHY: Provides orderIndex operations for drag-and-drop and update operations for title field
 * PATTERN: useEntityCrud composable wraps Vue Query mutations
 * NOTE: EntityCard handles deletion internally, so we only need patchOrderIndex and update here
 */
const { patchOrderIndex: patchBlockShapeOrderIndex } = useEntityCrud('blockShape')
const { patchOrderIndex: patchPartShapeOrderIndex } = useEntityCrud('partShape')

/**
 * LEARNING: Reactive tab state management
 * WHY: Tracks which tab is currently active (blockShapes, partShapes, or annotationTypes)
 * PATTERN: ref for reactive primitive values
 */
const activeTab = ref('blockShapes')

// NOTE: Search functionality removed - no longer needed

/**
 * LEARNING: Use expansion state composable for expansion state management
 * WHY: Moves expansion state logic out of component into reusable composable
 * PATTERN: Composable handles expanded entities state and helper function
 */
const expansionStateComposable = useExpansionState()
const { expandedEntities: expandedShapes, isPanelExpanded } = expansionStateComposable

/**
 * LEARNING: Use metadata modal handlers composable
 * WHY: All modal logic moved to composable - component is pure rendering
 */
const {
  partInstanceMetadataModalOpen,
  togglePartInstanceMetadataModal,
  handlePartInstanceMetadataSaved
} = useMetadataModalHandlers()

/**
 * LEARNING: Status button fields type for blockShape entities
 * WHY: Config-driven approach - booleans with renderAs: 'statusButton' render as clickable VChips
 * PATTERN: Categorize fields and extract status buttons for panel title rendering
 */
type BlockShapeStatusButtonField = Omit<StatusButtonField, 'key'> & { key: GlobalFieldKey<'blockShape'> }
type PartShapeStatusButtonField = Omit<StatusButtonField, 'key'> & { key: GlobalFieldKey<'partShape'> }

/**
 * LEARNING: Status button fields come from metadata ONLY
 * WHY: `/admin-input-metadata` is the source of truth for which fields exist + how they render
 * PATTERN: Fetch entity-type metadata once, then derive a shared status button list for all shapes
 *
 * NOTE: For shapes, metadata is global (shared across all BlockShapes / all PartShapes),
 * so we only need any one entity instance to bootstrap the metadata query.
 */
const anyBlockShapeForMetadata = computed<GlobalEntity<'blockShape'> | null>(() => blockShapesList.value[0] ?? null)
const { fieldMetadata: blockShapeFieldMetadata } = useEntityMetadata('blockShape', anyBlockShapeForMetadata)

const blockShapeStatusButtonFields = computed((): BlockShapeStatusButtonField[] => {
  const categorized = categorizeFieldsBySection([], undefined, {
    fieldMetadata: blockShapeFieldMetadata.value
  })

  return categorized.statusButtonFields.map((f) => ({
    ...f,
    key: f.key as GlobalFieldKey<'blockShape'>,
  }))
})

/**
 * LEARNING: PartShape status button fields come from metadata ONLY
 * WHY: `/admin-input-metadata` is the source of truth for PartShape rendering
 */
const anyPartShapeForMetadata = computed<GlobalEntity<'partShape'> | null>(() => partShapesList.value[0] ?? null)
const { fieldMetadata: partShapeFieldMetadata } = useEntityMetadata('partShape', anyPartShapeForMetadata)

const partShapeStatusButtonFields = computed((): PartShapeStatusButtonField[] => {
  const categorized = categorizeFieldsBySection([], undefined, {
    fieldMetadata: partShapeFieldMetadata.value
  })

  return categorized.statusButtonFields.map((f) => ({
    ...f,
    key: f.key as GlobalFieldKey<'partShape'>,
  }))
})

/**
 * LEARNING: Use status button value helper
 * WHY: Value extraction logic moved to composable
 */
const getStatusButtonBooleanValue = useStatusButtonValue.getStatusButtonBooleanValue

/**
 * LEARNING: Use status button handlers composables
 * WHY: Handler creation and click logic moved to composables
 */
const blockShapeStatusButtonHandlersComposable = useStatusButtonHandlers({
  filteredEntities: filteredBlockShapes,
  entityKey: 'blockShape'
})
const {
  handleStatusButtonClick: handleBlockShapeStatusButtonClick
} = blockShapeStatusButtonHandlersComposable

const partShapeStatusButtonHandlersComposable = useStatusButtonHandlers({
  filteredEntities: filteredPartShapes,
  entityKey: 'partShape'
})
const {
  handleStatusButtonClick: handlePartShapeStatusButtonClick
} = partShapeStatusButtonHandlersComposable

/**
 * LEARNING: Use shape creation composable
 * WHY: Creation logic moved to composable
 */
const shapeCreation = useShapeCreation({ expandedShapes })
const {
  isCreatingBlockShape,
  isCreatingPartShape,
  isCreatingAnnotationType,
  newBlockShapeInitialValues,
  newPartShapeInitialValues,
  newAnnotationTypeName,
  createBlockShape,
  createPartShape,
  createAnnotationType
} = shapeCreation

/**
 * LEARNING: Use shape save handlers composable
 * WHY: Save and cancel handlers moved to composable
 */
const shapeSaveHandlers = useShapeSaveHandlers({
  expandedShapes,
  isCreatingBlockShape,
  isCreatingPartShape,
  isCreatingAnnotationType,
  newBlockShapeInitialValues,
  newPartShapeInitialValues,
  newAnnotationTypeName
})
const {
  handleBlockShapeCreated,
  handleBlockShapeCancelled,
  handlePartShapeCreated,
  handlePartShapeCancelled,
  handleAnnotationTypeCreate,
  handleAnnotationTypeCancelled,
  handleExistingShapeSaved
} = shapeSaveHandlers

/**
 * LEARNING: Use annotation type filtering composable
 * WHY: Filtering logic moved to composable
 */
const {
  annotationTypes,
  isLoadingAnnotationTypes
} = useAnnotationTypeFiltering()

/**
 * LEARNING: Update annotation type mutation
 * WHY: Provides update operation for annotation type name editing
 * PATTERN: useUpdateAnnotationType composable wraps Vue Query mutation
 */
useUpdateAnnotationType()

// LEARNING: Dialogs removed in favor of inline EntityCard creation
// WHY: Unified component pattern - all create/edit happens in EntityCard

/**
 * LEARNING: Template refs for drag-and-drop containers
 * WHY: Need DOM references to initialize drag-and-drop
 * PATTERN: Template refs for container divs that wrap VExpansionPanels
 */
const blockShapesContainer = ref<HTMLElement | null>(null)
const partShapesContainer = ref<HTMLElement | null>(null)
const annotationTypesContainer = ref<HTMLElement | null>(null)

/**
 * LEARNING: Refs for actual VExpansionPanels DOM elements
 * WHY: VExpansionPanels component creates .v-expansion-panels element that contains the panels
 * PATTERN: Create refs that point to the actual DOM container elements (not component instances)
 */
const blockShapesPanelsContainer = ref<HTMLElement | null>(null)
const partShapesPanelsContainer = ref<HTMLElement | null>(null)
const annotationTypesPanelsContainer = ref<HTMLElement | null>(null)

// LEARNING: getPanelsElement moved to useDragAndDrop composable
// WHY: Extracted to composable for better organization

/**
 * LEARNING: Reactive arrays for drag-and-drop
 * WHY: Need mutable arrays that can be reordered during drag operations
 * PATTERN: ref arrays that sync with computed filtered results
 */
const blockShapesList = ref<GlobalEntity<'blockShape'>[]>([])
const partShapesList = ref<GlobalEntity<'partShape'>[]>([])

/**
 * LEARNING: Reactive ID arrays for drag-and-drop
 * WHY: @formkit/drag-and-drop uses ID arrays to track order
 * PATTERN: ref arrays of entity IDs that stay in sync with entity arrays
 */
const blockShapeIds = ref<string[]>([])
const partShapeIds = ref<string[]>([])

// LEARNING: Filtered shapes and display names moved to composables
// WHY: Extracted to composables for better organization

// LEARNING: Use entity drag handlers composables
// WHY: Extracts drag end handling logic from component to generic composables
// PATTERN: Generic composable provides drag end handlers and array syncing
const blockShapesDragHandlers = useEntityDragHandlers({
  entityIds: blockShapeIds,
  entityList: blockShapesList,
  filteredEntities: filteredBlockShapes,
  patchOrderIndex: patchBlockShapeOrderIndex
})

const partShapesDragHandlers = useEntityDragHandlers({
  entityIds: partShapeIds,
  entityList: partShapesList,
  filteredEntities: filteredPartShapes,
  patchOrderIndex: patchPartShapeOrderIndex
})

// LEARNING: Use entity tab state composable for array syncing watchers
// WHY: Extracts watcher logic from component to generic composable
// PATTERN: Generic composable handles array syncing watchers
useEntityTabState({
  filteredEntities: filteredBlockShapes,
  dragHandlers: blockShapesDragHandlers
})

useEntityTabState({
  filteredEntities: filteredPartShapes,
  dragHandlers: partShapesDragHandlers
})

// LEARNING: Use drag-and-drop composables
// WHY: Extracts drag-and-drop initialization and cleanup logic from component to composables
// PATTERN: Composable handles all drag-and-drop setup, watchers, and cleanup
const { isMounted: blockShapesMounted } = useDragAndDrop({
  containerRef: blockShapesContainer,
  panelsContainerRef: blockShapesPanelsContainer,
  entityIds: blockShapeIds,
  entityList: blockShapesList,
  filteredEntities: filteredBlockShapes,
  dragEndHandler: blockShapesDragHandlers.handleDragEnd,
  group: 'blockShapes',
  draggableClass: 'draggable-block-shape'
})

const { isMounted: _partShapesMounted } = useDragAndDrop({
  containerRef: partShapesContainer,
  panelsContainerRef: partShapesPanelsContainer,
  entityIds: partShapeIds,
  entityList: partShapesList,
  filteredEntities: filteredPartShapes,
  dragEndHandler: partShapesDragHandlers.handleDragEnd,
  group: 'partShapes',
  draggableClass: 'draggable-part-shape'
})

// LEARNING: Track mount status for component use
// WHY: Need to expose mount status for component use
// PATTERN: Use blockShapesMounted as primary mount indicator
 
// @ts-expect-error - Unused variable kept for future use
const _isMounted = blockShapesMounted


/**
 * LEARNING: Use shape deletion composable
 * WHY: Deletion handlers moved to composable
 */
const {
  handleDeleteBlockShape,
  handleDeletePartShape,
  handleDeleteAnnotationType
} = useShapeDeletion()

// LEARNING: isPanelExpanded is now provided by useExpansionState composable

// LEARNING: Removed manual form and context creation
// WHY: EntityCard handles all form and context creation through DynamicFormInputs
// PATTERN: Trust the unified system - EntityCard creates its own form and contexts internally
</script>

<template>
  <div class="shapes-tab">
    <!--
      LEARNING: VTabs component for tab navigation
      WHY: Provides tabbed interface to switch between BlockShapes and PartShapes
      PATTERN: v-model binds to reactive ref for two-way data binding
    -->
    <VTabs v-model="activeTab" class="mb-4">
      <VTab value="blockShapes">
        🧱 Block ({{ filteredBlockShapes.length }})
      </VTab>
      <VTab value="partShapes">
        🧩 Part ({{ filteredPartShapes.length }})
      </VTab>
      <VTab value="annotationTypes">
        🏷️ Annotations ({{ annotationTypes.length }})
      </VTab>
    </VTabs>
    
    <!--
      LEARNING: VWindow component for tab content container
      WHY: Manages which tab content is visible based on activeTab value
      PATTERN: v-model syncs with VTabs - when tab clicked, VWindow shows matching VWindowItem
    -->
    <!--
      LEARNING: Add explicit keys to VWindowItem components
      WHY: Helps Vue track components during transitions and prevents undefined VNode errors
      PATTERN: Use stable keys matching the value prop for proper component tracking
    -->
    <VWindow v-model="activeTab">
      <!-- BlockShapes Tab Content -->
      <VWindowItem key="blockShapes" value="blockShapes">
        <div class="d-flex justify-space-between align-center mb-4">
          <h3 class="text-h6">Block</h3>
          <VBtn
            color="primary"
            prepend-icon="tabler-plus"
            @click="createBlockShape"
          >
            Create Block Shape
          </VBtn>
        </div>
        
        <!--
          LEARNING: VExpansionPanels for grouped display with drag-and-drop
          WHY: Provides expandable/collapsible cards for BlockShapes that can be reordered
          PATTERN: v-model binds to expandedShapes array, multiple allows multiple expanded cards
          LEARNING: Use blockShapesList for drag-and-drop (mutable array)
          LEARNING: Wrap in div for drag-and-drop parent container
        -->
        <div ref="blockShapesContainer" class="drag-drop-container">
          <VExpansionPanels 
            ref="blockShapesPanelsContainer"
            v-model="expandedShapes" 
            multiple 
            v-if="isCreatingBlockShape || blockShapesList.length > 0"
          >
          <!-- Inline creation card -->
          <VExpansionPanel
            v-if="isCreatingBlockShape"
            key="new-blockShape"
            value="new-blockShape"
            class="new-shape-card"
          >
            <template #title>
              <div class="d-flex align-center gap-2 flex-grow-1">
                <VIcon icon="tabler-plus" size="small" color="primary" />
                <span class="text-primary font-weight-medium">New BlockShape</span>
              </div>
            </template>
            
            <template #text>
              <EntityCard
                entity-key="blockShape"
                :entity="newBlockShapeInitialValues!"
                :is-new="true"
                :expanded="true"
                @saved="handleBlockShapeCreated"
                @cancelled="handleBlockShapeCancelled"
              />
            </template>
          </VExpansionPanel>
          
          <!-- Existing BlockShapes -->
          <VExpansionPanel
            v-for="blockShape in blockShapesList"
            :key="String(blockShape.id)"
            :value="String(blockShape.id)"
            class="draggable-block-shape"
            :data-drag-id="String(blockShape.id)"
          >
            <template #title>
              <div class="d-flex align-center gap-2 flex-grow-1">
                <VIcon icon="tabler-grip-vertical" class="drag-handle" size="small" />
                <!-- LEARNING: Always show static name in expansion panel title -->
                <!-- WHY: Name field editing happens in EntityCard content, not in panel title -->
                <!-- PATTERN: Show static entity name - editing happens in expanded content below -->
                <!-- NOTE: This avoids timing issues and follows unified system pattern -->
                <span>{{ blockShapeDisplayNames.get(String(blockShape.id)) || blockShape.name || `BlockShape ${blockShape.id}` }}</span>
                
                <!-- LEARNING: Config-driven status buttons for blockShape entities -->
                <!-- WHY: Boolean fields with renderAs: 'statusButton' render as clickable VChips -->
                <!-- PATTERN: Render status buttons in panel title based on adminConfig -->
                <div 
                  v-if="blockShapeStatusButtonFields.length > 0"
                  class="d-flex align-center gap-1 flex-wrap ms-auto"
                  style="pointer-events: auto"
                >
                  <StatusButton
                    v-for="statusField in blockShapeStatusButtonFields"
                    :key="statusField.key"
                    :label="statusField.label"
                    :color="statusField.color"
                    :is-active="getStatusButtonBooleanValue('blockShape', blockShape, statusField.key)"
                    @click="(event) => handleBlockShapeStatusButtonClick(String(blockShape.id), statusField.key, event)"
                  />
                </div>
              </div>
            </template>
            
            <template #text>
              <EntityCard
                entity-key="blockShape"
                :entity="blockShape"
                :expanded="isPanelExpanded(String(blockShape.id))"
                @saved="handleExistingShapeSaved"
                @delete="handleDeleteBlockShape"
              />
            </template>
          </VExpansionPanel>
          </VExpansionPanels>
          
          <!--
            LEARNING: Empty state display
            WHY: Provides feedback when no results match search or no data exists
            PATTERN: Conditional rendering with v-else
          -->
          <VAlert
            v-else
            type="info"
            variant="tonal"
            class="mt-4"
          >
            No BlockShapes found. Create one to get started.
          </VAlert>
        </div>
      </VWindowItem>
      
      <!-- PartShapes Tab Content -->
      <VWindowItem key="partShapes" value="partShapes">
        <div class="d-flex justify-space-between align-center mb-4">
          <h3 class="text-h6">Part</h3>
          <div class="d-flex gap-2">
            <!-- LEARNING: Global button to configure all PartInstance fields -->
            <!-- WHY: Single config applies to all PartInstances regardless of their PartShape -->
            <!-- PATTERN: Global config modal triggered from section header -->
            <VBtn
              :variant="partInstanceMetadataModalOpen ? 'flat' : 'outlined'"
              :color="partInstanceMetadataModalOpen ? 'primary' : 'default'"
              prepend-icon="tabler-settings"
              @click="togglePartInstanceMetadataModal"
            >
              Metadata Edit
            </VBtn>
            <VBtn
              color="primary"
              prepend-icon="tabler-plus"
              @click="createPartShape"
            >
              Create Part Shape
            </VBtn>
          </div>
        </div>
        
        <!--
          LEARNING: VExpansionPanels for grouped display with drag-and-drop
          WHY: Provides expandable/collapsible cards for PartShapes that can be reordered
          PATTERN: v-model binds to expandedShapes array, multiple allows multiple expanded cards
          LEARNING: Use partShapesList for drag-and-drop (mutable array)
          LEARNING: Wrap in div for drag-and-drop parent container
        -->
        <div ref="partShapesContainer" class="drag-drop-container">
          <VExpansionPanels 
            ref="partShapesPanelsContainer"
            v-model="expandedShapes" 
            multiple 
            v-if="isCreatingPartShape || partShapesList.length > 0"
          >
          <!-- Inline creation card -->
          <VExpansionPanel
            v-if="isCreatingPartShape"
            key="new-partShape"
            value="new-partShape"
            class="new-shape-card"
          >
            <template #title>
              <div class="d-flex align-center gap-2 flex-grow-1">
                <VIcon icon="tabler-plus" size="small" color="primary" />
                <span class="text-primary font-weight-medium">New PartShape</span>
              </div>
            </template>
            
            <template #text>
              <EntityCard
                entity-key="partShape"
                :entity="newPartShapeInitialValues!"
                :is-new="true"
                :expanded="true"
                @saved="handlePartShapeCreated"
                @cancelled="handlePartShapeCancelled"
              />
            </template>
          </VExpansionPanel>
          
          <!-- Existing PartShapes -->
          <VExpansionPanel
            v-for="partShape in partShapesList"
            :key="String(partShape.id)"
            :value="String(partShape.id)"
            class="draggable-part-shape"
            :data-drag-id="String(partShape.id)"
          >
            <template #title>
              <div class="d-flex align-center gap-2 flex-grow-1">
                <VIcon icon="tabler-grip-vertical" class="drag-handle" size="small" />
                <!-- LEARNING: Always show static name in expansion panel title -->
                <!-- WHY: Name field editing happens in EntityCard content, not in panel title -->
                <!-- PATTERN: Show static entity name - editing happens in expanded content below -->
                <!-- NOTE: This avoids timing issues and follows unified system pattern -->
                <span>{{ partShapeDisplayNames.get(String(partShape.id)) || partShape.name || `PartShape ${partShape.id}` }}</span>
                
                <!-- LEARNING: Config-driven status buttons for partShape entities -->
                <!-- WHY: Boolean fields with renderAs: 'statusButton' render as clickable VChips -->
                <!-- PATTERN: Render status buttons in panel title based on adminConfig -->
                <div 
                  v-if="partShapeStatusButtonFields.length > 0"
                  class="d-flex align-center gap-1 flex-wrap ms-auto"
                  style="pointer-events: auto"
                >
                  <StatusButton
                    v-for="statusField in partShapeStatusButtonFields"
                    :key="statusField.key"
                    :label="statusField.label"
                    :color="statusField.color"
                    :is-active="getStatusButtonBooleanValue('partShape', partShape, statusField.key)"
                    @click="(event) => handlePartShapeStatusButtonClick(String(partShape.id), statusField.key, event)"
                  />
                </div>
              </div>
            </template>
            
            <template #text>
              <EntityCard
                entity-key="partShape"
                :entity="partShape"
                :expanded="isPanelExpanded(String(partShape.id))"
                @saved="handleExistingShapeSaved"
                @delete="handleDeletePartShape"
              />
            </template>
          </VExpansionPanel>
          </VExpansionPanels>
          
          <!--
            LEARNING: Empty state display
            WHY: Provides feedback when no results match search or no data exists
            PATTERN: Conditional rendering with v-else
          -->
          <VAlert
            v-else
            type="info"
            variant="tonal"
            class="mt-4"
          >
            No PartShapes found. Create one to get started.
          </VAlert>
        </div>
      </VWindowItem>
      
      <!-- AnnotationTypes Tab Content -->
      <VWindowItem key="annotationTypes" value="annotationTypes">
        <div class="d-flex justify-space-between align-center mb-4">
          <h3 class="text-h6">Annotations</h3>
          <VBtn
            color="primary"
            prepend-icon="tabler-plus"
            @click="createAnnotationType"
          >
            Create Annotation Type
          </VBtn>
        </div>
        
        <!--
          LEARNING: VExpansionPanels for grouped display (matching Block and Part tabs)
          WHY: Provides expandable/collapsible cards for AnnotationTypes with consistent UI
          PATTERN: v-model binds to expandedShapes array, multiple allows multiple expanded cards
          LEARNING: Use same structure as Block Shapes and Part Shapes for consistency
        -->
        <div ref="annotationTypesContainer" class="drag-drop-container">
          <div v-if="isLoadingAnnotationTypes" class="text-center py-4">
            <VProgressCircular indeterminate />
          </div>
          
          <VExpansionPanels 
            v-else-if="isCreatingAnnotationType || filteredAnnotationTypes.length > 0"
            ref="annotationTypesPanelsContainer"
            v-model="expandedShapes" 
            multiple 
          >
            <!-- Inline creation card for AnnotationType -->
            <VExpansionPanel
              v-if="isCreatingAnnotationType"
              key="new-annotationType"
              value="new-annotationType"
              class="new-shape-card"
            >
              <template #title>
                <div class="d-flex align-center gap-2 flex-grow-1">
                  <VIcon icon="tabler-plus" size="small" color="primary" />
                  <span class="text-primary font-weight-medium">New Annotation Type</span>
                </div>
              </template>
              
              <template #text>
                <div class="d-flex align-center gap-3">
                  <VTextField
                    v-model="newAnnotationTypeName"
                    label="Name"
                    variant="outlined"
                    density="compact"
                    class="flex-grow-1"
                    @keyup.enter="handleAnnotationTypeCreate"
                  />
                  <VBtn
                    color="primary"
                    :loading="createAnnotationTypeMutation.isPending.value"
                    :disabled="!newAnnotationTypeName.trim()"
                    @click="handleAnnotationTypeCreate"
                  >
                    Create
                  </VBtn>
                  <VBtn
                    variant="outlined"
                    @click="handleAnnotationTypeCancelled"
                  >
                    Cancel
                  </VBtn>
                </div>
              </template>
            </VExpansionPanel>
            
            <!-- Existing AnnotationTypes - inline edit using AnnotationTypeCard -->
            <VExpansionPanel
              v-for="annotationType in annotationTypes"
              :key="annotationType.id"
              :value="String(annotationType.id)"
            >
              <template #title>
                <!-- LEARNING: Always show static name in expansion panel title -->
                <!-- WHY: Name field editing happens in expanded content, not in panel title -->
                <!-- PATTERN: Show static entity name - editing happens in expanded content below -->
                <span>{{ annotationType.name || `Annotation Type ${annotationType.id}` }}</span>
              </template>
              
              <template #text>
                <AnnotationTypeCard
                  :annotation-type="annotationType"
                  @delete="handleDeleteAnnotationType"
                />
              </template>
            </VExpansionPanel>
          </VExpansionPanels>
          
          <!--
            LEARNING: Empty state display
            WHY: Provides feedback when no results match search or no data exists
            PATTERN: Conditional rendering with v-else - matches Block and Part tabs
          -->
          <VAlert
            v-else
            type="info"
            variant="tonal"
            class="mt-4"
          >
            No annotations found. Create one to get started.
          </VAlert>
        </div>
      </VWindowItem>
    </VWindow>
    
    <!--
      LEARNING: Global PartInstance Metadata Configuration Modal
      WHY: Single modal for configuring all PartInstance field definitions globally
      PATTERN: Global config modal triggered from section header, field definitions only mode
    -->
    <MetadataEditModal
      v-model="partInstanceMetadataModalOpen"
      entity-key="partShape"
      :entity="{ id: PART_SHAPE_GLOBAL_CONFIG_ID } as GlobalEntity<'partShape'>"
      mode="global"
      entity-name="Part Instance Fields (Global)"
      @saved="handlePartInstanceMetadataSaved"
    />
  </div>
</template>

<style scoped>
.shapes-tab {
  margin-top: 1rem;
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

.drag-drop-container {
  position: relative;
}

.draggable-block-shape,
.draggable-part-shape {
  transition: transform 0.2s;
  cursor: move;
}

.draggable-block-shape:hover,
.draggable-part-shape:hover {
  opacity: 0.8;
}

.new-shape-card {
  border: 2px dashed rgb(var(--v-theme-primary));
  background-color: rgba(var(--v-theme-primary), 0.05);
}

.title-field-input :deep(.v-field__input) {
  padding: 0 !important;
  min-height: auto !important;
}

.title-field-input :deep(.v-field) {
  padding: 0 !important;
  box-shadow: none !important;
}
</style>
