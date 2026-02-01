/**
 * Part Shape Aggregator
 * 
 * LEARNING: Groups parts by part shape and creates PartFinal instances
 * WHY: Part shape is the semantic unit - all instances of same shape should be totaled
 * PATTERN: Pure functions for aggregation and flag-based grouping
 */

import type { BookingPartInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { PartFinal } from './PartFinal'
import { createPartFinal } from './PartFinal'
import { toBoolean } from '@/utils/ternary/ternaryUtils'

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

export function createPartFinals(
  parts: BookingPartInstance[]
): PartFinal[] {
  const partsByShape = groupPartsByPartShape(parts)
  
  return Array.from(partsByShape.entries()).map(([partShape, shapeParts]) =>
    createPartFinal(partShape, shapeParts)
  )
}

/**
 * Filter out finalized parts that should be zeroed out
 * LEARNING: Removes finalized parts where zeroOutPart === true
 * WHY: Zeroed parts should not contribute to calculations
 * PATTERN: Filter based on zeroOutPart flag
 * 
 * @param finalizedParts - Array of PartFinal instances
 * @returns Array of finalized parts excluding zeroed parts
 */
export function filterZeroedParts(
  finalizedParts: PartFinal[]
): PartFinal[] {
  return finalizedParts.filter(part => !part.zeroOutPart)
}

/**
 * Calculate SlotShape from finalized parts (single-pass optimization)
 * LEARNING: Single iteration through finalizedParts instead of multiple separate filter+reduce operations
 * WHY: More efficient - O(n) instead of O(5n), reduces array iterations
 * PATTERN: Accumulate all totals in one pass
 * 
 * Session Event Refactor: Computes eventDurations dynamically from part properties
 * WHY: Enables extensible event system - new event types can be added without code changes
 * PATTERN: Build eventDurations Record from finalizedPart properties (major, minor, moveable)
 * NOTE: Properties are computed from eventAssignments relationships in booking transformer
 * 
 * ARCHITECTURAL CHANGE: Removed eventAssignments parameter - events are now computed in booking transformer
 * WHY: Uniform relationship handling - events flow through GlobalRelationship[], not special types
 * PATTERN: Use properties computed from relationships (major, minor, moveable) instead of direct relationship access
 * 
 * @param finalizedParts - Array of PartFinal instances
 * @returns SlotShape with eventDurations Record and duration totals
 */
export function calculateSlotShape(
  finalizedParts: PartFinal[]
): import('@/types/appointment').SlotShape {
  let totalDuration = 0
  let differentialOffset = 0
  
  const eventDurations: Record<string, number> = {}
  
  // WHY: Properties are computed from relationships in booking transformer, map to event names here
  // PATTERN: Use properties computed from GlobalRelationship[] with metadata lookups
  const eventMappings: Record<string, string> = {
    'major': 'Major',
    'minor': 'Minor',
    'moveable': 'Moveable'
  }
  
  for (const part of finalizedParts) {
    const baseTime = part.baseTime
    totalDuration += baseTime
    
    const isMajor = toBoolean(part.major, 'strict')
    const isMinor = toBoolean(part.minor, 'strict')
    const isMoveable = part.moveable === true
    
    // LEARNING: Properties (major, minor, moveable) are computed from eventAssignments relationships in booking transformer
    // PATTERN: Use properties computed from relationships, map to event shape names
    if (isMajor) {
      const eventName = eventMappings['major']
      eventDurations[eventName] = (eventDurations[eventName] || 0) + baseTime
      if (!isMinor) {
        differentialOffset += baseTime
      }
    }
    
    if (isMinor) {
      const eventName = eventMappings['minor']
      eventDurations[eventName] = (eventDurations[eventName] || 0) + baseTime
    }
    
    if (isMoveable) {
      const eventName = eventMappings['moveable']
      eventDurations[eventName] = (eventDurations[eventName] || 0) + baseTime
    }
  }
  
  // PATTERN: Convert eventDurations Record to eventFinals array format
  return { 
    totalDuration, 
    eventFinals: [], // TODO: Convert eventDurations to eventFinals array format
    differentialOffset
  }
}

/**
 * Calculate total duration for a group of finalized parts
 * LEARNING: Sums baseTime from all parts in group
 * WHY: Provides total duration for flag-based groups
 * PATTERN: Reduce to sum baseTime values
 * 
 * @param parts - Array of PartFinal instances
 * @returns Total duration in minutes
 */
export function sumPartFinalsDuration(parts: PartFinal[]): number {
  return parts.reduce((sum, part) => sum + part.baseTime, 0)
}
