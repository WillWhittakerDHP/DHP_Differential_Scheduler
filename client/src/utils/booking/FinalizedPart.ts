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
  
  // Computed boolean flags (OR of all parts in group)
  // LEARNING: Boolean flags are computed as OR - if ANY part has the flag, the finalized part has it
  // WHY: Ensures all characteristics are preserved when aggregating multiple instances
  onSite: boolean
  clientPresent: boolean
  moveable: boolean
  
  // Special flags
  zeroOutPart: boolean  // If ANY part has zeroOutPart=true, this is true
  
  // Source data (for debugging/tracking)
  sourcePartInstances: BookingPartInstance[]
}

/**
 * Get total duration from a finalized part
 * LEARNING: Simple accessor for baseTime
 * WHY: Provides consistent interface for duration access
 * 
 * @param part - FinalizedPart instance
 * @returns Total duration in minutes
 */
export function getTotalDuration(part: FinalizedPart): number {
  return part.baseTime
}

/**
 * Check if finalized part requires on-site work
 * LEARNING: Checks onSite flag
 * WHY: Provides consistent interface for flag checking
 * 
 * @param part - FinalizedPart instance
 * @returns True if part requires on-site work
 */
export function isOnSite(part: FinalizedPart): boolean {
  return part.onSite === true
}

/**
 * Check if finalized part requires client presence
 * LEARNING: Checks clientPresent flag
 * WHY: Provides consistent interface for flag checking
 * 
 * @param part - FinalizedPart instance
 * @returns True if part requires client presence
 */
export function isClientPresent(part: FinalizedPart): boolean {
  return part.clientPresent === true
}

/**
 * Check if finalized part should be zeroed out
 * LEARNING: Checks zeroOutPart flag
 * WHY: Provides consistent interface for zero-out logic
 * 
 * @param part - FinalizedPart instance
 * @returns True if part should be zeroed out (excluded from calculations)
 */
export function shouldZeroOut(part: FinalizedPart): boolean {
  return part.zeroOutPart === true
}

/**
 * Create a FinalizedPart from a group of part instances with the same part shape
 * LEARNING: Aggregates multiple part instances into a single finalized part
 * WHY: Part shape is the semantic unit - all instances of same shape should be totaled
 * PATTERN: Sum numeric values, use OR logic for boolean flags
 * 
 * Boolean Computation Rules:
 * - onSite: true if ANY part has onSite === true
 * - clientPresent: true if ANY part has clientPresent === true
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
    onSite: parts.some(p => p.onSite === true),
    clientPresent: parts.some(p => p.clientPresent === true),
    moveable: parts.some(p => p.moveable === true),
    zeroOutPart: parts.some(p => p.zeroOutPart === true),
    sourcePartInstances: parts
  }
}
