/**
 * useAvailabilityEmptyState Composable
 * 
 * LEARNING: Provides empty state message for availability step
 * WHY: Extracts empty state message logic from AvailabilityStep component
 * PATTERN: Composable that provides computed property for empty state message
 */

import { computed, type ComputedRef, type Ref } from 'vue'
import { useAvailabilitySettings } from '@/composables/booking/useAvailabilitySettings'

/**
 * useAvailabilityEmptyState composable parameters
 */
export interface UseAvailabilityEmptyStateParams {
  /**
   * Whether service is effectively differential
   */
  isEffectivelyDifferential: ComputedRef<boolean>
  
  /**
   * Start time type
   */
  startTimeType: Ref<'major' | 'minor' | 'nonDifferential'>
  
  /**
   * Number of appointment slots
   */
  appointmentSlotsCount: ComputedRef<number>
}

/**
 * useAvailabilityEmptyState composable return type
 */
export interface UseAvailabilityEmptyStateReturn {
  /**
   * Empty state message (null if slots are available)
   * LEARNING: Provides user-friendly message when no slots are available
   * WHY: Guides users on what to do when no slots are shown
   */
  emptyStateMessage: ComputedRef<string | null>
}

/**
 * useAvailabilityEmptyState composable
 * 
 * LEARNING: Provides empty state message for availability step
 * WHY: Extracts empty state message logic from component to composable
 * PATTERN: Composable that returns reactive computed property
 */
export function useAvailabilityEmptyState(
  params: UseAvailabilityEmptyStateParams
): UseAvailabilityEmptyStateReturn {
  const { isEffectivelyDifferential, startTimeType, appointmentSlotsCount } = params
  
  // LEARNING: Get configured labels from availability settings
  // WHY: Labels are configurable in admin panel, use configured values instead of hardcoded names
  const { settings: availabilitySettings } = useAvailabilitySettings()
  const majorLabel = computed(() => 
    availabilitySettings.value?.differentialPerspectives?.majorLabel || 'Major'
  )
  const minorLabel = computed(() => 
    availabilitySettings.value?.differentialPerspectives?.minorLabel || 'Minor'
  )

  /**
   * LEARNING: Compute empty state message based on service type and perspective
   * WHY: Provides contextual guidance when no slots are available
   * PATTERN: Return null if slots are available, otherwise return appropriate message
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
