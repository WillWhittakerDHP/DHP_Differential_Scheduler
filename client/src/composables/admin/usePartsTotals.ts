/**
 * Parts Totals Composable for Admin
 * LEARNING: Calculates totals from parts for a blockInstance entity
 * WHY: Provides reactive totals calculation for display in entity cards
 * PATTERN: Composable that determines if entity can have parts and calculates totals
 */

import { computed, type ComputedRef } from 'vue'
import { useGlobal } from '@/composables/useGlobal'
import { useRelationshipCrud } from '@/composables/useRelationship'
import { useEntityCrud } from '@/composables/useEntity'
import { calculatePartsTotals } from '@/utils/booking/partsTotals'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalEntity } from '@/types/entities'
import { resolveByIds } from '@/utils/collections/resolveByIds'

export interface UsePartsTotalsReturn {
  canHaveParts: ComputedRef<boolean>
  totalBaseFee: ComputedRef<number>
  totalBaseTime: ComputedRef<number>
  totalRateOverBaseFee: ComputedRef<number>
  totalRateOverBaseTime: ComputedRef<number>
}

/**
 * Calculate parts totals for an entity
 * LEARNING: Determines if entity can have parts and calculates totals
 * WHY: Provides reactive totals for display in entity cards
 * PATTERN: Check entity type and blockShape canHaveParts property, then calculate totals
 * 
 * @param entityKey - The entity type key
 * @param entityId - The entity ID
 * @returns Computed properties for canHaveParts flag and all totals
 */
export function usePartsTotals(
  entityKey: GlobalEntityKey,
  entityId: string
): UsePartsTotalsReturn {
  const { getGlobalEntityById } = useGlobal()
  const { relationships: partAssignments } = useRelationshipCrud('partAssignments')
  const { entities: partInstances } = useEntityCrud('partInstance')

  /**
   * LEARNING: Check if entity can have parts
   * WHY: Only blockInstance entities with canHaveParts blockShape can have parts
   * PATTERN: Check entity type, get blockShape, check canHaveParts property
   */
  const canHaveParts = computed((): boolean => {
    // Only blockInstance entities can have parts
    if (entityKey !== 'blockInstance') {
      return false
    }

    // Get blockInstance entity
    const blockInstance = getGlobalEntityById('blockInstance', entityId)
    if (!blockInstance) {
      return false
    }

    // Get blockShape to check canHaveParts property
    const blockInstanceEntity = blockInstance as GlobalEntity<'blockInstance'>
    const blockShape = getGlobalEntityById('blockShape', blockInstanceEntity.blockShapeRef)
    if (!blockShape) {
      return false
    }

    // Check if blockShape can have parts
    const blockShapeEntity = blockShape as GlobalEntity<'blockShape'>
    return blockShapeEntity.canHaveParts === true
  })

  /**
   * LEARNING: Get part instances for this blockInstance
   * WHY: Need part instances to calculate totals
   * PATTERN: Filter partAssignments relationships by parent_id, resolve to partInstance entities
   */
  const partInstancesForEntity = computed((): GlobalEntity<'partInstance'>[] => {
    if (!canHaveParts.value) {
      return []
    }

    if (!partAssignments.value) {
      return []
    }

    // Filter partAssignments relationships where parent_id matches entityId
    const relationships = partAssignments.value.filter(
      rel => String(rel.parent_id) === entityId && !rel.disabled
    )

    // Resolve child_ids to partInstance entities
    // LEARNING: Deduplicate childIds to ensure each part is only resolved once
    // WHY: If childIds contains duplicates, resolveByIds will resolve the same part multiple times
    //      This causes incorrect totals calculation (same part counted multiple times)
    // PATTERN: Use Set to deduplicate before resolving
    const childIdsBeforeDedup = relationships.map(rel => String(rel.child_id))
    const childIds = [...new Set(childIdsBeforeDedup)]

    // LEARNING: Warn if duplicate child_ids found (should not happen with proper versioning)
    // WHY: Indicates a data integrity issue that needs investigation
    if (childIdsBeforeDedup.length !== childIds.length) {
      console.warn(`[usePartsTotals] BlockInstance ${entityId} - Found duplicate child_ids!`, {
        beforeDedup: childIdsBeforeDedup,
        afterDedup: childIds,
        duplicates: childIdsBeforeDedup.filter((id, index) => childIdsBeforeDedup.indexOf(id) !== index)
      })
    }

    const { resolved, missingIds } = resolveByIds(partInstances.value, childIds)

    // LEARNING: Warn if part instances are missing (data integrity issue)
    // WHY: Indicates relationships pointing to non-existent part instances
    if (missingIds.length > 0) {
      console.warn(`[usePartsTotals] BlockInstance ${entityId} - Missing part instances:`, missingIds)
    }
    
    return resolved
  })

  /**
   * LEARNING: Calculate totals using shared utility
   * WHY: Uses same calculation logic as wizard for consistency
   * PATTERN: Call calculatePartsTotals with part instances
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
