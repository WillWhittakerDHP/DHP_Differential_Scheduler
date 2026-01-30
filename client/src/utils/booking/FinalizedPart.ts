/**
 * FinalizedPart: Aggregated part instance representing all parts of a given shape
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
import { aggregate } from '@/utils/ternary/ternaryUtils'

/**
 * FinalizedPart: Aggregated part instance representing all parts of a given shape
 * LEARNING: Groups multiple part instances by part shape and totals their values
 * WHY: Part shape is the semantic unit - all instances of same shape should be totaled
 * PATTERN: Plain interface with utility functions for calculations
 */
export interface FinalizedPart {
  // Identity
  partShape: string  // Part shape name (e.g., "Client Presentation")
  
  // Totaled values
  baseTime: number
  baseFee: number
  rateOverBaseTime: number
  rateOverBaseFee: number
  
  // Computed ternary flags (aggregated from all parts in group)
  // LEARNING: Ternary flags are aggregated using ternary logic - if ANY part has 'override', result is 'override'
  // WHY: Ensures all characteristics are preserved when aggregating multiple instances
  onSite: TernaryBoolean
  clientPresent: TernaryBoolean
  moveable: boolean
  
  // Special flags
  zeroOutPart: boolean  // If ANY part has zeroOutPart=true, this is true
  
  // Source data (for debugging/tracking)
  sourcePartInstances: BookingPartInstance[]
}

// Removed unused export: getTotalDuration
// LEARNING: Function was exported but never imported elsewhere
// WHY: Removes dead code to improve maintainability

// Removed unused export: isOnSite
// LEARNING: Function was exported but never imported elsewhere
// WHY: Removes dead code to improve maintainability

// Removed unused export: isClientPresent
// LEARNING: Function was exported but never imported elsewhere
// WHY: Removes dead code to improve maintainability

// Removed unused export: shouldZeroOut
// LEARNING: Function was exported but never imported elsewhere
// WHY: Removes dead code to improve maintainability

/**
 * Create a FinalizedPart from a group of part instances with the same part shape
 * LEARNING: Aggregates multiple part instances into a single finalized part
 * WHY: Part shape is the semantic unit - all instances of same shape should be totaled
 * PATTERN: Sum numeric values, use OR logic for boolean flags
 * 
 * Ternary Computation Rules:
 * - onSite: aggregated using ternaryUtils.aggregate() - if ANY part has 'override', result is 'override'; otherwise OR of 'true' values
 * - clientPresent: aggregated using ternaryUtils.aggregate() - if ANY part has 'override', result is 'override'; otherwise OR of 'true' values
 * - moveable: true if ANY part has moveable === true
 * - zeroOutPart: true if ANY part has zeroOutPart === true
 * 
 * @param partShape - Part shape name (e.g., "Client Presentation")
 * @param parts - Array of BookingPartInstance objects with the same part shape
 * @returns FinalizedPart instance with totaled values and computed flags
 */
export function createFinalizedPart(
  partShape: string,
  parts: BookingPartInstance[]
): FinalizedPart {
  return {
    partShape,
    baseTime: parts.reduce((sum, p) => sum + (p.baseTime ?? 0), 0),
    baseFee: parts.reduce((sum, p) => sum + (p.baseFee ?? 0), 0),
    rateOverBaseTime: parts.reduce((sum, p) => sum + (p.rateOverBaseTime ?? 0), 0),
    rateOverBaseFee: parts.reduce((sum, p) => sum + (p.rateOverBaseFee ?? 0), 0),
    onSite: aggregate(parts.map(p => p.onSite)),
    clientPresent: aggregate(parts.map(p => p.clientPresent)),
    moveable: parts.some(p => p.moveable === true),
    zeroOutPart: parts.some(p => p.zeroOutPart === true),
    sourcePartInstances: parts
  }
}
