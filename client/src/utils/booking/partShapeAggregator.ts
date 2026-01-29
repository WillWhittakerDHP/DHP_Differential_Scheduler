/**
 * Part Shape Aggregator
 * 
 * LEARNING: Groups parts by part shape and creates FinalizedPart instances
 * WHY: Part shape is the semantic unit - all instances of same shape should be totaled
 * PATTERN: Pure functions for aggregation and flag-based grouping
 */

import type { BookingPartInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { FinalizedPart } from './FinalizedPart'
import { createFinalizedPart } from './FinalizedPart'

/**
 * Group parts by part shape
 * LEARNING: Groups part instances by their partShape property
 * WHY: Part shape is the semantic unit - all instances of same shape should be totaled together
 * PATTERN: Use reduce to build Map of part shape name to array of parts
 * 
 * @param parts - Array of BookingPartInstance objects
 * @returns Map of part shape name to array of parts with that shape
 */
export function groupPartsByPartShape(
  parts: BookingPartInstance[]
): Map<string, BookingPartInstance[]> {
  return parts.reduce((grouped, part) => {
    const partShape = part.partShape || ''
    if (!grouped.has(partShape)) {
      grouped.set(partShape, [])
    }
    grouped.get(partShape)!.push(part)
    return grouped
  }, new Map<string, BookingPartInstance[]>())
}

/**
 * Create finalized parts from all parts
 * LEARNING: Groups parts by shape and creates FinalizedPart for each group
 * WHY: Provides aggregated parts with totaled values and computed boolean flags
 * PATTERN: Group by shape, then create finalized part for each group
 * 
 * @param parts - Array of BookingPartInstance objects
 * @returns Array of FinalizedPart instances, one per unique part shape
 */
export function createFinalizedParts(
  parts: BookingPartInstance[]
): FinalizedPart[] {
  const partsByShape = groupPartsByPartShape(parts)
  
  return Array.from(partsByShape.entries()).map(([partShape, shapeParts]) =>
    createFinalizedPart(partShape, shapeParts)
  )
}

/**
 * Filter out finalized parts that should be zeroed out
 * LEARNING: Removes finalized parts where zeroOutPart === true
 * WHY: Zeroed parts should not contribute to calculations
 * PATTERN: Filter based on zeroOutPart flag
 * 
 * @param finalizedParts - Array of FinalizedPart instances
 * @returns Array of finalized parts excluding zeroed parts
 */
export function filterZeroedParts(
  finalizedParts: FinalizedPart[]
): FinalizedPart[] {
  return finalizedParts.filter(part => !part.zeroOutPart)
}

/**
 * Group finalized parts by flag combinations for UI display and calculations
 * LEARNING: No hardcoded categories - derive groups from boolean flags
 * WHY: Extensible - new part shapes automatically work without code changes
 * PATTERN: Filter finalized parts by flag combinations
 * 
 * @param finalizedParts - Array of FinalizedPart instances
 * @returns Object with flag-based groups
 */
export function groupFinalizedPartsByFlags(
  finalizedParts: FinalizedPart[]
): {
  clientPresentation: FinalizedPart[]  // clientPresent === true
  dataCollection: FinalizedPart[]     // onSite === true && clientPresent === false
  earlyArrival: FinalizedPart[]      // moveable === true && onSite === true
  reportWriting: FinalizedPart[]     // onSite === false
} {
  return {
    clientPresentation: finalizedParts.filter(p => p.clientPresent === true),
    dataCollection: finalizedParts.filter(p => p.onSite === true && p.clientPresent === false),
    earlyArrival: finalizedParts.filter(p => p.moveable === true && p.onSite === true),
    reportWriting: finalizedParts.filter(p => p.onSite === false)
  }
}

/**
 * Calculate total duration for a group of finalized parts
 * LEARNING: Sums baseTime from all parts in group
 * WHY: Provides total duration for flag-based groups
 * PATTERN: Reduce to sum baseTime values
 * 
 * @param parts - Array of FinalizedPart instances
 * @returns Total duration in minutes
 */
export function sumFinalizedPartsDuration(parts: FinalizedPart[]): number {
  return parts.reduce((sum, part) => sum + part.baseTime, 0)
}
