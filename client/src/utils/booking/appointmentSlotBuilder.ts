/**
 * Appointment Slot Builder
 * 
 * LEARNING: Pure utility functions for building AppointmentShape and AppointmentSlot
 * WHY: Separates time-independent structure (shape) from time-applied data (slot)
 * PATTERN: Pure functions, no side effects, no reactivity
 */

import type { 
  TimeRange, 
  AppointmentShape, 
  AppointmentSlot 
} from '@/types/appointment'
import type { RFC3339DateTime } from '@/types/datetime'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { AvailabilitySettings } from '@/configs/availabilitySettings'
import type { EventInstance, EventShape } from '@/types/events'
import type { GlobalRelationship } from '@/types/relationships'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalData } from '@/utils/transformers/fetchToGlobalTransformer'
import { roundDuration } from '@/utils/booking/durationRounding'
import {
  createPartFinals,
  filterZeroedParts,
  calculateSlotShape
} from './partFinalizer'
import { 
  getMajorEventShape, 
  getMinorEventShape 
} from '@/utils/eventAttendeeUtils'

/**
 * Create a TimeRange from start time and duration
 * LEARNING: toISOString() always produces valid RFC3339 format (UTC with Z suffix)
 * WHY: Date.toISOString() is guaranteed to return RFC3339-compliant string
 * PATTERN: Use type assertion since we know the format is correct
 */
export function createTimeRange(startTime: string, duration: number): TimeRange {
  const start = new Date(startTime)
  const end = new Date(start)
  end.setUTCMinutes(end.getUTCMinutes() + duration)
  
  const result = {
    startTime: start.toISOString() as RFC3339DateTime,
    endTime: end.toISOString() as RFC3339DateTime,
    duration
  }
  
  return result
}

/**
 * Add minutes to a start time
 * LEARNING: Helper to add minutes to an ISO string
 * WHY: Used for calculating client start time with offset
 * PATTERN: Create Date, add minutes, return ISO string
 */
function addMinutes(startTime: string, minutes: number): string {
  const date = new Date(startTime)
  date.setUTCMinutes(date.getUTCMinutes() + minutes)
  return date.toISOString()
}

/**
 * Find EventFinal by event shape name
 * LEARNING: Helper function to look up event final by name from SlotShape
 * WHY: Eliminates hardcoded event name access, enables generic event lookup
 * PATTERN: Array.find() to search eventFinals array
 * 
 * @param slotShape - SlotShape with eventFinals array
 * @param name - Event shape name (e.g., 'Major', 'Minor', 'Moveable')
 * @returns EventFinal if found, undefined otherwise
 */
export function findEventFinalByName(
  slotShape: import('@/types/appointment').SlotShape,
  name: string
): import('@/types/appointment').EventFinal | undefined {
  return slotShape.eventFinals.find(ef => ef.eventShape.name === name)
}

/**
 * Find EventFinal by event shape ID
 * LEARNING: Helper function to look up event final by ID from SlotShape
 * WHY: Enables lookup by ID for more precise event identification
 * PATTERN: Array.find() to search eventFinals array
 * 
 * @param slotShape - SlotShape with eventFinals array
 * @param id - Event shape ID
 * @returns EventFinal if found, undefined otherwise
 */
export function findEventFinalById(
  slotShape: import('@/types/appointment').SlotShape,
  id: string
): import('@/types/appointment').EventFinal | undefined {
  return slotShape.eventFinals.find(ef => ef.eventShape.id === id)
}

/**
 * Convert SlotShape + startTime to TimeRange objects
 * LEARNING: Precomputes TimeRanges for performance (accessed frequently in UI)
 * WHY: TimeRanges are accessed frequently (graphBars, derivePerspective, TimeSlotGrid), so precompute
 * PATTERN: Pure function that creates TimeRange objects from durations
 * 
 * Session Event Refactor: Creates eventTimeRanges Record dynamically from eventFinals array
 * WHY: Enables fully generic event system - no hardcoded event names, matches PartFinal[] pattern
 * PATTERN: Build eventTimeRanges Record by iterating over eventFinals array
 * 
 * @param slotShape - SlotShape with eventFinals array
 * @param startTime - Base start time (ISO string)
 * @returns Object with precomputed TimeRanges including eventTimeRanges Record
 */
