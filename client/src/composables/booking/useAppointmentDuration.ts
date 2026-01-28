/**
 * useAppointmentDuration Composable
 * 
 * LEARNING: Calculates on-site appointment duration from block instances
 * WHY: Extracts duration calculation logic from AvailabilityStep component
 * PATTERN: Composable that provides computed property for appointment duration
 */

import { computed, type ComputedRef } from 'vue'
import { roundUpToIncrement } from '@/utils/timeSlotCalculations'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'

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
   * Appointment duration in minutes (on-site only, rounded to 15-minute increment)
   * LEARNING: Calculates only on-site duration, not total duration
   * WHY: Report writing can happen off-site, so we only need to ensure on-site work fits in business hours
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

  /**
   * LEARNING: Calculate on-site duration from block instances
   * WHY: Need to ensure last appointment ends at or before day end
   * PATTERN: Sum baseTime from parts where onSite === true, round to 15-minute increment
   */
  const appointmentDuration = computed<number | null>(() => {
    const instances = accumulatedBlockInstances.value
    if (instances.length === 0) {
      return null
    }
    
    // LEARNING: Calculate on-site duration, not total duration
    // WHY: Report writing can happen off-site, so we only need to ensure on-site work fits in business hours
    // PATTERN: Sum baseTime from parts where onSite === true
    const onSiteDuration = instances.reduce((sum, bi) => {
      if (!bi.partInstances || bi.partInstances.length === 0) return sum
      return sum + bi.partInstances.reduce((partSum, part) => {
        // Only count parts that require being on-site
        return partSum + (part.onSite === true ? (part.baseTime || 0) : 0)
      }, 0)
    }, 0)
    
    // LEARNING: Round up to nearest 15-minute increment
    // WHY: Ensures durations align with standard time increments for cleaner scheduling
    // PATTERN: Use ceiling function to round up
    const roundedDuration = roundUpToIncrement(onSiteDuration, 15)
    
    return roundedDuration > 0 ? roundedDuration : null
  })

  return {
    appointmentDuration
  }
}
