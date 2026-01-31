/**
 * Part Shape Aggregator
 * 
 * LEARNING: Groups parts by part shape and creates FinalizedPart instances
 * WHY: Part shape is the semantic unit - all instances of same shape should be totaled
 * PATTERN: Pure functions for aggregation and flag-based grouping
 */

import type { BookingPartInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { FinalizedPart } from './FinalizedPart'
import type { EventAssignmentRelationship } from '@/types/events'
import { createFinalizedPart } from './FinalizedPart'
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
 * Calculate SlotShape from finalized parts (single-pass optimization)
 * LEARNING: Single iteration through finalizedParts instead of multiple separate filter+reduce operations
 * WHY: More efficient - O(n) instead of O(5n), reduces array iterations
 * PATTERN: Accumulate all totals in one pass
 * 
 * Session Event Refactor: Computes eventDurations dynamically from part properties
 * WHY: Enables extensible event system - new event types can be added without code changes
 * PATTERN: Build eventDurations Record from finalizedPart properties (onSite, clientPresent, moveable)
 * NOTE: Properties are computed from activeEvents relationships in booking transformer
 * 
 * ARCHITECTURAL CHANGE: Removed activeEvents parameter - events are now computed in booking transformer
 * WHY: Uniform relationship handling - events flow through GlobalRelationship[], not special types
 * PATTERN: Use properties computed from relationships (onSite, clientPresent, moveable) instead of direct relationship access
 * 
 * @param finalizedParts - Array of FinalizedPart instances
 * @returns SlotShape with eventDurations Record and duration totals
 */
export function calculateSlotShape(
  finalizedParts: FinalizedPart[]
): import('@/types/appointment').SlotShape {
  let totalDuration = 0
  let clientStartOffset = 0
  
  // Initialize eventDurations Record
  // LEARNING: Use Record to store durations for each event shape name
  // WHY: Enables dynamic event types without hardcoded properties
  const eventDurations: Record<string, number> = {}
  
  // Event mappings from part properties to event shape names
  // LEARNING: Map part properties (computed from activeEvents relationships) to event shape names
  // WHY: Properties are computed from relationships in booking transformer, map to event names here
  // PATTERN: Use properties computed from GlobalRelationship[] with metadata lookups
  const eventMappings: Record<string, string> = {
    'onSite': 'OnSite',
    'clientPresent': 'ClientPresent',
    'moveable': 'Moveable'
  }
  
  for (const part of finalizedParts) {
    const baseTime = part.baseTime
    // LEARNING: totalDuration always includes all parts (override contributes to totalDuration)
    totalDuration += baseTime
    
    // LEARNING: Use toBoolean with 'strict' mode - only 'true' contributes to event calculations
    // WHY: 'override' parts contribute to totalDuration but NOT to specific events
    const isOnSite = toBoolean(part.onSite, 'strict')
    const isClientPresent = toBoolean(part.clientPresent, 'strict')
    const isMoveable = part.moveable === true
    
    // Compute event durations from part properties
    // LEARNING: Properties (onSite, clientPresent, moveable) are computed from activeEvents relationships in booking transformer
    // WHY: Uniform relationship handling - events flow through GlobalRelationship[], properties computed during transformation
    // PATTERN: Use properties computed from relationships, map to event shape names
    if (isOnSite) {
      const eventName = eventMappings['onSite']
      eventDurations[eventName] = (eventDurations[eventName] || 0) + baseTime
      // LEARNING: clientStartOffset only applies when onSite is true AND clientPresent is false
      if (!isClientPresent) {
        clientStartOffset += baseTime
      }
    }
    
    if (isClientPresent) {
      const eventName = eventMappings['clientPresent']
      eventDurations[eventName] = (eventDurations[eventName] || 0) + baseTime
    }
    
    if (isMoveable) {
      const eventName = eventMappings['moveable']
      eventDurations[eventName] = (eventDurations[eventName] || 0) + baseTime
    }
  }
  
  return { 
    totalDuration, 
    eventDurations,
    clientStartOffset
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