export function createTimeRangesFromSlotShape(
  slotShape: import('@/types/appointment').SlotShape,
  startTime: string
): {
  totalTimeRange: TimeRange | null
  eventTimeRanges: Record<string, TimeRange | null>
  // Legacy properties for backward compatibility during migration
  majorTimeRange: TimeRange | null
  minorTimeRange: TimeRange | null
  moveableTimeRange: TimeRange | null
} {
  // Build eventTimeRanges Record dynamically from eventFinals array
  // LEARNING: Create TimeRange for each event final in eventFinals array
  // WHY: Enables fully generic event system without hardcoded event names
  // LEARNING: Build eventTimeRanges functionally using reduce instead of for-of loop with mutations
  // WHY: Avoids object property mutations - builds object immutably
  // PATTERN: Reduce eventFinals to Record object
  const eventTimeRanges = (slotShape.eventFinals || []).reduce((acc, eventFinal) => {
    const eventName = eventFinal.eventShape.name
    const duration = eventFinal.duration
    if (duration > 0) {
      // LEARNING: Create time range for all events - differential offset adjustment handled in applyShapeToTime
      // WHY: No special handling needed here - applyShapeToTime handles minor time range adjustment using attendee-based logic
      return { ...acc, [eventName]: createTimeRange(startTime, duration) }
    } else {
      return { ...acc, [eventName]: null }
    }
  }, {} as Record<string, TimeRange | null>)
  
  // LEARNING: Legacy properties removed - use eventTimeRanges with dynamic event names instead
  // WHY: Eliminates hardcoded event name strings ('Major', 'Minor', 'Moveable')
  // PATTERN: Legacy properties are calculated dynamically in applyShapeToTime using attendee-based logic
  const result = {
    totalTimeRange: slotShape.totalDuration > 0
      ? createTimeRange(startTime, slotShape.totalDuration)
      : null,
    eventTimeRanges,
    // Legacy properties set to null - use eventTimeRanges with dynamic event names instead
    majorTimeRange: null,
    minorTimeRange: null,
    moveableTimeRange: null
  }
  
  return result
}

/**
 * Look up EventInstance[] for a partShape by name
 * LEARNING: Finds PartInstances with the given partShape name, then filters eventAssignments relationships
 * WHY: Events are configured at instance level (PartInstance → EventInstance), need to look up by PartInstance
 * PATTERN: Find PartInstances by partShape name, filter relationships where parent.id === partInstanceId, map to EventInstance[]
 * 
 * @param partShapeName - Part shape name (e.g., "Client Presentation")
 * @param partShapeById - Map of partShape ID → partShape entity
 * @param eventAssignmentsRelationships - Array of eventAssignments relationships (PartInstance → EventInstance)
 * @param eventInstances - Array of all EventInstance objects
 * @param validPartsRelationships - Array of validParts relationships (for backward compatibility, not used in new logic)
 * @param blockInstances - Array of block instances containing PartInstances
 * @returns Array of EventInstance objects for this partShape (aggregated from all PartInstances with this partShape)
 */
function lookupEventsForPartShape(
  partShapeName: string,
  partShapeById: Map<string, GlobalEntity<'partShape'>>,
  eventAssignmentsRelationships: GlobalRelationship[],
  eventInstances: EventInstance[],
  validPartsRelationships: GlobalRelationship[],
  blockInstances: BookingBlockInstance[]
): EventInstance[] {
  // Find partShape entity by name
  const partShapeEntity = Array.from(partShapeById.values()).find(
    ps => ps.name === partShapeName
  )
  
  if (!partShapeEntity) {
    return []
  }
  
  // LEARNING: eventAssignments relationships now have PartInstance as parent, not PartShape/BlockShape
  // WHY: Events are configured at instance level, matching validParts/partAssignments pattern
  // PATTERN: Find PartInstances with this partShape, then filter eventAssignments by those PartInstances
  
  // Collect all PartInstance IDs from blockInstances that match this partShape
  const partInstanceIds = blockInstances
    .flatMap(bi => bi.partInstances || [])
    .filter(pi => pi.partShape === partShapeName)
    .map(pi => pi.id)
  
  // Filter eventAssignments relationships by PartInstances that match this partShape
  const instanceEventAssignmentsRels = eventAssignmentsRelationships.filter(rel => {
    // Check if parent is one of our PartInstances
    return rel.parent.entityKey === 'partInstance' && partInstanceIds.includes(rel.parent.id)
  })
  
  // Extract child IDs and map to EventInstance[]
  const eventInstanceIds = instanceEventAssignmentsRels.flatMap(rel => 
    rel.children.map(child => child.id)
  )
  
  // Map IDs to EventInstance objects and deduplicate (multiple PartInstances may have same EventInstance)
  const uniqueEventInstanceIds = new Set(eventInstanceIds)
  const result = Array.from(uniqueEventInstanceIds)
    .map(id => eventInstances.find(ei => ei.id === id))
    .filter((ei): ei is EventInstance => ei !== undefined)
  
  return result
}

