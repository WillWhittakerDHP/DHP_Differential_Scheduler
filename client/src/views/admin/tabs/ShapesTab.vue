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
import EntityCard from '@/components/admin/generic/EntityCard.vue'
import AnnotationTypeCard from '../components/AnnotationTypeCard.vue'
import { getDefaultEntityValues } from '@/utils/entityDefaults'
import { useAnnotationTypes, useUpdateAnnotationType, useCreateAnnotationType } from '@/composables/useAnnotationType'
import { useNotification } from '@/composables/useNotification'

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
 * LEARNING: Notification composable for success/error messages
 */
const { success } = useNotification()

/**
 * LEARNING: Inline creation state for all shape types
 * WHY: Instead of dialogs, show inline EntityCards for creating new entities
 * PATTERN: Boolean flags and initial values for each entity type
 */
const isCreatingBlockShape = ref(false)
const isCreatingPartShape = ref(false)
const isCreatingAnnotationType = ref(false)
const newBlockShapeInitialValues = ref<GlobalEntity<'blockShape'> | null>(null)
const newPartShapeInitialValues = ref<GlobalEntity<'partShape'> | null>(null)
const newAnnotationTypeName = ref('')

/**
 * LEARNING: Create annotation type mutation
 */
const createAnnotationTypeMutation = useCreateAnnotationType()

/**
 * LEARNING: Function to start inline BlockShape creation
 */
const createBlockShape = () => {
  const defaults = getDefaultEntityValues('blockShape')
  newBlockShapeInitialValues.value = {
    ...defaults,
    id: `new-${Date.now()}` as string,
  } as GlobalEntity<'blockShape'>
  isCreatingBlockShape.value = true
  expandedShapes.value = ['new-blockShape', ...expandedShapes.value]
}

/**
 * LEARNING: Function to start inline PartShape creation
 */
const createPartShape = () => {
  const defaults = getDefaultEntityValues('partShape')
  newPartShapeInitialValues.value = {
    ...defaults,
    id: `new-${Date.now()}` as string,
  } as GlobalEntity<'partShape'>
  isCreatingPartShape.value = true
  expandedShapes.value = ['new-partShape', ...expandedShapes.value]
}

/**
 * LEARNING: Function to start inline AnnotationType creation
 */
const createAnnotationType = () => {
  newAnnotationTypeName.value = ''
  isCreatingAnnotationType.value = true
  expandedShapes.value = ['new-annotationType', ...expandedShapes.value]
}

/**
 * LEARNING: Handle BlockShape creation save
 */
const handleBlockShapeCreated = (_entity: GlobalEntity<GlobalEntityKey>) => {
  isCreatingBlockShape.value = false
  newBlockShapeInitialValues.value = null
  expandedShapes.value = expandedShapes.value.filter(id => id !== 'new-blockShape')
}

/**
 * LEARNING: Handle BlockShape creation cancel
 */
const handleBlockShapeCancelled = () => {
  isCreatingBlockShape.value = false
  newBlockShapeInitialValues.value = null
  expandedShapes.value = expandedShapes.value.filter(id => id !== 'new-blockShape')
}

/**
 * LEARNING: Handle PartShape creation save
 */
const handlePartShapeCreated = (_entity: GlobalEntity<GlobalEntityKey>) => {
  isCreatingPartShape.value = false
  newPartShapeInitialValues.value = null
  expandedShapes.value = expandedShapes.value.filter(id => id !== 'new-partShape')
}

/**
 * LEARNING: Handle PartShape creation cancel
 */
const handlePartShapeCancelled = () => {
  isCreatingPartShape.value = false
  newPartShapeInitialValues.value = null
  expandedShapes.value = expandedShapes.value.filter(id => id !== 'new-partShape')
}

/**
 * LEARNING: Handle AnnotationType creation save
 */
const handleAnnotationTypeCreate = async () => {
  if (!newAnnotationTypeName.value.trim()) return
  
  try {
    await createAnnotationTypeMutation.mutateAsync({ name: newAnnotationTypeName.value.trim() })
    success('Annotation type created successfully')
    isCreatingAnnotationType.value = false
    newAnnotationTypeName.value = ''
    expandedShapes.value = expandedShapes.value.filter(id => id !== 'new-annotationType')
  } catch (error) {
    // Failed to create annotation type
  }
}

