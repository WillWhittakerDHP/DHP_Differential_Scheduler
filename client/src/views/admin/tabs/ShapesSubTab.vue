<!--
  LEARNING: Shapes Sub-Tab Component for PartShape and AnnotationShape Management
  WHY: Provides interface for managing PartShapes and AnnotationShapes with CRUD operations
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
import MetadataEditModal from '@/components/admin/MetadataEditModal.vue'
import { PART_SHAPE_GLOBAL_CONFIG_ID, BLOCK_SHAPE_GLOBAL_CONFIG_ID, PART_INSTANCE_GLOBAL_CONFIG_ID } from '@/utils/entities/entityTypeMapping'
import { getDefaultEntityValues } from '@/utils/entityDefaults'
import { useAnnotationTypes, useUpdateAnnotationType, useCreateAnnotationType } from '@/composables/useAnnotationType'
import { useNotification } from '@/composables/useNotification'

// NOTE: useEntityDisplay removed - display names handled by useShapeDisplayNames

/**
 * LEARNING: Use entity filtering composable for PartShape and BlockShape
 * WHY: Extracts filtering and sorting logic from component to generic composable
 * PATTERN: Generic composable provides filtered and sorted entity arrays
 */
const { filteredEntities: filteredPartShapes } = useEntityFiltering('partShape')
const { filteredEntities: filteredBlockShapes } = useEntityFiltering('blockShape')

/**
 * LEARNING: Use shape display names composable
 * WHY: Extracts display names map logic from component to composable
 * PATTERN: Composable provides computed maps of entity IDs to display names
 */
const { partShapeDisplayNames, blockShapeDisplayNames } = useShapeDisplayNames()

/**
 * LEARNING: Entity CRUD composable for PartShape and BlockShape
 * WHY: Provides orderIndex operations for drag-and-drop and update operations for title field
 * PATTERN: useEntityCrud composable wraps Vue Query mutations
 * NOTE: EntityCard handles deletion internally, so we only need patchOrderIndex and update here
 */
const { patchOrderIndex: patchPartShapeOrderIndex } = useEntityCrud('partShape')
const { patchOrderIndex: patchBlockShapeOrderIndex } = useEntityCrud('blockShape')

/**
 * LEARNING: Reactive tab state management
 * WHY: Tracks which tab is currently active (blockShapes, partShapes, or annotationShapes)
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
 * LEARNING: Track if the global BlockShape metadata modal is open
 * WHY: Single modal for configuring all BlockShape field definitions globally
 * PATTERN: Simple boolean ref for single modal state
 */
const blockShapeMetadataModalOpen = ref(false)

/**
 * LEARNING: Toggle global BlockShape metadata modal
 * WHY: Opens/closes the modal for configuring all BlockShape field definitions
 */
const toggleBlockShapeMetadataModal = (): void => {
  blockShapeMetadataModalOpen.value = !blockShapeMetadataModalOpen.value
}

/**
 * LEARNING: Track if the global PartShape metadata modal is open
 * WHY: Single modal for configuring all PartShape field definitions globally
 * PATTERN: Simple boolean ref for single modal state
 */
const partShapeMetadataModalOpen = ref(false)

/**
 * LEARNING: Toggle global PartShape metadata modal
 * WHY: Opens/closes the modal for configuring all PartShape field definitions
 */
const togglePartShapeMetadataModal = (): void => {
  partShapeMetadataModalOpen.value = !partShapeMetadataModalOpen.value
}

/**
 * LEARNING: Track if the global PartInstance metadata modal is open
 * WHY: Single modal for configuring all PartInstance field definitions globally
 * PATTERN: Simple boolean ref for single modal state
 */
const partInstanceMetadataModalOpen = ref(false)

/**
 * LEARNING: Toggle global PartInstance metadata modal
 * WHY: Opens/closes the modal for configuring all PartInstance field definitions
 */
const togglePartInstanceMetadataModal = (): void => {
  partInstanceMetadataModalOpen.value = !partInstanceMetadataModalOpen.value
}

