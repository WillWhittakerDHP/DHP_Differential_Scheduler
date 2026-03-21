<script setup lang="ts">
/**
 * Client-facing cancel flow: /cancel?appointmentId=<id>
 * Confirm page → PATCH to cancelled → success/error and navigation.
 */
import { onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useCancelAppointment } from '@/composables/booking/useCancelAppointment'

const route = useRoute()
const {
  appointment,
  isLoading,
  isCancelling,
  error,
  isCancellable,
  fetchAppointment,
  cancelAppointment,
} = useCancelAppointment()

const appointmentId = computed(() => {
  const id = route.query.appointmentId
  return typeof id === 'string' ? id : null
})

const appointmentSummary = computed(() => {
  const a = appointment.value
  if (!a) return null
  const date = a.selectedDate ?? a.selectedDateRangeEnd ?? '—'
  return { id: a.id, date, status: a.status }
})

const showConfirm = computed(
  () =>
    appointment.value !== null &&
    isCancellable(appointment.value.status) &&
    !error.value
)

const showNotCancellable = computed(
  () =>
    appointment.value !== null &&
    !isCancellable(appointment.value.status) &&
    !error.value
)

const handleConfirm = async (): Promise<void> => {
  if (!appointmentId.value) return
  await cancelAppointment(appointmentId.value)
}

const handleGoBack = (): void => {
  window.history.back()
}

onMounted(() => {
  if (!appointmentId.value) return
  void fetchAppointment(appointmentId.value)
})
</script>

<template>
  <div class="cancel-confirm-view">
    <VCard max-width="400" class="mx-auto">
      <VCardTitle class="text-h6">Cancel appointment</VCardTitle>
      <VCardText>
        <template v-if="!appointmentId">
          <p class="text-error">Invalid link. No appointment ID provided.</p>
        </template>
        <template v-else-if="isLoading">
          <p>Loading appointment...</p>
        </template>
        <template v-else-if="error">
          <p class="text-error">{{ error }}</p>
        </template>
        <template v-else-if="showNotCancellable">
          <p class="text-warning">
            This appointment cannot be cancelled (status: {{ appointment?.status || 'unknown' }}).
          </p>
        </template>
        <template v-else-if="showConfirm && appointmentSummary">
          <p>
            Are you sure you want to cancel this appointment?
          </p>
          <p class="text-medium-emphasis mt-2">
            Appointment {{ appointmentSummary.id }} — {{ appointmentSummary.date }}
          </p>
        </template>
      </VCardText>
      <VCardActions v-if="showConfirm">
        <VBtn
          color="error"
          variant="flat"
          :loading="isCancelling"
          :disabled="isCancelling"
          @click="handleConfirm"
        >
          Cancel appointment
        </VBtn>
        <VBtn
          variant="outlined"
          :disabled="isCancelling"
          @click="handleGoBack"
        >
          Go back
        </VBtn>
      </VCardActions>
      <VCardActions v-else-if="appointmentId && !isLoading && (error || showNotCancellable)">
        <VBtn variant="outlined" @click="handleGoBack"
          >Go back</VBtn
        >
      </VCardActions>
    </VCard>
  </div>
</template>

<style scoped lang="scss">
.cancel-confirm-view {
  padding: 24px;
  max-width: 600px;
  margin: 0 auto;
}
</style>
