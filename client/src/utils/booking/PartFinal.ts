/**
 * PartFinal: Aggregated part instance representing all parts of a given shape
 * 
 * 
 * This eliminates the need for categorization - parts are grouped by their actual
 * part shape, and boolean flags determine how they're used in calculations.
 */

import type { BookingPartInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { TernaryBoolean } from '@/types/ternary'

/**
 * PartFinal: Aggregated part instance representing all parts of a given shape
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





/** Placeholder values until eventAssignments-derived major/minor/moveable are wired. */
const PART_FINAL_DEFAULT_MAJOR = 'false' as const
const PART_FINAL_DEFAULT_MINOR = 'false' as const
const PART_FINAL_DEFAULT_MOVEABLE = false

/**
 * Create PartFinal from grouped part instances
 *
 * @param partShape - Part shape name
 * @param parts - Array of BookingPartInstance objects with same partShape
 * @returns PartFinal with raw baseTime (no rounding)
 */
export function createPartFinal(
  partShape: string,
  parts: BookingPartInstance[]
): PartFinal {
  const baseTime = parts.reduce((sum, p) => sum + (p.baseTime ?? 0), 0)

  return {
    partShape,
    baseTime,
    baseFee: parts.reduce((sum, p) => sum + (p.baseFee ?? 0), 0),
    rateOverBaseTime: parts.reduce((sum, p) => sum + (p.rateOverBaseTime ?? 0), 0),
    rateOverBaseFee: parts.reduce((sum, p) => sum + (p.rateOverBaseFee ?? 0), 0),
    major: PART_FINAL_DEFAULT_MAJOR,
    minor: PART_FINAL_DEFAULT_MINOR,
    moveable: PART_FINAL_DEFAULT_MOVEABLE,
    zeroOutPart: parts.some(p => p.zeroOutPart === true),
    sourcePartInstances: parts
  }
}
