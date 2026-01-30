/**
 * useAppointmentDuration Composable
 * 
 * LEARNING: Calculates on-site appointment duration from block instances
 * WHY: Extracts duration calculation logic from AvailabilityStep component
 * PATTERN: Composable that provides computed property for appointment duration
 */

import { computed, type ComputedRef } from 'vue'
import { useDurationRounding } from '@/composables/booking/useDurationRounding'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import { toBoolean } from '@/utils/ternary/ternaryUtils'

/**
 * useAppointmentDuration composable parameters
 */
export interface UseAppointmentDurationParams {
  /**
   * Accumulated block instances (services, property type blocks, availability options)
   */
  accumulatedBlockInstances: ComputedRef<BookingBlockInstance[]>
}

/**
 * useAppointmentDuration composable return type
 */
export interface UseAppointmentDurationReturn {
  /**
   * Appointment duration in minutes (on-site only, with configurable rounding)
   * LEARNING: Calculates only on-site duration, not total duration
   * WHY: Report writing can happen off-site, so we only need to ensure on-site work fits in business hours
   * NOTE: Rounding is configurable via Business Controls tab (defaults to disabled)
   */
  appointmentDuration: ComputedRef<number | null>
}

/**
 * useAppointmentDuration composable
 * 
 * LEARNING: Calculates on-site duration from block instances
 * WHY: Extracts duration calculation logic from component to composable
 * PATTERN: Composable that returns reactive computed property
 */
export function useAppointmentDuration(
  params: UseAppointmentDurationParams
): UseAppointmentDurationReturn {
  const { accumulatedBlockInstances } = params

  // LEARNING: Get rounding function from composable
  // WHY: Provides reactive rounding that respects availability settings
  // PATTERN: Use composable for rounding logic
  const { roundDuration } = useDurationRounding()

  /**
   * LEARNING: Calculate on-site duration from block instances
   * WHY: Need to ensure last appointment ends at or before day end
   * PATTERN: Sum baseTime from parts where onSite === true, apply configurable rounding
   */
  const appointmentDuration = computed<number | null>(() => {
    const instances = accumulatedBlockInstances.value
    if (instances.length === 0) {
      return null
    }
    
    // LEARNING: Calculate on-site duration, not total duration
    // WHY: Report writing can happen off-site, so we only need to ensure on-site work fits in business hours
    // PATTERN: Sum baseTime from parts where onSite is 'true' (using strict mode - override excluded)
    const onSiteDuration = instances.reduce((sum, bi) => {
      if (!bi.partInstances || bi.partInstances.length === 0) return sum
      return sum + bi.partInstances.reduce((partSum, part) => {
        // LEARNING: Use toBoolean with 'strict' mode - only 'true' contributes to onSite calculation
        // WHY: 'override' parts contribute to totalDuration but NOT to onSite
        return partSum + (toBoolean(part.onSite, 'strict') ? (part.baseTime || 0) : 0)
      }, 0)
    }, 0)
    
    // LEARNING: Apply configurable rounding based on availability settings
    // WHY: Allows admin to control rounding behavior via Business Controls tab
    // PATTERN: Use composable rounding function that respects settings
    const roundedDuration = roundDuration(onSiteDuration)
    
    return roundedDuration > 0 ? roundedDuration : null
  })

  return {
    appointmentDuration
  }
}
