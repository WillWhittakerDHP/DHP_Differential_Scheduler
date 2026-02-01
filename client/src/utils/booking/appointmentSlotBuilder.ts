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
import {
  createPartFinals,
  filterZeroedParts,
  calculateSlotShape
} from './partFinalizer'
import { 
  getMajorEventShape, 
  getMinorEventShape 
} from '@/utils/eventAttendeeUtils'

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
  // PATTERN: Reduce eventFinals to Record object
  // DUAL-TRACK: Use roundedDuration for display (time ranges shown to users)
  const eventTimeRanges = (slotShape.eventFinals || []).reduce((acc, eventFinal) => {
    const eventName = eventFinal.eventShape.name
    const duration = eventFinal.roundedDuration
    if (duration > 0) {
      return { ...acc, [eventName]: createTimeRange(startTime, duration) }
    } else {
      return { ...acc, [eventName]: null }
    }
  }, {} as Record<string, TimeRange | null>)
  
  // PATTERN: Legacy properties are calculated dynamically in applyShapeToTime using attendee-based logic
  // DUAL-TRACK: Use roundedDuration for display
  const result = {
    totalTimeRange: slotShape.roundedDuration > 0
      ? createTimeRange(startTime, slotShape.roundedDuration)
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
  blockInstances: BookingBlockInstance[]
): EventInstance[] {
  const partShapeEntity = Array.from(partShapeById.values()).find(
    ps => ps.name === partShapeName
  )
  
  if (!partShapeEntity) {
    return []
  }
  
  // LEARNING: eventAssignments relationships now have PartInstance as parent, not PartShape/BlockShape
  // WHY: Events are configured at instance level, matching validParts/partAssignments pattern
  // PATTERN: Find PartInstances with this partShape, then filter eventAssignments by those PartInstances
  
  const partInstanceIds = blockInstances
    .flatMap(bi => bi.partInstances || [])
    .filter(pi => pi.partShape === partShapeName)
    .map(pi => pi.id)
  
  const instanceEventAssignmentsRels = eventAssignmentsRelationships.filter(rel => {
    return rel.parent.entityKey === 'partInstance' && partInstanceIds.includes(rel.parent.id)
  })
  
  const eventInstanceIds = instanceEventAssignmentsRels.flatMap(rel => 
    rel.children.map(child => child.id)
  )
  
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
  globalData?: GlobalData
): AppointmentShape {
  // PATTERN: Functional approach - flatMap instead of forEach with push mutations
  const allParts = blockInstances.flatMap(blockInstance => 
    blockInstance.partInstances && blockInstance.partInstances.length > 0 
      ? blockInstance.partInstances 
      : []
  )
  
  // PATTERN: Create finalized parts with rounding settings, then filter out zeroed parts
  // DUAL-TRACK: Pass settings to compute roundedTime at part level
  const allFinalizedParts = createPartFinals(allParts, settings || null)
  const nonZeroedParts = filterZeroedParts(allFinalizedParts)
  
  // PATTERN: Build eventAssignmentsByPartShape Record keyed by partShape name (aggregated from PartInstances)
  const eventAssignmentsByPartShape: Record<string, EventInstance[]> = {}
  
  if (eventInstances && eventAssignmentsRelationships && partShapeById) {
    const uniquePartShapes = new Set(nonZeroedParts.map(pf => pf.partShape))
    
    for (const partShapeName of uniquePartShapes) {
      const events = lookupEventsForPartShape(
        partShapeName,
        partShapeById,
        eventAssignmentsRelationships || [],
        eventInstances,
        blockInstances
      )
      if (events.length > 0) {
        eventAssignmentsByPartShape[partShapeName] = events
      }
    }
  }
  
  // PATTERN: Use calculateSlotShape to get all durations in one pass
  // DUAL-TRACK: Rounding is now computed at part level, so rounded values are already in slotShape
  fetch('http://127.0.0.1:7242/ingest/dee08c11-824d-42a5-9020-c38261879107',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'appointmentSlotBuilder.ts:303',message:'buildAppointmentShape: before calculateSlotShape',data:{hasSettings:!!settings,settings:settings?{hasDifferentialPerspectives:!!settings.differentialPerspectives,differentialPerspectives:settings.differentialPerspectives?{majorAttendees:settings.differentialPerspectives.majorAttendees||[],minorAttendees:settings.differentialPerspectives.minorAttendees||[]}:null}:null,hasGlobalData:!!globalData,eventShapesCount:eventShapes?.length||0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
  const slotShape = calculateSlotShape(nonZeroedParts, eventAssignmentsByPartShape, eventShapes || [], globalData, settings || null)
  
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
 * @param fallbackDuration - Optional duration to use if shape.slotShape.roundedDuration is 0
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
  const effectiveSlotShape = shape.slotShape.roundedDuration > 0
    ? shape.slotShape
    : {
        ...shape.slotShape,
        roundedDuration: fallbackDuration || 0
      }
  
  // PATTERN: Use utility function to create all TimeRanges at once
  const timeRanges = createTimeRangesFromSlotShape(effectiveSlotShape, startTime)
  
  // PATTERN: Adjust minorTimeRange to end at majorTimeRange.endTime if both exist
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
  
  // DUAL-TRACK: Use roundedDifferentialOffset for display logic
  if (majorTimeRange && minorTimeRange && majorEventName && minorEventName && effectiveSlotShape.roundedDifferentialOffset >= 0) {
    const minorDuration = majorTimeRange.duration - effectiveSlotShape.roundedDifferentialOffset
    if (minorDuration > 0) {
      adjustedMinorTimeRange = createTimeRange(
        addMinutes(startTime, effectiveSlotShape.roundedDifferentialOffset),
        minorDuration
      )
      adjustedEventTimeRanges[minorEventName] = adjustedMinorTimeRange
    } else {
      adjustedMinorTimeRange = null
      adjustedEventTimeRanges[minorEventName] = null
    }
  }
  
  // Validate: minorTimeRange and majorTimeRange must end at the same time
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

export function derivePerspective(
  slot: AppointmentSlot,
  perspective: 'major' | 'minor' | 'nonDifferential',
  globalData?: GlobalData,
  availabilitySettings?: AvailabilitySettings | null
): TimeRange | null {
  let result: TimeRange | null = null
  
  // PATTERN: Return null if required data is not available
  if (!globalData || !slot.shape.slotShape.eventFinals || !availabilitySettings?.differentialPerspectives) {
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
  const eventShapesExcludingMajor = majorEventShape
    ? eventShapeEntities.filter(es => es.id !== majorEventShape.id)
    : eventShapeEntities
  const minorEventShape = minorAttendeeIds.length > 0
    ? getMinorEventShape(eventShapesExcludingMajor, minorAttendeeIds)
    : null
  
  // PATTERN: Return null or totalTimeRange if event shapes are not found
  if (!majorEventShape) {
    if (perspective === 'nonDifferential' || perspective === 'major') {
      return slot.totalTimeRange
    }
    return null
  }
  
  const majorEventName = majorEventShape.name
  const minorEventName = minorEventShape?.name ?? null
  
  switch (perspective) {
    case 'major':
      result = slot.eventTimeRanges?.[majorEventName] ?? slot.totalTimeRange
      break
    case 'minor':
      // PATTERN: Show totalTimeRange as fallback so slot remains visible and clickable
      if (!minorEventShape || !minorEventName) {
        fetch('http://127.0.0.1:7242/ingest/dee08c11-824d-42a5-9020-c38261879107',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'appointmentSlotBuilder.ts:525',message:'derivePerspective: minor event shape not found, using totalTimeRange fallback',data:{hasMinorEventShape:!!minorEventShape,minorEventName,hasTotalTimeRange:!!slot.totalTimeRange},timestamp:Date.now(),sessionId:'debug-session',runId:'run5',hypothesisId:'H'})}).catch(()=>{});
        result = slot.totalTimeRange
      } else {
        result = slot.eventTimeRanges?.[minorEventName] ?? slot.totalTimeRange
        fetch('http://127.0.0.1:7242/ingest/dee08c11-824d-42a5-9020-c38261879107',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'appointmentSlotBuilder.ts:530',message:'derivePerspective: minor perspective result',data:{minorEventName,hasEventTimeRange:!!slot.eventTimeRanges?.[minorEventName],hasTotalTimeRange:!!slot.totalTimeRange,result:!!result},timestamp:Date.now(),sessionId:'debug-session',runId:'run5',hypothesisId:'H'})}).catch(()=>{});
      }
      break
    case 'nonDifferential':
      // LEARNING: Show major time for non-differential (same as major view)
      result = slot.eventTimeRanges?.[majorEventName] ?? slot.totalTimeRange
      break
    default:
      result = null
  }
  
  return result
}
