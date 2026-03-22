<!-- Thin component; display computeds and toggle in useEventInstancesSection. -->
<script setup lang="ts">
import type { InstancesTabContext } from '@/types/admin/adminInjectionKeys'
import { useEventInstancesSection } from '@/composables/admin/useEventInstancesSection'
import EventInstanceBuilderBody from './EventInstanceBuilderBody.vue'
import EventInstanceListItem from './EventInstanceListItem.vue'

const props = defineProps<{
  instancesTabContext: InstancesTabContext
}>()
const {
  ctx,
  expandedInstances,
  eventInstancesDisplay,
  eventShapesList,
  hasEventInstances,
  isLoading,
  toggleEventInstanceMetadata,
} = useEventInstancesSection(props.instancesTabContext)
</script>

<template>
  <div class="event-instances-tab-content">
    <div class="d-flex justify-space-between align-center mb-4">
      <h3 class="text-headline-small">Event Instances</h3>
      <div class="d-flex gap-2">
        <VBtn
          :variant="ctx.eventInstanceMetadataModalOpen.value ? 'flat' : 'outlined'"
          :color="ctx.eventInstanceMetadataModalOpen.value ? 'primary' : 'default'"
          prepend-icon="tabler-settings"
          @click="toggleEventInstanceMetadata"
        >
          Instance Fields
        </VBtn>
        <VBtn
          color="primary"
          prepend-icon="tabler-plus"
          @click="ctx.openCreateEventInstanceForm()"
        >
          Create Event Instance
        </VBtn>
      </div>
    </div>
    <div v-if="isLoading" class="text-center py-4">
      <VProgressCircular indeterminate />
    </div>
    <div
      v-else-if="ctx.isCreatingEventInstance.value || hasEventInstances"
      :ref="(el) => { if (ctx.eventInstancesContainer) ctx.eventInstancesContainer.value = el as HTMLElement | null }"
    >
      <VExpansionPanels
        :ref="(el) => { if (ctx.eventInstancesPanelsContainer && el != null) (ctx.eventInstancesPanelsContainer as { value: unknown }).value = el }"
        v-model="expandedInstances"
        multiple
      >
        <VExpansionPanel
          v-if="ctx.isCreatingEventInstance.value"
          key="new-eventInstance"
          value="new-eventInstance"
          class="new-shape-card"
        >
          <template #title>
            <div class="d-flex align-center gap-2 flex-grow-1">
              <VIcon icon="tabler-plus" size="small" color="primary" />
              <span class="text-primary font-weight-medium">New Event Instance</span>
            </div>
          </template>
          <template #text>
            <div v-if="ctx.newEventInstanceData.value" class="pa-2">
              <EventInstanceBuilderBody
                :model-value="ctx.newEventInstanceData.value"
                :event-shapes-list="eventShapesList"
                @update:model-value="ctx.newEventInstanceData.value = $event"
              />
              <div class="d-flex gap-2 justify-end mt-4">
                <VBtn
                  color="primary"
                  :loading="ctx.isCreatingEventInstanceLoading.value"
                  :disabled="!(typeof ctx.newEventInstanceData.value?.name === 'string' && ctx.newEventInstanceData.value.name.trim())"
                  prepend-icon="tabler-plus"
                  @click="ctx.handleEventInstanceCreate()"
                >
                  Create
                </VBtn>
                <VBtn
                  variant="outlined"
                  @click="ctx.handleEventInstanceCancelled()"
                >
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
          :expanded="ctx.isPanelExpanded(String(eventInstance.id))"
          :event-shapes-list="eventShapesList"
          @delete="ctx.handleDeleteEventInstance"
        />
      </VExpansionPanels>
    </div>
    <VAlert
      v-else
      type="info"
      variant="tonal"
      class="mt-4"
    >
      No event instances found. Create one to get started.
    </VAlert>
  </div>
</template>
