
import type { BookingPartInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { PartFinal } from './PartFinal'
import type { BlockFinal } from '@/types/booking/blockFinal'
import type { EventInstance, EventShape } from '@/types/events'
import { createPartFinal } from './PartFinal'
import { toGlobalEntityId } from '@/utils/globalEntity'
import type { TernaryBoolean } from '@/types/ternary'
import { createLogger } from '@/utils/logger'
import type { DifferentialRole } from '@shared/types/differentialRole'
import { effectiveDifferentialRole } from '@shared/utils/differentialRoleUtils'
import { eventShapeDifferentialRoleFromPlacementFields } from '@shared/utils/eventPlacementUtils'

export { calculateSlotShape } from './partFinalizerSlotShape'

const logger = createLogger('partFinalizer')

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
  const events = assignments[partShapeName] ?? []
  let major: TernaryBoolean = 'false'
  let minor: TernaryBoolean = 'false'
  let minimizer: TernaryBoolean = 'false'
  for (const ei of events) {
    const es = shapeById.get(toGlobalEntityId(ei.eventShapeRef))
    if (!es) {
      continue
    }
    const templateRole = eventShapeDifferentialRoleFromPlacementFields(es.placementKind, es.anchorEdge)
    const role = effectiveDifferentialRole(String(es.id), templateRole, overrides ?? undefined)
    if (role === 'major') {
      major = 'true'
    } else if (role === 'minor') {
      minor = 'true'
    } else if (role === 'minimizer') {
      minimizer = 'true'
    } else if (role === 'margin') {
      // WHY: PartFinal.minimizer 'override' = pre-major margin segment (phase 6.16), not minimizer 'true' (completion-window path).
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
        null
      )
      return { ...pf, ...flags }
    }),
  }))
}
