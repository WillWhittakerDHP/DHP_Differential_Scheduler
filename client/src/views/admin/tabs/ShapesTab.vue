<!--
  LEARNING: Shapes Tab Component for BlockShape, PartShape, and AnnotationShape Management
  WHY: Provides interface for managing BlockShapes, PartShapes, and AnnotationShapes with CRUD operations
  PATTERN: VTabs for tab navigation, VExpansionPanels for grouped display
  COMPARISON: React uses Ant Design Tabs. Vue uses Vuetify VTabs with VWindow
  RESOURCE: https://vuetifyjs.com/en/components/tabs/
-->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useEntityCrud } from '@/composables/entityCrud/useEntityCrud'
import { useEntityFiltering } from '@/composables/admin/useEntityFiltering'
import { useShapeDisplayNames } from '@/composables/admin/useShapeDisplayNames'
import { useDragAndDrop } from '@/composables/admin/useDragAndDrop'
import { useEntityDragHandlers } from '@/composables/admin/useEntityDragHandlers'
import { useExpansionState } from '@/composables/admin/useExpansionState'
import { useEntityTabState } from '@/composables/admin/useEntityTabState'
import { useShapesTabModals } from '@/composables/admin/useShapesTabModals'
import { useShapesTabCreation } from '@/composables/admin/useShapesTabCreation'
import { useShapesTabDeletion } from '@/composables/admin/useShapesTabDeletion'
import { toGlobalEntityId, type GlobalEntity } from '@/types/entities'
import EntityCard from '@/components/admin/generic/EntityCard.vue'
import MetadataEditModal from '@/components/admin/MetadataEditModal.vue'
import { PART_SHAPE_GLOBAL_CONFIG_ID, BLOCK_SHAPE_GLOBAL_CONFIG_ID, PART_INSTANCE_GLOBAL_CONFIG_ID, ANNOTATION_SHAPE_GLOBAL_CONFIG_ID } from '@/utils/entities/entityTypeMapping'
import { useNotification } from '@/composables/useNotification'
import { createLogger } from '@/utils/logger'

const logger = createLogger('ShapesTab')

const { filteredEntities: filteredPartShapes } = useEntityFiltering('partShape')
const { filteredEntities: filteredBlockShapes } = useEntityFiltering('blockShape')
const { partShapeDisplayNames: _partShapeDisplayNames, blockShapeDisplayNames: _blockShapeDisplayNames } = useShapeDisplayNames()
const { patchOrderIndex: patchPartShapeOrderIndex } = useEntityCrud('partShape')
const { patchOrderIndex: patchBlockShapeOrderIndex } = useEntityCrud('blockShape')
const annotationShapesComposable = useEntityCrud('annotationShape')
const annotationShapes = annotationShapesComposable.entities
const isLoadingAnnotationShapes = annotationShapesComposable.isLoading
const createAnnotationShapeMutation = annotationShapesComposable.create
const eventShapesComposable = useEntityCrud('eventShape')
const eventShapes = eventShapesComposable.entities
const isLoadingEventShapes = eventShapesComposable.isLoading
const createEventShapeMutation = eventShapesComposable.create
const activeTab = ref('blockShapes')
const expansionStateComposable = useExpansionState()
const { expandedEntities: expandedShapes, isPanelExpanded } = expansionStateComposable
const { success } = useNotification()

const modals = useShapesTabModals()
const {
  blockShapeMetadataModalOpen,
  partShapeMetadataModalOpen,
  partInstanceMetadataModalOpen,
  annotationShapeMetadataModalOpen,
  eventShapeMetadataModalOpen,
  toggleBlockShapeMetadataModal,
  togglePartShapeMetadataModal,
  togglePartInstanceMetadataModal,
  handlePartInstanceMetadataSaved,
  toggleAnnotationShapeMetadataModal,
  toggleEventShapeMetadataModal,
} = modals

const creation = useShapesTabCreation({
  expandedShapes,
  success,
  createAnnotationShapeMutation,
  createEventShapeMutation,
  logger,
})
const {
  isCreatingPartShape,
  isCreatingAnnotationShape,
  isCreatingEventShape,
  newPartShapeInitialValues,
  newAnnotationShapeName,
  newEventShapeName,
  isCreatingAnnotationShapeLoading,
  isCreatingEventShapeLoading,
  createPartShape,
  startCreatingAnnotationShape,
  handlePartShapeCreated,
  handlePartShapeCancelled,
  handleAnnotationShapeCreate,
  handleAnnotationShapeCancelled,
  startCreatingEventShape,
  handleEventShapeCreate,
  handleEventShapeCancelled,
} = creation

const deletion = useShapesTabDeletion({ expandedShapes })
const {
  handleDeletePartShape,
  handleDeleteBlockShape,
  handleDeleteAnnotationShape,
  handleDeleteEventShape,
  handleExistingShapeSaved,
} = deletion

const partShapesContainer = ref<HTMLElement | null>(null)
const blockShapesContainer = ref<HTMLElement | null>(null)
const annotationShapesContainer = ref<HTMLElement | null>(null)
void annotationShapesContainer.value
const partShapesPanelsContainer = ref<HTMLElement | null>(null)
const blockShapesPanelsContainer = ref<HTMLElement | null>(null)
const annotationShapesPanelsContainer = ref<HTMLElement | null>(null)
void annotationShapesPanelsContainer.value
const partShapesList = ref<GlobalEntity<'partShape'>[]>([])
const blockShapesList = ref<GlobalEntity<'blockShape'>[]>([])
const partShapeIds = ref<string[]>([])
const blockShapeIds = ref<string[]>([])

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
useEntityTabState({ filteredEntities: filteredPartShapes, dragHandlers: partShapesDragHandlers })
useEntityTabState({ filteredEntities: filteredBlockShapes, dragHandlers: blockShapesDragHandlers })
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

const filteredAnnotationShapes = computed(() =>
  Array.isArray(annotationShapes.value) ? [...annotationShapes.value] : []
)
const safeEventShapes = computed(() =>
  Array.isArray(eventShapes.value) ? eventShapes.value : []
)
const blockShapesTabLabel = computed(() => `🧱 Block (${filteredBlockShapes.value.length})`)
const partShapesTabLabel = computed(() => `🧩 Part (${filteredPartShapes.value.length})`)
const annotationShapesTabLabel = computed(() => `🏷️ Annotations (${filteredAnnotationShapes.value.length})`)
const eventShapesTabLabel = computed(() => `📅 Events (${safeEventShapes.value.length})`)
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
      :entity="{ id: toGlobalEntityId(ANNOTATION_SHAPE_GLOBAL_CONFIG_ID), name: 'Annotation Shape Fields (Global)', entityKey: 'annotationShape', orderIndex: 0, active: true }"
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
      :entity="{ id: toGlobalEntityId('00000000-0000-0000-0000-000000000010'), name: 'Event Shape Fields (Global)', entityKey: 'eventShape', orderIndex: 0, active: true, isTernary: false, ternaryDefault: null, differentialRole: null }"
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

