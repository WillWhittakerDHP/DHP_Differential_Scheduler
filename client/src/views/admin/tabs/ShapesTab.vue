<!--
  PATTERN: VTabs for tab navigation; panel bodies in ShapesTab*Panel (component-health).
-->
<script setup lang="ts">
import { defineAsyncComponent, provide } from 'vue'
import type { GlobalEntity } from '@/types/entities'
import MetadataEditModal from '@/components/admin/MetadataEditModal.vue'
import { PART_SHAPE_GLOBAL_CONFIG_ID, BLOCK_SHAPE_GLOBAL_CONFIG_ID } from '@/utils/entities/entityTypeMapping'
import { useShapesTab } from '@/composables/admin/useShapesTab'
import { shapesTabInjectionKey } from './shapesTabContext'

const ShapesTabBlockPanel = defineAsyncComponent(() => import('./components/ShapesTabBlockPanel.vue'))
const ShapesTabPartPanel = defineAsyncComponent(() => import('./components/ShapesTabPartPanel.vue'))
const ShapesTabAnnotationPanel = defineAsyncComponent(() => import('./components/ShapesTabAnnotationPanel.vue'))
const ShapesTabEventPanel = defineAsyncComponent(() => import('./components/ShapesTabEventPanel.vue'))

const shapesTabApi = useShapesTab()
provide(shapesTabInjectionKey, shapesTabApi)

const {
  activeTab,
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
  handlePartInstanceMetadataSaved,
  handleAnnotationInstanceMetadataSaved,
  handleEventInstanceMetadataSaved,
  partInstanceConfigEntity,
  annotationInstanceConfigEntity,
  eventInstanceConfigEntity,
  annotationShapeFieldsEntity,
  eventShapeFieldsEntity,
} = shapesTabApi
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
      <VWindowItem key="blockShapes" value="blockShapes">
        <ShapesTabBlockPanel />
      </VWindowItem>
      <VWindowItem key="partShapes" value="partShapes">
        <ShapesTabPartPanel />
      </VWindowItem>
      <VWindowItem key="annotationShapes" value="annotationShapes">
        <ShapesTabAnnotationPanel />
      </VWindowItem>
      <VWindowItem key="eventShapes" value="eventShapes">
        <ShapesTabEventPanel />
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

.shapes-tab :deep(.drag-handle) {
  cursor: grab;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.shapes-tab :deep(.drag-handle:hover) {
  opacity: 1;
}

.shapes-tab :deep(.drag-handle:active) {
  cursor: grabbing;
}

.shapes-tab :deep(.drag-drop-container) {
  position: relative;
}

.shapes-tab :deep(.draggable-part-shape),
.shapes-tab :deep(.draggable-block-shape),
.shapes-tab :deep(.draggable-annotation-shape),
.shapes-tab :deep(.draggable-event-shape) {
  transition: transform 0.2s;
  cursor: move;
}

.shapes-tab :deep(.draggable-part-shape:hover),
.shapes-tab :deep(.draggable-block-shape:hover),
.shapes-tab :deep(.draggable-annotation-shape:hover),
.shapes-tab :deep(.draggable-event-shape:hover) {
  opacity: 0.8;
}

.shapes-tab :deep(.new-shape-card) {
  border: 2px dashed rgb(var(--v-theme-primary));
  background-color: rgba(var(--v-theme-primary), 0.05);
}

.shapes-tab :deep(.title-field-input .v-field__input) {
  padding: 0 !important;
  min-height: auto !important;
}

.shapes-tab :deep(.title-field-input .v-field) {
  padding: 0 !important;
  box-shadow: none !important;
}
</style>