/**
 * LEARNING: Handle PartInstance metadata saved
 * WHY: Close modal after saving field definitions
 */
const handlePartInstanceMetadataSaved = () => {
  // LEARNING: MetadataEditModal emits 'saved' with no parameters
  // WHY: Modal doesn't need to pass entity back, just signals that save completed
  // PATTERN: Handler matches emit signature (no parameters)
  partInstanceMetadataModalOpen.value = false
}

/**
 * LEARNING: Inline creation state for shape types
 * WHY: Instead of dialogs, show inline EntityCards for creating new entities
 * PATTERN: Boolean flags and initial values for each entity type
 */
const isCreatingPartShape = ref(false)
const isCreatingAnnotationShape = ref(false)
const newPartShapeInitialValues = ref<GlobalEntity<'partShape'> | null>(null)
const newAnnotationShapeName = ref('')

/**
 * LEARNING: Create annotation shape mutation
 */
const createAnnotationShapeMutation = useCreateAnnotationType()

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
 * LEARNING: Function to start inline AnnotationShape creation
 */
const createAnnotationShape = () => {
  newAnnotationShapeName.value = ''
  isCreatingAnnotationShape.value = true
  expandedShapes.value = ['new-annotationShape', ...expandedShapes.value]
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
 * LEARNING: Handle AnnotationShape creation save
 */
const handleAnnotationShapeCreate = async () => {
  if (!newAnnotationShapeName.value.trim()) return
  
  try {
    await createAnnotationShapeMutation.mutateAsync({ name: newAnnotationShapeName.value.trim() })
    success('Annotation shape created successfully')
    isCreatingAnnotationShape.value = false
    newAnnotationShapeName.value = ''
    expandedShapes.value = expandedShapes.value.filter(id => id !== 'new-annotationShape')
  } catch (error) {
    // Failed to create annotation shape
  }
}

/**
 * LEARNING: Handle AnnotationShape creation cancel
 */
const handleAnnotationShapeCancelled = () => {
  isCreatingAnnotationShape.value = false
  newAnnotationShapeName.value = ''
  expandedShapes.value = expandedShapes.value.filter(id => id !== 'new-annotationShape')
}

/**
 * LEARNING: Fetch annotation shapes
 * WHY: Get all annotation shapes for display
 * PATTERN: useQuery hook from Vue Query
 * NOTE: API still uses "types" endpoint, but we refer to them as "shapes" in the UI
 */
// LEARNING: Avoid destructuring `data = []` from vue-query (creates a union that breaks `.value` access).
const annotationShapesQuery = useAnnotationTypes()
const annotationShapes = computed(() => annotationShapesQuery.data.value ?? [])
const isLoadingAnnotationShapes = computed(() => annotationShapesQuery.isLoading.value)

/**
 * LEARNING: Update annotation shape mutation
 * WHY: Provides update operation for annotation shape name editing
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
const partShapesContainer = ref<HTMLElement | null>(null)
const annotationShapesContainer = ref<HTMLElement | null>(null)

/**
 * LEARNING: Refs for actual VExpansionPanels DOM elements
 * WHY: VExpansionPanels component creates .v-expansion-panels element that contains the panels
 * PATTERN: Create refs that point to the actual DOM container elements (not component instances)
 */
const partShapesPanelsContainer = ref<HTMLElement | null>(null)
const annotationShapesPanelsContainer = ref<HTMLElement | null>(null)

// LEARNING: getPanelsElement moved to useDragAndDrop composable
// WHY: Extracted to composable for better organization

/**
 * LEARNING: Reactive arrays for drag-and-drop
 * WHY: Need mutable arrays that can be reordered during drag operations
 * PATTERN: ref arrays that sync with computed filtered results
 */
const partShapesList = ref<GlobalEntity<'partShape'>[]>([])

/**
 * LEARNING: Reactive ID arrays for drag-and-drop
 * WHY: @formkit/drag-and-drop uses ID arrays to track order
 * PATTERN: ref arrays of entity IDs that stay in sync with entity arrays
 */
const partShapeIds = ref<string[]>([])

// LEARNING: Filtered shapes and display names moved to composables
// WHY: Extracted to composables for better organization

// LEARNING: Use entity drag handlers composables
// WHY: Extracts drag end handling logic from component to generic composables
// PATTERN: Generic composable provides drag end handlers and array syncing
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
  filteredEntities: filteredPartShapes,
  dragHandlers: partShapesDragHandlers
})

