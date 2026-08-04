import type { BlockFinal } from '@/types/booking/blockFinal'
import type { DifferentialDurationOffsets } from '@/types/appointmentModels'
import type { EventInstance, EventShape } from '@/types/events'
import type { EventShapeEntity } from '@/types/entities'
import type { EventFinal } from '@/types/appointment'
import type { AvailabilitySettings } from '@/configs/availabilitySettings'
import type { ResolvedNumericPolicy } from '@shared/types/organizationDefaults'
import { resolvePrimarySecondaryEventShapesForBooking } from '@/utils/eventAttendeeUtils'
import { roundDuration, roundDurationFromResolvedTimeRounding } from '@/utils/booking/durationRounding'
import { toGlobalEntityId } from '@/utils/globalEntity'
import type { AppLogger } from '@/utils/logger'
import { sanitizeEventPlacementKindInput } from '@shared/utils/eventPlacementUtils'
import {
  eventPartModifierDurationMinutes,
  eventShapeIdForEventInstance,
  isEventBlock,
  nonEventPartDurationByEventAndShape,
  partBaseDuration,
  partFinalLineageKey,
} from '@/utils/booking/eventPartTimeModifiers'

type AccumulatedRawDurations = {
  totalRawDuration: number
  eventRawDurations: Map<string, number>
}

export function accumulateRawDurationsFromBlockFinals(
  blockFinals: BlockFinal[],
  eventAssignmentsByPartInstanceId: Record<string, EventInstance[]>,
  eventShapeById: Map<string, EventShape>,
  _logger: AppLogger
): AccumulatedRawDurations {
  const eventRawDurationsByShapeId = new Map<string, number>()
  const nonEventDurationsByEventAndShape = nonEventPartDurationByEventAndShape(
    blockFinals,
    eventAssignmentsByPartInstanceId,
    eventShapeById
  )

  const { totalRawDuration, eventRawDurations } = blockFinals.reduce(
    (blockAcc, blockFinal) => {
      return blockFinal.finalizedParts.reduce(
        (partAcc, part) => {
          const lineageKey = partFinalLineageKey(part)
          const rawEvents = eventAssignmentsByPartInstanceId[lineageKey]
          const events = rawEvents !== undefined && rawEvents !== null ? rawEvents : []
          const updatedEventRawDurations = new Map(partAcc.eventRawDurations)

          if (isEventBlock(blockFinal)) {
            let totalEventModifierDuration = 0
            for (const eventInstance of events) {
              const eventShapeId = eventShapeIdForEventInstance(eventInstance, eventShapeById)
              if (eventShapeId === null) continue
              const duration = eventPartModifierDurationMinutes(
                part,
                eventShapeId,
                nonEventDurationsByEventAndShape
              )
              totalEventModifierDuration += duration
              const currentRawDuration = updatedEventRawDurations.get(eventShapeId) || 0
              updatedEventRawDurations.set(eventShapeId, currentRawDuration + duration)
            }
            return {
              totalRawDuration: partAcc.totalRawDuration + totalEventModifierDuration,
              eventRawDurations: updatedEventRawDurations,
            }
          }

          const duration = partBaseDuration(part)
          for (const eventInstance of events) {
            const eventShape = eventShapeById.get(toGlobalEntityId(eventInstance.eventShapeRef))
            if (!eventShape) continue
            const eventShapeId = eventShape.id
            const currentRawDuration = updatedEventRawDurations.get(eventShapeId) || 0
            updatedEventRawDurations.set(eventShapeId, currentRawDuration + duration)
          }

          return {
            totalRawDuration: partAcc.totalRawDuration + duration,
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
  if (eventFinals.length === 0) {
    return 0
  }

  const primaryDurations: number[] = []
  const insideDurations: number[] = []
  let adjacentDuration = 0

  for (const eventFinal of eventFinals) {
    const duration = eventFinal.roundedDuration
    const kind = sanitizeEventPlacementKindInput(eventFinal.eventShape.placementKind) ?? 'primary'
    if (kind === 'primary') {
      primaryDurations.push(duration)
      continue
    }
    if (kind === 'secondary') {
      insideDurations.push(duration)
      continue
    }
    if (kind === 'marginal') {
      adjacentDuration += duration
    }
  }

  if (primaryDurations.length === 0) {
    return Math.max(...eventFinals.map((ef) => ef.roundedDuration))
  }

  const primaryWindow = Math.max(...primaryDurations, ...insideDurations, 0)
  return primaryWindow + adjacentDuration
}

export function computeDifferentialOffsetsFromMaps(
  eventRawDurations: Map<string, number>,
  eventRoundedDurationsByShapeId: Map<string, number>,
  eventShapes: EventShape[]
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
    resolvePrimarySecondaryEventShapesForBooking(candidateEventShapes as EventShapeEntity[])
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
