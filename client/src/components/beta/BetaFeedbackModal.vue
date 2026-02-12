<!--
  LEARNING: Beta feedback submission modal (wizard only)
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
import { ref, reactive, watch } from 'vue';
import type { VForm } from 'vuetify/components';
import { useBetaFeedback } from '@/composables/beta/useBetaFeedback';
import { useNotification } from '@/composables/useNotification';
import type { FeedbackCategory, FeedbackSeverity } from '@/types/betaFeedback';

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{ (e: 'update:modelValue', value: boolean): void }>();

const { submitFeedback } = useBetaFeedback();
const { success, error: showError } = useNotification();
const formRef = ref<InstanceType<typeof VForm> | null>(null);
const sending = ref(false);
const submitError = ref('');

const categoryItems: { title: string; value: FeedbackCategory }[] = [
  { title: 'Bug', value: 'bug' },
  { title: 'Feature request', value: 'feature_request' },
  { title: 'Usability', value: 'usability' },
  { title: 'Performance', value: 'performance' },
  { title: 'General', value: 'general' },
];

const severityItems: { title: string; value: FeedbackSeverity }[] = [
  { title: 'Low', value: 'low' },
  { title: 'Medium', value: 'medium' },
  { title: 'High', value: 'high' },
  { title: 'Critical', value: 'critical' },
];

const suggestedTags = ['booking-wizard', 'mobile', 'first-impression', 'confusing'];

const form = reactive({
  reporterName: '',
  reporterEmail: '',
  category: 'general' as FeedbackCategory,
  severity: 'medium' as FeedbackSeverity,
  title: '',
  description: '',
  tags: [] as string[],
  stepsToReproduce: '',
  expectedBehavior: '',
  actualBehavior: '',
});

function captureContext(): { pageUrl: string; browserInfo: string; screenSize: string } {
  if (typeof window === 'undefined') {
    return { pageUrl: '', browserInfo: '', screenSize: '' };
  }
  const nav = typeof window.navigator !== 'undefined' ? window.navigator : null;
  return {
    pageUrl: window.location.href,
    browserInfo: nav ? nav.userAgent : '',
    screenSize: `${window.innerWidth}x${window.innerHeight}`,
  };
}

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) submitError.value = '';
  }
);

async function handleSubmit() {
  const valid = await formRef.value?.validate();
  if (!valid?.valid) return;
  submitError.value = '';
  sending.value = true;
  try {
    const { pageUrl, browserInfo, screenSize } = captureContext();
    await submitFeedback({
      reporterName: form.reporterName.trim(),
      reporterEmail: form.reporterEmail?.trim() || undefined,
      category: form.category,
      severity: form.severity,
      title: form.title.trim(),
      description: form.description.trim(),
      pageUrl: pageUrl || undefined,
      browserInfo: browserInfo || undefined,
      screenSize: screenSize || undefined,
      stepsToReproduce:
        form.category === 'bug' && form.stepsToReproduce?.trim()
          ? form.stepsToReproduce.trim()
          : undefined,
      expectedBehavior:
        form.category === 'bug' && form.expectedBehavior?.trim()
          ? form.expectedBehavior.trim()
          : undefined,
      actualBehavior:
        form.category === 'bug' && form.actualBehavior?.trim()
          ? form.actualBehavior.trim()
          : undefined,
      tags: form.tags.length > 0 ? form.tags : undefined,
    });
    success('Thank you! Your feedback has been submitted.');
    emit('update:modelValue', false);
    form.reporterName = '';
    form.reporterEmail = '';
    form.title = '';
    form.description = '';
    form.tags = [];
    form.stepsToReproduce = '';
    form.expectedBehavior = '';
    form.actualBehavior = '';
  } catch (err) {
    const message = err && typeof err === 'object' && 'response' in err
      ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
      : null;
    submitError.value = message || 'Failed to submit feedback. Please try again.';
    showError(submitError.value);
  } finally {
    sending.value = false;
  }
}
</script>