// LEARNING: Use drag-and-drop composables
// WHY: Extracts drag-and-drop initialization and cleanup logic from component to composables
// PATTERN: Composable handles all drag-and-drop setup, watchers, and cleanup
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
 * LEARNING: Computed property for filtered annotation shapes
 * WHY: Filters annotation shapes by search term
 * PATTERN: Computed property with data transformation
 * LEARNING: Add guards to handle undefined/edge cases during component transitions
 * WHY: Prevents errors when Vue is rendering/unmounting components during VWindow transitions
 */
const filteredAnnotationShapes = computed(() => {
  // LEARNING: Guard against undefined annotationShapes during transitions
  // WHY: Prevents errors when component is mounting/unmounting
  // PATTERN: Check that annotationShapes is an array before spreading
  if (!Array.isArray(annotationShapes.value)) {
    return []
  }
  
  return [...annotationShapes.value]
})

// LEARNING: isPanelExpanded is now provided by useExpansionState composable

// LEARNING: Removed manual form and context creation
// WHY: EntityCard handles all form and context creation through DynamicFormInputs
// PATTERN: Trust the unified system - EntityCard creates its own form and contexts internally

/**
 * WHY: Event handler for deleting AnnotationShape
WHY: AnnotationTypeCard handles deletion internally, this is just a notification handler
PATTERN: No-op handler - card handles all deletion logic
 */
