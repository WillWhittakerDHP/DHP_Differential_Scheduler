/**
 * Block instances eligible for user_role alignment: user-shaped block under a state-control shape (matches server validation).
 */
import { BLOCK_SHAPE_TYPES } from '@/constants/blockShapeTypes'
import type { BlockInstanceEntity, BlockShapeEntity } from '@/types/entities'
import type { GlobalData } from '@/utils/transformers/fetchToGlobalTransformer'
import { toGlobalEntityId } from '@/utils/globalEntity'
import { asEmptyArray } from '@/utils/safeDefaults'

export function getEligibleUserRoleAlignmentBlockInstances(data: GlobalData): BlockInstanceEntity[] {
  const shapes = asEmptyArray(data.entities.blockShape) as BlockShapeEntity[]
  const eligibleShapeIds = new Set(
    shapes
      .filter((s) => s.isStateControl === true && s.type === BLOCK_SHAPE_TYPES.USER)
      .map((s) => s.id)
  )
  const instances = asEmptyArray(data.entities.blockInstance) as BlockInstanceEntity[]
  return instances.filter((bi) => eligibleShapeIds.has(toGlobalEntityId(bi.blockShapeRef)))
}
