/**
 * Appointment buffer minutes after onsite end (placement after | both), from availability settings.
 * WHY: Orchestrator needs buffer before useAppointmentSlots for inspection deadline filter; separate from minimizer fetch.
 */
import { ref, watchEffect, type Ref } from 'vue'
import { getAvailabilitySettings } from '@/configs/availabilitySettings'
import { createLogger } from '@/utils/logger'

const logger = createLogger('useAfterAppointmentBufferMinutes')

export function useAfterAppointmentBufferMinutes(): Ref<number> {
  const afterBufferMinutes = ref(0)

  watchEffect(async () => {
    try {
      const settings = await getAvailabilitySettings()
      const bufferMinutes = settings.buffers?.appointment?.minutes ?? 0
      const placement = settings.buffers?.appointment?.placement ?? 'off'
      afterBufferMinutes.value =
        placement === 'after' || placement === 'both' ? bufferMinutes : 0
    } catch (err) {
      logger.error('Failed to load appointment buffer for inspection deadline filter', err)
      afterBufferMinutes.value = 0
    }
  })

  return afterBufferMinutes
}