/**
 * Build AppointmentShape from block instances
 * 
 * Calculates durations and stores finalized parts (no times).
 * This is calculated once and reused for each available start time.
 * 
 * LEARNING: Events are appointment-level features, stored on AppointmentShape
 * WHY: Events are configured at instance level (PartInstance → EventInstance), parts determine which events apply
 * PATTERN: Look up EventInstance[] for each unique partShape (aggregated from PartInstances) and store on AppointmentShape
 * 
 * @param blockInstances - Array of block instances to build shape from
 * @param settings - Optional availability settings for rounding configuration
 * @param eventInstances - Array of EventInstance objects
 * @param eventShapes - Array of EventShape objects
 * @param eventAssignmentsRelationships - Array of eventAssignments relationships
 * @param partShapeById - Map of partShape ID → partShape entity
 */
export function buildAppointmentShape(
  blockInstances: BookingBlockInstance[],
  settings?: AvailabilitySettings | null,
  eventInstances?: EventInstance[],
  eventShapes?: EventShape[],
  eventAssignmentsRelationships?: GlobalRelationship[],
  partShapeById?: Map<string, GlobalEntity<'partShape'>>,
  validPartsRelationships?: GlobalRelationship[],
  globalData?: GlobalData
): AppointmentShape {
  // Collect all parts from block instances
  // LEARNING: Use flatMap to collect all parts from all block instances
  // WHY: Provides flat array of all parts for aggregation
  // PATTERN: Functional approach - flatMap instead of forEach with push mutations
  const allParts = blockInstances.flatMap(blockInstance => 
    blockInstance.partInstances && blockInstance.partInstances.length > 0 
      ? blockInstance.partInstances 
      : []
  )
  
  // LEARNING: Group parts by part shape and create finalized parts
  // WHY: Part shape is the semantic unit - all instances of same shape should be totaled
  // PATTERN: Create finalized parts, then filter out zeroed parts
  const allFinalizedParts = createPartFinals(allParts)
  const nonZeroedParts = filterZeroedParts(allFinalizedParts)
  
  // Look up events for each unique partShape
  // LEARNING: Events are appointment-level features, stored on AppointmentShape
  // WHY: Events are configured at instance level, aggregated by partShape name for grouping
  // PATTERN: Build eventAssignmentsByPartShape Record keyed by partShape name (aggregated from PartInstances)
  const eventAssignmentsByPartShape: Record<string, EventInstance[]> = {}
  
  if (eventInstances && eventAssignmentsRelationships && partShapeById) {
    // Get unique partShape names from finalized parts
    const uniquePartShapes = new Set(nonZeroedParts.map(pf => pf.partShape))
    
    // Look up EventInstance[] for each unique partShape
    for (const partShapeName of uniquePartShapes) {
      const events = lookupEventsForPartShape(
        partShapeName,
        partShapeById,
        eventAssignmentsRelationships || [],
        eventInstances,
        validPartsRelationships || [],
        blockInstances
      )
      if (events.length > 0) {
        eventAssignmentsByPartShape[partShapeName] = events
      }
    }
  }
  
  // Calculate SlotShape from non-zeroed finalized parts and events
  // LEARNING: Single-pass calculation for efficiency
  // WHY: More efficient than multiple filter+reduce operations
  // PATTERN: Use calculateSlotShape to get all durations in one pass
  // LEARNING: Pass globalData and settings for attendee-based differential offset calculation
  // WHY: Enables dynamic event identification based on attendees instead of hardcoded names
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/dee08c11-824d-42a5-9020-c38261879107',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'appointmentSlotBuilder.ts:303',message:'buildAppointmentShape: before calculateSlotShape',data:{hasSettings:!!settings,settings:settings?{hasDifferentialPerspectives:!!settings.differentialPerspectives,differentialPerspectives:settings.differentialPerspectives?{majorAttendees:settings.differentialPerspectives.majorAttendees||[],minorAttendees:settings.differentialPerspectives.minorAttendees||[]}:null}:null,hasGlobalData:!!globalData,eventShapesCount:eventShapes?.length||0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
  // #endregion
  let slotShape = calculateSlotShape(nonZeroedParts, eventAssignmentsByPartShape, eventShapes || [], globalData, settings || null)
  
  // LEARNING: Round major event duration based on availability settings
  // WHY: Ensures end times align with configured time increments when rounding is enabled
  // PATTERN: Use configurable rounding function that respects settings
  // Session Event Refactor: Round major event duration in eventFinals array using helper function
  // LEARNING: Find major event using attendee-based logic - no fallback to hardcoded name
  // WHY: Must use attendee-based logic to find major event shape
  if (globalData && settings?.differentialPerspectives && slotShape.eventFinals.length > 0) {
    const majorAttendeeIds = settings.differentialPerspectives.majorAttendees || []
    if (majorAttendeeIds.length > 0) {
      const eventShapeEntities = slotShape.eventFinals.map(ef => ef.eventShape) as import('@/types/entities').EventShapeEntity[]
      const majorEventShape = getMajorEventShape(eventShapeEntities, majorAttendeeIds)
      if (majorEventShape) {
        const majorEventFinal = slotShape.eventFinals.find(ef => ef.eventShape.id === majorEventShape.id)
        if (majorEventFinal) {
          const roundedDuration = roundDuration(majorEventFinal.duration, settings || null)
          slotShape = {
            ...slotShape,
            eventFinals: slotShape.eventFinals.map(ef => 
              ef.eventShape.id === majorEventFinal.eventShape.id
                ? { ...ef, duration: roundedDuration }
                : ef
            )
          }
        }
      }
    }
  }
  
  const shape: AppointmentShape = {
    finalizedParts: nonZeroedParts,
    slotShape,
    eventAssignmentsByPartShape
  }
  
  return shape
}

