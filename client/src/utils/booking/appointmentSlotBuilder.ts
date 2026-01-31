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
import { roundDuration } from '@/utils/booking/durationRounding'
import {
  createPartFinals,
  filterZeroedParts,
  calculateSlotShape
} from './partFinalizer'

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
 * Convert SlotShape + startTime to TimeRange objects
 * LEARNING: Precomputes TimeRanges for performance (accessed frequently in UI)
 * WHY: TimeRanges are accessed frequently (graphBars, derivePerspective, TimeSlotGrid), so precompute
 * PATTERN: Pure function that creates TimeRange objects from durations
 * 
 * Session Event Refactor: Creates eventTimeRanges Record dynamically from eventDurations
 * WHY: Enables extensible event system - new event types can be added without code changes
 * PATTERN: Build eventTimeRanges Record by iterating over eventDurations
 * 
 * @param slotShape - SlotShape with eventDurations Record
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
  onSiteTimeRange: TimeRange | null
  clientPresentTimeRange: TimeRange | null
  moveableTimeRange: TimeRange | null
} {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/dee08c11-824d-42a5-9020-c38261879107',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'appointmentSlotBuilder.ts:73',message:'createTimeRangesFromSlotShape: entry',data:{slotShapeTotalDuration:slotShape.totalDuration,slotShapeEventDurations:slotShape.eventDurations,slotShapeClientStartOffset:slotShape.clientStartOffset,startTime},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  
  // Build eventTimeRanges Record dynamically from eventDurations
  // LEARNING: Create TimeRange for each event shape name in eventDurations
  // WHY: Enables dynamic event types without hardcoded properties
  const eventTimeRanges: Record<string, TimeRange | null> = {}
  
  for (const [eventName, duration] of Object.entries(slotShape.eventDurations || {})) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/dee08c11-824d-42a5-9020-c38261879107',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'appointmentSlotBuilder.ts:89',message:'createTimeRangesFromSlotShape: processing event',data:{eventName,duration,durationGreaterThanZero:duration>0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    if (duration > 0) {
      // Special handling for ClientPresent (needs clientStartOffset)
      if (eventName === 'ClientPresent' && slotShape.clientStartOffset >= 0) {
        eventTimeRanges[eventName] = createTimeRange(
          addMinutes(startTime, slotShape.clientStartOffset),
          duration
        )
      } else {
        eventTimeRanges[eventName] = createTimeRange(startTime, duration)
      }
    } else {
      eventTimeRanges[eventName] = null
    }
  }
  
  // Legacy properties for backward compatibility during migration
  const onSiteTimeRange = eventTimeRanges['OnSite'] ?? null
  const clientPresentTimeRange = eventTimeRanges['ClientPresent'] ?? null
  const moveableTimeRange = eventTimeRanges['Moveable'] ?? null
  
  const result = {
    totalTimeRange: slotShape.totalDuration > 0
      ? createTimeRange(startTime, slotShape.totalDuration)
      : null,
    eventTimeRanges,
    // Legacy properties for backward compatibility during migration
    onSiteTimeRange,
    clientPresentTimeRange,
    moveableTimeRange
  }
  
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/dee08c11-824d-42a5-9020-c38261879107',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'appointmentSlotBuilder.ts:110',message:'createTimeRangesFromSlotShape: return',data:{totalTimeRange:result.totalTimeRange?{startTime:result.totalTimeRange.startTime,endTime:result.totalTimeRange.endTime,duration:result.totalTimeRange.duration}:null,eventTimeRangesKeys:Object.keys(result.eventTimeRanges),eventTimeRangesCount:Object.keys(result.eventTimeRanges).length,onSiteTimeRange:result.onSiteTimeRange?{startTime:result.onSiteTimeRange.startTime,endTime:result.onSiteTimeRange.endTime,duration:result.onSiteTimeRange.duration}:null},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  
  return result
}

