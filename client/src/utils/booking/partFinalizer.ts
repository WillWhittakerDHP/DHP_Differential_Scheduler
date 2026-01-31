/**
 * Part Finalizer
 * 
 * LEARNING: Groups parts by part shape and creates PartFinal instances
 * WHY: Part shape is the semantic unit - all instances of same shape should be totaled
 * PATTERN: Pure functions for aggregation and flag-based grouping
 */

import type { BookingPartInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { PartFinal } from './PartFinal'
import type { EventInstance, EventShape } from '@/types/events'
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
function groupPartsByShape(
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
 * Create PartFinal instances from all parts
 * LEARNING: Groups parts by shape and creates PartFinal for each group
 * WHY: Provides aggregated parts with totaled values and computed boolean flags
 * PATTERN: Group by shape, then create finalized part for each group
 * 
 * @param parts - Array of BookingPartInstance objects
 * @returns Array of PartFinal instances, one per unique part shape
 */
export function createPartFinals(
  parts: BookingPartInstance[]
): PartFinal[] {
  const partsByShape = groupPartsByShape(parts)
  
  return Array.from(partsByShape.entries()).map(([partShape, shapeParts]) =>
    createPartFinal(partShape, shapeParts)
  )
}

/**
 * Filter out PartFinal instances that should be zeroed out
 * LEARNING: Removes PartFinal instances where zeroOutPart === true
 * WHY: Zeroed parts should not contribute to calculations
 * PATTERN: Filter based on zeroOutPart flag
 * 
 * @param partFinals - Array of PartFinal instances
 * @returns Array of PartFinal instances excluding zeroed parts
 */
export function filterZeroedParts(
  partFinals: PartFinal[]
): PartFinal[] {
  return partFinals.filter(part => !part.zeroOutPart)
}

/**
 * Calculate SlotShape from PartFinal instances (single-pass optimization)
 * LEARNING: Single iteration through partFinals instead of multiple separate filter+reduce operations
 * WHY: More efficient - O(n) instead of O(5n), reduces array iterations
 * PATTERN: Accumulate all totals in one pass
 * 
 * Session Event Refactor: Computes eventDurations dynamically from EventInstance[]
 * WHY: Enables extensible event system - new event types can be added without code changes
 * PATTERN: Build eventDurations Record from EventInstance[] stored on AppointmentShape
 * NOTE: Events are looked up from activeEventsByPartShape keyed by partShape name
 * 
 * LEARNING: Events are appointment-level features, not part properties
 * WHY: Events are configured at shape level (PartShape → EventInstance), stored on AppointmentShape
 * PATTERN: Look up EventInstance[] for each partShape, read metadata from EventShape
 * 
 * @param partFinals - Array of PartFinal instances
 * @param eventAssignmentsByPartShape - Record mapping partShape name → EventInstance[]
 * @param eventShapes - Array of EventShape objects for metadata lookup
 * @returns SlotShape with eventDurations Record and duration totals
 */
export function calculateSlotShape(
  partFinals: PartFinal[],
  eventAssignmentsByPartShape: Record<string, EventInstance[]> = {},
  eventShapes: EventShape[] = []
): import('@/types/appointment').SlotShape {
  let totalDuration = 0
  let clientStartOffset = 0
  
  // Initialize eventDurations Record
  // LEARNING: Use Record to store durations for each event shape name
  // WHY: Enables dynamic event types without hardcoded properties
  const eventDurations: Record<string, number> = {}
  
  // Create lookup map for EventShape by ID
  const eventShapeById = new Map(eventShapes.map(es => [es.id, es]))
  
  for (const part of partFinals) {
    const baseTime = part.baseTime
    // LEARNING: totalDuration always includes all parts
    totalDuration += baseTime
    
    // Get EventInstance[] for this partShape
    const events = eventAssignmentsByPartShape[part.partShape] || []
    
    // Process each event for this partShape
    for (const eventInstance of events) {
      // Look up EventShape to get event shape name and metadata
      const eventShape = eventShapeById.get(eventInstance.eventShapeRef)
      if (!eventShape) continue
      
      const eventShapeName = eventShape.name
      
      // Handle ternary events (OnSite, ClientPresent)
      if (eventShapeName === 'OnSite' || eventShapeName === 'ClientPresent') {
        // Read defaultTernaryValue from EventShape and use toBoolean with 'strict' mode
        // LEARNING: Only 'true' contributes to event calculations, 'override' does not
        // WHY: 'override' parts contribute to totalDuration but NOT to specific events
        const ternaryValue = eventShape.defaultTernaryValue ?? 'true'
        const isActive = toBoolean(ternaryValue as import('@/types/ternary').TernaryBoolean, 'strict')
        
        if (isActive) {
          eventDurations[eventShapeName] = (eventDurations[eventShapeName] || 0) + baseTime
          
          // LEARNING: clientStartOffset only applies when OnSite is true AND ClientPresent is false
          if (eventShapeName === 'OnSite') {
            // Check if ClientPresent is false for this partShape
            const hasClientPresent = events.some(ei => {
              const es = eventShapeById.get(ei.eventShapeRef)
              return es?.name === 'ClientPresent' && 
                     toBoolean((es.defaultTernaryValue ?? 'true') as import('@/types/ternary').TernaryBoolean, 'strict')
            })
            
            if (!hasClientPresent) {
              clientStartOffset += baseTime
            }
          }
        }
      }
      
      // Handle boolean events (Moveable)
      if (eventShapeName === 'Moveable') {
        // For boolean events, if event exists, it's active
        eventDurations[eventShapeName] = (eventDurations[eventShapeName] || 0) + baseTime
      }
    }
  }
  
  return { 
    totalDuration, 
    eventDurations,
    clientStartOffset
  }
}

/**
 * Calculate total duration for a group of PartFinal instances
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