/**
 * Apply AppointmentShape to a specific start time
 * 
 * Creates AppointmentSlot with actual TimeRanges.
 * Validates that all totals end at the same time.
 * 
 * @param shape - AppointmentShape with finalized parts and SlotShape
 * @param startTime - Start time (ISO string)
 * @param buttonIndex - UI button index
 * @param fallbackDuration - Optional duration to use if shape.slotShape.totalDuration is 0
 * @param isAvailable - Whether this slot is available
 * @returns AppointmentSlot with precomputed TimeRanges
 */
export function applyShapeToTime(
  shape: AppointmentShape,
  startTime: string,
  buttonIndex: number,
  fallbackDuration?: number,
  isAvailable: boolean = true,
  globalData?: GlobalData,
  availabilitySettings?: AvailabilitySettings | null
): AppointmentSlot {
  // Use fallback duration if shape has no duration
  // LEARNING: Always create totalTimeRange, using fallbackDuration if shape.slotShape.totalDuration is 0
  // WHY: Ensures buttons always have a display time with valid duration, even when no services are selected
  const effectiveSlotShape = shape.slotShape.totalDuration > 0
    ? shape.slotShape
    : {
        ...shape.slotShape,
        totalDuration: fallbackDuration || 0
      }
  
  // Create all time ranges from SlotShape
  // LEARNING: Precompute TimeRanges for performance
  // WHY: TimeRanges are accessed frequently in UI, so precompute them
  // PATTERN: Use utility function to create all TimeRanges at once
  const timeRanges = createTimeRangesFromSlotShape(effectiveSlotShape, startTime)
  
  // LEARNING: For differential services, minorTimeRange should end when major finishes work
  // WHY: Minor perspective should show time from minor arrival to when major finishes work
  // PATTERN: Adjust minorTimeRange to end at majorTimeRange.endTime if both exist
  // LEARNING: Find major/minor event shapes using attendee-based logic - no fallback to hardcoded names
  // WHY: Must use attendee-based logic to find major/minor events
  let majorTimeRange: TimeRange | null = null
  let minorTimeRange: TimeRange | null = null
  let majorEventName: string | null = null
  let minorEventName: string | null = null
  
  if (globalData && availabilitySettings?.differentialPerspectives && effectiveSlotShape.eventFinals.length > 0) {
    const majorAttendeeIds = availabilitySettings.differentialPerspectives.majorAttendees || []
    const minorAttendeeIds = availabilitySettings.differentialPerspectives.minorAttendees || []
    const eventShapeEntities = effectiveSlotShape.eventFinals.map(ef => ef.eventShape) as import('@/types/entities').EventShapeEntity[]
    
    const majorEventShape = majorAttendeeIds.length > 0
      ? getMajorEventShape(eventShapeEntities, majorAttendeeIds)
      : null
    // LEARNING: Exclude major event shape when finding minor to avoid matching the same event
    // WHY: Minor attendees may include all major attendees, so we need to exclude the major event
    const eventShapesExcludingMajor = majorEventShape
      ? eventShapeEntities.filter(es => es.id !== majorEventShape.id)
      : eventShapeEntities
    const minorEventShape = minorAttendeeIds.length > 0
      ? getMinorEventShape(eventShapesExcludingMajor, minorAttendeeIds)
      : null
    
    if (majorEventShape) {
      majorEventName = majorEventShape.name
      majorTimeRange = timeRanges.eventTimeRanges[majorEventName] ?? null
    }
    if (minorEventShape) {
      minorEventName = minorEventShape.name
      minorTimeRange = timeRanges.eventTimeRanges[minorEventName] ?? null
    }
  }
  
  const adjustedEventTimeRanges = { ...timeRanges.eventTimeRanges }
  let adjustedMinorTimeRange = minorTimeRange
  
  if (majorTimeRange && minorTimeRange && majorEventName && minorEventName && effectiveSlotShape.differentialOffset >= 0) {
    // Minor time should end when major finishes work
    const minorDuration = majorTimeRange.duration - effectiveSlotShape.differentialOffset
    if (minorDuration > 0) {
      adjustedMinorTimeRange = createTimeRange(
        addMinutes(startTime, effectiveSlotShape.differentialOffset),
        minorDuration
      )
      adjustedEventTimeRanges[minorEventName] = adjustedMinorTimeRange
    } else {
      adjustedMinorTimeRange = null
      adjustedEventTimeRanges[minorEventName] = null
    }
  }
  
  // Validate: minorTimeRange and majorTimeRange must end at the same time
  // LEARNING: For differential services, both perspectives should end when major finishes work
  // WHY: Minor time ends when major finishes work, not when total appointment ends
  // PATTERN: Validate that minor and major times align
  if (adjustedMinorTimeRange && majorTimeRange) {
    if (adjustedMinorTimeRange.endTime !== majorTimeRange.endTime) {
      throw new Error(
        `AppointmentSlot validation failed: ` +
        `minorTimeRange.endTime (${adjustedMinorTimeRange.endTime}) !== ` +
        `majorTimeRange.endTime (${majorTimeRange.endTime})`
      )
    }
  }
  
  const slot = {
    buttonIndex,
    isAvailable,
    shape,
    startTime,
    totalTimeRange: timeRanges.totalTimeRange,
    eventTimeRanges: adjustedEventTimeRanges
  }
  
  return slot
}

