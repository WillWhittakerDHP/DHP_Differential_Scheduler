/**
 * PATTERN: Pure admin helper — one matrix row per active event shape.
 * WHY: Admins create event shapes first; rows must appear immediately. Allowlists use
 * blockShape.validEventCascades; scheduling still depends on block-level eventAssignments and roles.
 */
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import type { BlockInstanceEntity, EventShapeEntity } from '@/types/entities'
import type { DifferentialRole } from '@shared/types/differentialRole'
import {
  eventShapeDifferentialRoleFromPlacementFields,
  sanitizeEventAnchorEdgeInput,
  sanitizeEventPlacementKindInput,
  type EventPlacementKind,
} from '@shared/utils/eventPlacementUtils'

const PLACEMENT_KIND_WORD: Record<EventPlacementKind, string> = {
  primary: 'Primary',
  secondary: 'Secondary',
  marginal: 'Marginal',
  floating: 'Floating',
}

/** User-visible summary of shape placement (lead line in override matrix). */
export function formatEventShapePlacementCaption(shape: EventShapeEntity): string {
  const kind = sanitizeEventPlacementKindInput(shape.placementKind) ?? 'primary'
  const edge = sanitizeEventAnchorEdgeInput(shape.anchorEdge)
  if (kind === 'primary') {
    return PLACEMENT_KIND_WORD.primary
  }
  if (edge === 'start' || edge === 'end') {
    return `${PLACEMENT_KIND_WORD[kind]} · ${edge}`
  }
  return `${PLACEMENT_KIND_WORD[kind]} · set anchor on shape`
}

export interface DifferentialRoleMatrixRow {
  eventShapeId: GlobalEntityId
  name: string
  /** Derived scheduling role from placement (storage / effectiveDifferentialRole path). */
  templateRole: DifferentialRole
  /** Placement-first caption for admin copy (Feature 20). */
  placementCaption: string
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
      placementCaption: formatEventShapePlacementCaption(eventShape),
    })
  }

  return rows.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
}
