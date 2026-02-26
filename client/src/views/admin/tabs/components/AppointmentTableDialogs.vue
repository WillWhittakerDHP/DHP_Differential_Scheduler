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
      <VCardTitle class="text-headline-small">{{ APPOINTMENTS_TABLE_UI.CONFIRM }}</VCardTitle>
      <VCardText>
        {{ confirmingAppointment ? confirmingAppointment.selectedDate ?? '—' : '' }}
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn variant="text" @click="$emit('cancel-confirm')">{{ APPOINTMENTS_TABLE_UI.CANCEL }}</VBtn>
        <VBtn color="success" variant="flat" disabled>{{ APPOINTMENTS_TABLE_UI.CONFIRM }}</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
