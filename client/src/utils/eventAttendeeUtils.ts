import { effectiveDifferentialRole } from '@shared/utils/differentialRoleUtils'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import type { DifferentialRole, DifferentialRoleStorage } from '@shared/types/differentialRole'
import type { EventShapeEntity, BlockInstanceEntity, BlockShapeEntity } from '@/types/entities'
import { toGlobalEntityId } from '@/utils/globalEntity'
import type { GlobalData } from '@/utils/transformers/fetchToGlobalTransformer'
import { asEmptyArray } from '@/utils/safeDefaults'

export function getAllUserTypeBlockIds(globalData: GlobalData): GlobalEntityId[] {
  const blockShapes = asEmptyArray(globalData.entities.blockShape) as BlockShapeEntity[]
  const stateControlBlockShapes = blockShapes.filter(bs => bs.isStateControl === true)
  const stateControlBlockShapeIds = new Set(stateControlBlockShapes.map(bs => bs.id))
  
  const blockInstances = asEmptyArray(globalData.entities.blockInstance) as BlockInstanceEntity[]
  const stateControlBlockInstances = blockInstances.filter(
    instance => 
      stateControlBlockShapeIds.has(toGlobalEntityId(instance.blockShapeRef))
  )
  
  return stateControlBlockInstances.map(instance => instance.id)
}

/** Major/minor lookup using block-instance overrides when provided. */
export function getEventShapeByRoleWithOverrides(
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
