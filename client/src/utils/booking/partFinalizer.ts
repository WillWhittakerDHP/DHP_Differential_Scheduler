
import type { BookingPartInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { PartFinal } from './PartFinal'
import type { BlockFinal } from '@/types/booking/blockFinal'
import type { EventInstance, EventShape } from '@/types/events'
import { createPartFinal } from './PartFinal'
import { toGlobalEntityId } from '@/utils/globalEntity'
import type { TernaryBoolean } from '@/types/ternary'
import { createLogger } from '@/utils/logger'
import { nilToEmptyArray } from '@shared/utils/nilDefaults'
import type { DifferentialRole } from '@shared/types/differentialRole'
import { effectiveDifferentialRole, isDifferentialRoleOverrideValue } from '@shared/utils/differentialRoleUtils'

export { calculateSlotShape } from './partFinalizerSlotShape'

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
      if (!isDifferentialRoleOverrideValue(v)) {
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

function resolvePartShapeDifferentialFlags(
  partShapeName: string,
  assignments: Record<string, EventInstance[]>,
  shapeById: Map<string, EventShape>,
  overrides?: Record<string, DifferentialRole> | null
): { major: TernaryBoolean; minor: TernaryBoolean; minimizer: TernaryBoolean } {
  const events = nilToEmptyArray(assignments[partShapeName])
  let major: TernaryBoolean = 'false'
  let minor: TernaryBoolean = 'false'
  let minimizer: TernaryBoolean = 'false'
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
      minimizer = 'true'
    } else if (role === 'margin') {
      // WHY: PartFinal.minimizer 'override' = pre-major margin segment (phase 6.16), not minimizer 'true' (moveable path).
      minimizer = 'override'
    }
  }
  return { major, minor, minimizer }
}

/** Set PartFinal major/minor/minimizer from eventAssignmentsByPartShape + event shape roles. */
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
