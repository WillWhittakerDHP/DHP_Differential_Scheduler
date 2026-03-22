
import type { BookingPartInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { PartFinal } from './PartFinal'
import type { BlockFinal } from '@/types/booking/blockFinal'
import type { EventInstance, EventShape } from '@/types/events'
import { createPartFinal } from './PartFinal'
import { toBoolean } from '@/utils/ternary/ternaryUtils'
import { getEventShapeByRoleWithOverrides } from '@/utils/eventAttendeeUtils'
import type { DifferentialRole } from '@shared/types/differentialRole'
import { effectiveDifferentialRole } from '@shared/utils/differentialRoleUtils'
import { toGlobalEntityId } from '@/utils/globalEntity'
import type { EventShapeEntity } from '@/types/entities'
import type { EventFinal, SlotShape } from '@/types/appointment'
import type { TernaryBoolean } from '@/types/ternary'
import type { AvailabilitySettings } from '@/configs/availabilitySettings'
import { createLogger } from '@/utils/logger'
import { roundDuration } from '@/utils/booking/durationRounding'
import { nilToEmptyArray } from '@shared/utils/nilDefaults'

const logger = createLogger('partFinalizer')

/**
 * Merge per-block differential role overrides for slot math. First block wins per eventShapeId; log on conflict.
 */
export function mergeBlockDifferentialRoleOverrides(blockFinals: BlockFinal[]): Record<string, DifferentialRole> {
  const merged: Record<string, DifferentialRole> = {}
  for (const bf of blockFinals) {
    const raw = bf.sourceBlockInstance.differentialEventRoleOverrides
    if (raw === undefined || raw === null || typeof raw !== 'object') {
      continue
    }
    for (const [k, v] of Object.entries(raw)) {
      if (v !== 'major' && v !== 'minor' && v !== 'moveable' && v !== 'none') {
        continue
      }
      if (k in merged && merged[k] !== v) {
        logger.warn('mergeBlockDifferentialRoleOverrides: conflicting override; keeping first', {
          eventShapeId: k,
          kept: merged[k],
          skipped: v,
        })
        continue
      }
      if (!(k in merged)) {
        merged[k] = v
      }
    }
  }
  return merged
}

function partShapeKey(part: BookingPartInstance): string {
  const raw = part.partShape
  if (raw === undefined || raw === null || raw === '') {
    logger.debug('groupPartsByShape: partShape missing', { partId: part.id })
    return ''
  }
  return raw
}

function groupPartsByShape(
  parts: BookingPartInstance[]
): Map<string, BookingPartInstance[]> {
  return parts.reduce((grouped, part) => {
    const partShape = partShapeKey(part)
    if (!grouped.has(partShape)) {
      grouped.set(partShape, [])
    }
    grouped.get(partShape)!.push(part)
    return grouped
  }, new Map<string, BookingPartInstance[]>())
}

export function createPartFinals(
  parts: BookingPartInstance[]
): PartFinal[] {
  const partsByShape = groupPartsByShape(parts)
  
  return Array.from(partsByShape.entries()).map(([partShape, shapeParts]) =>
    createPartFinal(partShape, shapeParts)
  )
}

export function filterZeroedParts(
  partFinals: PartFinal[]
): PartFinal[] {
  return partFinals.filter(part => !part.zeroOutPart)
}

export function calculateSlotShape(
  blockFinals: BlockFinal[],
  eventAssignmentsByPartShape: Record<string, EventInstance[]> = {},
  eventShapes: EventShape[] = [],
  roundingSettings?: AvailabilitySettings | null,
  mergedRoleOverrides: Record<string, DifferentialRole> = {},
): SlotShape {
  let rawDuration = 0
  
  // PATTERN: Map<eventShapeId, rawDuration> for accumulation, then round ONCE per event after accumulation
  const eventRawDurationsByShapeId = new Map<string, number>()
  
  const eventShapeById = new Map(eventShapes.map(es => [es.id, es]))
  
  // PATTERN: Use reduce to accumulate raw durations only
  const { totalRawDuration, eventRawDurations } = blockFinals.reduce(
    (blockAcc, blockFinal) => {
      // PATTERN: Accumulate from all finalized parts within this block
      return blockFinal.finalizedParts.reduce(
        (partAcc, part) => {
          const baseTime = part.baseTime
          const newRawDuration = partAcc.totalRawDuration + baseTime
          
          const rawEvents = eventAssignmentsByPartShape[part.partShape]
          const events = rawEvents !== undefined && rawEvents !== null ? rawEvents : []
          
          // PATTERN: Process events and accumulate raw durations by event shape
          const updatedEventRawDurations = new Map(partAcc.eventRawDurations)
          
          for (const eventInstance of events) {
            const eventShape = eventShapeById.get(toGlobalEntityId(eventInstance.eventShapeRef))
            if (!eventShape) continue
            
            const eventShapeId = eventShape.id
            
            // PATTERN: Check isTernary flag, use ternaryDefault if available, otherwise fail gracefully
            if (eventShape.isTernary) {
              const ternaryValue = eventShape.ternaryDefault
              if (ternaryValue === null) {
                logger.error('Cannot determine ternary value for event shape - ternaryDefault is null', {
                  eventShapeName: eventShape.name,
                  eventShapeId: eventShape.id
                })
                continue // Skip this event - graceful failure
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
            eventRawDurations: updatedEventRawDurations
          }
        },
        blockAcc
      )
    },
    {
      totalRawDuration: 0,
      eventRawDurations: eventRawDurationsByShapeId
    }
  )
  
  rawDuration = totalRawDuration
  
  // PATTERN: Build new Map from reduce result (no mutation); use eventRawDurations from reduce
  const eventRoundedDurationsByShapeId = new Map(
    Array.from(eventRawDurations.entries()).map(([eventShapeId, rawDuration]) => [
      eventShapeId,
      roundDuration(rawDuration, roundingSettings ?? null),
    ])
  )
  
  // WHY: Provides array of event shapes with both raw and rounded durations, matching PartFinal[] pattern
  // PATTERN: Map over eventRawDurations entries, create EventFinal for each with both raw and rounded durations
  const eventFinals: EventFinal[] = Array.from(eventRawDurations.entries())
    .map(([eventShapeId, rawDuration]) => {
      const eventShape = eventShapeById.get(toGlobalEntityId(eventShapeId))
      if (!eventShape) {
        return null
      }
      const roundedDuration = eventRoundedDurationsByShapeId.get(eventShapeId) || 0
      return {
        eventShape,
        rawDuration,
        roundedDuration
      }
    })
    .filter((ef): ef is EventFinal => ef !== null)
    .filter(ef => ef.rawDuration > 0) // Only include events with raw duration > 0
  
  // PATTERN: Use max instead of sum to get the actual slot span
  const roundedDuration = eventFinals.length > 0
    ? Math.max(...eventFinals.map(ef => ef.roundedDuration))
    : 0
  
  // PATTERN: Calculate offset from final event durations after all parts have been processed and rounded
  let rawDifferentialOffset = 0
  let roundedDifferentialOffset = 0
  const participatingIds = new Set(
    Array.from(eventRawDurations.entries())
      .filter(([, dur]) => dur > 0)
      .map(([id]) => id)
  )
  const candidateEventShapes = eventShapes.filter((es) => participatingIds.has(String(es.id)))

  const majorEventShape = getEventShapeByRoleWithOverrides(
    candidateEventShapes as EventShapeEntity[],
    'major',
    mergedRoleOverrides
  )
  const minorEventShape = getEventShapeByRoleWithOverrides(
    candidateEventShapes as EventShapeEntity[],
    'minor',
    mergedRoleOverrides
  )
  if (!majorEventShape) {
    logger.error('calculateSlotShape: no event shape with effective differentialRole=major', {
      availableRoles: candidateEventShapes.map((es) => ({
        name: es.name,
        differentialRole: es.differentialRole,
        effective: effectiveDifferentialRole(String(es.id), es.differentialRole, mergedRoleOverrides),
      })),
    })
  }
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
  
  const result = { 
    rawDuration,
    roundedDuration,
    eventFinals,
    rawDifferentialOffset,
    roundedDifferentialOffset
  }
  return result
}

function resolvePartShapeDifferentialFlags(
  partShapeName: string,
  assignments: Record<string, EventInstance[]>,
  shapeById: Map<string, EventShape>,
  overrides?: Record<string, DifferentialRole> | null
): { major: TernaryBoolean; minor: TernaryBoolean; moveable: boolean } {
  const events = nilToEmptyArray(assignments[partShapeName])
  let major: TernaryBoolean = 'false'
  let minor: TernaryBoolean = 'false'
  let moveable = false
  for (const ei of events) {
    const es = shapeById.get(toGlobalEntityId(ei.eventShapeRef))
    if (!es) {
      continue
    }
    const role = effectiveDifferentialRole(String(es.id), es.differentialRole, overrides ?? undefined)
    if (role === 'major') {
      major = 'true'
    } else if (role === 'minor') {
      minor = 'true'
    } else if (role === 'moveable') {
      moveable = true
    }
  }
  return { major, minor, moveable }
}

/** Set PartFinal major/minor/moveable from eventAssignmentsByPartShape + event shape roles. */
export function enrichBlockFinalsWithDifferentialRoles(
  blockFinals: BlockFinal[],
  eventAssignmentsByPartShape: Record<string, EventInstance[]>,
  eventShapes: EventShape[]
): BlockFinal[] {
  const shapeById = new Map(
    eventShapes.map((es) => [toGlobalEntityId(es.id), es])
  )
  return blockFinals.map((bf) => ({
    ...bf,
    finalizedParts: bf.finalizedParts.map((pf) => {
      const flags = resolvePartShapeDifferentialFlags(
        pf.partShape,
        eventAssignmentsByPartShape,
        shapeById,
        bf.sourceBlockInstance.differentialEventRoleOverrides ?? null
      )
      return { ...pf, ...flags }
    }),
  }))
}

export function sumPartFinalsDuration(parts: PartFinal[]): number {
  return parts.reduce((sum, part) => sum + part.baseTime, 0)
}
