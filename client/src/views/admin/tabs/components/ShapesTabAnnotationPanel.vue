<!--
  WHY: Annotation shapes VWindow body extracted from ShapesTab (component-health: oversized template).
-->
<script setup lang="ts">
import AnnotationShapeListCard from '@/components/admin/generic/AnnotationShapeListCard.vue'
import { inject } from 'vue'
import { shapesTabInjectionKey } from '../shapesTabContext'

const c = inject(shapesTabInjectionKey)
if (c === undefined) {
  throw new Error('ShapesTabAnnotationPanel: shapesTabInjectionKey not provided')
}

const {
  expandedShapes,
  annotationShapesList,
  annotationShapeMetadataModalOpen,
  annotationInstanceMetadataModalOpen,
  toggleAnnotationShapeMetadataModal,
  toggleAnnotationInstanceMetadataModal,
  startCreatingAnnotationShape,
  isCreatingAnnotationShape,
  filteredAnnotationShapes,
  isLoadingAnnotationShapes,
  newAnnotationShapeName,
  isCreatingAnnotationShapeLoading,
  handleAnnotationShapeCreate,
  handleAnnotationShapeCancelled,
  handleExistingShapeSaved,
  handleDeleteAnnotationShape,
  isPanelExpanded,
} = c
</script>

<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-4">
      <h3 class="text-headline-small">Annotations</h3>
      <div class="d-flex gap-2">
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
        <VBtn color="primary" prepend-icon="tabler-plus" @click="startCreatingAnnotationShape">
          Create Annotation Shape
        </VBtn>
      </div>
    </div>
    <div :ref="c.annotationShapesContainer" class="drag-drop-container">
      <div v-if="isLoadingAnnotationShapes" class="text-center py-4">
        <VProgressCircular indeterminate />
      </div>
      <VExpansionPanels
        v-else-if="isCreatingAnnotationShape || filteredAnnotationShapes.length > 0"
        :ref="c.annotationShapesPanelsContainer"
        v-model="expandedShapes"
        multiple
      >
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
              <VBtn variant="outlined" @click="handleAnnotationShapeCancelled">Cancel</VBtn>
            </div>
          </template>
        </VExpansionPanel>
        <AnnotationShapeListCard
          v-for="annotationShape in annotationShapesList"
          :key="String(annotationShape.id)"
          :class="`draggable-annotation-shape`"
          :data-drag-id="String(annotationShape.id)"
          :entity="annotationShape"
          :expanded="isPanelExpanded(String(annotationShape.id))"
          @saved="handleExistingShapeSaved"
          @delete="handleDeleteAnnotationShape"
        />
      </VExpansionPanels>
      <VAlert v-else type="info" variant="tonal" class="mt-4">
        No annotation shapes found. Create one to get started.
      </VAlert>
    </div>
  </div>
</template>
