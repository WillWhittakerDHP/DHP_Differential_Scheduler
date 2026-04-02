import type { useAdmin } from '@/composables/admin/useAdmin'
import { BLOCK_SHAPE_TYPES } from '@/constants/blockShapeTypes'
import { toGlobalEntityId } from '@/utils/globalEntity'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import type { GlobalEntity } from '@/types/entities'

interface BlockInstanceShapeFlags {
  /** Instance-level composite flag (Feature 20); drives instance-component UX. */
  composable: boolean
  /** Non-user shapes participate in part-instance totals (replaces shape canHaveParts). */
  canHaveParts: boolean
}

/**
 * Resolves instance composite + shape type for the current blockInstance entity (admin store).
 */
export function getBlockInstanceShapeProperties(
  adminComp: ReturnType<typeof useAdmin>,
  entityIdValue: GlobalEntityId
): BlockInstanceShapeFlags {
  const blockInstance = adminComp.getEntity('blockInstance', toGlobalEntityId(entityIdValue))
  if (!blockInstance) {
    return { composable: false, canHaveParts: false }
  }
  const bi = blockInstance as GlobalEntity<'blockInstance'>
  const blockShape = adminComp.getEntity('blockShape', toGlobalEntityId(bi.blockShapeRef))
  if (!blockShape) {
    return { composable: false, canHaveParts: false }
  }
  const shape = blockShape as GlobalEntity<'blockShape'>
  return {
    composable: bi.composite === true,
    canHaveParts: shape.type !== BLOCK_SHAPE_TYPES.USER,
  }
}
