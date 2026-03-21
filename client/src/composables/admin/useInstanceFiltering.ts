import { computed } from 'vue'
import type { GlobalEntity } from '@/types/entities'
import { DEFAULT_VALUES } from '@/constants/entityFieldConstants'
import { rawBookingModeIsStandaloneOnly } from '@shared/utils/ternaryAliasUtils'
import type { UseInstanceFilteringOptions, UseInstanceFilteringReturn } from '@/types/admin/instanceFiltering'

const DEFAULT_BOOKING_MODE_STORAGE = DEFAULT_VALUES.DEFAULT_TERNARY_BOOKING_MODE

function isAdminStandaloneSection(instance: GlobalEntity<'blockInstance'>): boolean {
  const mode = instance.bookingMode ?? DEFAULT_BOOKING_MODE_STORAGE
  return rawBookingModeIsStandaloneOnly(mode)
}

/**
 * WHY: Admin Instances tab grouping is visual only. Split uses the same bookingMode semantics as
 *     `rawBookingModeIsStandaloneOnly` (shared with booking transforms), not wizard “main vs line item” lists.
 */
export function useInstanceFiltering(
  options: UseInstanceFilteringOptions
): UseInstanceFilteringReturn {
  const { blockInstancesByShape } = options

  const mainInstancesByShape = computed((): Map<string, GlobalEntity<'blockInstance'>[]> => {
    const result = new Map<string, GlobalEntity<'blockInstance'>[]>()

    blockInstancesByShape.value.forEach((instances, blockShapeId) => {
      const mainInstances = instances.filter((instance) => isAdminStandaloneSection(instance))
      result.set(blockShapeId, mainInstances)
    })

    return result
  })

  const groupedInstancesByShape = computed((): Map<string, GlobalEntity<'blockInstance'>[]> => {
    const result = new Map<string, GlobalEntity<'blockInstance'>[]>()

    blockInstancesByShape.value.forEach((instances, blockShapeId) => {
      const groupedInstances = instances.filter((instance) => !isAdminStandaloneSection(instance))
      result.set(blockShapeId, groupedInstances)
    })

    return result
  })

  const groupedPanelValue = (blockShapeId: string): string => {
    return `atomic-dependent-${blockShapeId}`
  }

  return {
    mainInstancesByShape,
    groupedInstancesByShape,
    groupedPanelValue
  }
}
