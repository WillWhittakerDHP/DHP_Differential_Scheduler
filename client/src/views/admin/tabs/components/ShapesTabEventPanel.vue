<!--
  WHY: Event shapes VWindow body extracted from ShapesTab (component-health: oversized template).
-->
<script setup lang="ts">
import EntityCard from '@/components/admin/generic/EntityCard.vue'
import { inject } from 'vue'
import { shapesTabInjectionKey } from '../shapesTabContext'

const c = inject(shapesTabInjectionKey)
if (c === undefined) {
  throw new Error('ShapesTabEventPanel: shapesTabInjectionKey not provided')
}

const {
  expandedShapes,
  eventShapeMetadataModalOpen,
  eventInstanceMetadataModalOpen,
  toggleEventShapeMetadataModal,
  toggleEventInstanceMetadataModal,
  startCreatingEventShape,
  isCreatingEventShape,
  safeEventShapes,
  isLoadingEventShapes,
  newEventShapeName,
  isCreatingEventShapeLoading,
  handleEventShapeCreate,
  handleEventShapeCancelled,
  handleExistingShapeSaved,
  handleDeleteEventShape,
  isPanelExpanded,
} = c
</script>

<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-4">
      <h3 class="text-headline-small">Events</h3>
      <div class="d-flex gap-2">
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
        <VBtn color="primary" prepend-icon="tabler-plus" @click="startCreatingEventShape">
          Create Event Shape
        </VBtn>
      </div>
    </div>
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
              <VBtn variant="outlined" @click="handleEventShapeCancelled">Cancel</VBtn>
            </div>
          </template>
        </VExpansionPanel>
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
      <VAlert v-else type="info" variant="tonal" class="mt-4">
        No event shapes found. Create one to get started.
      </VAlert>
    </div>
  </div>
</template>
