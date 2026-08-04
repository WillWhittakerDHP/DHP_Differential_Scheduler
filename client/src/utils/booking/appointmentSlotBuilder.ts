/**
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
import type { ResolvedNumericPolicy } from '@shared/types/organizationDefaults'
import type { EventInstance, EventShape } from '@/types/events'
import type { BlockFinal } from '@/types/booking/blockFinal'
import type { GlobalRelationship } from '@/types/relationships'
import { calculateSlotShape, filterZeroedParts } from './partFinalizer'
import {
  createBlockFinals,
  filterZeroedBlocks
} from './blockFinalizer'
import { createTimeRangesFromSlotShape } from './slotShapeLookups'

export { createTimeRange } from './slotTimeUtils'
export { findEventFinalByName, createTimeRangesFromSlotShape } from './slotShapeLookups'
export { derivePerspective } from './perspectiveResolver'

/**
 * Build a minimal AppointmentShape for a single duration (e.g. minimizer completion grid).
 */
export function createMinimalAppointmentShapeForDuration(durationMinutes: number): AppointmentShape {
  return {
    finalizedBlocks: [],
    finalizedParts: [],
    slotShape: {
      rawDuration: durationMinutes,
      roundedDuration: durationMinutes,
      eventFinals: [],
      rawDifferentialOffset: 0,
      roundedDifferentialOffset: 0,
    },
    eventAssignmentsByPartInstanceId: {},
  }
}

/**
 * WHY: Principles §4.2/§5.2 — event assignment resolves per part instance as
 * `event profile override ?? event orchestrator baseline`. A part-level assignment
 * REPLACES the block baseline for that part; the two are never unioned.
 */
function lookupEventInstancesForPartLineage(
  partInstanceId: string,
  owningBlockInstanceId: string,
  eventAssignmentsRelationships: GlobalRelationship[],
  eventInstances: EventInstance[],
): EventInstance[] {
  const baselineEventIds = new Set<string>()
  const overrideEventIds = new Set<string>()
  for (const rel of eventAssignmentsRelationships) {
    if (rel.relationshipKind !== 'eventAssignments') {
      continue
    }
    const parent = rel.parent
    const matchesBlockBaseline =
      parent.entityKey === 'blockInstance' && parent.id === owningBlockInstanceId
    const matchesPartOverride = parent.entityKey === 'partInstance' && parent.id === partInstanceId
    if (!matchesBlockBaseline && !matchesPartOverride) {
      continue
    }
    const target = matchesPartOverride ? overrideEventIds : baselineEventIds
    for (const child of rel.children) {
      if (child.entityKey === 'eventInstance') {
        target.add(child.id)
      }
    }
  }
  const resolvedIds = overrideEventIds.size > 0 ? overrideEventIds : baselineEventIds
  return Array.from(resolvedIds)
    .map((id) => eventInstances.find((ei) => ei.id === id))
    .filter((ei): ei is EventInstance => ei !== undefined)
}

function buildEventAssignmentsByPartInstanceId(
  nonZeroedBlockFinals: BlockFinal[],
  eventAssignmentsRelationships: GlobalRelationship[],
  eventInstances: EventInstance[],
): Record<string, EventInstance[]> {
  const out: Record<string, EventInstance[]> = {}
  for (const bf of nonZeroedBlockFinals) {
    for (const pf of bf.finalizedParts) {
      const lineageId = pf.sourcePartInstances[0]?.id
      if (lineageId === undefined || lineageId === '') {
        continue
      }
      const events = lookupEventInstancesForPartLineage(
        lineageId,
        bf.blockInstanceId,
        eventAssignmentsRelationships,
        eventInstances,
      )
      if (events.length > 0) {
        out[lineageId] = events
      }
    }
  }
  return out
}

export function buildAppointmentShape(
  blockInstances: BookingBlockInstance[],
  settings?: AvailabilitySettings | null,
  eventInstances?: EventInstance[],
  eventShapes?: EventShape[],
  eventAssignmentsRelationships?: GlobalRelationship[],
  resolvedTimeRounding?: ResolvedNumericPolicy['timeAndRounding'] | null,
): AppointmentShape {
  const allBlockFinals = createBlockFinals(blockInstances)
  // WHY: Principles §4.4 step 5 / §4.8 — zero-out is per PART, applied last. A zeroed part
  // inside a mixed block must not contribute to durations or rollups, so each surviving
  // block's finalizedParts are re-filtered (not just fully-zeroed blocks dropped).
  const nonZeroedBlockFinals = filterZeroedBlocks(allBlockFinals).map((blockFinal) => ({
    ...blockFinal,
    finalizedParts: filterZeroedParts(blockFinal.finalizedParts),
  }))

  const eventAssignmentsByPartInstanceId =
    eventInstances && eventAssignmentsRelationships
      ? buildEventAssignmentsByPartInstanceId(
          nonZeroedBlockFinals,
          eventAssignmentsRelationships,
          eventInstances,
        )
      : {}

  let resolvedEventShapes: EventShape[]
  if (eventShapes !== undefined && eventShapes !== null) {
    resolvedEventShapes = eventShapes
  } else {
    logger.debug('buildAppointmentShape: eventShapes missing, using []')
    resolvedEventShapes = []
  }

  const nonZeroedParts = nonZeroedBlockFinals.flatMap((blockFinal) => blockFinal.finalizedParts)

  const slotShape = calculateSlotShape(
    nonZeroedBlockFinals,
    eventAssignmentsByPartInstanceId,
    resolvedEventShapes,
    settings ?? null,
    resolvedTimeRounding,
  )

  return {
    finalizedBlocks: nonZeroedBlockFinals,
    finalizedParts: nonZeroedParts,
    slotShape,
    eventAssignmentsByPartInstanceId,
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

  return {
    buttonIndex,
    isAvailable,
    shape,
    startTime,
    totalTimeRange: timeRanges.totalTimeRange,
    eventTimeRanges: timeRanges.eventTimeRanges
  }
}
