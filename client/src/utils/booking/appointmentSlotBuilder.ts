/**
 * PATTERN: Appointment Slot Builder
PATTERN: Pure functions, no side effects, no re...
 */
import { createLogger } from '@/utils/logger'
import type {
  AppointmentShape,
  AppointmentSlot
} from '@/types/appointment'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'

const logger = createLogger('appointmentSlotBuilder')
import type { AvailabilitySettings } from '@/configs/availabilitySettings'
import type { EventInstance, EventShape } from '@/types/events'
import type { GlobalRelationship } from '@/types/relationships'
import type { GlobalEntity } from '@/types/entities'
import {
  calculateSlotShape
} from './partFinalizer'
import {
  createBlockFinals,
  filterZeroedBlocks
} from './blockFinalizer'
import { createTimeRangesFromSlotShape } from './slotShapeLookups'
import { resolveEventShapes, adjustMinorTimeRange } from './perspectiveResolver'

export { createTimeRange } from './slotTimeUtils'
export { findEventFinalByName, createTimeRangesFromSlotShape } from './slotShapeLookups'
export { derivePerspective } from './perspectiveResolver'

/**
 * Look up EventInstance[] for a partShape by name
 * 
 * @param partShapeName - Part shape name (e.g., "Client Presentation")
 * @param partShapeById - Map of partShape ID → partShape entity
 * @param eventAssignmentsRelationships - Array of eventAssignments relationships (PartInstance → EventInstance)
 * @param eventInstances - Array of all EventInstance objects
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
  const partShapeEntity = Array.from(partShapeById.values()).find(ps => ps.name === partShapeName)
  if (!partShapeEntity) return []

  const partInstanceIds = blockInstances
    .flatMap((bi) => {
      const p = bi.partInstances
      if (p === undefined || p === null) {
        logger.debug('partInstances missing on blockInstance', { blockInstanceId: bi.id })
        return []
      }
      return p
    })
    .filter((pi) => pi.partShape === partShapeName)
    .map(pi => pi.id)

  const instanceEventAssignmentsRels = eventAssignmentsRelationships.filter(
    rel => rel.parent.entityKey === 'partInstance' && partInstanceIds.includes(rel.parent.id)
  )
  const eventInstanceIds = instanceEventAssignmentsRels.flatMap(rel =>
    rel.children.map(child => child.id)
  )
  const uniqueEventInstanceIds = new Set(eventInstanceIds)
  return Array.from(uniqueEventInstanceIds)
    .map(id => eventInstances.find(ei => ei.id === id))
    .filter((ei): ei is EventInstance => ei !== undefined)
}

/**
 * Build eventAssignmentsByPartShape from nonZeroedParts and relationships.
 */
function buildEventAssignmentsByPartShape(
  nonZeroedParts: { partShape: string }[],
  partShapeById: Map<string, GlobalEntity<'partShape'>>,
  eventAssignmentsRelationships: GlobalRelationship[],
  eventInstances: EventInstance[],
  blockInstances: BookingBlockInstance[]
): Record<string, EventInstance[]> {
  const uniquePartShapes = new Set(nonZeroedParts.map(pf => pf.partShape))
  const entries = Array.from(uniquePartShapes)
    .map(partShapeName => {
      const events = lookupEventsForPartShape(
        partShapeName,
        partShapeById,
        eventAssignmentsRelationships,
        eventInstances,
        blockInstances
      )
      return events.length > 0 ? ([partShapeName, events] as const) : null
    })
    .filter((entry): entry is [string, EventInstance[]] => entry !== null)
  return Object.fromEntries(entries)
}

/**
 * Build AppointmentShape from block instances
 * 
 * Calculates durations and stores finalized parts (no times).
 * This is calculated once and reused for each available start time.
 * 
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
): AppointmentShape {
  const allBlockFinals = createBlockFinals(blockInstances)
  const nonZeroedBlockFinals = filterZeroedBlocks(allBlockFinals)
  const nonZeroedParts = nonZeroedBlockFinals.flatMap(blockFinal => blockFinal.finalizedParts)

  const eventAssignmentsByPartShape =
    eventInstances && eventAssignmentsRelationships && partShapeById
      ? buildEventAssignmentsByPartShape(
          nonZeroedParts,
          partShapeById,
          eventAssignmentsRelationships,
          eventInstances,
          blockInstances
        )
      : {}

  let resolvedEventShapes: EventShape[]
  if (eventShapes !== undefined && eventShapes !== null) {
    resolvedEventShapes = eventShapes
  } else {
    logger.debug('buildAppointmentShape: eventShapes missing, using []')
    resolvedEventShapes = []
  }
  const slotShape = calculateSlotShape(
    nonZeroedBlockFinals,
    eventAssignmentsByPartShape,
    resolvedEventShapes,
    settings ?? null,
  )

  return {
    finalizedBlocks: nonZeroedBlockFinals,
    finalizedParts: nonZeroedParts,
    slotShape,
    eventAssignmentsByPartShape
  }
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
): AppointmentSlot {
  const effectiveSlotShape = shape.slotShape.roundedDuration > 0
    ? shape.slotShape
    : {
        ...shape.slotShape,
        roundedDuration: fallbackDuration ?? 0
      }
  
  const timeRanges = createTimeRangesFromSlotShape(effectiveSlotShape, startTime)

  const resolved = effectiveSlotShape.eventFinals.length > 0
    ? resolveEventShapes(effectiveSlotShape.eventFinals)
    : {
        majorEventShape: null,
        minorEventShape: null,
        majorEventName: null,
        minorEventName: null
      }

  const majorTimeRange =
    resolved.majorEventName != null
      ? timeRanges.eventTimeRanges[resolved.majorEventName] ?? null
      : null
  const minorTimeRange =
    resolved.minorEventName != null
      ? timeRanges.eventTimeRanges[resolved.minorEventName] ?? null
      : null

  const { adjustedEventTimeRanges, adjustedMinorTimeRange } = adjustMinorTimeRange(
    startTime,
    timeRanges.eventTimeRanges,
    resolved.majorEventName,
    resolved.minorEventName,
    majorTimeRange,
    minorTimeRange,
    effectiveSlotShape.roundedDifferentialOffset
  )

  if (adjustedMinorTimeRange != null && majorTimeRange != null) {
    if (adjustedMinorTimeRange.endTime !== majorTimeRange.endTime) {
      throw new Error(
        `AppointmentSlot validation failed: ` +
          `minorTimeRange.endTime (${adjustedMinorTimeRange.endTime}) !== ` +
          `majorTimeRange.endTime (${majorTimeRange.endTime})`
      )
    }
  }

  return {
    buttonIndex,
    isAvailable,
    shape,
    startTime,
    totalTimeRange: timeRanges.totalTimeRange,
    eventTimeRanges: adjustedEventTimeRanges
  }
}