/**
 * Look up EventInstance[] for a partShape by name
 * LEARNING: Finds partShape ID from name, then filters eventAssignments relationships
 * WHY: Events are configured at shape level (PartShape → EventInstance), need to look up by shape
 * PATTERN: Find partShape entity by name, filter relationships where parent.id === partShapeId, map to EventInstance[]
 * 
 * @param partShapeName - Part shape name (e.g., "Client Presentation")
 * @param partShapeById - Map of partShape ID → partShape entity
 * @param eventAssignmentsRelationships - Array of eventAssignments relationships
 * @param eventInstances - Array of all EventInstance objects
 * @returns Array of EventInstance objects for this partShape
 */
function lookupEventsForPartShape(
  partShapeName: string,
  partShapeById: Map<string, GlobalEntity<'partShape'>>,
  eventAssignmentsRelationships: GlobalRelationship[],
  eventInstances: EventInstance[],
  validPartsRelationships: GlobalRelationship[],
  blockInstances: BookingBlockInstance[]
): EventInstance[] {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/dee08c11-824d-42a5-9020-c38261879107',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'appointmentSlotBuilder.ts:147',message:'lookupEventsForPartShape: entry',data:{partShapeName,partShapeByIdSize:partShapeById.size,eventAssignmentsRelationshipsCount:eventAssignmentsRelationships.length,eventInstancesCount:eventInstances.length,validPartsRelationshipsCount:validPartsRelationships.length,blockInstancesCount:blockInstances.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
  // #endregion
  
  // Find partShape entity by name
  const partShapeEntity = Array.from(partShapeById.values()).find(
    ps => ps.name === partShapeName
  )
  
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/dee08c11-824d-42a5-9020-c38261879107',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'appointmentSlotBuilder.ts:154',message:'lookupEventsForPartShape: partShapeEntity lookup',data:{partShapeName,partShapeEntityFound:!!partShapeEntity,partShapeEntityId:partShapeEntity?.id,partShapeByIdKeys:Array.from(partShapeById.keys()).slice(0,5),partShapeByIdValuesNames:Array.from(partShapeById.values()).map(ps=>ps.name).slice(0,5)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
  // #endregion
  
  if (!partShapeEntity) {
    return []
  }
  
  // LEARNING: eventAssignments relationships have blockShape as parent, not partShape
  // WHY: Events are configured at blockShape level, but apply to partShapes within that blockShape
  // PATTERN: Find blockShapes that contain this partShape via validParts, then filter eventAssignments by those blockShapes
  
  // Get unique blockShape IDs from blockInstances
  const blockShapeIds = new Set(blockInstances.map(bi => bi.blockShapeRef))
  
  // Find blockShapes that contain this partShape via validParts relationships
  const blockShapesWithPartShape = validPartsRelationships
    .filter(rel => {
      // Check if this validParts relationship includes our partShape
      return rel.children.some(child => child.id === partShapeEntity.id)
    })
    .map(rel => rel.parent.id)
    .filter(blockShapeId => blockShapeIds.has(blockShapeId))
  
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/dee08c11-824d-42a5-9020-c38261879107',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'appointmentSlotBuilder.ts:173',message:'lookupEventsForPartShape: finding blockShapes with partShape',data:{partShapeEntityId:partShapeEntity.id,blockShapesWithPartShapeCount:blockShapesWithPartShape.length,blockShapesWithPartShape,blockShapeIds:Array.from(blockShapeIds)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
  // #endregion
  
  // Filter eventAssignments relationships by blockShapes that contain this partShape
  const shapeEventAssignmentsRels = eventAssignmentsRelationships.filter(rel => {
    return blockShapesWithPartShape.includes(rel.parent.id)
  })
  
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/dee08c11-824d-42a5-9020-c38261879107',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'appointmentSlotBuilder.ts:180',message:'lookupEventsForPartShape: filtering relationships',data:{partShapeEntityId:partShapeEntity.id,shapeEventAssignmentsRelsCount:shapeEventAssignmentsRels.length,eventAssignmentsRelationshipsSample:eventAssignmentsRelationships.slice(0,3).map(rel=>({parentId:rel.parent.id,parentEntityKey:rel.parent.entityKey,childrenCount:rel.children.length}))},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
  // #endregion
  
  // Extract child IDs and map to EventInstance[]
  const eventInstanceIds = shapeEventAssignmentsRels.flatMap(rel => 
    rel.children.map(child => child.id)
  )
  
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/dee08c11-824d-42a5-9020-c38261879107',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'appointmentSlotBuilder.ts:187',message:'lookupEventsForPartShape: extracting event instance IDs',data:{eventInstanceIdsCount:eventInstanceIds.length,eventInstanceIdsSample:eventInstanceIds.slice(0,5),eventInstancesIdsAvailable:eventInstances.map(ei=>ei.id).slice(0,5)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
  // #endregion
  
  // Map IDs to EventInstance objects
  const result = eventInstanceIds
    .map(id => eventInstances.find(ei => ei.id === id))
    .filter((ei): ei is EventInstance => ei !== undefined)
  
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/dee08c11-824d-42a5-9020-c38261879107',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'appointmentSlotBuilder.ts:195',message:'lookupEventsForPartShape: return',data:{partShapeName,resultCount:result.length,resultEventShapeRefs:result.map(ei=>ei.eventShapeRef)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
  // #endregion
  
  return result
}

