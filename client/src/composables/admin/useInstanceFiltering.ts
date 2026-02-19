/**
 * Composable for instance filtering and grouping logic
 * WHY: Extracts filtering and grouping logic from InstancesTab
 * PATTERN: Computed properties and helper functions for instance filtering
 */

import { computed, type ComputedRef } from 'vue'
import type { GlobalEntity } from '@/types/entities'
import type { BookingMode } from '@/constants/bookingMode'
import { DEFAULT_VALUES } from '@/constants/entityFieldConstants'
import { useGlobal } from '@/composables/useGlobal'

const DEFAULT_BOOKING_MODE = DEFAULT_VALUES.BOOKING_MODE

/**
 * Check if instance is a component child
 * WHY: Component children should be grouped separately
 * PATTERN: Check if instance ID is in componentChildIds set
 */
function isComponentChild(instance: GlobalEntity<'blockInstance'>, componentChildIds: Set<string>): boolean {
  return componentChildIds.has(instance.id)
}


import type { UseInstanceBlockInstancesByShapeOptions } from './instanceComposableOptions'

export type UseInstanceFilteringOptions = UseInstanceBlockInstancesByShapeOptions

export interface UseInstanceFilteringReturn {
  mainInstancesByShape: ComputedRef<Map<string, GlobalEntity<'blockInstance'>[]>>
  groupedInstancesByShape: ComputedRef<Map<string, GlobalEntity<'blockInstance'>[]>>
  groupedPanelValue: (blockShapeId: string) => string
}

/**
 * Composable for filtering instances into main vs grouped
 * WHY: Makes it visually obvious which instances are not shown in booking main lists
 * PATTERN: Main list stays draggable; grouped list lives in a collapsible section
 */
export function useInstanceFiltering(
  options: UseInstanceFilteringOptions
): UseInstanceFilteringReturn {
  const { blockInstancesByShape } = options

  const { globalData } = useGlobal()

  /**
   * LEARNING: Component-child detection (instanceComponents relationship)
   * WHY: Instances used only as components should be visually grouped and clearly marked as "not in booking main lists".
   * PATTERN: Build a Set of all child blockInstance IDs from instanceComponents relationships.
   */
  const componentChildIds = computed((): Set<string> => {
    const raw = globalData.value?.relationships?.instanceComponents
    const relationships = raw !== undefined && raw !== null && Array.isArray(raw) ? raw : []

    return relationships.reduce((acc, rel) => {
      if (rel.relationshipKind !== 'instanceComponents') return acc
      rel.children.forEach((child) => {
        acc.add(child.id)
      })
      return acc
    }, new Set<string>())
  })

  /**
   * Split instances into main vs grouped (components/addOn)
   * WHY: Makes it visually obvious which instances are not shown in booking main lists
   * PATTERN: Main list stays draggable; grouped list lives in a collapsible section
   * LEARNING: Main instances include standalone and both (preserves orderIndex order from useInstanceGrouping)
   *           Grouped instances include addOn OR component children (preserves orderIndex order from useInstanceGrouping)
   */
  const mainInstancesByShape = computed((): Map<string, GlobalEntity<'blockInstance'>[]> => {
    const result = new Map<string, GlobalEntity<'blockInstance'>[]>()

    blockInstancesByShape.value.forEach((instances, blockShapeId) => {
      const mainInstances = instances
        .filter((instance) => {
          const mode = instance.bookingMode ?? DEFAULT_BOOKING_MODE
          return !isComponentChild(instance, componentChildIds.value) && mode !== 'addOn'
        })
      result.set(blockShapeId, mainInstances)
    })

    return result
  })

  const groupedInstancesByShape = computed((): Map<string, GlobalEntity<'blockInstance'>[]> => {
    const result = new Map<string, GlobalEntity<'blockInstance'>[]>()

    blockInstancesByShape.value.forEach((instances, blockShapeId) => {
      const groupedInstances = instances
        .filter((instance) => {
          const mode = instance.bookingMode ?? DEFAULT_BOOKING_MODE
          return isComponentChild(instance, componentChildIds.value) || mode === 'addOn'
        })
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
