/**
 * WHY: State-control block shapes define wizard user types; list their active instances for annotation copy UI.
 */
import type { UseAdminReturn } from '@/composables/admin/useAdmin'
import type { BlockInstanceEntity } from '@/types/entities'
import { toGlobalEntityId } from '@/utils/globalEntity'
import { FIELD_NAMES } from '@/constants/entityFieldConstants'

export function listSortedUserTypeBlockInstances(admin: UseAdminReturn): BlockInstanceEntity[] {
  const shapes = admin.getEntitiesByKey('blockShape')
  const stateControlShapeIds = new Set(
    shapes.filter((s) => s.isStateControl === true).map((s) => toGlobalEntityId(s.id))
  )
  const instances = admin.getEntitiesByKey('blockInstance')
  return instances
    .filter((i) => stateControlShapeIds.has(toGlobalEntityId(i.blockShapeRef)) && i.active !== false)
    .slice()
    .sort((a, b) => {
      const ao = a[FIELD_NAMES.ORDER_INDEX] ?? 0
      const bo = b[FIELD_NAMES.ORDER_INDEX] ?? 0
      if (ao !== bo) return ao - bo
      return (a.name ?? '').localeCompare(b.name ?? '')
    })
}
