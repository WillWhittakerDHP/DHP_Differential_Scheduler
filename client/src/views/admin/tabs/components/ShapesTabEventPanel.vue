<!--
  WHY: Event shapes VWindow body extracted from ShapesTab (component-health: oversized template).
-->
<script setup lang="ts">
import AdminEntityEditorPanel from '@/components/admin/generic/AdminEntityEditorPanel.vue'
import { inject } from 'vue'
import { shapesTabInjectionKey } from '../shapesTabContext'

const c = inject(shapesTabInjectionKey)
if (c === undefined) {
  throw new Error('ShapesTabEventPanel: shapesTabInjectionKey not provided')
}

const {
  expandedShapes,
  eventShapesList,
  startCreatingEventShape,
  isCreatingEventShape,
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
        <VBtn color="primary" prepend-icon="tabler-plus" @click="startCreatingEventShape">
          Create Event Type
        </VBtn>
      </div>
    </div>
    <div class="mb-6">
      <h4 class="text-body-large mb-3">Event Types</h4>
      <div v-if="isLoadingEventShapes" class="text-center py-4">
        <VProgressCircular indeterminate />
      </div>
      <div v-else :ref="c.eventShapesContainer" class="drag-drop-container">
        <VCard
          v-if="isCreatingEventShape"
          class="mb-4"
          variant="outlined"
        >
          <VCardTitle class="d-flex align-center gap-2 text-body-large">
            <VIcon icon="tabler-plus" size="small" color="primary" />
            <span class="text-primary font-weight-medium">New Event Type</span>
          </VCardTitle>
          <VCardText>
            <div class="d-flex align-center gap-3 flex-wrap">
              <VTextField
                v-model="newEventShapeName"
                label="Name"
                variant="outlined"
                density="compact"
                class="flex-grow-1"
                style="min-width: 12rem"
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
          </VCardText>
        </VCard>
        <VExpansionPanels
          v-if="eventShapesList.length > 0"
          :ref="c.eventShapesPanelsContainer"
          v-model="expandedShapes"
          multiple
        >
          <AdminEntityEditorPanel
            v-for="eventShape in eventShapesList"
            :key="String(eventShape.id)"
            :class="`draggable-event-shape`"
            :data-drag-id="String(eventShape.id)"
            entity-key="eventShape"
            :entity="eventShape"
            :expanded="isPanelExpanded(String(eventShape.id))"
            show-shape-list-drag-handle
            @saved="handleExistingShapeSaved"
            @delete="handleDeleteEventShape"
          />
        </VExpansionPanels>
        <VAlert v-else-if="!isCreatingEventShape" type="info" variant="tonal" class="mt-4">
          No event types found. Create one to get started.
        </VAlert>
      </div>
    </div>
  </div>
</template>
