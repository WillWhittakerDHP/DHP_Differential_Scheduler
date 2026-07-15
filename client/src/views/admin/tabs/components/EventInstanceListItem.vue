<!-- Collapsed row: name, shape, active, short sample summary preview. -->
<script setup lang="ts">
import { computed } from 'vue'
import type { GlobalEntity } from '@/types/entities'
import { buildSampleInviteContextFromTemplateVariables } from '@shared/utils/buildSampleInviteContext'
import { resolveEventTemplates } from '@shared/utils/eventTemplateResolver'
import EventInstanceEditor from './EventInstanceEditor.vue'
import { eventTimingBehaviorFromPlacement } from '@/utils/admin/eventPlacementLabels'

const props = defineProps<{
  entity: GlobalEntity<'eventInstance'>
  expanded: boolean
  eventShapesList: GlobalEntity<'eventShape'>[]
}>()

const emit = defineEmits<{
  delete: [id: string]
}>()

const eventShape = computed(() => {
  const id = props.entity.eventShapeRef
  return props.eventShapesList.find((s) => String(s.id) === String(id)) ?? null
})

const shapeName = computed((): string => {
  const shape = eventShape.value
  return shape?.name?.trim() ? shape.name : '—'
})

const timingLabel = computed((): string => {
  const shape = eventShape.value
  if (!shape) {
    return 'Timing unknown'
  }
  return eventTimingBehaviorFromPlacement(shape.placementKind, shape.anchorEdge).shortTitle
})

const summaryPreview = computed((): string => {
  const ctx = buildSampleInviteContextFromTemplateVariables()
  const { summary } = resolveEventTemplates(
    {
      titleTemplate: props.entity.titleTemplate,
      descriptionTemplate: props.entity.descriptionTemplate,
      locationTemplate: props.entity.locationTemplate,
    },
    ctx
  )
  const s = summary.trim()
  if (!s) return ''
  return s.length > 72 ? `${s.slice(0, 69)}…` : s
})
</script>

<template>
  <VExpansionPanel
    :value="String(entity.id)"
    class="draggable-event-instance draggable-instance-item"
    :data-drag-id="String(entity.id)"
  >
    <template #title>
      <div class="d-flex flex-column gap-1 flex-grow-1 text-left" style="width: 100%">
        <div class="d-flex align-center gap-2 flex-wrap">
          <span class="font-weight-medium text-truncate">{{ entity.name }}</span>
          <VChip size="x-small" variant="tonal" color="secondary">{{ shapeName }}</VChip>
          <VChip size="x-small" variant="tonal" color="info">{{ timingLabel }}</VChip>
          <VChip
            v-if="entity.active === false"
            size="x-small"
            variant="tonal"
            color="warning"
          >
            Inactive
          </VChip>
        </div>
        <div
          v-if="summaryPreview"
          class="text-body-small text-medium-emphasis text-truncate"
        >
          Preview: {{ summaryPreview }}
        </div>
      </div>
    </template>
    <template #text>
      <EventInstanceEditor
        :entity="entity"
        :expanded="expanded"
        :event-shapes-list="eventShapesList"
        @delete="emit('delete', $event)"
      />
    </template>
  </VExpansionPanel>
</template>
