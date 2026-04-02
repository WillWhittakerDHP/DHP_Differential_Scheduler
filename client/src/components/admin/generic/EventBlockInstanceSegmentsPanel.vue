<!--
  WHY: FEATURE_20 §8.3 — segments edited on event block instance cards (parentBlockInstanceId scope).
  PATTERN: Thin shell; logic in useBlockInstanceEventSegments; reuse Instances-tab child components.
-->
<script setup lang="ts">
import { toRef } from 'vue'
import { useBlockInstanceEventSegments } from '@/composables/admin/useBlockInstanceEventSegments'
import EventInstanceBuilderBody from '@/views/admin/tabs/components/EventInstanceBuilderBody.vue'
import EventInstanceListItem from '@/views/admin/tabs/components/EventInstanceListItem.vue'

const props = defineProps<{
  blockInstanceId: string
}>()

const {
  expandedInstances,
  eventInstancesDisplay,
  eventShapes,
  hasEventInstances,
  isLoadingEventInstances,
  isCreatingEventInstance,
  newEventInstanceData,
  isCreatingEventInstanceLoading,
  canSubmitNewEventInstance,
  newSegmentPanelValue,
  isPanelExpanded,
  openCreateEventInstanceForm,
  handleEventInstanceCreate,
  handleEventInstanceCancelled,
  handleDeleteEventInstance,
  bindEventInstancesContainer,
  bindEventInstancesPanelsContainer,
} = useBlockInstanceEventSegments(toRef(props, 'blockInstanceId'))
</script>

<template>
  <VCard variant="outlined" class="mt-4 event-block-instance-segments">
    <VCardTitle class="text-subtitle-1 d-flex align-center justify-space-between flex-wrap gap-2">
      <span>Calendar segments</span>
      <VBtn
        color="primary"
        size="small"
        prepend-icon="tabler-plus"
        @click="openCreateEventInstanceForm"
      >
        Add segment
      </VBtn>
    </VCardTitle>
    <VCardText>
      <div v-if="isLoadingEventInstances" class="text-center py-4">
        <VProgressCircular indeterminate />
      </div>
      <div
        v-else-if="isCreatingEventInstance || hasEventInstances"
        :ref="bindEventInstancesContainer"
      >
        <VExpansionPanels
          :ref="bindEventInstancesPanelsContainer"
          v-model="expandedInstances"
          multiple
        >
          <VExpansionPanel
            v-if="isCreatingEventInstance"
            :key="newSegmentPanelValue"
            :value="newSegmentPanelValue"
            class="new-shape-card"
          >
            <template #title>
              <div class="d-flex align-center gap-2 flex-grow-1">
                <VIcon icon="tabler-plus" size="small" color="primary" />
                <span class="text-primary font-weight-medium">New segment</span>
              </div>
            </template>
            <template #text>
              <div v-if="newEventInstanceData" class="pa-2">
                <EventInstanceBuilderBody
                  v-model="newEventInstanceData"
                  :event-shapes-list="eventShapes"
                />
                <div class="d-flex gap-2 justify-end mt-4">
                  <VBtn
                    color="primary"
                    :loading="isCreatingEventInstanceLoading"
                    :disabled="!canSubmitNewEventInstance"
                    prepend-icon="tabler-plus"
                    @click="handleEventInstanceCreate()"
                  >
                    Create
                  </VBtn>
                  <VBtn variant="outlined" @click="handleEventInstanceCancelled()">
                    Cancel
                  </VBtn>
                </div>
              </div>
            </template>
          </VExpansionPanel>
          <EventInstanceListItem
            v-for="eventInstance in eventInstancesDisplay"
            :key="String(eventInstance.id)"
            :entity="eventInstance"
            :expanded="isPanelExpanded(String(eventInstance.id))"
            :event-shapes-list="eventShapes"
            @delete="handleDeleteEventInstance"
          />
        </VExpansionPanels>
      </div>
      <VAlert v-else type="info" variant="tonal" density="compact" class="mb-0">
        No segments yet. Add a segment to attach calendar templates to this block instance.
      </VAlert>
    </VCardText>
  </VCard>
</template>
