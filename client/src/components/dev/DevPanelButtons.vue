<script setup lang="ts">
/**
 * Shared Dev Panel Buttons Component
 * 
 */

import { computed, inject, ref, type Ref, type ComputedRef } from 'vue'
import type { AppointmentResponse } from '@/types/appointment'
import { useBookingWizard } from '@/composables/booking/useBookingWizard'

interface DevPanelButtons {
  selectedAppointmentId: Ref<string | null>
  appointmentDropdownItems: ComputedRef<Array<{ text: string; value: string }>>
  loadedAppointmentId: Ref<string | null>
  isLoadingAppointment: Ref<boolean>
  fetchAll: { isLoading: Ref<boolean>; data: Ref<AppointmentResponse[]> }
  handleLoadAppointment: (id: string | null) => Promise<void>
  handleUpdateAppointment: () => Promise<void>
  handleResetWizard: () => void
  handleResetMocks: () => void
  updateAppointment: { isPending: Ref<boolean> }
  wizard: ReturnType<typeof useBookingWizard> | null
}

const devPanelButtonsRef = inject<Ref<DevPanelButtons | null>>('devPanelButtons', ref(null))

const devPanelButtons = computed(() => {
  if (!devPanelButtonsRef || !devPanelButtonsRef.value) {
    return null
  }
  return devPanelButtonsRef.value
})

const hasDevPanelButtons = computed(() => {
  return devPanelButtons.value !== null
})
</script>

<template>
  <VCardText v-if="hasDevPanelButtons" class="pa-2 pb-1">
    <VRow v-if="devPanelButtons" dense no-gutters>
      <VCol cols="12" class="d-flex gap-2 mb-2 align-center">
        <VBtn
          color="primary"
          variant="outlined"
          size="small"
          prepend-icon="tabler-file-upload"
          :loading="(devPanelButtons?.fetchAll?.isLoading?.value || devPanelButtons?.isLoadingAppointment?.value) ?? false"
          @click="devPanelButtons?.handleLoadAppointment('random')"
        >
          LOAD RANDOM APPOINTMENT
        </VBtn>
        <VBtn
          color="success"
          variant="outlined"
          size="small"
          prepend-icon="tabler-device-floppy"
          :loading="devPanelButtons?.updateAppointment?.isPending?.value ?? false"
          :disabled="(devPanelButtons?.updateAppointment?.isPending?.value || !devPanelButtons?.loadedAppointmentId?.value) ?? false"
          @click="devPanelButtons?.handleUpdateAppointment"
        >
          UPDATE APPOINTMENT
        </VBtn>
        <VBtn
          color="secondary"
          variant="outlined"
          size="small"
          prepend-icon="tabler-refresh"
          @click="devPanelButtons?.handleResetWizard"
        >
          RESET WIZARD
        </VBtn>
      </VCol>
    </VRow>
  </VCardText>
</template>
