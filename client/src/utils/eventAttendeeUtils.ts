import {
  sanitizeEventPlacementKindInput,
} from '@shared/utils/eventPlacementUtils'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
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

/**
 * WHY (FEATURE_20): **placement_kind** is the source of truth for primary / secondary event shapes.
 * Block-instance **`differential_event_role_overrides`** was removed (migration + admin UI).
 */
export function resolvePrimarySecondaryEventShapesForBooking(
  eventShapes: EventShapeEntity[],
): {
  primary: EventShapeEntity | null
  secondary: EventShapeEntity | null
} {
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
): DifferentialMajorMinorFromEventShapes {
  const { primary, secondary } = resolvePrimarySecondaryEventShapesForBooking(eventShapes)
  return {
    hasMajorMinorPair: primary !== null && secondary !== null,
    major: primary,
    minor: secondary,
  }
}
