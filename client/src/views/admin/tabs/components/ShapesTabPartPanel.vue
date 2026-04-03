<!--
  WHY: Part shapes VWindow body extracted from ShapesTab (component-health: oversized template).
-->
<script setup lang="ts">
import type { GlobalEntity } from '@/types/entities'
import EntityCard from '@/components/admin/generic/EntityCard.vue'
import { PART_SHAPE_GLOBAL_CONFIG_ID } from '@/utils/entities/entityTypeMapping'
import { inject } from 'vue'
import { shapesTabInjectionKey } from '../shapesTabContext'
import ShapeCreationForm from './ShapeCreationForm.vue'
import ShapeCardList from './ShapeCardList.vue'

const c = inject(shapesTabInjectionKey)
if (c === undefined) {
  throw new Error('ShapesTabPartPanel: shapesTabInjectionKey not provided')
}

const {
  partShapesList,
  expandedShapes,
  isCreatingPartShape,
  newPartShapeInitialValues,
  createPartShape,
  handlePartShapeCreated,
  handlePartShapeCancelled,
  handleExistingShapeSaved,
  handleDeletePartShape,
  isPanelExpanded,
} = c
</script>

<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-4">
      <h3 class="text-headline-small">Part</h3>
      <div class="d-flex gap-2">
        <VBtn color="primary" prepend-icon="tabler-plus" @click="createPartShape">
          Create Part Shape
        </VBtn>
      </div>
    </div>
    <div :ref="c.partShapesContainer" class="drag-drop-container">
      <VExpansionPanels
        v-if="isCreatingPartShape || partShapesList.length > 0"
        :ref="c.partShapesPanelsContainer"
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
      <VAlert v-else type="info" variant="tonal" class="mt-4">
        No PartShapes found. Create one to get started.
      </VAlert>
      <VDivider class="my-6" />
      <VExpansionPanels v-model="expandedShapes" multiple>
        <EntityCard
          entity-key="partShape"
          :entity="{ id: PART_SHAPE_GLOBAL_CONFIG_ID } as GlobalEntity<'partShape'>"
          :expanded="isPanelExpanded(PART_SHAPE_GLOBAL_CONFIG_ID)"
        />
      </VExpansionPanels>
    </div>
  </div>
</template>