/**
 * Build AppointmentShape from block instances
 * 
 * Calculates durations and stores finalized parts (no times).
 * This is calculated once and reused for each available start time.
 * 
 * LEARNING: Events are appointment-level features, stored on AppointmentShape
 * WHY: Events are configured at shape level (PartShape → EventInstance), parts determine which events apply
 * PATTERN: Look up EventInstance[] for each unique partShape and store on AppointmentShape
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
  validPartsRelationships?: GlobalRelationship[]
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
  // WHY: Events are configured at shape level, parts determine which events apply
  // PATTERN: Build eventAssignmentsByPartShape Record keyed by partShape name
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
  let slotShape = calculateSlotShape(nonZeroedParts, eventAssignmentsByPartShape, eventShapes || [])
  
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/dee08c11-824d-42a5-9020-c38261879107',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'appointmentSlotBuilder.ts:236',message:'buildAppointmentShape: slotShape calculated',data:{totalDuration:slotShape.totalDuration,eventDurations:slotShape.eventDurations,clientStartOffset:slotShape.clientStartOffset,nonZeroedPartsCount:nonZeroedParts.length,eventAssignmentsByPartShapeKeys:Object.keys(eventAssignmentsByPartShape)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  
  // LEARNING: Round on-site duration based on availability settings
  // WHY: Ensures end times align with configured time increments when rounding is enabled
  // PATTERN: Use configurable rounding function that respects settings
  // Session Event Refactor: Round OnSite event duration in eventDurations Record
  if (slotShape.eventDurations['OnSite']) {
    slotShape = {
      ...slotShape,
      eventDurations: {
        ...slotShape.eventDurations,
        'OnSite': roundDuration(slotShape.eventDurations['OnSite'], settings || null)
      }
    }
  }
  
  const shape: AppointmentShape = {
    finalizedParts: nonZeroedParts,
    slotShape,
    eventAssignmentsByPartShape
  }
  
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/dee08c11-824d-42a5-9020-c38261879107',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'appointmentSlotBuilder.ts:250',message:'buildAppointmentShape: shape created',data:{slotShapeTotalDuration:shape.slotShape.totalDuration,slotShapeEventDurations:shape.slotShape.eventDurations,slotShapeClientStartOffset:shape.slotShape.clientStartOffset},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
  // #endregion
  
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
  isAvailable: boolean = true
): AppointmentSlot {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/dee08c11-824d-42a5-9020-c38261879107',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'appointmentSlotBuilder.ts:274',message:'applyShapeToTime: entry',data:{shapeSlotShapeTotalDuration:shape.slotShape.totalDuration,shapeSlotShapeEventDurations:shape.slotShape.eventDurations,fallbackDuration:fallbackDuration,startTime,buttonIndex},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  
  // Use fallback duration if shape has no duration
  // LEARNING: Always create totalTimeRange, using fallbackDuration if shape.slotShape.totalDuration is 0
  // WHY: Ensures buttons always have a display time with valid duration, even when no services are selected
  const effectiveSlotShape = shape.slotShape.totalDuration > 0
    ? shape.slotShape
    : {
        ...shape.slotShape,
        totalDuration: fallbackDuration || 0
      }
  
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/dee08c11-824d-42a5-9020-c38261879107',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'appointmentSlotBuilder.ts:289',message:'applyShapeToTime: effectiveSlotShape created',data:{effectiveTotalDuration:effectiveSlotShape.totalDuration,effectiveEventDurations:effectiveSlotShape.eventDurations,effectiveClientStartOffset:effectiveSlotShape.clientStartOffset},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  
  // Create all time ranges from SlotShape
  // LEARNING: Precompute TimeRanges for performance
  // WHY: TimeRanges are accessed frequently in UI, so precompute them
  // PATTERN: Use utility function to create all TimeRanges at once
  const timeRanges = createTimeRangesFromSlotShape(effectiveSlotShape, startTime)
  
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/dee08c11-824d-42a5-9020-c38261879107',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'appointmentSlotBuilder.ts:295',message:'applyShapeToTime: timeRanges created',data:{totalTimeRange:timeRanges.totalTimeRange?{startTime:timeRanges.totalTimeRange.startTime,endTime:timeRanges.totalTimeRange.endTime,duration:timeRanges.totalTimeRange.duration}:null,eventTimeRangesKeys:Object.keys(timeRanges.eventTimeRanges),eventTimeRanges:Object.fromEntries(Object.entries(timeRanges.eventTimeRanges).map(([k,v])=>[k,v?{startTime:v.startTime,endTime:v.endTime,duration:v.duration}:null]))},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  
  // LEARNING: For differential services, clientPresentTimeRange should end when inspector finishes on-site work
  // WHY: Client perspective should show time from client arrival to when inspector finishes on-site work
  // PATTERN: Adjust clientPresentTimeRange to end at onSiteTimeRange.endTime if both exist
  // Session Event Refactor: Update eventTimeRanges Record with adjusted ClientPresent time range
  const onSiteTimeRange = timeRanges.eventTimeRanges['OnSite']
  const clientPresentTimeRange = timeRanges.eventTimeRanges['ClientPresent']
  
  const adjustedEventTimeRanges = { ...timeRanges.eventTimeRanges }
  let adjustedClientPresentTimeRange = clientPresentTimeRange
  
  if (onSiteTimeRange && clientPresentTimeRange && effectiveSlotShape.clientStartOffset >= 0) {
    // Client-present time should end when inspector finishes on-site work
    const clientPresentDuration = onSiteTimeRange.duration - effectiveSlotShape.clientStartOffset
    if (clientPresentDuration > 0) {
      adjustedClientPresentTimeRange = createTimeRange(
        addMinutes(startTime, effectiveSlotShape.clientStartOffset),
        clientPresentDuration
      )
      adjustedEventTimeRanges['ClientPresent'] = adjustedClientPresentTimeRange
    } else {
      adjustedClientPresentTimeRange = null
      adjustedEventTimeRanges['ClientPresent'] = null
    }
  }
  
  // Validate: clientPresentTimeRange and onSiteTimeRange must end at the same time
  // LEARNING: For differential services, both perspectives should end when inspector finishes on-site work
  // WHY: Client-present time ends when inspector finishes on-site work, not when total appointment ends
  // PATTERN: Validate that client-present and on-site times align
  if (adjustedClientPresentTimeRange && onSiteTimeRange) {
    if (adjustedClientPresentTimeRange.endTime !== onSiteTimeRange.endTime) {
      throw new Error(
        `AppointmentSlot validation failed: ` +
        `clientPresentTimeRange.endTime (${adjustedClientPresentTimeRange.endTime}) !== ` +
        `onSiteTimeRange.endTime (${onSiteTimeRange.endTime})`
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
  
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/dee08c11-824d-42a5-9020-c38261879107',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'appointmentSlotBuilder.ts:343',message:'applyShapeToTime: slot created',data:{buttonIndex:slot.buttonIndex,totalTimeRange:slot.totalTimeRange?{startTime:slot.totalTimeRange.startTime,endTime:slot.totalTimeRange.endTime,duration:slot.totalTimeRange.duration}:null,eventTimeRangesKeys:Object.keys(slot.eventTimeRanges),eventTimeRanges:Object.fromEntries(Object.entries(slot.eventTimeRanges).map(([k,v])=>[k,v?{startTime:v.startTime,endTime:v.endTime,duration:v.duration}:null]))},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  // #endregion
  
  return slot
}

/**
 * Derive the TimeRange for a given perspective
 * 
 * @param slot - AppointmentSlot with precomputed totals
 * @param perspective - Which perspective to derive
 * @returns TimeRange for display, or null if not applicable
 * 
 * LEARNING: Falls back to totalTimeRange if perspective-specific range is null
 * WHY: Ensures buttons always have a display time, even when specific perspective ranges are null
 */
