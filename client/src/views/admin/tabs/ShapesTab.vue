<!--
  PATTERN: VTabs for tab navigation; panel bodies in ShapesTab*Panel (component-health).
-->
<script setup lang="ts">
import { defineAsyncComponent, provide } from 'vue'
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
} = shapesTabApi
</script>

<template>
  <div class="shapes-tab">
    <!--
      WHY: Tabbed Block / Part / Annotation / Event shapes with creation actions
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
