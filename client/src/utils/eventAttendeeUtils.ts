import { effectiveDifferentialRole } from '@shared/utils/differentialRoleUtils'
import {
  eventShapeDifferentialRoleFromPlacementFields,
  sanitizeEventPlacementKindInput,
} from '@shared/utils/eventPlacementUtils'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import type { DifferentialRole, DifferentialRoleStorage } from '@shared/types/differentialRole'
import type { EventShapeEntity, BlockInstanceEntity, BlockShapeEntity } from '@/types/entities'
import { BLOCK_SHAPE_TYPES } from '@/constants/blockShapeTypes'
import { toGlobalEntityId } from '@/utils/globalEntity'
import type { GlobalData } from '@/utils/transformers/fetchToGlobalTransformer'
import { asEmptyArray } from '@/utils/safeDefaults'

export function getAllUserTypeBlockIds(globalData: GlobalData): GlobalEntityId[] {
  const blockShapes = asEmptyArray(globalData.entities.blockShape) as BlockShapeEntity[]
  const userBlockShapeIds = new Set(
    blockShapes.filter((bs) => bs.type === BLOCK_SHAPE_TYPES.USER).map((bs) => bs.id)
  )

  const blockInstances = asEmptyArray(globalData.entities.blockInstance) as BlockInstanceEntity[]
  const userBlockInstances = blockInstances.filter((instance) =>
    userBlockShapeIds.has(toGlobalEntityId(instance.blockShapeRef))
  )

  return userBlockInstances.map((instance) => instance.id)
}

/** Major/minor lookup using block-instance overrides when provided. */
function resolveEventShapeEntityForRole(
  eventShapes: EventShapeEntity[],
  role: DifferentialRoleStorage,
  overrides?: Record<string, DifferentialRole> | null
): EventShapeEntity | null {
  return (
    eventShapes.find((es) => {
      const templateRole = eventShapeDifferentialRoleFromPlacementFields(es.placementKind, es.anchorEdge)
      const effective = effectiveDifferentialRole(String(es.id), templateRole, overrides ?? undefined)
      return effective === role
    }) ?? null
  )
}

export function getEventShapeByRoleWithOverrides(
  eventShapes: EventShapeEntity[],
  role: DifferentialRoleStorage,
  overrides?: Record<string, DifferentialRole> | null
): EventShapeEntity | null {
  return resolveEventShapeEntityForRole(eventShapes, role, overrides)
}

/** True when appointment-level differential role overrides may change effective roles (non-empty map). */
export function hasNonEmptyDifferentialRoleOverrides(
  overrides?: Record<string, DifferentialRole> | null
): boolean {
  if (overrides == null) {
    return false
  }
  return Object.keys(overrides).length > 0
}

/**
 * WHY (FEATURE_20 / §4.3): Prefer **placement_kind** (primary / secondary) over scanning for
 * effective role `major` / `minor` when overrides are empty — placement is the source of truth.
 * When overrides exist, keep legacy **effectiveDifferentialRole** resolution for parity.
 */
export function resolvePrimarySecondaryEventShapesForBooking(
  eventShapes: EventShapeEntity[],
  overrides?: Record<string, DifferentialRole> | null
): {
  primary: EventShapeEntity | null
  secondary: EventShapeEntity | null
} {
  if (hasNonEmptyDifferentialRoleOverrides(overrides)) {
    return {
      primary: resolveEventShapeEntityForRole(eventShapes, 'major', overrides),
      secondary: resolveEventShapeEntityForRole(eventShapes, 'minor', overrides),
    }
  }
  return {
    primary:
      eventShapes.find(
        (es) => (sanitizeEventPlacementKindInput(es.placementKind) ?? 'primary') === 'primary'
      ) ?? null,
    secondary:
      eventShapes.find((es) => sanitizeEventPlacementKindInput(es.placementKind) === 'secondary') ??
      null,
  }
}

/** Both roles resolved — differential scheduling bar/offset path. No logging. */
type DifferentialMajorMinorFromEventShapes = {
  hasMajorMinorPair: boolean
  major: EventShapeEntity | null
  minor: EventShapeEntity | null
}

export function resolveDifferentialMajorMinorFromEventShapes(
  eventShapes: EventShapeEntity[],
  overrides?: Record<string, DifferentialRole> | null
): DifferentialMajorMinorFromEventShapes {
  const { primary, secondary } = resolvePrimarySecondaryEventShapesForBooking(eventShapes, overrides)
  return {
    hasMajorMinorPair: primary !== null && secondary !== null,
    major: primary,
    minor: secondary,
  }
}
