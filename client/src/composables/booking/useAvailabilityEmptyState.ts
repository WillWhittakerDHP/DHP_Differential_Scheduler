/**
 * WHY: useAvailabilityEmptyState Composable

WHY: Extracts empty state message ...
 */
import { computed } from 'vue'
import { useAvailabilitySettings } from '@/composables/booking/useAvailabilitySettings'
import type { UseAvailabilityEmptyStateParams, UseAvailabilityEmptyStateReturn } from '@/types/booking/availabilityEmptyState'

export type { UseAvailabilityEmptyStateParams, UseAvailabilityEmptyStateReturn } from '@/types/booking/availabilityEmptyState'

/**
 * WHY: useAvailabilityEmptyState composable

WHY: Extracts empty state message ...
 */
export function useAvailabilityEmptyState(
  params: UseAvailabilityEmptyStateParams
): UseAvailabilityEmptyStateReturn {
  const { isEffectivelyDifferential, startTimeType, appointmentSlotsCount } = params
  
  const { settings: availabilitySettings } = useAvailabilitySettings()
  const majorLabel = computed(() => {
    const raw = availabilitySettings.value?.differentialPerspectives?.majorLabel
    return raw !== undefined && raw !== null && raw !== '' ? raw : 'Major'
  })
  const minorLabel = computed(() => {
    const raw = availabilitySettings.value?.differentialPerspectives?.minorLabel
    return raw !== undefined && raw !== null && raw !== '' ? raw : 'Minor'
  })

  /**
   * LEARNING: Compute empty state message based on service type and perspective
   */
  const emptyStateMessage = computed<string | null>(() => {
    if (appointmentSlotsCount.value > 0) {
      return null
    }
    
    if (isEffectivelyDifferential.value && startTimeType.value === 'nonDifferential') {
      return `Click on the ${majorLabel.value} or ${minorLabel.value} bars below the calendar to view available times.`
    }
    
    return 'No time slots available for selected date.'
  })

  return {
    emptyStateMessage
  }
}
