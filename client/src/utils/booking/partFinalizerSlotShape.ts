import type { BlockFinal } from '@/types/booking/blockFinal'
import type { EventInstance, EventShape } from '@/types/events'
import type { DifferentialRole } from '@shared/types/differentialRole'
import type { SlotShape } from '@/types/appointment'
import type { AvailabilitySettings } from '@/configs/availabilitySettings'
import { createLogger } from '@/utils/logger'
import {
  accumulateRawDurationsFromBlockFinals,
  buildEventFinalsList,
  buildRoundedDurationMap,
  computeDifferentialOffsetsFromMaps,
  computeTopLevelRoundedDuration,
} from '@/utils/booking/partFinalizerSlotShapeHelpers'

const logger = createLogger('partFinalizerSlotShape')

export function calculateSlotShape(
  blockFinals: BlockFinal[],
  eventAssignmentsByPartShape: Record<string, EventInstance[]> = {},
  eventShapes: EventShape[] = [],
  roundingSettings?: AvailabilitySettings | null,
  mergedRoleOverrides: Record<string, DifferentialRole> = {},
): SlotShape {
  const eventShapeById = new Map(eventShapes.map((es) => [es.id, es]))

  const { totalRawDuration, eventRawDurations } = accumulateRawDurationsFromBlockFinals(
    blockFinals,
    eventAssignmentsByPartShape,
    eventShapeById,
    logger,
  )

  const rawDuration = totalRawDuration

  const eventRoundedDurationsByShapeId = buildRoundedDurationMap(eventRawDurations, roundingSettings)

  const eventFinals = buildEventFinalsList(
    eventRawDurations,
    eventRoundedDurationsByShapeId,
    eventShapeById,
  )

  const roundedDuration = computeTopLevelRoundedDuration(eventFinals)

  const { rawDifferentialOffset, roundedDifferentialOffset } = computeDifferentialOffsetsFromMaps(
    eventRawDurations,
    eventRoundedDurationsByShapeId,
    eventShapes,
    mergedRoleOverrides,
  )

  return {
    rawDuration,
    roundedDuration,
    eventFinals,
    rawDifferentialOffset,
    roundedDifferentialOffset,
  }
}
