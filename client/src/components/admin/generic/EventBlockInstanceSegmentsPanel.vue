<!--
  WHY: FEATURE_20 §8.3 — segments edited on event block instance cards (parentBlockInstanceId scope).
  PATTERN: Thin shell; focused composables (parent filter, drag order, panels); reuse Instances-tab children.
-->
<script setup lang="ts">
import { computed, ref, toRef, watch } from 'vue'
import { useEntityCrud } from '@/composables/entityCrud/useEntityCrud'
import { useAdmin } from '@/composables/admin/useAdmin'
import { useBlockInstanceEventInstancesForParent } from '@/composables/admin/useBlockInstanceEventInstancesForParent'
import { useBlockInstanceEventSegmentDragOrder } from '@/composables/admin/useBlockInstanceEventSegmentDragOrder'
import { useBlockInstanceEventSegmentPanels } from '@/composables/admin/useBlockInstanceEventSegmentPanels'
import EventInstanceBuilderBody from '@/views/admin/tabs/components/EventInstanceBuilderBody.vue'
import EventInstanceEditor from '@/views/admin/tabs/components/EventInstanceEditor.vue'
import EventInstanceListItem from '@/views/admin/tabs/components/EventInstanceListItem.vue'
import type { GlobalEntity } from '@/types/entities'
import { toGlobalEntityId } from '@/utils/globalEntity'

const props = defineProps<{
  blockInstanceId: string
}>()

const blockIdRef = toRef(props, 'blockInstanceId')
const parent = useBlockInstanceEventInstancesForParent(blockIdRef)
const { entities: eventShapes } = useEntityCrud('eventShape')
const admin = useAdmin()
const directSegmentEditorRef = ref<InstanceType<typeof EventInstanceEditor> | null>(null)

const blockInstance = computed(() =>
  admin.getEntity('blockInstance', toGlobalEntityId(props.blockInstanceId)) as
    | GlobalEntity<'blockInstance'>
    | undefined
)

const usesSegmentManager = computed(() => blockInstance.value?.orchestrator === true)

const directSegment = computed(() => parent.filteredEventInstances.value[0] ?? null)

const drag = useBlockInstanceEventSegmentDragOrder({
  filteredEventInstances: parent.filteredEventInstances,
  patchEventInstanceOrderIndex: parent.patchEventInstanceOrderIndex,
})

const segmentPanels = useBlockInstanceEventSegmentPanels({
  blockInstanceId: parent.blockInstanceId,
  filteredEventInstances: parent.filteredEventInstances,
  eventShapes,
  createEventInstance: parent.createEventInstance,
  removeEventInstance: parent.removeEventInstance,
})

const { expandedInstances, isPanelExpanded } = segmentPanels.expansion
const {
  isCreatingEventInstance,
  newEventInstanceData,
  isCreatingEventInstanceLoading,
  canSubmitNewEventInstance,
  newSegmentPanelValue,
} = segmentPanels.draft
const {
  openCreateEventInstanceForm,
  handleEventInstanceCreate,
  handleEventInstanceCancelled,
  handleDeleteEventInstance,
} = segmentPanels.actions
const {
  eventInstancesDisplay,
  bindEventInstancesContainer,
  bindEventInstancesPanelsContainer,
} = drag
const { hasEventInstances, isLoadingEventInstances } = parent

watch(
  [usesSegmentManager, directSegment, eventShapes],
  ([usesManager, segment, shapes]) => {
    if (usesManager || segment || shapes.length === 0 || isCreatingEventInstance.value) {
      return
    }
    openCreateEventInstanceForm()
  },
  { immediate: true }
)

async function saveDirectSegment(): Promise<void> {
  if (usesSegmentManager.value) {
    return
  }
  if (directSegment.value) {
    await directSegmentEditorRef.value?.handleSave()
    return
  }
  if (newEventInstanceData.value) {
    await handleEventInstanceCreate()
  }
}

defineExpose({
  saveDirectSegment,
})
</script>

<template>
  <div v-if="!usesSegmentManager" class="mt-4 event-block-instance-segment">
    <VAlert
      v-if="eventShapes.length === 0"
      type="warning"
      variant="tonal"
      density="compact"
      class="mb-4"
    >
      Create an Event Type before configuring this segment.
    </VAlert>
    <div v-else-if="isLoadingEventInstances" class="text-center py-4">
      <VProgressCircular indeterminate />
    </div>
    <EventInstanceEditor
      v-else-if="directSegment"
      ref="directSegmentEditorRef"
      :entity="directSegment"
      :expanded="true"
      :event-shapes-list="eventShapes"
      :show-actions="false"
      @delete="handleDeleteEventInstance"
    />
    <div v-else-if="newEventInstanceData">
      <EventInstanceBuilderBody
        v-model="newEventInstanceData"
        :event-shapes-list="eventShapes"
      />
    </div>
  </div>

  <VCard v-else variant="outlined" class="mt-4 event-block-instance-segments">
    <VCardTitle class="text-subtitle-1 d-flex align-center justify-space-between flex-wrap gap-2">
      <span>Orchestrated calendar segments</span>
      <VBtn
        color="primary"
        size="small"
        prepend-icon="tabler-plus"
        @click="openCreateEventInstanceForm"
      >
        Add segment / choose event type
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
        No segments yet. Click <strong>Add segment / choose event type</strong> to create an event instance,
        choose its Event Type, set attendees, and attach calendar templates.
      </VAlert>
    </VCardText>
  </VCard>
</template>
