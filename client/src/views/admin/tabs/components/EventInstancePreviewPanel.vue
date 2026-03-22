<!-- WHY: Side-by-side sample vs real appointment resolution builds trust before saving. -->
<script setup lang="ts">
import { computed } from 'vue'
import type { EventInstancePreviewResponseBody } from '@shared/types/eventInstancePreview'

const props = defineProps<{
  samplePreview: EventInstancePreviewResponseBody
  realPreview: EventInstancePreviewResponseBody | null
  realPreviewLoading: boolean
  realPreviewError: string | null
  appointmentSelectItems: { title: string; value: string }[]
}>()

const selectedAppointmentId = defineModel<string | null>('selectedAppointmentId', { default: null })

function previewBlock(label: string, body: EventInstancePreviewResponseBody): { label: string; lines: string[] } {
  return {
    label,
    lines: [
      `Summary: ${body.summary || '—'}`,
      `Description: ${body.description || '—'}`,
      `Location: ${body.location || '—'}`,
    ],
  }
}

const sampleBlock = computed(() => previewBlock('Sample preview (documented examples)', props.samplePreview))

const realBlock = computed(() => {
  if (!selectedAppointmentId.value) {
    return { label: 'Real appointment preview', lines: ['Select an appointment below to resolve against real data.'] }
  }
  if (props.realPreviewLoading) {
    return { label: 'Real appointment preview', lines: ['Loading…'] }
  }
  if (props.realPreviewError) {
    return { label: 'Real appointment preview', lines: [`Error: ${props.realPreviewError}`, 'Showing sample preview only.'] }
  }
  if (props.realPreview) {
    return previewBlock('Real appointment preview', props.realPreview)
  }
  return { label: 'Real appointment preview', lines: ['No preview yet.'] }
})
</script>

<template>
  <div class="text-title-small mb-2">Live preview</div>
  <VRow dense class="mb-3">
    <VCol cols="12" md="6">
      <VCard variant="outlined" class="pa-3 h-100">
        <div class="text-label-large mb-2">{{ sampleBlock.label }}</div>
        <div
          v-for="(line, i) in sampleBlock.lines"
          :key="`s-${i}`"
          class="text-body-small text-pre-wrap"
        >
          {{ line }}
        </div>
      </VCard>
    </VCol>
    <VCol cols="12" md="6">
      <VCard variant="outlined" class="pa-3 h-100">
        <div class="text-label-large mb-2">{{ realBlock.label }}</div>
        <div
          v-for="(line, i) in realBlock.lines"
          :key="`r-${i}`"
          class="text-body-small text-pre-wrap"
        >
          {{ line }}
        </div>
      </VCard>
    </VCol>
  </VRow>

  <VAutocomplete
    v-model="selectedAppointmentId"
    :items="appointmentSelectItems"
    item-title="title"
    item-value="value"
    label="Appointment for real preview"
    variant="outlined"
    density="compact"
    clearable
    hide-details="auto"
    class="mb-2"
  />
</template>
