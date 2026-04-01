<!--
  WHY: Reusable dependency-aware delete dialog; orchestration in useAdminEntityDeleteWizard.
  PATTERN: VDialog + VCard — list/card wiring lives in 6.17.4.
-->
<template>
  <VDialog
    :model-value="modelValue"
    max-width="560"
    :persistent="isBusy"
    @update:model-value="onDialogUpdate"
  >
    <VCard>
      <VCardTitle class="d-flex align-center justify-space-between pa-4">
        <span class="text-headline-small">Delete {{ entityLabel }}</span>
        <VBtn
          icon
          variant="text"
          :disabled="isBusy"
          aria-label="Close"
          @click="closeDialog"
        >
          <VIcon icon="tabler-x" />
        </VBtn>
      </VCardTitle>

      <VCardText class="pa-4">
        <div
          v-if="phase === 'loading_preflight' || phase === 'finalizing'"
          class="d-flex justify-center py-8"
        >
          <VProgressCircular
            indeterminate
            color="primary"
            size="48"
          />
        </div>

        <template v-else-if="phase === 'blocked'">
          <VAlert
            type="warning"
            variant="tonal"
            class="mb-4"
            title="Cannot delete yet"
          >
            This item still has blocking dependencies. Resolve them in the admin UI, then try again.
          </VAlert>
          <ul
            v-if="dependencySummaryLines.length > 0"
            class="text-body-medium pl-4 mb-0"
          >
            <li
              v-for="(line, index) in dependencySummaryLines"
              :key="index"
            >
              {{ line }}
            </li>
          </ul>
        </template>

        <template v-else-if="phase === 'ready'">
          <p class="text-body-medium mb-4">
            Are you sure you want to delete "{{ entityLabel }}"? This action cannot be undone.
          </p>
          <ul
            v-if="dependencySummaryLines.length > 0"
            class="text-body-small text-medium-emphasis pl-4 mb-0"
          >
            <li
              v-for="(line, index) in dependencySummaryLines"
              :key="index"
            >
              {{ line }}
            </li>
          </ul>
        </template>

        <VAlert
          v-else-if="phase === 'error' && lastError"
          type="error"
          variant="tonal"
          class="mb-0"
        >
          {{ lastError }}
        </VAlert>

        <VAlert
          v-else-if="phase === 'success'"
          type="success"
          variant="tonal"
          class="mb-0"
        >
          The item was deleted.
        </VAlert>
      </VCardText>

      <VCardActions class="pa-4">
        <VSpacer />
        <VBtn
          v-if="phase !== 'success'"
          variant="outlined"
          :disabled="isBusy"
          @click="closeDialog"
        >
          Cancel
        </VBtn>
        <VBtn
          v-if="phase === 'ready' && canConfirmDelete"
          color="error"
          @click="onConfirmDelete"
        >
          Delete
        </VBtn>
        <VBtn
          v-if="phase === 'success'"
          color="primary"
          variant="elevated"
          @click="onDone"
        >
          Done
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import type { GlobalEntityKey } from '@/constants/entitiesTypes'
import { useAdminEntityDeleteWizard } from '@/composables/admin/useAdminEntityDeleteWizard'

interface Props {
  modelValue: boolean
  entityKey: GlobalEntityKey
  entityId: string
  entityLabel: string
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'finalized', payload: { entityId: string }): void
  (e: 'cancel'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const {
  phase,
  lastError,
  canConfirmDelete,
  isBusy,
  dependencySummaryLines,
  reset,
  runPreflight,
  confirmFinalize,
} = useAdminEntityDeleteWizard()

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      void runPreflight(props.entityKey, props.entityId)
    } else {
      reset()
    }
  }
)

function onDialogUpdate(value: boolean): void {
  if (!value) {
    emit('cancel')
    reset()
  }
  emit('update:modelValue', value)
}

function closeDialog(): void {
  emit('cancel')
  reset()
  emit('update:modelValue', false)
}

async function onConfirmDelete(): Promise<void> {
  await confirmFinalize(props.entityKey, props.entityId)
}

function onDone(): void {
  emit('finalized', { entityId: props.entityId })
  reset()
  emit('update:modelValue', false)
}
</script>
