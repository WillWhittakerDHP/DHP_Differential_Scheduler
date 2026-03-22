<!-- Collapsed row: name, shape, active, short sample summary preview. -->
<script setup lang="ts">
import { computed } from 'vue'
import type { GlobalEntity } from '@/types/entities'
import { buildSampleInviteContextFromTemplateVariables } from '@shared/utils/buildSampleInviteContext'
import { resolveEventTemplates } from '@shared/utils/eventTemplateResolver'
import EventInstanceEditor from './EventInstanceEditor.vue'

const props = defineProps<{
  entity: GlobalEntity<'eventInstance'>
  expanded: boolean
  eventShapesList: GlobalEntity<'eventShape'>[]
}>()

const emit = defineEmits<{
  delete: [id: string]
}>()

const shapeName = computed((): string => {
  const id = props.entity.eventShapeRef
  const shape = props.eventShapesList.find((s) => String(s.id) === String(id))
  return shape?.name?.trim() ? shape.name : '—'
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
