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
 * Find EventFinal by event shape name
 * LEARNING: Helper function to look up event final by name from SlotShape
 * WHY: Eliminates hardcoded event name access, enables generic event lookup
 * PATTERN: Array.find() to search eventFinals array
 * 
 * @param slotShape - SlotShape with eventFinals array
 * @param name - Event shape name (e.g., 'OnSite', 'ClientPresent', 'Moveable')
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
  onSiteTimeRange: TimeRange | null
  clientPresentTimeRange: TimeRange | null
  moveableTimeRange: TimeRange | null
} {
  // Build eventTimeRanges Record dynamically from eventFinals array
  // LEARNING: Create TimeRange for each event final in eventFinals array
  // WHY: Enables fully generic event system without hardcoded event names
  const eventTimeRanges: Record<string, TimeRange | null> = {}
  
  for (const eventFinal of slotShape.eventFinals || []) {
    const eventName = eventFinal.eventShape.name
    const duration = eventFinal.duration
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
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/dee08c11-824d-42a5-9020-c38261879107',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'appointmentSlotBuilder.ts:174',message:'lookupEventsForPartShape entry',data:{partShapeName,eventAssignmentsRelationshipsCount:eventAssignmentsRelationships.length,eventInstancesCount:eventInstances.length,blockInstancesCount:blockInstances.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  // Find partShape entity by name
  const partShapeEntity = Array.from(partShapeById.values()).find(
    ps => ps.name === partShapeName
  )
  
  if (!partShapeEntity) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/dee08c11-824d-42a5-9020-c38261879107',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'appointmentSlotBuilder.ts:188',message:'partShape entity not found',data:{partShapeName,partShapeByIdKeys:Array.from(partShapeById.keys())},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
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
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/dee08c11-824d-42a5-9020-c38261879107',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'appointmentSlotBuilder.ts:200',message:'found part instances',data:{partShapeName,partInstanceIdsCount:partInstanceIds.length,partInstanceIds},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  
  // Filter eventAssignments relationships by PartInstances that match this partShape
  const instanceEventAssignmentsRels = eventAssignmentsRelationships.filter(rel => {
    // Check if parent is one of our PartInstances
    return rel.parent.entityKey === 'partInstance' && partInstanceIds.includes(rel.parent.id)
  })
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/dee08c11-824d-42a5-9020-c38261879107',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'appointmentSlotBuilder.ts:204',message:'filtered event assignments',data:{partShapeName,instanceEventAssignmentsRelsCount:instanceEventAssignmentsRels.length,relationships:instanceEventAssignmentsRels.map(rel=>({parentId:rel.parent.id,parentEntityKey:rel.parent.entityKey,childrenCount:rel.children.length,childrenIds:rel.children.map(c=>c.id)}))},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  // #endregion
  
  // Extract child IDs and map to EventInstance[]
  const eventInstanceIds = instanceEventAssignmentsRels.flatMap(rel => 
    rel.children.map(child => child.id)
  )
  
  // Map IDs to EventInstance objects and deduplicate (multiple PartInstances may have same EventInstance)
  const uniqueEventInstanceIds = new Set(eventInstanceIds)
  const result = Array.from(uniqueEventInstanceIds)
    .map(id => eventInstances.find(ei => ei.id === id))
    .filter((ei): ei is EventInstance => ei !== undefined)
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/dee08c11-824d-42a5-9020-c38261879107',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'appointmentSlotBuilder.ts:217',message:'lookupEventsForPartShape exit',data:{partShapeName,resultCount:result.length,resultEventInstanceIds:result.map(ei=>ei.id)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
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
  let slotShape = calculateSlotShape(nonZeroedParts, eventAssignmentsByPartShape, eventShapes || [])
  
  // LEARNING: Round on-site duration based on availability settings
  // WHY: Ensures end times align with configured time increments when rounding is enabled
  // PATTERN: Use configurable rounding function that respects settings
  // Session Event Refactor: Round OnSite event duration in eventFinals array using helper function
  const onSiteEventFinal = findEventFinalByName(slotShape, 'OnSite')
  if (onSiteEventFinal) {
    const roundedDuration = roundDuration(onSiteEventFinal.duration, settings || null)
    slotShape = {
      ...slotShape,
      eventFinals: slotShape.eventFinals.map(ef => 
        ef.eventShape.name === 'OnSite' 
          ? { ...ef, duration: roundedDuration }
          : ef
      )
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
  isAvailable: boolean = true
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
  
  return result
}
