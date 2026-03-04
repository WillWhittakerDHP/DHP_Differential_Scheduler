<!--
  WHY: Collects feedback with auto-captured context (URL, browser, screen size)
  PATTERN: VDialog + VForm; modelValue for open/close; conditional bug fields
-->
<template>
  <VDialog
    :model-value="modelValue"
    max-width="600"
    persistent
    @update:model-value="emit('update:modelValue', $event)"
  >
    <VCard>
      <VCardTitle class="d-flex align-center justify-space-between">
        <span>Submit Feedback</span>
        <VBtn icon variant="text" @click="emit('update:modelValue', false)">
          <VIcon icon="tabler-x" />
        </VBtn>
      </VCardTitle>
      <VCardText>
        <VForm ref="formRef" @submit.prevent="handleSubmit">
          <VTextField
            v-model="form.reporterName"
            label="Your name"
            required
            class="mb-3"
            :disabled="sending"
          />
          <VTextField
            v-model="form.reporterEmail"
            label="Email (optional)"
            type="email"
            class="mb-3"
            :disabled="sending"
          />
          <VSelect
            v-model="form.category"
            label="Category"
            :items="categoryItems"
            required
            class="mb-3"
            :disabled="sending"
          />
          <VSelect
            v-model="form.severity"
            label="Severity"
            :items="severityItems"
            required
            class="mb-3"
            :disabled="sending"
          />
          <VTextField
            v-model="form.title"
            label="Title"
            required
            class="mb-3"
            :disabled="sending"
          />
          <VTextarea
            v-model="form.description"
            label="Description"
            required
            rows="3"
            class="mb-3"
            :disabled="sending"
          />
          <VCombobox
            v-model="form.tags"
            label="Tags (optional)"
            :items="suggestedTags"
            multiple
            chips
            closable-chips
            class="mb-3"
            :disabled="sending"
          />
          <template v-if="form.category === 'bug'">
            <VTextarea
              v-model="form.stepsToReproduce"
              label="Steps to reproduce"
              rows="2"
              class="mb-3"
              :disabled="sending"
            />
            <VTextarea
              v-model="form.expectedBehavior"
              label="Expected behavior"
              rows="2"
              class="mb-3"
              :disabled="sending"
            />
            <VTextarea
              v-model="form.actualBehavior"
              label="Actual behavior"
              rows="2"
              class="mb-3"
              :disabled="sending"
            />
          </template>
          <VAlert v-if="submitError" type="error" variant="tonal" class="mb-3" density="compact">
            {{ submitError }}
          </VAlert>
          <VCardActions class="px-0">
            <VSpacer />
            <VBtn variant="text" :disabled="sending" @click="emit('update:modelValue', false)">
              Cancel
            </VBtn>
            <VBtn type="submit" color="primary" :loading="sending" :disabled="sending">
              Submit
            </VBtn>
          </VCardActions>
        </VForm>
      </VCardText>
    </VCard>
  </VDialog>
</template>

<script setup lang="ts">
import { useFeedbackSubmit } from '@/composables/beta/useFeedbackSubmit'
import type { FeedbackCategory, FeedbackSeverity } from '@/types/betaFeedback'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ (e: 'update:modelValue', value: boolean): void }>()

const { form, sending, submitError, handleSubmit } = useFeedbackSubmit({
  modelValue: () => props.modelValue,
  onClose: () => emit('update:modelValue', false),
})

const categoryItems: { title: string; value: FeedbackCategory }[] = [
  { title: 'Bug', value: 'bug' },
  { title: 'Feature request', value: 'feature_request' },
  { title: 'Usability', value: 'usability' },
  { title: 'Performance', value: 'performance' },
  { title: 'General', value: 'general' },
]

const severityItems: { title: string; value: FeedbackSeverity }[] = [
  { title: 'Low', value: 'low' },
  { title: 'Medium', value: 'medium' },
  { title: 'High', value: 'high' },
  { title: 'Critical', value: 'critical' },
]

const suggestedTags = ['booking-wizard', 'mobile', 'first-impression', 'confusing']
</script>
