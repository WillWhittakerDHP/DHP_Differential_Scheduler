import type { BlockFinal } from '@/types/booking/blockFinal'
import type { EventInstance, EventShape } from '@/types/events'
import type { SlotShape } from '@/types/appointment'
import type { AvailabilitySettings } from '@/configs/availabilitySettings'
import type { ResolvedNumericPolicy } from '@shared/types/organizationDefaults'
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
  eventAssignmentsByPartInstanceId: Record<string, EventInstance[]> = {},
  eventShapes: EventShape[] = [],
  roundingSettings?: AvailabilitySettings | null,
  resolvedTimeRounding?: ResolvedNumericPolicy['timeAndRounding'] | null,
): SlotShape {
  const eventShapeById = new Map(eventShapes.map((es) => [es.id, es]))

  const { totalRawDuration, eventRawDurations } = accumulateRawDurationsFromBlockFinals(
    blockFinals,
    eventAssignmentsByPartInstanceId,
    eventShapeById,
    logger,
  )

  const rawDuration = totalRawDuration

  const eventRoundedDurationsByShapeId = buildRoundedDurationMap(
    eventRawDurations,
    roundingSettings,
    resolvedTimeRounding,
  )

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
  )

  return {
    rawDuration,
    roundedDuration,
    eventFinals,
    rawDifferentialOffset,
    roundedDifferentialOffset,
  }
}
