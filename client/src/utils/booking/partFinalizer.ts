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
 * Session Event Refactor: Computes eventFinals array dynamically from EventInstance[]
 * WHY: Enables fully generic event system - no hardcoded event names, matches PartFinal[] pattern
 * PATTERN: Build EventFinal[] array from EventInstance[] stored on AppointmentShape
 * NOTE: Events are looked up from eventAssignmentsByPartShape keyed by partShape name
 * 
 * LEARNING: Events are appointment-level features, not part properties
 * WHY: Events are configured at shape level (PartShape → EventInstance), stored on AppointmentShape
 * PATTERN: Look up EventInstance[] for each partShape, read metadata from EventShape
 * 
 * @param partFinals - Array of PartFinal instances
 * @param eventAssignmentsByPartShape - Record mapping partShape name → EventInstance[]
 * @param eventShapes - Array of EventShape objects for metadata lookup
 * @returns SlotShape with eventFinals array and duration totals
 */
export function calculateSlotShape(
  partFinals: PartFinal[],
  eventAssignmentsByPartShape: Record<string, EventInstance[]> = {},
  eventShapes: EventShape[] = []
): import('@/types/appointment').SlotShape {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/dee08c11-824d-42a5-9020-c38261879107',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'partFinalizer.ts:91',message:'calculateSlotShape entry',data:{partFinalsCount:partFinals.length,eventShapesCount:eventShapes.length,eventAssignmentsKeys:Object.keys(eventAssignmentsByPartShape),eventAssignmentsCounts:Object.fromEntries(Object.entries(eventAssignmentsByPartShape).map(([k,v])=>[k,v.length]))},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  let totalDuration = 0
  let clientStartOffset = 0
  
  // LEARNING: Use Map to accumulate durations by event shape ID
  // WHY: Groups durations by event shape, then converts to EventFinal[] array
  // PATTERN: Map<eventShapeId, duration> for accumulation, then convert to array
  const eventDurationsByShapeId = new Map<string, number>()
  
  // Create lookup map for EventShape by ID
  const eventShapeById = new Map(eventShapes.map(es => [es.id, es]))
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/dee08c11-824d-42a5-9020-c38261879107',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'partFinalizer.ts:105',message:'eventShapeById created',data:{eventShapeByIdSize:eventShapeById.size,eventShapeIds:Array.from(eventShapeById.keys())},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  
  for (const part of partFinals) {
    const baseTime = part.baseTime
    // LEARNING: totalDuration always includes all parts
    totalDuration += baseTime
    
    // Get EventInstance[] for this partShape
    const events = eventAssignmentsByPartShape[part.partShape] || []
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/dee08c11-824d-42a5-9020-c38261879107',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'partFinalizer.ts:113',message:'processing part',data:{partShape:part.partShape,baseTime:part.baseTime,eventsCount:events.length,eventInstanceIds:events.map(ei=>ei.id)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    
    // Process each event for this partShape
    for (const eventInstance of events) {
      // Look up EventShape to get event shape name and metadata
      const eventShape = eventShapeById.get(eventInstance.eventShapeRef)
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/dee08c11-824d-42a5-9020-c38261879107',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'partFinalizer.ts:118',message:'looking up event shape',data:{eventInstanceId:eventInstance.id,eventShapeRef:eventInstance.eventShapeRef,eventShapeFound:!!eventShape,eventShapeName:eventShape?.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      if (!eventShape) continue
      
      const eventShapeId = eventShape.id
      
      // LEARNING: Use isTernary property to determine event behavior dynamically
      // WHY: Enables fully generic event system - no hardcoded event names
      // PATTERN: Check isTernary flag, use ternaryDefault if available, otherwise fail gracefully
      if (eventShape.isTernary) {
        // Ternary event - use ternaryDefault if available, otherwise fail gracefully
        const ternaryValue = eventShape.ternaryDefault
        if (ternaryValue === null) {
          console.error(`[Event Error] Cannot determine ternary value for event shape "${eventShape.name}" (${eventShape.id}) - ternaryDefault is null`)
          continue // Skip this event - graceful failure
        }
        
        // LEARNING: Only 'true' contributes to event calculations, 'override' does not
        // WHY: 'override' parts contribute to totalDuration but NOT to specific events
        const isActive = toBoolean(ternaryValue, 'strict')
        
        if (isActive) {
          // Accumulate duration by event shape ID
          const currentDuration = eventDurationsByShapeId.get(eventShapeId) || 0
          const newDuration = currentDuration + baseTime
          eventDurationsByShapeId.set(eventShapeId, newDuration)
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/dee08c11-824d-42a5-9020-c38261879107',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'partFinalizer.ts:141',message:'accumulated ternary event duration',data:{eventShapeId,eventShapeName:eventShape.name,baseTime,currentDuration,newDuration},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
          // #endregion
          
          // LEARNING: clientStartOffset only applies when OnSite is true AND ClientPresent is false
          // WHY: Need to check if OnSite event exists and is active, and ClientPresent is not active
          // PATTERN: Look for OnSite event shape by checking isTernary and name, then check ClientPresent
          if (eventShape.name === 'OnSite') {
            // Check if ClientPresent is false for this partShape
            const hasClientPresent = events.some(ei => {
              const es = eventShapeById.get(ei.eventShapeRef)
              if (!es || !es.isTernary || es.name !== 'ClientPresent') return false
              const clientPresentValue = es.ternaryDefault
              if (clientPresentValue === null) return false
              return toBoolean(clientPresentValue, 'strict')
            })
            
            if (!hasClientPresent) {
              clientStartOffset += baseTime
            }
          }
        }
      } else {
        // Boolean event - existence means active
        const currentDuration = eventDurationsByShapeId.get(eventShapeId) || 0
        const newDuration = currentDuration + baseTime
        eventDurationsByShapeId.set(eventShapeId, newDuration)
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/dee08c11-824d-42a5-9020-c38261879107',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'partFinalizer.ts:164',message:'accumulated boolean event duration',data:{eventShapeId,eventShapeName:eventShape.name,baseTime,currentDuration,newDuration},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
      }
    }
  }
  
  // LEARNING: Convert Map to EventFinal[] array
  // WHY: Provides array of event shapes with durations, matching PartFinal[] pattern
  // PATTERN: Map over eventShapeById entries, create EventFinal for each with accumulated duration
  const eventFinalsBeforeFilter = Array.from(eventShapeById.entries())
    .map(([eventShapeId, eventShape]) => {
      const duration = eventDurationsByShapeId.get(eventShapeId) || 0
      return {
        eventShape,
        duration
      }
    })
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/dee08c11-824d-42a5-9020-c38261879107',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'partFinalizer.ts:172',message:'eventFinals before filter',data:{eventFinalsBeforeFilter:eventFinalsBeforeFilter.map(ef=>({eventShapeId:ef.eventShape.id,eventShapeName:ef.eventShape.name,duration:ef.duration})),eventDurationsByShapeIdEntries:Array.from(eventDurationsByShapeId.entries())},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
  // #endregion
  const eventFinals: import('@/types/appointment').EventFinal[] = eventFinalsBeforeFilter.filter(ef => ef.duration > 0) // Only include events with duration > 0
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/dee08c11-824d-42a5-9020-c38261879107',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'partFinalizer.ts:180',message:'calculateSlotShape exit',data:{totalDuration,eventFinalsCount:eventFinals.length,eventFinals:eventFinals.map(ef=>({eventShapeId:ef.eventShape.id,eventShapeName:ef.eventShape.name,duration:ef.duration})),clientStartOffset},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
  // #endregion
  
  return { 
    totalDuration, 
    eventFinals,
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
