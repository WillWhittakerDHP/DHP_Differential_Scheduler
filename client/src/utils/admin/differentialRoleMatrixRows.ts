/**
 * PATTERN: Pure admin helper — one matrix row per active event shape.
 * WHY: Admins create event shapes first; rows must appear immediately. Allowlists use
 * blockShape.validEventCascades; scheduling still depends on block-level eventAssignments and roles.
 */
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import type { BlockInstanceEntity, EventShapeEntity } from '@/types/entities'
import type { DifferentialRole } from '@shared/types/differentialRole'
import { eventShapeDifferentialRoleFromPlacementFields } from '@shared/utils/eventPlacementUtils'

interface DifferentialRoleMatrixRow {
  eventShapeId: GlobalEntityId
  name: string
  templateRole: DifferentialRole
}

export function buildDifferentialRoleMatrixRows(
  blockInstance: BlockInstanceEntity | undefined,
  eventShapes: readonly EventShapeEntity[]
): DifferentialRoleMatrixRow[] {
  if (!blockInstance?.blockShapeRef) {
    return []
  }

  const rows: DifferentialRoleMatrixRow[] = []
  for (const eventShape of eventShapes) {
    if (eventShape.active === false) {
      continue
    }
    rows.push({
      eventShapeId: eventShape.id,
      name: eventShape.name?.trim() || String(eventShape.id),
      templateRole: eventShapeDifferentialRoleFromPlacementFields(
        eventShape.placementKind,
        eventShape.anchorEdge
      ),
    })
  }

  return rows.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
}
