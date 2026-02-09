/**
 * Duration Calculation Utility
 * 
 * LEARNING: Calculates duration from block instances
 * WHY: Extracted from timeSlotCalculations.ts after removing dead code
 * PATTERN: Pure function for duration calculation
 */

import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import { DEFAULT_APPOINTMENT_DURATION_MINUTES } from '@/constants/scheduling'

/**
 * Calculate duration from accumulated block instances
 * LEARNING: Sums all baseTime values from partInstances across all selected block instances
 * WHY: Duration includes time from base service, property type blocks, and availability options
 * PATTERN: Reduce block instances to sum of all part instances' baseTime values
 * Session 1.3.7: Refactored to handle all block instance types (service, property type block, availability options)
 * 
 * @param blockInstances - Array of BookingBlockInstance objects (service, property type block, availability options)
 * @returns Total duration in minutes, defaults to 90 if no block instances or part instances
 */
export function calculateDurationFromBlockInstances(blockInstances: BookingBlockInstance[]): number {
  if (!blockInstances || blockInstances.length === 0) {
    return DEFAULT_APPOINTMENT_DURATION_MINUTES
  }
  
  // PATTERN: Reduce block instances, then reduce part instances within each block
  const totalDuration = blockInstances.reduce((total, blockInstance) => {
    if (!blockInstance.partInstances || blockInstance.partInstances.length === 0) {
      return total
    }
    const blockDuration = blockInstance.partInstances.reduce((sum, partInstance) => {
      return sum + (partInstance.baseTime || 0)
    }, 0)
    return total + blockDuration
  }, 0)
  
  return totalDuration > 0 ? totalDuration : DEFAULT_APPOINTMENT_DURATION_MINUTES
}
