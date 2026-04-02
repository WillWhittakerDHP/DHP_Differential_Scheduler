import type { BlockFinal } from '@/types/booking/blockFinal'
import type { DifferentialDurationOffsets } from '@/types/appointmentModels'
import type { EventInstance, EventShape } from '@/types/events'
import type { EventShapeEntity } from '@/types/entities'
import type { EventFinal } from '@/types/appointment'
import type { AvailabilitySettings } from '@/configs/availabilitySettings'
import type { DifferentialRole } from '@shared/types/differentialRole'
import type { ResolvedNumericPolicy } from '@shared/types/organizationDefaults'
import { resolvePrimarySecondaryEventShapesForBooking } from '@/utils/eventAttendeeUtils'
import { roundDuration, roundDurationFromResolvedTimeRounding } from '@/utils/booking/durationRounding'
import { toGlobalEntityId } from '@/utils/globalEntity'
import type { AppLogger } from '@/utils/logger'

type AccumulatedRawDurations = {
  totalRawDuration: number
  eventRawDurations: Map<string, number>
}

export function accumulateRawDurationsFromBlockFinals(
  blockFinals: BlockFinal[],
  eventAssignmentsByPartShape: Record<string, EventInstance[]>,
  eventShapeById: Map<string, EventShape>,
  _logger: AppLogger
): AccumulatedRawDurations {
  const eventRawDurationsByShapeId = new Map<string, number>()

  const { totalRawDuration, eventRawDurations } = blockFinals.reduce(
    (blockAcc, blockFinal) => {
      return blockFinal.finalizedParts.reduce(
        (partAcc, part) => {
          const baseTime = part.baseTime
          const newRawDuration = partAcc.totalRawDuration + baseTime

          const rawEvents = eventAssignmentsByPartShape[part.partShape]
          const events = rawEvents !== undefined && rawEvents !== null ? rawEvents : []

          const updatedEventRawDurations = new Map(partAcc.eventRawDurations)

          for (const eventInstance of events) {
            const eventShape = eventShapeById.get(toGlobalEntityId(eventInstance.eventShapeRef))
            if (!eventShape) continue

            const eventShapeId = eventShape.id

            const currentRawDuration = updatedEventRawDurations.get(eventShapeId) || 0
            updatedEventRawDurations.set(eventShapeId, currentRawDuration + baseTime)
          }

          return {
            totalRawDuration: newRawDuration,
            eventRawDurations: updatedEventRawDurations,
          }
        },
        blockAcc,
      )
    },
    {
      totalRawDuration: 0,
      eventRawDurations: eventRawDurationsByShapeId,
    },
  )

  return { totalRawDuration, eventRawDurations }
}

export function buildRoundedDurationMap(
  eventRawDurations: Map<string, number>,
  roundingSettings: AvailabilitySettings | null | undefined,
  resolvedTimeRounding?: ResolvedNumericPolicy['timeAndRounding'] | null,
): Map<string, number> {
  const roundOne = (dur: number): number =>
    resolvedTimeRounding != null
      ? roundDurationFromResolvedTimeRounding(dur, resolvedTimeRounding)
      : roundDuration(dur, roundingSettings ?? null)
  return new Map(
    Array.from(eventRawDurations.entries()).map(([eventShapeId, dur]) => [
      eventShapeId,
      roundOne(dur),
    ]),
  )
}

export function buildEventFinalsList(
  eventRawDurations: Map<string, number>,
  eventRoundedDurationsByShapeId: Map<string, number>,
  eventShapeById: Map<string, EventShape>
): EventFinal[] {
  return Array.from(eventRawDurations.entries())
    .map(([eventShapeId, dur]) => {
      const eventShape = eventShapeById.get(toGlobalEntityId(eventShapeId))
      if (!eventShape) {
        return null
      }
      const roundedDuration = eventRoundedDurationsByShapeId.get(eventShapeId) || 0
      return {
        eventShape,
        rawDuration: dur,
        roundedDuration,
      }
    })
    .filter((ef): ef is EventFinal => ef !== null)
    .filter((ef) => ef.rawDuration > 0)
}

export function computeTopLevelRoundedDuration(eventFinals: EventFinal[]): number {
  return eventFinals.length > 0 ? Math.max(...eventFinals.map((ef) => ef.roundedDuration)) : 0
}

export function computeDifferentialOffsetsFromMaps(
  eventRawDurations: Map<string, number>,
  eventRoundedDurationsByShapeId: Map<string, number>,
  eventShapes: EventShape[],
  mergedRoleOverrides: Record<string, DifferentialRole>
): DifferentialDurationOffsets {
  let rawDifferentialOffset = 0
  let roundedDifferentialOffset = 0

  const participatingIds = new Set(
    Array.from(eventRawDurations.entries())
      .filter(([, dur]) => dur > 0)
      .map(([id]) => id),
  )
  const candidateEventShapes = eventShapes.filter((es) => participatingIds.has(String(es.id)))

  const { primary: majorEventShape, secondary: minorEventShape } =
    resolvePrimarySecondaryEventShapesForBooking(
      candidateEventShapes as EventShapeEntity[],
      mergedRoleOverrides,
    )
  if (majorEventShape) {
    const majorRawDuration = eventRawDurations.get(majorEventShape.id) || 0
    const majorRoundedDuration = eventRoundedDurationsByShapeId.get(majorEventShape.id) || 0
    if (minorEventShape) {
      const minorRawDuration = eventRawDurations.get(minorEventShape.id) || 0
      const minorRoundedDuration = eventRoundedDurationsByShapeId.get(minorEventShape.id) || 0
      rawDifferentialOffset = majorRawDuration - minorRawDuration
      roundedDifferentialOffset = majorRoundedDuration - minorRoundedDuration
    } else {
      rawDifferentialOffset = majorRawDuration
      roundedDifferentialOffset = majorRoundedDuration
    }
  }

  return { rawDifferentialOffset, roundedDifferentialOffset }
}
