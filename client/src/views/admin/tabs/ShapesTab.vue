<!--
  LEARNING: Shapes Tab Component for BlockShape, PartShape, and AnnotationShape Management
  WHY: Provides interface for managing BlockShapes, PartShapes, and AnnotationShapes with CRUD operations
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
import MetadataEditModal from '@/components/admin/MetadataEditModal.vue'
import { PART_SHAPE_GLOBAL_CONFIG_ID, BLOCK_SHAPE_GLOBAL_CONFIG_ID, PART_INSTANCE_GLOBAL_CONFIG_ID, ANNOTATION_SHAPE_GLOBAL_CONFIG_ID } from '@/utils/entities/entityTypeMapping'
import { getDefaultEntityValues } from '@/utils/entityDefaults'
import { useNotification } from '@/composables/useNotification'
import type { EventShape } from '@/types/events'

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
const { partShapeDisplayNames: _partShapeDisplayNames, blockShapeDisplayNames: _blockShapeDisplayNames } = useShapeDisplayNames()

/**
 * LEARNING: Entity CRUD composable for PartShape and BlockShape
 * WHY: Provides orderIndex operations for drag-and-drop and update operations for title field
 * PATTERN: useEntityCrud composable wraps Vue Query mutations
 * NOTE: EntityCard handles deletion internally, so we only need patchOrderIndex and update here
 */
const { patchOrderIndex: patchPartShapeOrderIndex } = useEntityCrud('partShape')
const { patchOrderIndex: patchBlockShapeOrderIndex } = useEntityCrud('blockShape')

/**
 * LEARNING: Entity CRUD composable for AnnotationShape
 * WHY: Provides entities list and create/update/delete operations
 * PATTERN: useEntityCrud composable wraps Vue Query mutations
 */
const annotationShapesComposable = useEntityCrud('annotationShape')
const annotationShapes = annotationShapesComposable.entities
const isLoadingAnnotationShapes = annotationShapesComposable.isLoading
const createAnnotationShapeMutation = annotationShapesComposable.create

/**
 * LEARNING: Entity CRUD composable for EventShape
 * WHY: Provides entities list and create/update/delete operations
 * PATTERN: useEntityCrud composable wraps Vue Query mutations
 */
const eventShapesComposable = useEntityCrud('eventShape')
const eventShapes = eventShapesComposable.entities
const isLoadingEventShapes = eventShapesComposable.isLoading
const createEventShapeMutation = eventShapesComposable.create

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
 * LEARNING: Track if the global AnnotationShape metadata modal is open
 * WHY: Single modal for configuring all AnnotationShape field definitions globally
 * PATTERN: Simple boolean ref for single modal state
 */
const annotationShapeMetadataModalOpen = ref(false)

/**
 * LEARNING: Toggle global AnnotationShape metadata modal
 * WHY: Opens/closes the modal for configuring all AnnotationShape field definitions
 */
const toggleAnnotationShapeMetadataModal = (): void => {
  annotationShapeMetadataModalOpen.value = !annotationShapeMetadataModalOpen.value
}

/**
 * LEARNING: Track if the global EventShape metadata modal is open
 * WHY: Single modal for configuring all EventShape field definitions globally
 * PATTERN: Simple boolean ref for single modal state
 */
const eventShapeMetadataModalOpen = ref(false)

/**
 * LEARNING: Toggle global EventShape metadata modal
 * WHY: Opens/closes the modal for configuring all EventShape field definitions
 */
const toggleEventShapeMetadataModal = (): void => {
  eventShapeMetadataModalOpen.value = !eventShapeMetadataModalOpen.value
}

/**
 * LEARNING: Inline creation state for shape types
 * WHY: Instead of dialogs, show inline EntityCards for creating new entities
 * PATTERN: Boolean flags and initial values for each entity type
 */
const isCreatingPartShape = ref(false)
const isCreatingAnnotationShape = ref(false)
const isCreatingEventShape = ref(false)
const newPartShapeInitialValues = ref<GlobalEntity<'partShape'> | null>(null)
const newAnnotationShapeName = ref('')
const newEventShapeName = ref('')