/**
 * LEARNING: Handle AnnotationType creation cancel
 */
const handleAnnotationTypeCancelled = () => {
  isCreatingAnnotationType.value = false
  newAnnotationTypeName.value = ''
  expandedShapes.value = expandedShapes.value.filter(id => id !== 'new-annotationType')
}

/**
 * LEARNING: Fetch annotation types
 * WHY: Get all annotation types for display
 * PATTERN: useQuery hook from Vue Query
 */
// LEARNING: Avoid destructuring `data = []` from vue-query (creates a union that breaks `.value` access).
const annotationTypesQuery = useAnnotationTypes()
const annotationTypes = computed(() => annotationTypesQuery.data.value ?? [])
const isLoadingAnnotationTypes = computed(() => annotationTypesQuery.isLoading.value)

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
 * WHY: Event handler for deleting BlockShape
WHY: EntityCard already handles deletion internally, this is just a notification handler
PATTERN: No-op handler - EntityCard handles all deletion logic including confirmation
NOTE: EntityCard emits 'delete' event after successful deletion for parent awareness
 */
function handleDeleteBlockShape(_id: string) {
  // EntityCard already handled the deletion - this is just for parent awareness
  // Vue Query will automatically refetch and update the UI
}

/**
 * WHY: Event handler for deleting PartShape
WHY: EntityCard already handles deletion internally, this is just a notification handler
PATTERN: No-op handler - EntityCard handles all deletion logic including confirmation
NOTE: EntityCard emits 'delete' event after successful deletion for parent awareness
 */
function handleDeletePartShape(_id: string) {
  // EntityCard already handled the deletion - this is just for parent awareness
  // Vue Query will automatically refetch and update the UI
}

/**
 * LEARNING: Computed property for filtered annotation types
 * WHY: Filters annotation types by search term
 * PATTERN: Computed property with data transformation
 * LEARNING: Add guards to handle undefined/edge cases during component transitions
 * WHY: Prevents errors when Vue is rendering/unmounting components during VWindow transitions
 */
const filteredAnnotationTypes = computed(() => {
  // LEARNING: Guard against undefined annotationTypes during transitions
  // WHY: Prevents errors when component is mounting/unmounting
  // PATTERN: Check that annotationTypes is an array before spreading
  if (!Array.isArray(annotationTypes.value)) {
    return []
  }
  
  return [...annotationTypes.value]
})

// LEARNING: isPanelExpanded is now provided by useExpansionState composable

// LEARNING: Removed manual form and context creation
// WHY: EntityCard handles all form and context creation through DynamicFormInputs
// PATTERN: Trust the unified system - EntityCard creates its own form and contexts internally

/**
 * WHY: Event handler for deleting AnnotationType
WHY: AnnotationTypeCard handles deletion internally, this is just a notification handler
PATTERN: No-op handler - card handles all deletion logic
 */
function handleDeleteAnnotationType(_id: string) {
  // AnnotationTypeCard already handled the deletion - this is just for parent awareness
  // Vue Query will automatically refetch and update the UI
}

/**
 * LEARNING: Handle save on existing Shape - collapse the card
 * WHY: User expects card to collapse after saving changes
 * PATTERN: Remove entity ID from expandedShapes to collapse the panel
 */
function handleExistingShapeSaved(entity: GlobalEntity<GlobalEntityKey>) {
  // Collapse the card by removing from expanded list
  expandedShapes.value = expandedShapes.value.filter(id => id !== String(entity.id))
}
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
        🏷️ Annotations ({{ filteredAnnotationTypes.length }})
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
                :hide-title-field="true"
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
              </div>
            </template>
            
            <template #text>
              <EntityCard
                entity-key="blockShape"
                :entity="blockShape"
                :expanded="isPanelExpanded(String(blockShape.id))"
                :hide-title-field="true"
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
          <VBtn
            color="primary"
            prepend-icon="tabler-plus"
            @click="createPartShape"
          >
            Create Part Shape
          </VBtn>
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
                :hide-title-field="true"
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
              </div>
            </template>
            
            <template #text>
              <EntityCard
                entity-key="partShape"
                :entity="partShape"
                :expanded="isPanelExpanded(String(partShape.id))"
                :hide-title-field="true"
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
              v-for="annotationType in filteredAnnotationTypes"
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