export function derivePerspective(
  slot: AppointmentSlot,
  perspective: 'onSite' | 'clientPresent' | 'nonDifferential'
): TimeRange | null {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/dee08c11-824d-42a5-9020-c38261879107',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'appointmentSlotBuilder.ts:347',message:'derivePerspective: entry',data:{perspective,slotTotalTimeRange:slot.totalTimeRange?{startTime:slot.totalTimeRange.startTime,endTime:slot.totalTimeRange.endTime,duration:slot.totalTimeRange.duration}:null,slotEventTimeRangesKeys:Object.keys(slot.eventTimeRanges||{}),slotEventTimeRangesOnSite:slot.eventTimeRanges?.['OnSite']?{startTime:slot.eventTimeRanges['OnSite'].startTime,endTime:slot.eventTimeRanges['OnSite'].endTime,duration:slot.eventTimeRanges['OnSite'].duration}:null},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
  // #endregion
  
  let result: TimeRange | null = null
  
  switch (perspective) {
    case 'onSite':
      // LEARNING: Fallback to totalTimeRange if onSiteTimeRange is null
      // WHY: Ensures buttons always have a display time
      // Session Event Refactor: Use eventTimeRanges["OnSite"]
      result = slot.eventTimeRanges?.['OnSite'] ?? slot.totalTimeRange
      break
    case 'clientPresent':
      // LEARNING: Fallback to totalTimeRange if clientPresentTimeRange is null
      // WHY: Ensures buttons always have a display time
      // Session Event Refactor: Use eventTimeRanges["ClientPresent"]
      result = slot.eventTimeRanges?.['ClientPresent'] ?? slot.totalTimeRange
      break
    case 'nonDifferential':
      // LEARNING: Show on-site time for non-differential (same as inspector view)
      // WHY: Non-differential services should show inspector times on buttons, not total appointment time
      // PATTERN: Use onSiteTimeRange with fallback to totalTimeRange if null
      // Session Event Refactor: Use eventTimeRanges["OnSite"]
      result = slot.eventTimeRanges?.['OnSite'] ?? slot.totalTimeRange
      break
    default:
      result = null
  }
  
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/dee08c11-824d-42a5-9020-c38261879107',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'appointmentSlotBuilder.ts:377',message:'derivePerspective: return',data:{perspective,result:result?{startTime:result.startTime,endTime:result.endTime,duration:result.duration}:null},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
  // #endregion
  
  return result
}
