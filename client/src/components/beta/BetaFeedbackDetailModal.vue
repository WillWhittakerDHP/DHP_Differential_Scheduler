<!--
  LEARNING: Detail and triage modal for a single beta feedback item
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
          <VListItem>
            <VListItemTitle class="text-caption text-medium-emphasis">Reporter</VListItemTitle>
            <VListItemSubtitle>{{ feedback.reporterName }} {{ feedback.reporterEmail ? `(${feedback.reporterEmail})` : '' }}</VListItemSubtitle>
          </VListItem>
          <VListItem>
            <VListItemTitle class="text-caption text-medium-emphasis">Category / Severity</VListItemTitle>
            <VListItemSubtitle>{{ feedback.category }} · {{ feedback.severity }}</VListItemSubtitle>
          </VListItem>
          <VListItem>
            <VListItemTitle class="text-caption text-medium-emphasis">Description</VListItemTitle>
            <VListItemSubtitle class="text-wrap">{{ feedback.description }}</VListItemSubtitle>
          </VListItem>
          <template v-if="feedback.category === 'bug'">
            <VListItem v-if="feedback.stepsToReproduce">
              <VListItemTitle class="text-caption text-medium-emphasis">Steps to reproduce</VListItemTitle>
              <VListItemSubtitle class="text-wrap">{{ feedback.stepsToReproduce }}</VListItemSubtitle>
            </VListItem>
            <VListItem v-if="feedback.expectedBehavior">
              <VListItemTitle class="text-caption text-medium-emphasis">Expected</VListItemTitle>
              <VListItemSubtitle class="text-wrap">{{ feedback.expectedBehavior }}</VListItemSubtitle>
            </VListItem>
            <VListItem v-if="feedback.actualBehavior">
              <VListItemTitle class="text-caption text-medium-emphasis">Actual</VListItemTitle>
              <VListItemSubtitle class="text-wrap">{{ feedback.actualBehavior }}</VListItemSubtitle>
            </VListItem>
          </template>
          <VListItem v-if="feedback.pageUrl">
            <VListItemTitle class="text-caption text-medium-emphasis">Page URL</VListItemTitle>
            <VListItemSubtitle class="text-break">{{ feedback.pageUrl }}</VListItemSubtitle>
          </VListItem>
          <VListItem v-if="feedback.browserInfo">
            <VListItemTitle class="text-caption text-medium-emphasis">Browser</VListItemTitle>
            <VListItemSubtitle class="text-wrap text-caption">{{ feedback.browserInfo }}</VListItemSubtitle>
          </VListItem>
          <VListItem v-if="feedback.screenSize">
            <VListItemTitle class="text-caption text-medium-emphasis">Screen size</VListItemTitle>
            <VListItemSubtitle>{{ feedback.screenSize }}</VListItemSubtitle>
          </VListItem>
          <VListItem v-if="feedback.tags?.length">
            <VListItemTitle class="text-caption text-medium-emphasis">Tags</VListItemTitle>
            <VListItemSubtitle>{{ feedback.tags.join(', ') }}</VListItemSubtitle>
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
import type { BetaFeedback, FeedbackStatus } from '@/types/betaFeedback';
import { useFeedbackDetail } from '@/composables/beta/useFeedbackDetail';

const props = defineProps<{ modelValue: boolean; feedback: BetaFeedback | null }>();
const emit = defineEmits<{ (e: 'update:modelValue', value: boolean): void; (e: 'saved'): void }>();

const {
  localStatus,
  localResolutionNotes,
  saving,
  saveError,
  handleSave,
} = useFeedbackDetail(() => props.feedback, emit);

const statusItems: { title: string; value: FeedbackStatus }[] = [
  { title: 'New', value: 'new' },
  { title: 'Triaged', value: 'triaged' },
  { title: 'In progress', value: 'in_progress' },
  { title: 'Resolved', value: 'resolved' },
  { title: "Won't fix", value: 'wont_fix' },
];
</script>
