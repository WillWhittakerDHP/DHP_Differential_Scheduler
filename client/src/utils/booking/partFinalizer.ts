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
import type { GlobalData } from '@/utils/transformers/fetchToGlobalTransformer'
import { 
  getMajorEventShape, 
  getMinorEventShape 
} from '@/utils/eventAttendeeUtils'
import type { EventShapeEntity } from '@/types/entities'
import type { AvailabilitySettings } from '@/configs/availabilitySettings'

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
 * @param globalData - Optional GlobalData for attendee-based logic (if not provided, falls back to name-based logic)
 * @param availabilitySettings - Optional AvailabilitySettings for major/minor attendee configuration
 * @returns SlotShape with eventFinals array and duration totals
 */
export function calculateSlotShape(
  partFinals: PartFinal[],
  eventAssignmentsByPartShape: Record<string, EventInstance[]> = {},
  eventShapes: EventShape[] = [],
  globalData?: GlobalData,
  availabilitySettings?: AvailabilitySettings | null
): import('@/types/appointment').SlotShape {
  let totalDuration = 0
  let differentialOffset = 0
  
  // LEARNING: Use Map to accumulate durations by event shape ID
  // WHY: Groups durations by event shape, then converts to EventFinal[] array
  // PATTERN: Map<eventShapeId, duration> for accumulation, then convert to array
  const eventDurationsByShapeId = new Map<string, number>()
  
  // Create lookup map for EventShape by ID
  const eventShapeById = new Map(eventShapes.map(es => [es.id, es]))
  
  // LEARNING: Find major and minor UserTypeBlock IDs for attendee-based logic
  // WHY: Enables dynamic event identification based on attendees instead of hardcoded names
  // PATTERN: Use availabilitySettings to get major/minor attendee IDs, fall back to name-based logic if not available
  let majorAttendeeIds: string[] = []
  let minorAttendeeIds: string[] = []
  let useAttendeeBasedLogic = false
  
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/dee08c11-824d-42a5-9020-c38261879107',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'partFinalizer.ts:125',message:'calculateSlotShape: checking availabilitySettings',data:{hasGlobalData:!!globalData,hasAvailabilitySettings:!!availabilitySettings,hasDifferentialPerspectives:!!availabilitySettings?.differentialPerspectives,availabilitySettings:availabilitySettings?{differentialPerspectives:availabilitySettings.differentialPerspectives?{majorAttendees:availabilitySettings.differentialPerspectives.majorAttendees||[],minorAttendees:availabilitySettings.differentialPerspectives.minorAttendees||[]}:null}:null},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
  // #endregion
  
  if (globalData && availabilitySettings?.differentialPerspectives) {
    majorAttendeeIds = availabilitySettings.differentialPerspectives.majorAttendees || []
    minorAttendeeIds = availabilitySettings.differentialPerspectives.minorAttendees || []
    useAttendeeBasedLogic = majorAttendeeIds.length > 0 || minorAttendeeIds.length > 0
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/dee08c11-824d-42a5-9020-c38261879107',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'partFinalizer.ts:129',message:'calculateSlotShape: attendee-based logic enabled',data:{majorAttendeeIds,minorAttendeeIds,useAttendeeBasedLogic},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
  } else {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/dee08c11-824d-42a5-9020-c38261879107',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'partFinalizer.ts:129',message:'calculateSlotShape: attendee-based logic disabled',data:{hasGlobalData:!!globalData,hasAvailabilitySettings:!!availabilitySettings,hasDifferentialPerspectives:!!availabilitySettings?.differentialPerspectives},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
  }
  
  // Convert EventShape[] to EventShapeEntity[] for attendee helper functions
  const eventShapeEntities = eventShapes as EventShapeEntity[]
  
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
          
          // LEARNING: differentialOffset only applies when major event exists but minor event does not
          // WHY: Need to check if major event exists and is active, and minor event is not active
          // PATTERN: Use attendee-based logic when available, fall back to name-based logic for backward compatibility
          let shouldAddToDifferentialOffset = false
          
          if (useAttendeeBasedLogic) {
            // Attendee-based logic: Check if this event shape has major attendee
            const majorEventShape = getMajorEventShape(eventShapeEntities, majorAttendeeIds)
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/dee08c11-824d-42a5-9020-c38261879107',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'partFinalizer.ts:178',message:'calculateSlotShape: major event shape lookup',data:{majorAttendeeIds,eventShapeId:eventShape.id,eventShapeName:eventShape.name,eventShapeAttendees:eventShape.attendees,majorEventShape:majorEventShape?{id:majorEventShape.id,name:majorEventShape.name,attendees:majorEventShape.attendees}:null,isMajorEvent:majorEventShape?.id===eventShape.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
            // #endregion
            if (majorEventShape && majorEventShape.id === eventShape.id) {
              // This is a major event - check if there's a minor event for this partShape
              const minorEventShape = getMinorEventShape(eventShapeEntities, minorAttendeeIds)
              // #region agent log
              fetch('http://127.0.0.1:7242/ingest/dee08c11-824d-42a5-9020-c38261879107',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'partFinalizer.ts:181',message:'calculateSlotShape: minor event shape lookup',data:{minorAttendeeIds,minorEventShape:minorEventShape?{id:minorEventShape.id,name:minorEventShape.name,attendees:minorEventShape.attendees}:null,partShape:part.partShape},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
              // #endregion
              if (minorEventShape) {
                // Check if minor event is active for this partShape
                const hasMinorEvent = events.some(ei => {
                  if (ei.eventShapeRef !== minorEventShape.id) return false
                  const es = eventShapeById.get(ei.eventShapeRef)
                  if (!es || !es.isTernary) return false
                  const minorValue = es.ternaryDefault
                  if (minorValue === null) return false
                  return toBoolean(minorValue, 'strict')
                })
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/dee08c11-824d-42a5-9020-c38261879107',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'partFinalizer.ts:184',message:'calculateSlotShape: minor event active check',data:{hasMinorEvent,eventsCount:events.length,events:events.map(ei=>({id:ei.id,eventShapeRef:ei.eventShapeRef}))},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
                // #endregion
                if (!hasMinorEvent) {
                  shouldAddToDifferentialOffset = true
                }
              } else {
                // No minor event shape exists - add to differential offset
                shouldAddToDifferentialOffset = true
              }
            }
          } else {
            // LEARNING: No fallback to name-based logic
            // WHY: If attendee-based logic is not available, don't calculate differential offset
            // PATTERN: Skip differential offset calculation if attendee-based logic is disabled
            // NOTE: This ensures we don't use hardcoded event names
          }
          
          if (shouldAddToDifferentialOffset) {
            differentialOffset += baseTime
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/dee08c11-824d-42a5-9020-c38261879107',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'partFinalizer.ts:220',message:'calculateSlotShape: adding to differentialOffset',data:{baseTime,differentialOffsetBefore:differentialOffset-baseTime,differentialOffsetAfter:differentialOffset,partShape:part.partShape,eventShapeId:eventShape.id,eventShapeName:eventShape.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
            // #endregion
          }
        }
      } else {
        // Boolean event - existence means active
        const currentDuration = eventDurationsByShapeId.get(eventShapeId) || 0
        const newDuration = currentDuration + baseTime
        eventDurationsByShapeId.set(eventShapeId, newDuration)
      }
    }
  }
  
  // LEARNING: Convert Map to EventFinal[] array
  // WHY: Provides array of event shapes with durations, matching PartFinal[] pattern
  // PATTERN: Map over eventDurationsByShapeId entries, create EventFinal for each with accumulated duration
  // LEARNING: Only create EventFinals for event shapes that have been assigned to parts
  // WHY: Don't create EventFinals for all event shapes - only those that are actually assigned
  // PATTERN: Iterate over eventDurationsByShapeId to only include event shapes that have durations accumulated
  const eventFinals: import('@/types/appointment').EventFinal[] = Array.from(eventDurationsByShapeId.entries())
    .map(([eventShapeId, duration]) => {
      const eventShape = eventShapeById.get(eventShapeId)
      if (!eventShape) {
        return null
      }
      return {
        eventShape,
        duration
      }
    })
    .filter((ef): ef is import('@/types/appointment').EventFinal => ef !== null)
    .filter(ef => ef.duration > 0) // Only include events with duration > 0
  
  const result = { 
    totalDuration, 
    eventFinals,
    differentialOffset
  }
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/dee08c11-824d-42a5-9020-c38261879107',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'partFinalizer.ts:252',message:'calculateSlotShape: final result',data:{totalDuration,differentialOffset,eventFinalsCount:eventFinals.length,eventFinals:eventFinals.map(ef=>({eventShapeId:ef.eventShape.id,eventShapeName:ef.eventShape.name,eventShapeAttendees:ef.eventShape.attendees,duration:ef.duration})),useAttendeeBasedLogic,majorAttendeeIds,minorAttendeeIds},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
  // #endregion
  return result
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