// LEARNING: Events and annotations are now core entities, use entity CRUD composable
// (Already defined above with useEntityCrud)
const isCreatingAnnotationShapeLoading = ref(false)
const isCreatingEventShapeLoading = ref(false)


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
 * WHY: Renamed to avoid conflict with mutation function
 * PATTERN: Use descriptive name that indicates this starts the creation UI flow
 */
const startCreatingAnnotationShape = () => {
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
 * WHY: Uses mutation function from useEntityCrud composable
 * PATTERN: Call mutation function with entity data
 */
const handleAnnotationShapeCreate = async () => {
  if (!newAnnotationShapeName.value.trim()) return
  
  isCreatingAnnotationShapeLoading.value = true
  try {
    await createAnnotationShapeMutation({
      name: newAnnotationShapeName.value.trim(),
      orderIndex: 0,
      active: true,
      entityKey: 'annotationShape' as const
    })
    success('Annotation shape created successfully')
    isCreatingAnnotationShape.value = false
    newAnnotationShapeName.value = ''
    expandedShapes.value = expandedShapes.value.filter(id => id !== 'new-annotationShape')
  } catch (error) {
    // Failed to create annotation shape
  } finally {
    isCreatingAnnotationShapeLoading.value = false
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
 * LEARNING: Function to start inline EventShape creation
 * WHY: Renamed to avoid conflict with mutation function
 * PATTERN: Use descriptive name that indicates this starts the creation UI flow
 */
const startCreatingEventShape = () => {
  newEventShapeName.value = ''
  isCreatingEventShape.value = true
  expandedShapes.value = ['new-eventShape', ...expandedShapes.value]
}

/**
 * LEARNING: Handle EventShape creation save
 * WHY: Uses mutation function from useEntityCrud composable
 * PATTERN: Call mutation function with entity data
 */
const handleEventShapeCreate = async () => {
  if (!newEventShapeName.value.trim()) return
  
  isCreatingEventShapeLoading.value = true
  try {
    await createEventShapeMutation({
      name: newEventShapeName.value.trim(),
      orderIndex: 0,
      active: true,
      entityKey: 'eventShape' as const
    })
    success('Event shape created successfully')
    isCreatingEventShape.value = false
    newEventShapeName.value = ''
    expandedShapes.value = expandedShapes.value.filter(id => id !== 'new-eventShape')
  } catch (error) {
    // Failed to create event shape
  } finally {
    isCreatingEventShapeLoading.value = false
  }
}

/**
 * LEARNING: Handle EventShape creation cancel
 */
const handleEventShapeCancelled = () => {
  isCreatingEventShape.value = false
  newEventShapeName.value = ''
  expandedShapes.value = expandedShapes.value.filter(id => id !== 'new-eventShape')
}


// NOTE: Annotation shapes and event shapes are loaded above via useEntityCrud

// LEARNING: Dialogs removed in favor of inline EntityCard creation
// WHY: Unified component pattern - all create/edit happens in EntityCard

/**
 * LEARNING: Template refs for drag-and-drop containers
 * WHY: Need DOM references to initialize drag-and-drop
 * PATTERN: Template refs for container divs that wrap VExpansionPanels
 */
const partShapesContainer = ref<HTMLElement | null>(null)
const blockShapesContainer = ref<HTMLElement | null>(null)
const annotationShapesContainer = ref<HTMLElement | null>(null)

/**
 * LEARNING: Refs for actual VExpansionPanels DOM elements
 * WHY: VExpansionPanels component creates .v-expansion-panels element that contains the panels
 * PATTERN: Create refs that point to the actual DOM container elements (not component instances)
 */
const partShapesPanelsContainer = ref<HTMLElement | null>(null)
const blockShapesPanelsContainer = ref<HTMLElement | null>(null)
const annotationShapesPanelsContainer = ref<HTMLElement | null>(null)

// LEARNING: getPanelsElement moved to useDragAndDrop composable
// WHY: Extracted to composable for better organization

/**
 * LEARNING: Reactive arrays for drag-and-drop
 * WHY: Need mutable arrays that can be reordered during drag operations
 * PATTERN: ref arrays that sync with computed filtered results
 */
const partShapesList = ref<GlobalEntity<'partShape'>[]>([])
const blockShapesList = ref<GlobalEntity<'blockShape'>[]>([])

/**
 * LEARNING: Reactive ID arrays for drag-and-drop
 * WHY: @formkit/drag-and-drop uses ID arrays to track order
 * PATTERN: ref arrays of entity IDs that stay in sync with entity arrays
 */
const partShapeIds = ref<string[]>([])
const blockShapeIds = ref<string[]>([])

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

const blockShapesDragHandlers = useEntityDragHandlers({
  entityIds: blockShapeIds,
  entityList: blockShapesList,
  filteredEntities: filteredBlockShapes,
  patchOrderIndex: patchBlockShapeOrderIndex
})

// LEARNING: Use entity tab state composable for array syncing watchers
// WHY: Extracts watcher logic from component to generic composable
// PATTERN: Generic composable handles array syncing watchers
useEntityTabState({
  filteredEntities: filteredPartShapes,
  dragHandlers: partShapesDragHandlers
})

useEntityTabState({
  filteredEntities: filteredBlockShapes,
  dragHandlers: blockShapesDragHandlers
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

const { isMounted: _blockShapesMounted } = useDragAndDrop({
  containerRef: blockShapesContainer,
  panelsContainerRef: blockShapesPanelsContainer,
  entityIds: blockShapeIds,
  entityList: blockShapesList,
  filteredEntities: filteredBlockShapes,
  dragEndHandler: blockShapesDragHandlers.handleDragEnd,
  group: 'blockShapes',
  draggableClass: 'draggable-block-shape'
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
 * LEARNING: Event handler for deleting BlockShape
 * WHY: EntityCard already handles deletion internally, this is just a notification handler
 * PATTERN: No-op handler - EntityCard handles all deletion logic including confirmation
 * NOTE: EntityCard emits 'delete' event after successful deletion for parent awareness
 */
function handleDeleteBlockShape(_id: string) {
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

/**
 * LEARNING: Computed property for event shapes with transition guards
 * WHY: Ensures safe access during VWindow transitions
 * PATTERN: Guard against undefined eventShapes during component mounting/unmounting
 */
const safeEventShapes = computed(() => {
  // LEARNING: Guard against undefined eventShapes during transitions
  // WHY: Prevents errors when component is mounting/unmounting
  // PATTERN: Check that eventShapes is an array before accessing
  if (!Array.isArray(eventShapes.value)) {
    return []
  }
  
  return eventShapes.value
})

/**
 * LEARNING: Computed properties for tab labels with safe counts
 * WHY: Ensures tab labels are always safe to render during transitions
 * PATTERN: Computed properties that return safe string values
 */
const blockShapesTabLabel = computed(() => `🧱 Block (${filteredBlockShapes.value.length})`)
const partShapesTabLabel = computed(() => `🧩 Part (${filteredPartShapes.value.length})`)
const annotationShapesTabLabel = computed(() => `🏷️ Annotations (${filteredAnnotationShapes.value.length})`)
const eventShapesTabLabel = computed(() => `📅 Events (${safeEventShapes.value.length})`)

// LEARNING: isPanelExpanded is now provided by useExpansionState composable

// LEARNING: Removed manual form and context creation
// WHY: EntityCard handles all form and context creation through DynamicFormInputs
// PATTERN: Trust the unified system - EntityCard creates its own form and contexts internally

/**
 * LEARNING: Event handler for deleting AnnotationShape
 * WHY: EntityCard handles deletion internally, this is just a notification handler
 * PATTERN: No-op handler - card handles all deletion logic
 */
function handleDeleteAnnotationShape(_id: string) {
  // EntityCard already handled the deletion - this is just for parent awareness
  // Vue Query will automatically refetch and update the UI
}

/**
 * LEARNING: Event handler for deleting EventShape
 * WHY: EntityCard handles deletion internally, this is just a notification handler
 * PATTERN: No-op handler - card handles all deletion logic
 */
function handleDeleteEventShape(_id: string) {
  // EntityCard already handled the deletion - this is just for parent awareness
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
      WHY: Provides tabbed interface to switch between PartShapes and AnnotationShapes
      PATTERN: v-model binds to reactive ref for two-way data binding
    -->
    <VTabs v-model="activeTab" class="mb-4">
      <VTab key="blockShapes" value="blockShapes">
        {{ blockShapesTabLabel }}
      </VTab>
      <VTab key="partShapes" value="partShapes">
        {{ partShapesTabLabel }}
      </VTab>
      <VTab key="annotationShapes" value="annotationShapes">
        {{ annotationShapesTabLabel }}
      </VTab>
      <VTab key="eventShapes" value="eventShapes">
        {{ eventShapesTabLabel }}
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
              Shape Fields
            </VBtn>
          </div>
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
            v-if="blockShapesList.length > 0"
          >
            <!-- Existing BlockShapes -->
            <EntityCard
              v-for="blockShape in blockShapesList"
              :key="String(blockShape.id)"
              :class="`draggable-block-shape`"
              :data-drag-id="String(blockShape.id)"
              entity-key="blockShape"
              :entity="blockShape"
              :expanded="isPanelExpanded(String(blockShape.id))"
              @saved="handleExistingShapeSaved"
              @delete="handleDeleteBlockShape"
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
            No BlockShapes found. BlockShapes are created automatically when BlockInstances are created.
          </VAlert>
        </div>
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
          
          <!--
            LEARNING: PartShape Fields Preview Card
            WHY: Shows configured partShape fields at bottom of tab for easy reference
            PATTERN: EntityCard with global config ID to display all partShape field configurations
          -->
          <VDivider class="my-6" />
          <VExpansionPanels v-model="expandedShapes" multiple>
            <EntityCard
              entity-key="partShape"
              :entity="{ id: PART_SHAPE_GLOBAL_CONFIG_ID } as GlobalEntity<'partShape'>"
              :expanded="isPanelExpanded(PART_SHAPE_GLOBAL_CONFIG_ID)"
            />
          </VExpansionPanels>
        </div>
      </VWindowItem>
      
      <!-- AnnotationShapes Tab Content -->
      <VWindowItem key="annotationShapes" value="annotationShapes">
        <div class="d-flex justify-space-between align-center mb-4">
          <h3 class="text-h6">Annotations</h3>
          <div class="d-flex gap-2">
            <!-- LEARNING: Global button to configure all AnnotationShape fields -->
            <!-- WHY: Single config applies to all AnnotationShapes globally -->
            <!-- PATTERN: Global config modal triggered from section header -->
            <VBtn
              :variant="annotationShapeMetadataModalOpen ? 'flat' : 'outlined'"
              :color="annotationShapeMetadataModalOpen ? 'primary' : 'default'"
              prepend-icon="tabler-settings"
              @click="toggleAnnotationShapeMetadataModal"
            >
              Shape Fields
            </VBtn>
            <VBtn
              color="primary"
              prepend-icon="tabler-plus"
              @click="startCreatingAnnotationShape"
            >
              Create Annotation Shape
            </VBtn>
          </div>
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
                    :loading="isCreatingAnnotationShapeLoading"
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
            
            <!-- Existing AnnotationShapes -->
            <EntityCard
              v-for="annotationShape in filteredAnnotationShapes"
              :key="String(annotationShape.id)"
              :class="`draggable-annotation-shape`"
              :data-drag-id="String(annotationShape.id)"
              entity-key="annotationShape"
              :entity="annotationShape"
              :expanded="isPanelExpanded(String(annotationShape.id))"
              @saved="handleExistingShapeSaved"
              @delete="handleDeleteAnnotationShape"
            />
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
      
      <!-- EventShapes Tab Content -->
      <VWindowItem key="eventShapes" value="eventShapes">
        <div class="d-flex justify-space-between align-center mb-4">
          <h3 class="text-h6">Events</h3>
          <div class="d-flex gap-2">
            <!-- LEARNING: Global button to configure all EventShape fields -->
            <!-- WHY: Single config applies to all EventShapes globally -->
            <!-- PATTERN: Global config modal triggered from section header -->
            <VBtn
              :variant="eventShapeMetadataModalOpen ? 'flat' : 'outlined'"
              :color="eventShapeMetadataModalOpen ? 'primary' : 'default'"
              prepend-icon="tabler-settings"
              @click="toggleEventShapeMetadataModal"
            >
              Shape Fields
            </VBtn>
            <VBtn
              color="primary"
              prepend-icon="tabler-plus"
              @click="startCreatingEventShape"
            >
              Create Event Shape
            </VBtn>
          </div>
        </div>
        
        <!--
          LEARNING: Event Shapes Section
          WHY: Shows event shape definitions (e.g., OnSite, Moveable, ClientPresent)
          PATTERN: Similar to annotation shapes section
        -->
        <div class="mb-6">
          <h4 class="text-subtitle-1 mb-3">Event Shapes</h4>
          <div v-if="isLoadingEventShapes" class="text-center py-4">
            <VProgressCircular indeterminate />
          </div>
          
          <VExpansionPanels 
            v-else-if="isCreatingEventShape || safeEventShapes.length > 0"
            v-model="expandedShapes" 
            multiple 
          >
            <!-- Inline creation card for EventShape -->
            <VExpansionPanel
              v-if="isCreatingEventShape"
              key="new-eventShape"
              value="new-eventShape"
              class="new-shape-card"
            >
              <template #title>
                <div class="d-flex align-center gap-2 flex-grow-1">
                  <VIcon icon="tabler-plus" size="small" color="primary" />
                  <span class="text-primary font-weight-medium">New Event Shape</span>
                </div>
              </template>
              
              <template #text>
                <div class="d-flex align-center gap-3">
                  <VTextField
                    v-model="newEventShapeName"
                    label="Name"
                    variant="outlined"
                    density="compact"
                    class="flex-grow-1"
                    @keyup.enter="handleEventShapeCreate"
                  />
                  <VBtn
                    color="primary"
                    :loading="isCreatingEventShapeLoading"
                    :disabled="!newEventShapeName.trim()"
                    @click="handleEventShapeCreate"
                  >
                    Create
                  </VBtn>
                  <VBtn
                    variant="outlined"
                    @click="handleEventShapeCancelled"
                  >
                    Cancel
                  </VBtn>
                </div>
              </template>
            </VExpansionPanel>
            
            <!-- Existing EventShapes -->
            <EntityCard
              v-for="eventShape in safeEventShapes"
              :key="String(eventShape.id)"
              :class="`draggable-event-shape`"
              :data-drag-id="String(eventShape.id)"
              entity-key="eventShape"
              :entity="eventShape"
              :expanded="isPanelExpanded(String(eventShape.id))"
              @saved="handleExistingShapeSaved"
              @delete="handleDeleteEventShape"
            />
          </VExpansionPanels>
          
          <VAlert
            v-else
            type="info"
            variant="tonal"
            class="mt-4"
          >
            No event shapes found. Create one to get started.
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
      entity-name="Part Instance Fields (Global)"
      @saved="handlePartInstanceMetadataSaved"
    />
    
    <!--
      LEARNING: Global AnnotationShape Metadata Configuration Modal
      WHY: Single modal for configuring all AnnotationShape field definitions globally
      PATTERN: Global config modal triggered from section header, uses sentinel UUID
    -->
    <MetadataEditModal
      v-model="annotationShapeMetadataModalOpen"
      entity-key="annotationShape"
      :entity="{ id: ANNOTATION_SHAPE_GLOBAL_CONFIG_ID, name: 'Annotation Shape Fields (Global)', entityKey: 'annotationShape', orderIndex: 0, active: true }"
      entity-name="Annotation Shape Fields (Global)"
      @saved="() => annotationShapeMetadataModalOpen = false"
    />
    
    <!--
      LEARNING: Global EventShape Metadata Configuration Modal
      WHY: Single modal for configuring all EventShape field definitions globally
      PATTERN: Global config modal triggered from section header, uses sentinel UUID
    -->
    <MetadataEditModal
      v-model="eventShapeMetadataModalOpen"
      entity-key="eventShape"
      :entity="{ id: '00000000-0000-0000-0000-000000000010', name: 'Event Shape Fields (Global)', entityKey: 'eventShape', orderIndex: 0, active: true }"
      entity-name="Event Shape Fields (Global)"
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

.draggable-part-shape {
  transition: transform 0.2s;
  cursor: move;
}

.draggable-part-shape:hover {
  opacity: 0.8;
}

.draggable-block-shape {
  transition: transform 0.2s;
  cursor: move;
}

.draggable-block-shape:hover {
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

