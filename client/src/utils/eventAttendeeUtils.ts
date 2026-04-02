import { effectiveDifferentialRole } from '@shared/utils/differentialRoleUtils'
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
      const effective = effectiveDifferentialRole(String(es.id), es.differentialRole, overrides ?? undefined)
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
  const major = resolveEventShapeEntityForRole(eventShapes, 'major', overrides)
  const minor = resolveEventShapeEntityForRole(eventShapes, 'minor', overrides)
  return {
    hasMajorMinorPair: major !== null && minor !== null,
    major,
    minor,
  }
}
