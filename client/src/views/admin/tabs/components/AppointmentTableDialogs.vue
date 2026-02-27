<!-- Extracted from AppointmentsTable for component-health (allowlist repair). -->
<script setup lang="ts">
import { APPOINTMENTS_TABLE_UI } from '@/constants/appointmentsTableConstants'
import type { AppointmentResponse } from '@/types/appointment'

defineProps<{
  showDeleteDialog: boolean
  showConfirmDialog: boolean
  confirmingAppointment: AppointmentResponse | null
}>()

defineEmits<{
  (e: 'cancel-delete'): void
  (e: 'confirm-delete'): void
  (e: 'cancel-confirm'): void
  (e: 'confirm-appointment'): void
}>()
</script>

<template>
  <VDialog
    :model-value="showDeleteDialog"
    max-width="500"
    @update:model-value="(v) => !v && $emit('cancel-delete')"
  >
    <VCard>
      <VCardTitle class="text-headline-small">{{ APPOINTMENTS_TABLE_UI.DELETE_DIALOG_TITLE }}</VCardTitle>
      <VCardText>
        {{ APPOINTMENTS_TABLE_UI.DELETE_DIALOG_MESSAGE }}
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn variant="text" @click="$emit('cancel-delete')">{{ APPOINTMENTS_TABLE_UI.DELETE_DIALOG_CANCEL }}</VBtn>
        <VBtn color="error" variant="flat" @click="$emit('confirm-delete')">{{ APPOINTMENTS_TABLE_UI.DELETE_DIALOG_CONFIRM }}</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>

  <VDialog
    :model-value="showConfirmDialog"
    max-width="500"
    persistent
    @update:model-value="(v) => !v && $emit('cancel-confirm')"
  >
    <VCard>
      <VCardTitle class="text-headline-small">{{ APPOINTMENTS_TABLE_UI.CONFIRM_DIALOG_TITLE }}</VCardTitle>
      <VCardText>
        <p class="mb-3">{{ APPOINTMENTS_TABLE_UI.CONFIRM_DIALOG_MESSAGE }}</p>
        <VList v-if="confirmingAppointment" density="compact" class="bg-surface-variant rounded">
          <VListItem>
            <template #prepend>
              <VIcon icon="tabler-calendar" size="small" class="me-2" />
            </template>
            <VListItemTitle class="text-body-2">
              {{ confirmingAppointment.selectedDate ?? '—' }}
            </VListItemTitle>
            <VListItemSubtitle>Date</VListItemSubtitle>
          </VListItem>
          <VListItem>
            <template #prepend>
              <VIcon icon="tabler-tag" size="small" class="me-2" />
            </template>
            <VListItemTitle class="text-body-2">
              {{ confirmingAppointment.status }}
            </VListItemTitle>
            <VListItemSubtitle>Current Status</VListItemSubtitle>
          </VListItem>
        </VList>
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn variant="text" @click="$emit('cancel-confirm')">{{ APPOINTMENTS_TABLE_UI.CANCEL }}</VBtn>
        <VBtn color="success" variant="flat" @click="$emit('confirm-appointment')">{{ APPOINTMENTS_TABLE_UI.CONFIRM }}</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
