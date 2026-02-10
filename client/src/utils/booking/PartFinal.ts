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

/**
 * PartFinal: Aggregated part instance representing all parts of a given shape
 * LEARNING: Groups multiple part instances by part shape and totals their values
 * WHY: Part shape is the semantic unit - all instances of same shape should be totaled
 * PATTERN: Plain interface with utility functions for calculations
 */
export interface PartFinal {
  partShape: string  // Part shape name (e.g., "Client Presentation")
  
  baseTime: number      // Raw duration (rounding happens at event level, not part level)
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
 * LEARNING: Computes raw baseTime only - rounding happens at event level
 * WHY: Rounding moved to event level to prevent double rounding inflation
 * PATTERN: Sum raw values, rounding applied later when accumulating events
 * 
 * @param partShape - Part shape name
 * @param parts - Array of BookingPartInstance objects with same partShape
 * @returns PartFinal with raw baseTime (no rounding)
 */
export function createPartFinal(
  partShape: string,
  parts: BookingPartInstance[]
): PartFinal {
  // PATTERN: For now, use default values - these should be computed from eventAssignments in the future
  // NOTE: This is a temporary solution - these properties should be computed from events when creating PartFinal
  const baseTime = parts.reduce((sum, p) => sum + (p.baseTime ?? 0), 0)
  
  return {
    partShape,
    baseTime,
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
