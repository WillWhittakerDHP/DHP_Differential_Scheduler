import { BLOCK_SHAPE_TYPES } from '@/constants/blockShapeTypes'
import type { BlockFinal } from '@/types/booking/blockFinal'
import type { PartFinal } from '@/types/booking/partFinal'
import type { EventInstance, EventShape } from '@/types/events'
import { toGlobalEntityId } from '@/utils/globalEntity'

type PartDurationByEventAndShape = Map<string, number>
type EventAssignmentsByPartInstanceId = Record<string, EventInstance[]>

export function isEventBlock(blockFinal: BlockFinal): boolean {
  return blockFinal.sourceBlockInstance.blockShapeSemanticType === BLOCK_SHAPE_TYPES.EVENT
}

export function partBaseDuration(part: PartFinal): number {
  return part.baseTime
}

function multiplierDelta(baseDuration: number, multiplier: number): number {
  return baseDuration * (multiplier - 1)
}

export function partFinalLineageKey(part: PartFinal): string {
  const id = part.sourcePartInstances[0]?.id
  if (id !== undefined && id !== '') {
    return id
  }
  return part.partShape
}

export function eventPartDurationKey(eventShapeId: string, partShape: string): string {
  return `${eventShapeId}::${partShape}`
}

export function eventShapeIdForEventInstance(
  eventInstance: EventInstance,
  eventShapeById: Map<string, EventShape>
): string | null {
  const eventShape = eventShapeById.get(toGlobalEntityId(eventInstance.eventShapeRef))
  return eventShape?.id ?? null
}

function eventShapeIdsForPart(
  part: PartFinal,
  assignments: EventAssignmentsByPartInstanceId,
  eventShapeById: Map<string, EventShape>
): string[] {
  const events = assignments[partFinalLineageKey(part)] ?? []
  return events
    .map((eventInstance) => eventShapeIdForEventInstance(eventInstance, eventShapeById))
    .filter((id): id is string => id !== null)
}

export function nonEventPartDurationByEventAndShape(
  blockFinals: BlockFinal[],
  eventAssignmentsByPartInstanceId: EventAssignmentsByPartInstanceId,
  eventShapeById: Map<string, EventShape>
): PartDurationByEventAndShape {
  const out = new Map<string, number>()
  for (const blockFinal of blockFinals) {
    if (isEventBlock(blockFinal)) {
      continue
    }
    for (const part of blockFinal.finalizedParts) {
      for (const eventShapeId of eventShapeIdsForPart(part, eventAssignmentsByPartInstanceId, eventShapeById)) {
        const key = eventPartDurationKey(eventShapeId, part.partShape)
        out.set(key, (out.get(key) ?? 0) + partBaseDuration(part))
      }
    }
  }
  return out
}

export function eventPartModifierDurationMinutes(
  part: PartFinal,
  eventShapeId: string,
  nonEventDurationsByEventAndShape: PartDurationByEventAndShape
): number {
  const baseDuration = partBaseDuration(part)
  const key = eventPartDurationKey(eventShapeId, part.partShape)
  const targetBaseDuration = nonEventDurationsByEventAndShape.get(key) ?? 0
  return baseDuration + multiplierDelta(targetBaseDuration, part.baseMultiplier)
}
