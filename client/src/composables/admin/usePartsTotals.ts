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
import { createLogger } from '@/utils/logger'
import type { UsePartsTotalsReturn } from '@/types/admin/partsTotals'
import {
  activeChildIdsForBlockParent,
  blockShapeAllowsParts,
  resolvePartInstancesByChildIds,
} from '@/utils/admin/blockInstancePartsTotalsResolution'

const logger = createLogger('usePartsTotals')

export function usePartsTotals(entityKey: GlobalEntityKey, entityId: string): UsePartsTotalsReturn {
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
    return blockShapeAllowsParts(blockShape as GlobalEntity<'blockShape'> | null | undefined)
  })

  const partInstancesForEntity = computed((): GlobalEntity<'partInstance'>[] => {
    if (!canHaveParts.value) {
      return []
    }
    const { childIds, hadDuplicates, beforeDedup } = activeChildIdsForBlockParent(
      partAssignments.value ?? null,
      entityId
    )
    if (hadDuplicates) {
      logger.warn('Found duplicate child_ids', {
        entityId,
        beforeDedup,
        afterDedup: childIds,
        duplicates: beforeDedup.filter((id, index) => beforeDedup.indexOf(id) !== index),
      })
    }
    const { resolved, missingIds } = resolvePartInstancesByChildIds(partInstances.value, childIds)
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
        totalFeePerUnit: 0,
        totalTimePerUnit: 0,
      }
    }
    return calculatePartsTotals(partInstancesForEntity.value)
  })

  return {
    canHaveParts,
    totalBaseFee: computed(() => totals.value.totalBaseFee),
    totalBaseTime: computed(() => totals.value.totalBaseTime),
    totalFeePerUnit: computed(() => totals.value.totalFeePerUnit),
    totalTimePerUnit: computed(() => totals.value.totalTimePerUnit),
  }
}
