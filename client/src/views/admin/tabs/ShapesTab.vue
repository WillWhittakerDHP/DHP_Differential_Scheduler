<!--
  PATTERN: VTabs for tab navigation, VExpansionPanels for grouped display
-->
<script setup lang="ts">
import type { GlobalEntity } from '@/types/entities'
import EntityCard from '@/components/admin/generic/EntityCard.vue'
import MetadataEditModal from '@/components/admin/MetadataEditModal.vue'
import ShapeCardList from './components/ShapeCardList.vue'
import ShapeCreationForm from './components/ShapeCreationForm.vue'
import { PART_SHAPE_GLOBAL_CONFIG_ID, BLOCK_SHAPE_GLOBAL_CONFIG_ID } from '@/utils/entities/entityTypeMapping'
import { useShapesTab } from '@/composables/admin/useShapesTab'

const {
  activeTab,
  blockShapesContainer: _blockShapesContainer,
  partShapesContainer: _partShapesContainer,
  annotationShapesContainer: _annotationShapesContainer,
  partShapesPanelsContainer: _partShapesPanelsContainer,
  blockShapesPanelsContainer: _blockShapesPanelsContainer,
  annotationShapesPanelsContainer: _annotationShapesPanelsContainer,
  blockShapesList,
  partShapesList,
  expandedShapes,
  isPanelExpanded,
  blockShapesTabLabel,
  partShapesTabLabel,
  annotationShapesTabLabel,
  eventShapesTabLabel,
  blockShapeMetadataModalOpen,
  partShapeMetadataModalOpen,
  partInstanceMetadataModalOpen,
  annotationShapeMetadataModalOpen,
  annotationInstanceMetadataModalOpen,
  eventShapeMetadataModalOpen,
  eventInstanceMetadataModalOpen,
  toggleBlockShapeMetadataModal,
  togglePartShapeMetadataModal,
  togglePartInstanceMetadataModal,
  handlePartInstanceMetadataSaved,
  toggleAnnotationShapeMetadataModal,
  toggleAnnotationInstanceMetadataModal,
  handleAnnotationInstanceMetadataSaved,
  toggleEventShapeMetadataModal,
  toggleEventInstanceMetadataModal,
  handleEventInstanceMetadataSaved,
  isCreatingBlockShape,
  isCreatingPartShape,
  isCreatingAnnotationShape,
  isCreatingEventShape,
  newBlockShapeInitialValues,
  newPartShapeInitialValues,
  newAnnotationShapeName,
  newEventShapeName,
  isCreatingAnnotationShapeLoading,
  isCreatingEventShapeLoading,
  createBlockShape,
  handleBlockShapeCreated,
  handleBlockShapeCancelled,
  createPartShape,
  startCreatingAnnotationShape,
  handlePartShapeCreated,
  handlePartShapeCancelled,
  handleAnnotationShapeCreate,
  handleAnnotationShapeCancelled,
  startCreatingEventShape,
  handleEventShapeCreate,
  handleEventShapeCancelled,
  handleDeletePartShape,
  handleDeleteBlockShape,
  handleDeleteAnnotationShape,
  handleDeleteEventShape,
  handleExistingShapeSaved,
  filteredAnnotationShapes,
  safeEventShapes,
  isLoadingAnnotationShapes,
  isLoadingEventShapes,
  partInstanceConfigEntity,
  annotationInstanceConfigEntity,
  eventInstanceConfigEntity,
  annotationShapeFieldsEntity,
  eventShapeFieldsEntity,
} = useShapesTab()
</script>

