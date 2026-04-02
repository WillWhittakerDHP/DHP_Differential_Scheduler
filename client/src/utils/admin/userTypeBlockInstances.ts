/**
 * WHY: User-type block shapes define wizard user types; list their active instances for annotation copy UI.
 */
import type { UseAdminReturn } from '@/composables/admin/useAdmin'
import { BLOCK_SHAPE_TYPES } from '@/constants/blockShapeTypes'
import type { BlockInstanceEntity } from '@/types/entities'
import { toGlobalEntityId } from '@/utils/globalEntity'
import { FIELD_NAMES } from '@/constants/entityFieldConstants'
import { nilToEmptyString } from '@shared/utils/nilDefaults'

export function listSortedUserTypeBlockInstances(admin: UseAdminReturn): BlockInstanceEntity[] {
  const shapes = admin.getEntitiesByKey('blockShape')
  const userShapeIds = new Set(
    shapes.filter((s) => s.type === BLOCK_SHAPE_TYPES.USER).map((s) => toGlobalEntityId(s.id))
  )
  const instances = admin.getEntitiesByKey('blockInstance')
  return instances
    .filter((i) => userShapeIds.has(toGlobalEntityId(i.blockShapeRef)) && i.active !== false)
    .slice()
    .sort((a, b) => {
      const ao = a[FIELD_NAMES.ORDER_INDEX] ?? 0
      const bo = b[FIELD_NAMES.ORDER_INDEX] ?? 0
      if (ao !== bo) return ao - bo
      return nilToEmptyString(a.name).localeCompare(nilToEmptyString(b.name))
    })
}
