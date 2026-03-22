/**
 * WHY: useAvailabilityEmptyState Composable

WHY: Extracts empty state message ...
 */
import { computed } from 'vue'
import { useWizardSettings } from '@/composables/admin/useWizardSettings'
import type { UseAvailabilityEmptyStateParams, UseAvailabilityEmptyStateReturn } from '@/types/booking/availabilityEmptyState'

/**
 * WHY: useAvailabilityEmptyState composable

WHY: Extracts empty state message ...
 */
export function useAvailabilityEmptyState(
  params: UseAvailabilityEmptyStateParams
): UseAvailabilityEmptyStateReturn {
  const { isEffectivelyDifferential, startTimeType, appointmentSlotsCount } = params
  
  const { labels } = useWizardSettings()
  const { majorLabel, minorLabel } = labels

  /**
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
