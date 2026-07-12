<!--
  WHY: Block shapes VWindow body extracted from ShapesTab (component-health: oversized template).
-->
<script setup lang="ts">
import { inject } from 'vue'
import { shapesTabInjectionKey } from '../shapesTabContext'
import ShapeCreationForm from './ShapeCreationForm.vue'
import ShapeCardList from './ShapeCardList.vue'

const c = inject(shapesTabInjectionKey)
if (c === undefined) {
  throw new Error('ShapesTabBlockPanel: shapesTabInjectionKey not provided')
}

const {
  blockShapesList,
  expandedShapes,
  isCreatingBlockShape,
  newBlockShapeInitialValues,
  createBlockShape,
  handleBlockShapeCreated,
  handleBlockShapeCancelled,
  handleExistingShapeSaved,
  handleDeleteBlockShape,
  isPanelExpanded,
} = c
</script>

<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-4">
      <h3 class="text-headline-small">Block</h3>
      <div class="d-flex gap-2">
        <VBtn color="primary" prepend-icon="tabler-plus" @click="createBlockShape">
          Create Block Shape
        </VBtn>
      </div>
    </div>
    <div :ref="c.blockShapesContainer" class="drag-drop-container">
      <ShapeCreationForm
        v-if="isCreatingBlockShape"
        class="mb-4"
        entity-key="blockShape"
        :entity="newBlockShapeInitialValues!"
        @saved="handleBlockShapeCreated"
        @cancelled="handleBlockShapeCancelled"
      />
      <VExpansionPanels
        v-if="blockShapesList.length > 0"
        :ref="c.blockShapesPanelsContainer"
        v-model="expandedShapes"
        multiple
      >
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
      <VAlert v-else-if="!isCreatingBlockShape" type="info" variant="tonal" class="mt-4">
        No BlockShapes found. Create one to get started.
      </VAlert>
    </div>
  </div>
</template>
