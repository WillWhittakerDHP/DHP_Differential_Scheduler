<!--
  WHY: View full feedback + context; update status and resolution notes
  PATTERN: VDialog with read-only content and editable status/notes
-->
<template>
  <VDialog
    :model-value="modelValue"
    max-width="640"
    persistent
    @update:model-value="emit('update:modelValue', $event)"
  >
    <VCard v-if="feedback">
      <VCardTitle class="d-flex align-center justify-space-between">
        <span>Feedback: {{ feedback.title }}</span>
        <VBtn icon variant="text" @click="emit('update:modelValue', false)">
          <VIcon icon="tabler-x" />
        </VBtn>
      </VCardTitle>
      <VCardText>
        <VList density="compact" class="mb-4">
          <VListItem
            v-for="row in detailRows"
            :key="row.key"
          >
            <VListItemTitle class="text-body-small text-medium-emphasis">{{ row.label }}</VListItemTitle>
            <VListItemSubtitle :class="row.subtitleClass">{{ row.value }}</VListItemSubtitle>
          </VListItem>
        </VList>
        <VSelect
          v-model="localStatus"
          label="Status"
          :items="statusItems"
          item-title="title"
          item-value="value"
          class="mb-3"
          :disabled="saving"
        />
        <VTextarea
          v-model="localResolutionNotes"
          label="Resolution notes"
          rows="3"
          :disabled="saving"
        />
        <VAlert v-if="saveError" type="error" variant="tonal" density="compact" class="mt-3">
          {{ saveError }}
        </VAlert>
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn variant="text" :disabled="saving" @click="emit('update:modelValue', false)">
          Close
        </VBtn>
        <VBtn color="primary" :loading="saving" :disabled="saving" @click="handleSave">
          Save
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { BetaFeedback, FeedbackStatus } from '@/types/betaFeedback'
import { useFeedbackDetail } from '@/composables/beta/useFeedbackDetail'

const props = defineProps<{ modelValue: boolean; feedback: BetaFeedback | null }>()
const emit = defineEmits<{ (e: 'update:modelValue', value: boolean): void; (e: 'saved'): void }>()

const {
  localStatus,
  localResolutionNotes,
  saving,
  saveError,
  handleSave,
} = useFeedbackDetail(() => props.feedback, emit)

const detailRows = computed(() => {
  const f = props.feedback
  if (!f) return []
  const rows: { key: string; label: string; value: string; subtitleClass?: string }[] = [
    { key: 'reporter', label: 'Reporter', value: `${f.reporterName}${f.reporterEmail ? ` (${f.reporterEmail})` : ''}` },
    { key: 'category', label: 'Category / Severity', value: `${f.category} · ${f.severity}` },
    { key: 'description', label: 'Description', value: f.description, subtitleClass: 'text-wrap' },
  ]
  if (f.category === 'bug') {
    if (f.stepsToReproduce) rows.push({ key: 'steps', label: 'Steps to reproduce', value: f.stepsToReproduce, subtitleClass: 'text-wrap' })
    if (f.expectedBehavior) rows.push({ key: 'expected', label: 'Expected', value: f.expectedBehavior, subtitleClass: 'text-wrap' })
    if (f.actualBehavior) rows.push({ key: 'actual', label: 'Actual', value: f.actualBehavior, subtitleClass: 'text-wrap' })
  }
  if (f.pageUrl) rows.push({ key: 'pageUrl', label: 'Page URL', value: f.pageUrl, subtitleClass: 'text-break' })
  if (f.browserInfo) rows.push({ key: 'browser', label: 'Browser', value: f.browserInfo, subtitleClass: 'text-wrap text-body-small' })
  if (f.screenSize) rows.push({ key: 'screenSize', label: 'Screen size', value: f.screenSize })
  if (f.tags?.length) rows.push({ key: 'tags', label: 'Tags', value: f.tags.join(', ') })
  return rows
})

const statusItems: { title: string; value: FeedbackStatus }[] = [
  { title: 'New', value: 'new' },
  { title: 'Triaged', value: 'triaged' },
  { title: 'In progress', value: 'in_progress' },
  { title: 'Resolved', value: 'resolved' },
  { title: "Won't fix", value: 'wont_fix' },
];
</script>
