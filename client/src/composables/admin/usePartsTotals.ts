/**
 * PATTERN: Parts Totals Composable for Admin
PATTERN: Composable that determines if...
 */
import { computed } from 'vue'
import { useGlobal } from '@/composables/useGlobal'
import { useRelationshipCrud } from '@/composables/useRelationship'
import { useEntityCrud } from '@/composables/entityCrud/useEntityCrud'
import { calculatePartsTotals } from '@/utils/booking/partsTotals'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalEntity } from '@/types/entities'
import { resolveByIds } from '@/utils/collections/resolveByIds'
import { createLogger } from '@/utils/logger'
import type { UsePartsTotalsReturn } from '@/types/admin/partsTotals'

const logger = createLogger('usePartsTotals')


export function usePartsTotals(
  entityKey: GlobalEntityKey,
  entityId: string
): UsePartsTotalsReturn {
  const { getGlobalEntityById } = useGlobal()
  const { relationships: partAssignments } = useRelationshipCrud('partAssignments')
  const { entities: partInstances } = useEntityCrud('partInstance')

  const canHaveParts = computed((): boolean => {
    if (entityKey !== 'blockInstance') {
      return false
    }

    const blockInstance = getGlobalEntityById('blockInstance', entityId)
    if (!blockInstance) {
      return false
    }

    const blockInstanceEntity = blockInstance as GlobalEntity<'blockInstance'>
    const blockShape = getGlobalEntityById('blockShape', blockInstanceEntity.blockShapeRef)
    if (!blockShape) {
      return false
    }

    const blockShapeEntity = blockShape as GlobalEntity<'blockShape'>
    return blockShapeEntity.canHaveParts === true
  })

  const partInstancesForEntity = computed((): GlobalEntity<'partInstance'>[] => {
    if (!canHaveParts.value) {
      return []
    }

    if (!partAssignments.value) {
      return []
    }

    const relationships = partAssignments.value.filter(
      rel => String(rel.parentId) === entityId && !rel.disabled
    )

    // PATTERN: Use Set to deduplicate before resolving
    const childIdsBeforeDedup = relationships.map(rel => String(rel.childId))
    const childIds = [...new Set(childIdsBeforeDedup)]

    if (childIdsBeforeDedup.length !== childIds.length) {
      logger.warn('Found duplicate child_ids', {
        entityId,
        beforeDedup: childIdsBeforeDedup,
        afterDedup: childIds,
        duplicates: childIdsBeforeDedup.filter((id, index) => childIdsBeforeDedup.indexOf(id) !== index)
      })
    }

    const { resolved, missingIds } = resolveByIds(partInstances.value, childIds)

    if (missingIds.length > 0) {
      logger.warn('Missing part instances', { entityId, missingIds })
    }
    
    return resolved
  })

  /**
   * WHY: Uses same calculation logic as wizard for consistency
   */
  const totals = computed(() => {
    if (!canHaveParts.value || partInstancesForEntity.value.length === 0) {
      return {
        totalBaseFee: 0,
        totalBaseTime: 0,
        totalRateOverBaseFee: 0,
        totalRateOverBaseTime: 0
      }
    }

    return calculatePartsTotals(partInstancesForEntity.value)
  })

  return {
    canHaveParts,
    totalBaseFee: computed(() => totals.value.totalBaseFee),
    totalBaseTime: computed(() => totals.value.totalBaseTime),
    totalRateOverBaseFee: computed(() => totals.value.totalRateOverBaseFee),
    totalRateOverBaseTime: computed(() => totals.value.totalRateOverBaseTime)
  }
}
