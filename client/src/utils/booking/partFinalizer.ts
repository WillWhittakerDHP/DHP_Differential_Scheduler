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
import { EVENT_PERSPECTIVE_KEYS } from '@/configs/eventPerspectiveLabels'

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
  // NOTE: Old accumulation logic removed - will be recalculated from final durations
  
  // PATTERN: Map<eventShapeId, duration> for accumulation, then convert to array
  const eventDurationsByShapeId = new Map<string, number>()
  
  const eventShapeById = new Map(eventShapes.map(es => [es.id, es]))
  
  // PATTERN: Use availabilitySettings to get major/minor attendee IDs, fall back to name-based logic if not available
  let majorAttendeeIds: string[] = []
  let minorAttendeeIds: string[] = []
  let useAttendeeBasedLogic = false
  
  fetch('http://127.0.0.1:7242/ingest/dee08c11-824d-42a5-9020-c38261879107',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'partFinalizer.ts:125',message:'calculateSlotShape: checking availabilitySettings',data:{hasGlobalData:!!globalData,hasAvailabilitySettings:!!availabilitySettings,hasDifferentialPerspectives:!!availabilitySettings?.differentialPerspectives,availabilitySettings:availabilitySettings?{differentialPerspectives:availabilitySettings.differentialPerspectives?{majorAttendees:availabilitySettings.differentialPerspectives.majorAttendees||[],minorAttendees:availabilitySettings.differentialPerspectives.minorAttendees||[]}:null}:null},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
  
  if (globalData && availabilitySettings?.differentialPerspectives) {
    majorAttendeeIds = availabilitySettings.differentialPerspectives.majorAttendees || []
    minorAttendeeIds = availabilitySettings.differentialPerspectives.minorAttendees || []
    useAttendeeBasedLogic = majorAttendeeIds.length > 0 || minorAttendeeIds.length > 0
    fetch('http://127.0.0.1:7242/ingest/dee08c11-824d-42a5-9020-c38261879107',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'partFinalizer.ts:129',message:'calculateSlotShape: attendee-based logic enabled',data:{majorAttendeeIds,minorAttendeeIds,useAttendeeBasedLogic},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
  } else {
    fetch('http://127.0.0.1:7242/ingest/dee08c11-824d-42a5-9020-c38261879107',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'partFinalizer.ts:129',message:'calculateSlotShape: attendee-based logic disabled',data:{hasGlobalData:!!globalData,hasAvailabilitySettings:!!availabilitySettings,hasDifferentialPerspectives:!!availabilitySettings?.differentialPerspectives},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
  }
  
  const eventShapeEntities = eventShapes as EventShapeEntity[]
  
  for (const part of partFinals) {
    const baseTime = part.baseTime
    totalDuration += baseTime
    
    const events = eventAssignmentsByPartShape[part.partShape] || []
    
    for (const eventInstance of events) {
      const eventShape = eventShapeById.get(eventInstance.eventShapeRef)
      if (!eventShape) continue
      
      const eventShapeId = eventShape.id
      
      // PATTERN: Check isTernary flag, use ternaryDefault if available, otherwise fail gracefully
      if (eventShape.isTernary) {
        const ternaryValue = eventShape.ternaryDefault
        if (ternaryValue === null) {
          console.error(`[Event Error] Cannot determine ternary value for event shape "${eventShape.name}" (${eventShape.id}) - ternaryDefault is null`)
          continue // Skip this event - graceful failure
        }
        
        const isActive = toBoolean(ternaryValue, 'strict')
        
        if (isActive) {
          const currentDuration = eventDurationsByShapeId.get(eventShapeId) || 0
          const newDuration = currentDuration + baseTime
          eventDurationsByShapeId.set(eventShapeId, newDuration)
          
          // PATTERN: Just log event processing, offset calculation happens after all events are processed
          if (useAttendeeBasedLogic) {
            const majorEventShape = getMajorEventShape(eventShapeEntities, majorAttendeeIds)
            const minorEventShape = getMinorEventShape(eventShapeEntities, minorAttendeeIds)
            // WHY: Eliminates hardcoded perspective strings, enables config-driven approach
            // PATTERN: Use EVENT_PERSPECTIVE_KEYS constants for perspective determination
            const eventPerspective = majorEventShape?.id === eventShape.id ? EVENT_PERSPECTIVE_KEYS.MAJOR : (minorEventShape?.id === eventShape.id ? EVENT_PERSPECTIVE_KEYS.MINOR : EVENT_PERSPECTIVE_KEYS.OTHER)
            fetch('http://127.0.0.1:7242/ingest/dee08c11-824d-42a5-9020-c38261879107',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'partFinalizer.ts:178',message:'calculateSlotShape: event perspective lookup',data:{majorAttendeeIds,eventShapeId:eventShape.id,eventPerspective,eventShapeAttendees:eventShape.attendees,isMajorEvent:majorEventShape?.id===eventShape.id,isMinorEvent:minorEventShape?.id===eventShape.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
            if (majorEventShape && majorEventShape.id === eventShape.id) {
              fetch('http://127.0.0.1:7242/ingest/dee08c11-824d-42a5-9020-c38261879107',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'partFinalizer.ts:193',message:'calculateSlotShape: processing major event',data:{eventShapeId:eventShape.id,eventPerspective:'major',partShape:part.partShape,baseTime:part.baseTime},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
            }
          }
        }
      } else {
        const currentDuration = eventDurationsByShapeId.get(eventShapeId) || 0
        const newDuration = currentDuration + baseTime
        eventDurationsByShapeId.set(eventShapeId, newDuration)
        
        // PATTERN: Just log event processing, offset calculation happens after all events are processed
        if (useAttendeeBasedLogic) {
          const majorEventShape = getMajorEventShape(eventShapeEntities, majorAttendeeIds)
          const minorEventShape = getMinorEventShape(eventShapeEntities, minorAttendeeIds)
          const eventPerspective = majorEventShape?.id === eventShape.id ? 'major' : (minorEventShape?.id === eventShape.id ? 'minor' : 'other')
          fetch('http://127.0.0.1:7242/ingest/dee08c11-824d-42a5-9020-c38261879107',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'partFinalizer.ts:258',message:'calculateSlotShape: boolean event - event perspective lookup',data:{majorAttendeeIds,eventShapeId:eventShape.id,eventPerspective,eventShapeAttendees:eventShape.attendees,isMajorEvent:majorEventShape?.id===eventShape.id,isMinorEvent:minorEventShape?.id===eventShape.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
          if (majorEventShape && majorEventShape.id === eventShape.id) {
            fetch('http://127.0.0.1:7242/ingest/dee08c11-824d-42a5-9020-c38261879107',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'partFinalizer.ts:262',message:'calculateSlotShape: boolean event - processing major event',data:{eventShapeId:eventShape.id,eventPerspective:'major',partShape:part.partShape,baseTime:part.baseTime},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
          }
        }
      }
    }
  }
  
  // LEARNING: Convert Map to EventFinal[] array
  // WHY: Provides array of event shapes with durations, matching PartFinal[] pattern
  // PATTERN: Map over eventDurationsByShapeId entries, create EventFinal for each with accumulated duration
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
  
  // LEARNING: Calculate differentialOffset as the difference between major and minor event durations
  // PATTERN: Calculate offset from final event durations after all parts have been processed
  let finalDifferentialOffset = 0
  if (useAttendeeBasedLogic) {
    const majorEventShape = getMajorEventShape(eventShapeEntities, majorAttendeeIds)
    // PATTERN: Filter out major event shape before searching for minor event shape
    const eventShapesExcludingMajor = majorEventShape 
      ? eventShapeEntities.filter(es => es.id !== majorEventShape.id)
      : eventShapeEntities
    const minorEventShape = getMinorEventShape(eventShapesExcludingMajor, minorAttendeeIds)
    
    if (majorEventShape) {
      const majorDuration = eventDurationsByShapeId.get(majorEventShape.id) || 0
      if (minorEventShape) {
        const minorDuration = eventDurationsByShapeId.get(minorEventShape.id) || 0
        finalDifferentialOffset = majorDuration - minorDuration
        fetch('http://127.0.0.1:7242/ingest/dee08c11-824d-42a5-9020-c38261879107',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'partFinalizer.ts:340',message:'calculateSlotShape: calculating differentialOffset from durations',data:{majorDuration,minorDuration,differentialOffset:finalDifferentialOffset,majorEventShapeId:majorEventShape.id,minorEventShapeId:minorEventShape.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      } else {
        finalDifferentialOffset = majorDuration
        fetch('http://127.0.0.1:7242/ingest/dee08c11-824d-42a5-9020-c38261879107',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'partFinalizer.ts:347',message:'calculateSlotShape: calculating differentialOffset (no minor event)',data:{majorDuration,differentialOffset:finalDifferentialOffset,majorEventShapeId:majorEventShape.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      }
    }
  }
  
  const result = { 
    totalDuration, 
    eventFinals,
    differentialOffset: finalDifferentialOffset
  }
  let logMajorEventShape: EventShapeEntity | null = null
  let logMinorEventShape: EventShapeEntity | null = null
  if (useAttendeeBasedLogic) {
    logMajorEventShape = getMajorEventShape(eventShapeEntities, majorAttendeeIds)
    const eventShapesExcludingMajorForLog = logMajorEventShape 
      ? eventShapeEntities.filter(es => es.id !== logMajorEventShape!.id)
      : eventShapeEntities
    logMinorEventShape = getMinorEventShape(eventShapesExcludingMajorForLog, minorAttendeeIds)
  }
  fetch('http://127.0.0.1:7242/ingest/dee08c11-824d-42a5-9020-c38261879107',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'partFinalizer.ts:252',message:'calculateSlotShape: final result',data:{totalDuration,differentialOffset:finalDifferentialOffset,eventFinalsCount:eventFinals.length,eventFinals:eventFinals.map(ef=>({eventShapeId:ef.eventShape.id,eventPerspective:logMajorEventShape?.id===ef.eventShape.id?EVENT_PERSPECTIVE_KEYS.MAJOR:(logMinorEventShape?.id===ef.eventShape.id?EVENT_PERSPECTIVE_KEYS.MINOR:EVENT_PERSPECTIVE_KEYS.OTHER),eventShapeAttendees:ef.eventShape.attendees,duration:ef.duration})),useAttendeeBasedLogic,majorAttendeeIds,minorAttendeeIds},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
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
