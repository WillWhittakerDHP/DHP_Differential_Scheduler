import type { BlockFinal } from '@/types/booking/blockFinal'
import type { EventInstance, EventShape } from '@/types/events'
import { getEventShapeByRoleWithOverrides } from '@/utils/eventAttendeeUtils'
import type { DifferentialRole } from '@shared/types/differentialRole'
import { toGlobalEntityId } from '@/utils/globalEntity'
import type { EventShapeEntity } from '@/types/entities'
import type { EventFinal, SlotShape } from '@/types/appointment'
import type { AvailabilitySettings } from '@/configs/availabilitySettings'
import { createLogger } from '@/utils/logger'
import { roundDuration } from '@/utils/booking/durationRounding'
import { toBoolean } from '@/utils/ternary/ternaryUtils'

const logger = createLogger('partFinalizerSlotShape')

export function calculateSlotShape(
  blockFinals: BlockFinal[],
  eventAssignmentsByPartShape: Record<string, EventInstance[]> = {},
  eventShapes: EventShape[] = [],
  roundingSettings?: AvailabilitySettings | null,
  mergedRoleOverrides: Record<string, DifferentialRole> = {},
): SlotShape {
  let rawDuration = 0

  const eventRawDurationsByShapeId = new Map<string, number>()

  const eventShapeById = new Map(eventShapes.map((es) => [es.id, es]))

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

            if (eventShape.isTernary) {
              const ternaryValue = eventShape.ternaryDefault
              if (ternaryValue === null) {
                logger.error('Cannot determine ternary value for event shape - ternaryDefault is null', {
                  eventShapeName: eventShape.name,
                  eventShapeId: eventShape.id,
                })
                continue
              }

              const isActive = toBoolean(ternaryValue, 'strict')

              if (isActive) {
                const currentRawDuration = updatedEventRawDurations.get(eventShapeId) || 0
                updatedEventRawDurations.set(eventShapeId, currentRawDuration + baseTime)
              }
            } else {
              const currentRawDuration = updatedEventRawDurations.get(eventShapeId) || 0
              updatedEventRawDurations.set(eventShapeId, currentRawDuration + baseTime)
            }
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

  rawDuration = totalRawDuration

  const eventRoundedDurationsByShapeId = new Map(
    Array.from(eventRawDurations.entries()).map(([eventShapeId, dur]) => [
      eventShapeId,
      roundDuration(dur, roundingSettings ?? null),
    ]),
  )

  const eventFinals: EventFinal[] = Array.from(eventRawDurations.entries())
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

  const roundedDuration =
    eventFinals.length > 0 ? Math.max(...eventFinals.map((ef) => ef.roundedDuration)) : 0

  let rawDifferentialOffset = 0
  let roundedDifferentialOffset = 0
  const participatingIds = new Set(
    Array.from(eventRawDurations.entries())
      .filter(([, dur]) => dur > 0)
      .map(([id]) => id),
  )
  const candidateEventShapes = eventShapes.filter((es) => participatingIds.has(String(es.id)))

  const majorEventShape = getEventShapeByRoleWithOverrides(
    candidateEventShapes as EventShapeEntity[],
    'major',
    mergedRoleOverrides,
  )
  const minorEventShape = getEventShapeByRoleWithOverrides(
    candidateEventShapes as EventShapeEntity[],
    'minor',
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

  return {
    rawDuration,
    roundedDuration,
    eventFinals,
    rawDifferentialOffset,
    roundedDifferentialOffset,
  }
}
