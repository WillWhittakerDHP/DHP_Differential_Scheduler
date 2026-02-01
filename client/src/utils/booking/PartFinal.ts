/**
 * PartFinal: Aggregated part instance representing all parts of a given shape
 * 
 * LEARNING: Groups multiple part instances by part shape and totals their values
 * WHY: Part shape is the semantic unit - all instances of same shape should be totaled
 * PATTERN: Plain interface with utility functions for calculations
 * 
 * This eliminates the need for categorization - parts are grouped by their actual
 * part shape, and boolean flags determine how they're used in calculations.
 */

import type { BookingPartInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { TernaryBoolean } from '@/types/ternary'
import type { AvailabilitySettings } from '@/configs/availabilitySettings'
import { roundDuration } from '@/utils/booking/durationRounding'

/**
 * PartFinal: Aggregated part instance representing all parts of a given shape
 * LEARNING: Groups multiple part instances by part shape and totals their values
 * WHY: Part shape is the semantic unit - all instances of same shape should be totaled
 * PATTERN: Plain interface with utility functions for calculations
 */
export interface PartFinal {
  partShape: string  // Part shape name (e.g., "Client Presentation")
  
  baseTime: number      // Raw duration before rounding
  roundedTime: number   // Rounded duration (computed from baseTime using rounding settings)
  baseFee: number
  rateOverBaseTime: number
  rateOverBaseFee: number
  
  major: TernaryBoolean
  minor: TernaryBoolean
  moveable: boolean
  
  zeroOutPart: boolean  // If ANY part has zeroOutPart=true, this is true
  
  sourcePartInstances: BookingPartInstance[]
}





/**
 * Create PartFinal from grouped part instances
 * LEARNING: Computes both raw (baseTime) and rounded (roundedTime) durations
 * WHY: Dual-track architecture - stores both values for consistency and flexibility
 * PATTERN: Round at part level, propagate upward through sums
 * 
 * @param partShape - Part shape name
 * @param parts - Array of BookingPartInstance objects with same partShape
 * @param settings - Optional availability settings for rounding configuration
 * @returns PartFinal with both raw and rounded durations
 */
export function createPartFinal(
  partShape: string,
  parts: BookingPartInstance[],
  settings?: AvailabilitySettings | null
): PartFinal {
  // PATTERN: For now, use default values - these should be computed from eventAssignments in the future
  // NOTE: This is a temporary solution - these properties should be computed from events when creating PartFinal
  const baseTime = parts.reduce((sum, p) => sum + (p.baseTime ?? 0), 0)
  const roundedTime = roundDuration(baseTime, settings || null)
  
  return {
    partShape,
    baseTime,
    roundedTime,
    baseFee: parts.reduce((sum, p) => sum + (p.baseFee ?? 0), 0),
    rateOverBaseTime: parts.reduce((sum, p) => sum + (p.rateOverBaseTime ?? 0), 0),
    rateOverBaseFee: parts.reduce((sum, p) => sum + (p.rateOverBaseFee ?? 0), 0),
    major: 'false' as const, // TODO: Compute from eventAssignments relationships
    minor: 'false' as const, // TODO: Compute from eventAssignments relationships
    moveable: false, // TODO: Compute from eventAssignments relationships
    zeroOutPart: parts.some(p => p.zeroOutPart === true),
    sourcePartInstances: parts
  }
}
