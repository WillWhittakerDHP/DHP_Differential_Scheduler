/**
 * Shared utility for calculating parts totals
 * LEARNING: Generic function that works with both BookingPartInstance and GlobalEntity<'partInstance'>
 * WHY: Provides single source of truth for parts totals calculation, used by both wizard and admin
 * PATTERN: Minimal interface that both types satisfy
 */

/**
 * Minimal interface for parts with totals properties
 * LEARNING: Works with both BookingPartInstance and GlobalEntity<'partInstance'>
 * WHY: Allows shared utility to work with different part instance types
 * PATTERN: Define minimal interface with optional properties
 */
interface PartWithTotals {
  baseFee?: number | null
  baseTime?: number | null
  rateOverBaseFee?: number | null
  rateOverBaseTime?: number | null
}

/**
 * Parts totals calculation result
 * LEARNING: Contains all four totals calculated from parts
 * WHY: Provides structured return type for parts totals
 * PATTERN: Object with all four total properties
 */
interface PartsTotalsResult {
  totalBaseFee: number
  totalBaseTime: number
  totalRateOverBaseFee: number
  totalRateOverBaseTime: number
}

/**
 * Calculate totals from an array of parts
 * LEARNING: Sums baseFee, baseTime, rateOverBaseFee, and rateOverBaseTime from all parts
 * WHY: Shared utility for consistent calculation across wizard and admin
 * PATTERN: Reduce to sum each property, treating null/undefined as 0
 * 
 * @param parts - Array of parts with totals properties
 * @returns Object with all four totals
 */
export function calculatePartsTotals(parts: PartWithTotals[]): PartsTotalsResult {
  // LEARNING: Sum each property using reduce, treating null/undefined as 0
  // PATTERN: Use reduce with fallback to 0 for null/undefined values
  const totalBaseFee = parts.reduce((sum, part) => sum + (part.baseFee ?? 0), 0)
  const totalBaseTime = parts.reduce((sum, part) => sum + (part.baseTime ?? 0), 0)
  const totalRateOverBaseFee = parts.reduce((sum, part) => sum + (part.rateOverBaseFee ?? 0), 0)
  const totalRateOverBaseTime = parts.reduce((sum, part) => sum + (part.rateOverBaseTime ?? 0), 0)

  return {
    totalBaseFee,
    totalBaseTime,
    totalRateOverBaseFee,
    totalRateOverBaseTime
  }
}