<template>
  <div class="shapes-tab">
    <!--
      WHY: Tabbed Block / Part / Annotation / Event shapes with aligned actions (Shape Fields, Instance Fields where applicable, Create)
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
      WHY: Manages which tab content is visible based on activeTab value
      PATTERN: v-model syncs with VTabs - when tab clicked, VWindow shows matching VWindowItem
    -->
    <!--
      WHY: Helps Vue track components during transitions and prevents undefined VNode errors
      PATTERN: Use stable keys matching the value prop for proper component tracking
    -->
    <VWindow v-model="activeTab">
      <!-- BlockShapes Tab Content -->
      <VWindowItem key="blockShapes" value="blockShapes">
        <div class="d-flex justify-space-between align-center mb-4">
          <h3 class="text-headline-small">Block</h3>
          <div class="d-flex gap-2">
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
            <VBtn
              color="primary"
              prepend-icon="tabler-plus"
              @click="createBlockShape"
            >
              Create Block Shape
            </VBtn>
          </div>
        </div>
        
        <!--
          WHY: Provides expandable/collapsible cards for BlockShapes that can be reordered
          PATTERN: Same as Part/Annotation/Event — parent VExpansionPanels with v-model, ShapeCardList with wrap-in-panels=false so EntityCards are direct children and expand/click work
        -->
        <div ref="_blockShapesContainer" class="drag-drop-container">
          <VExpansionPanels
            v-if="isCreatingBlockShape || blockShapesList.length > 0"
            ref="_blockShapesPanelsContainer"
            v-model="expandedShapes"
            multiple
          >
            <ShapeCreationForm
              v-if="isCreatingBlockShape"
              entity-key="blockShape"
              :entity="newBlockShapeInitialValues!"
              @saved="handleBlockShapeCreated"
              @cancelled="handleBlockShapeCancelled"
            />
            <ShapeCardList
              entity-key="blockShape"
              :items="blockShapesList"
              :expanded="expandedShapes"
              :is-panel-expanded="isPanelExpanded"
              drag-class="draggable-block-shape"
              :wrap-in-panels="false"
              @saved="handleExistingShapeSaved"
              @delete="handleDeleteBlockShape"
            />
          </VExpansionPanels>
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
          <h3 class="text-headline-small">Part</h3>
          <div class="d-flex gap-2">
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
          WHY: Provides expandable/collapsible cards for PartShapes that can be reordered
          PATTERN: v-model binds to expandedShapes array, multiple allows multiple expanded cards
        -->
        <div ref="_partShapesContainer" class="drag-drop-container">
          <VExpansionPanels
            v-if="isCreatingPartShape || partShapesList.length > 0"
            ref="_partShapesPanelsContainer"
            v-model="expandedShapes"
            multiple
          >
            <ShapeCreationForm
              v-if="isCreatingPartShape"
              entity-key="partShape"
              :entity="newPartShapeInitialValues!"
              @saved="handlePartShapeCreated"
              @cancelled="handlePartShapeCancelled"
            />
            <ShapeCardList
              entity-key="partShape"
              :items="partShapesList"
              :expanded="expandedShapes"
              :is-panel-expanded="isPanelExpanded"
              drag-class="draggable-part-shape"
              :wrap-in-panels="false"
              @saved="handleExistingShapeSaved"
              @delete="handleDeletePartShape"
            />
          </VExpansionPanels>
          
          <!--
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
          <h3 class="text-headline-small">Annotations</h3>
          <div class="d-flex gap-2">
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
              :variant="annotationInstanceMetadataModalOpen ? 'flat' : 'outlined'"
              :color="annotationInstanceMetadataModalOpen ? 'primary' : 'default'"
              prepend-icon="tabler-settings"
              @click="toggleAnnotationInstanceMetadataModal"
            >
              Instance Fields
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
          WHY: Provides expandable/collapsible cards for AnnotationShapes with consistent UI
          PATTERN: v-model binds to expandedShapes array, multiple allows multiple expanded cards
        -->
        <div ref="_annotationShapesContainer" class="drag-drop-container">
          <div v-if="isLoadingAnnotationShapes" class="text-center py-4">
            <VProgressCircular indeterminate />
          </div>
          
          <VExpansionPanels 
            v-else-if="isCreatingAnnotationShape || filteredAnnotationShapes.length > 0"
            ref="_annotationShapesPanelsContainer"
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
          <h3 class="text-headline-small">Events</h3>
          <div class="d-flex gap-2">
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
              :variant="eventInstanceMetadataModalOpen ? 'flat' : 'outlined'"
              :color="eventInstanceMetadataModalOpen ? 'primary' : 'default'"
              prepend-icon="tabler-settings"
              @click="toggleEventInstanceMetadataModal"
            >
              Instance Fields
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
          WHY: Shows event shape definitions (e.g., OnSite, Moveable, ClientPresent)
          PATTERN: Similar to annotation shapes section
        -->
        <div class="mb-6">
          <h4 class="text-body-large mb-3">Event Shapes</h4>
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
      WHY: Single modal for configuring all PartInstance field definitions globally
      PATTERN: Global config modal triggered from section header, field definitions only mode
    -->
    <MetadataEditModal
      v-model="partInstanceMetadataModalOpen"
      entity-key="partInstance"
      :entity="partInstanceConfigEntity"
      entity-name="Part Instance Fields (Global)"
      @saved="handlePartInstanceMetadataSaved"
    />
    
    <!--
      WHY: Single modal for configuring all AnnotationShape field definitions globally
      PATTERN: Global config modal triggered from section header, uses sentinel UUID
    -->
    <MetadataEditModal
      v-model="annotationShapeMetadataModalOpen"
      entity-key="annotationShape"
      :entity="annotationShapeFieldsEntity"
      entity-name="Annotation Shape Fields (Global)"
      @saved="() => annotationShapeMetadataModalOpen = false"
    />
    
    <MetadataEditModal
      v-model="annotationInstanceMetadataModalOpen"
      entity-key="annotationInstance"
      :entity="annotationInstanceConfigEntity"
      entity-name="Annotation Instance Fields (Global)"
      @saved="handleAnnotationInstanceMetadataSaved"
    />
    
    <!--
      WHY: Single modal for configuring all EventShape field definitions globally
      PATTERN: Global config modal triggered from section header, uses sentinel UUID
    -->
    <MetadataEditModal
      v-model="eventShapeMetadataModalOpen"
      entity-key="eventShape"
      :entity="eventShapeFieldsEntity"
      entity-name="Event Shape Fields (Global)"
      @saved="() => eventShapeMetadataModalOpen = false"
    />
    
    <MetadataEditModal
      v-model="eventInstanceMetadataModalOpen"
      entity-key="eventInstance"
      :entity="eventInstanceConfigEntity"
      entity-name="Event Instance Fields (Global)"
      @saved="handleEventInstanceMetadataSaved"
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
