import type { useAdmin } from '@/composables/admin/useAdmin'
import { toGlobalEntityId } from '@/utils/globalEntity'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'

interface BlockInstanceShapeFlags {
  composable: boolean
  canHaveParts: boolean
}

/**
 * Resolves blockShape flags for the current blockInstance entity (admin store).
 */
export function getBlockInstanceShapeProperties(
  adminComp: ReturnType<typeof useAdmin>,
  entityIdValue: GlobalEntityId
): BlockInstanceShapeFlags {
  const blockInstance = adminComp.getEntity('blockInstance', toGlobalEntityId(entityIdValue))
  if (!blockInstance) {
    return { composable: false, canHaveParts: false }
  }
  const blockShape = adminComp.getEntity('blockShape', toGlobalEntityId(blockInstance.blockShapeRef))
  if (!blockShape) {
    return { composable: false, canHaveParts: false }
  }
  return {
    composable: blockShape.composable === true,
    canHaveParts: blockShape.canHaveParts === true,
  }
}
