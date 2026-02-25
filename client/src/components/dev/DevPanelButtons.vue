<script setup lang="ts">

import { computed } from 'vue'
import { useDevPanelButtonsInject } from '@/composables/booking/useDevPanelButtonsInject'

const { devPanelButtons } = useDevPanelButtonsInject()

const hasDevPanelButtons = computed(() => {
  return devPanelButtons.value !== null
})
</script>

<template>
  <VCardText v-if="hasDevPanelButtons" class="pa-2 pb-1">
    <VRow v-if="devPanelButtons" dense no-gutters>
      <VCol cols="12" class="d-flex gap-2 mb-2 align-center">
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