function handleDeleteAnnotationShape(_id: string) {
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
  <div class="shapes-sub-tab">
    <!--
      LEARNING: VTabs component for tab navigation
      WHY: Provides tabbed interface to switch between PartShapes and AnnotationShapes
      PATTERN: v-model binds to reactive ref for two-way data binding
    -->
    <VTabs v-model="activeTab" class="mb-4">
      <VTab value="blockShapes">
        🧱 Block ({{ filteredBlockShapes.length }})
      </VTab>
      <VTab value="partShapes">
        🧩 Part ({{ filteredPartShapes.length }})
      </VTab>
      <VTab value="annotationShapes">
        🏷️ Annotations ({{ filteredAnnotationShapes.length }})
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
          <div class="d-flex gap-2">
            <!-- LEARNING: Global button to configure all BlockShape fields -->
            <!-- WHY: Single config applies to all BlockShapes globally -->
            <!-- PATTERN: Global config modal triggered from section header -->
            <VBtn
              :variant="blockShapeMetadataModalOpen ? 'flat' : 'outlined'"
              :color="blockShapeMetadataModalOpen ? 'primary' : 'default'"
              prepend-icon="tabler-settings"
              @click="toggleBlockShapeMetadataModal"
            >
              Metadata Edit
            </VBtn>
          </div>
        </div>
        
        <!--
          LEARNING: BlockShapes list display
          WHY: Shows all BlockShapes for metadata configuration reference
          PATTERN: Simple list display (no drag-and-drop needed for metadata editing)
        -->
        <VAlert
          type="info"
          variant="tonal"
          class="mt-4"
        >
          Configure BlockShape field metadata (composable, constituable, validCascades, validConstituents) using the Metadata Edit button above.
        </VAlert>
      </VWindowItem>
      
      <!-- PartShapes Tab Content -->
      <VWindowItem key="partShapes" value="partShapes">
        <div class="d-flex justify-space-between align-center mb-4">
          <h3 class="text-h6">Part</h3>
          <div class="d-flex gap-2">
            <!-- LEARNING: Global button to configure all PartShape fields -->
            <!-- WHY: Shape-level field configuration -->
            <!-- PATTERN: Global config modal triggered from section header -->
            <VBtn
              :variant="partShapeMetadataModalOpen ? 'flat' : 'outlined'"
              :color="partShapeMetadataModalOpen ? 'primary' : 'default'"
              prepend-icon="tabler-settings"
              @click="togglePartShapeMetadataModal"
            >
              Shape Fields
            </VBtn>
            <!-- LEARNING: Global button to configure all PartInstance fields -->
            <!-- WHY: Instance-level field configuration (zeroOutPart, onSite, etc.) -->
            <!-- PATTERN: Global config modal triggered from section header -->
            <VBtn
              :variant="partInstanceMetadataModalOpen ? 'flat' : 'outlined'"
              :color="partInstanceMetadataModalOpen ? 'primary' : 'default'"
              prepend-icon="tabler-settings"
              @click="togglePartInstanceMetadataModal"
            >
              Instance Fields
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
          <!-- LEARNING: EntityCard is now self-contained with its own VExpansionPanel -->
          <!-- WHY: EntityCard wraps itself in VExpansionPanel and renders its own titleRow fields -->
          <!-- PATTERN: Use EntityCard directly - no need for parent VExpansionPanel wrapper -->
          <!-- NOTE: For new instances, use useExpansionPanel=false since they're always expanded -->
          <EntityCard
            v-if="isCreatingPartShape"
            key="new-partShape"
            entity-key="partShape"
            :entity="newPartShapeInitialValues!"
            :is-new="true"
            :expanded="true"
            :use-expansion-panel="false"
            class="new-shape-card"
            @saved="handlePartShapeCreated"
            @cancelled="handlePartShapeCancelled"
          />
          
          <!-- Existing PartShapes -->
          <EntityCard
            v-for="partShape in partShapesList"
            :key="String(partShape.id)"
            :class="`draggable-part-shape`"
            :data-drag-id="String(partShape.id)"
            entity-key="partShape"
            :entity="partShape"
            :expanded="isPanelExpanded(String(partShape.id))"
            @saved="handleExistingShapeSaved"
            @delete="handleDeletePartShape"
          />
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
      
      <!-- AnnotationShapes Tab Content -->
      <VWindowItem key="annotationShapes" value="annotationShapes">
        <div class="d-flex justify-space-between align-center mb-4">
          <h3 class="text-h6">Annotations</h3>
          <VBtn
            color="primary"
            prepend-icon="tabler-plus"
            @click="createAnnotationShape"
          >
            Create Annotation Shape
          </VBtn>
        </div>
        
        <!--
          LEARNING: VExpansionPanels for grouped display (matching Part tab)
          WHY: Provides expandable/collapsible cards for AnnotationShapes with consistent UI
          PATTERN: v-model binds to expandedShapes array, multiple allows multiple expanded cards
          LEARNING: Use same structure as Part Shapes for consistency
        -->
        <div ref="annotationShapesContainer" class="drag-drop-container">
          <div v-if="isLoadingAnnotationShapes" class="text-center py-4">
            <VProgressCircular indeterminate />
          </div>
          
          <VExpansionPanels 
            v-else-if="isCreatingAnnotationShape || filteredAnnotationShapes.length > 0"
            ref="annotationShapesPanelsContainer"
            v-model="expandedShapes" 
            multiple 
          >
            <!-- Inline creation card for AnnotationShape -->
            <VExpansionPanel
              v-if="isCreatingAnnotationShape"
              key="new-annotationShape"
              value="new-annotationShape"
              class="new-shape-card"
            >
              <template #title>
                <div class="d-flex align-center gap-2 flex-grow-1">
                  <VIcon icon="tabler-plus" size="small" color="primary" />
                  <span class="text-primary font-weight-medium">New Annotation Shape</span>
                </div>
              </template>
              
              <template #text>
                <div class="d-flex align-center gap-3">
                  <VTextField
                    v-model="newAnnotationShapeName"
                    label="Name"
                    variant="outlined"
                    density="compact"
                    class="flex-grow-1"
                    @keyup.enter="handleAnnotationShapeCreate"
                  />
                  <VBtn
                    color="primary"
                    :loading="createAnnotationShapeMutation.isPending.value"
                    :disabled="!newAnnotationShapeName.trim()"
                    @click="handleAnnotationShapeCreate"
                  >
                    Create
                  </VBtn>
                  <VBtn
                    variant="outlined"
                    @click="handleAnnotationShapeCancelled"
                  >
                    Cancel
                  </VBtn>
                </div>
              </template>
            </VExpansionPanel>
            
            <!-- Existing AnnotationShapes - inline edit using AnnotationTypeCard -->
            <VExpansionPanel
              v-for="annotationShape in filteredAnnotationShapes"
              :key="annotationShape.id"
              :value="String(annotationShape.id)"
            >
              <template #title>
                <!-- LEARNING: Always show static name in expansion panel title -->
                <!-- WHY: Name field editing happens in expanded content, not in panel title -->
                <!-- PATTERN: Show static entity name - editing happens in expanded content below -->
                <span>{{ annotationShape.name || `Annotation Shape ${annotationShape.id}` }}</span>
              </template>
              
              <template #text>
                <AnnotationTypeCard
                  :annotation-type="annotationShape"
                  @delete="handleDeleteAnnotationShape"
                />
              </template>
            </VExpansionPanel>
          </VExpansionPanels>
          
          <!--
            LEARNING: Empty state display
            WHY: Provides feedback when no results match search or no data exists
            PATTERN: Conditional rendering with v-else - matches Part tab
          -->
          <VAlert
            v-else
            type="info"
            variant="tonal"
            class="mt-4"
          >
            No annotation shapes found. Create one to get started.
          </VAlert>
        </div>
      </VWindowItem>
    </VWindow>
    
    <!--
      LEARNING: Global BlockShape Metadata Configuration Modal
      WHY: Single modal for configuring all BlockShape field definitions globally
      PATTERN: Global config modal triggered from section header, field definitions only mode
    -->
    <MetadataEditModal
      v-model="blockShapeMetadataModalOpen"
      entity-key="blockShape"
      :entity="{ id: BLOCK_SHAPE_GLOBAL_CONFIG_ID } as GlobalEntity<'blockShape'>"
      mode="global"
      entity-name="Block Shape Fields (Global)"
      @saved="() => blockShapeMetadataModalOpen = false"
    />
    
    <!--
      LEARNING: Global PartShape Metadata Configuration Modal
      WHY: Single modal for configuring all PartShape field definitions globally
      PATTERN: Global config modal triggered from section header, field definitions only mode
    -->
    <MetadataEditModal
      v-model="partShapeMetadataModalOpen"
      entity-key="partShape"
      :entity="{ id: PART_SHAPE_GLOBAL_CONFIG_ID } as GlobalEntity<'partShape'>"
      mode="global"
      entity-name="Part Shape Fields (Global)"
      @saved="() => partShapeMetadataModalOpen = false"
    />
    
    <!--
      LEARNING: Global PartInstance Metadata Configuration Modal
      WHY: Single modal for configuring all PartInstance field definitions globally
      PATTERN: Global config modal triggered from section header, field definitions only mode
    -->
    <MetadataEditModal
      v-model="partInstanceMetadataModalOpen"
      entity-key="partInstance"
      :entity="{ id: PART_INSTANCE_GLOBAL_CONFIG_ID, entityKey: 'partInstance' } as GlobalEntity<'partInstance'>"
      mode="global"
      entity-name="Part Instance Fields (Global)"
      @saved="handlePartInstanceMetadataSaved"
    />
  </div>
</template>

<style scoped>
.shapes-sub-tab {
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

.draggable-part-shape {
  transition: transform 0.2s;
  cursor: move;
}

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

