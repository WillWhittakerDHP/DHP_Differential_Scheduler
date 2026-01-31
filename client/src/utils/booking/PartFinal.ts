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
  major: TernaryBoolean
  minor: TernaryBoolean
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
 * Create a PartFinal from a group of part instances with the same part shape
 * LEARNING: Aggregates multiple part instances into a single finalized part
 * WHY: Part shape is the semantic unit - all instances of same shape should be totaled
 * PATTERN: Sum numeric values, use OR logic for boolean flags
 * 
 * LEARNING: Events are not part properties - they are appointment-level features
 * WHY: Events are configured at shape level (PartShape → EventInstance), stored on AppointmentShape
 * PATTERN: Events are looked up from AppointmentShape.eventAssignmentsByPartShape[partShape] when needed
 * 
 * @param partShape - Part shape name (e.g., "Client Presentation")
 * @param parts - Array of BookingPartInstance objects with the same part shape
 * @returns PartFinal instance with totaled values
 */
export function createPartFinal(
  partShape: string,
  parts: BookingPartInstance[]
): PartFinal {
  // LEARNING: major, minor, and moveable are computed from eventAssignments relationships
  // WHY: These properties were deprecated on BookingPartInstance - they should be computed from events
  // PATTERN: For now, use default values - these should be computed from eventAssignments in the future
  // NOTE: This is a temporary solution - these properties should be computed from events when creating PartFinal
  // TODO: Compute major/minor/moveable from eventAssignments relationships using globalData and event shapes
  return {
    partShape,
    baseTime: parts.reduce((sum, p) => sum + (p.baseTime ?? 0), 0),
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