/**
 * Derive the TimeRange for a given perspective
 * 
 * @param slot - AppointmentSlot with precomputed totals
 * @param perspective - Which perspective to derive ('major' | 'minor' | 'nonDifferential')
 * @param globalData - Optional GlobalData for attendee-based logic (if not provided, falls back to name-based logic)
 * @param availabilitySettings - Optional AvailabilitySettings for major/minor attendee configuration
 * @returns TimeRange for display, or null if not applicable
 * 
 * LEARNING: Falls back to totalTimeRange if perspective-specific range is null
 * WHY: Ensures buttons always have a display time, even when specific perspective ranges are null
 * LEARNING: Uses attendee-based logic to find major/minor event names dynamically
 * WHY: Enables configurable event identification based on attendees instead of hardcoded names
 */
export function derivePerspective(
  slot: AppointmentSlot,
  perspective: 'major' | 'minor' | 'nonDifferential',
  globalData?: GlobalData,
  availabilitySettings?: AvailabilitySettings | null
): TimeRange | null {
  let result: TimeRange | null = null
  
  // LEARNING: Require globalData and availabilitySettings for attendee-based logic
  // WHY: No fallbacks to hardcoded names - fail gracefully if configuration is missing
  // PATTERN: Return null if required data is not available
  if (!globalData || !slot.shape.slotShape.eventFinals || !availabilitySettings?.differentialPerspectives) {
    // Return totalTimeRange for major/nonDifferential if no configuration available
    if (perspective === 'nonDifferential' || perspective === 'major') {
      return slot.totalTimeRange
    }
    return null
  }
  
  const majorAttendeeIds = availabilitySettings.differentialPerspectives.majorAttendees || []
  const minorAttendeeIds = availabilitySettings.differentialPerspectives.minorAttendees || []
  const eventShapeEntities = slot.shape.slotShape.eventFinals.map(ef => ef.eventShape) as import('@/types/entities').EventShapeEntity[]
  
  const majorEventShape = majorAttendeeIds.length > 0
    ? getMajorEventShape(eventShapeEntities, majorAttendeeIds)
    : null
  // LEARNING: Exclude major event shape when finding minor to avoid matching the same event
  // WHY: Minor attendees may include all major attendees, so we need to exclude the major event
  const eventShapesExcludingMajor = majorEventShape
    ? eventShapeEntities.filter(es => es.id !== majorEventShape.id)
    : eventShapeEntities
  const minorEventShape = minorAttendeeIds.length > 0
    ? getMinorEventShape(eventShapesExcludingMajor, minorAttendeeIds)
    : null
  
  // LEARNING: Require event shapes to be found - no fallbacks to hardcoded names
  // WHY: If attendee-based logic can't find event shapes, fail gracefully
  // PATTERN: Return null or totalTimeRange if event shapes are not found
  if (!majorEventShape) {
    // For non-differential, fall back to totalTimeRange so buttons still work
    if (perspective === 'nonDifferential' || perspective === 'major') {
      return slot.totalTimeRange
    }
    return null
  }
  
  const majorEventName = majorEventShape.name
  const minorEventName = minorEventShape?.name ?? null
  
  switch (perspective) {
    case 'major':
      // LEARNING: Fallback to totalTimeRange if majorTimeRange is null (but use attendee-based name)
      // WHY: Ensures buttons always have a display time
      result = slot.eventTimeRanges?.[majorEventName] ?? slot.totalTimeRange
      break
    case 'minor':
      // LEARNING: Fallback to totalTimeRange if minor event shape not found
      // WHY: Ensures buttons always have a display time, even if minor event shape isn't identified
      // PATTERN: Show totalTimeRange as fallback so slot remains visible and clickable
      if (!minorEventShape || !minorEventName) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/dee08c11-824d-42a5-9020-c38261879107',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'appointmentSlotBuilder.ts:525',message:'derivePerspective: minor event shape not found, using totalTimeRange fallback',data:{hasMinorEventShape:!!minorEventShape,minorEventName,hasTotalTimeRange:!!slot.totalTimeRange},timestamp:Date.now(),sessionId:'debug-session',runId:'run5',hypothesisId:'H'})}).catch(()=>{});
        // #endregion
        result = slot.totalTimeRange
      } else {
        result = slot.eventTimeRanges?.[minorEventName] ?? slot.totalTimeRange
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/dee08c11-824d-42a5-9020-c38261879107',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'appointmentSlotBuilder.ts:530',message:'derivePerspective: minor perspective result',data:{minorEventName,hasEventTimeRange:!!slot.eventTimeRanges?.[minorEventName],hasTotalTimeRange:!!slot.totalTimeRange,result:!!result},timestamp:Date.now(),sessionId:'debug-session',runId:'run5',hypothesisId:'H'})}).catch(()=>{});
        // #endregion
      }
      break
    case 'nonDifferential':
      // LEARNING: Show major time for non-differential (same as major view)
      // WHY: Non-differential services should show major times on buttons, not total appointment time
      result = slot.eventTimeRanges?.[majorEventName] ?? slot.totalTimeRange
      break
    default:
      result = null
  }
  
  return result
}
