/**
 * Composable for instance filtering and grouping logic
 * WHY: Extracts filtering and grouping logic from InstancesTab
 * PATTERN: Computed properties and helper functions for instance filtering
 */

import { computed, type ComputedRef } from 'vue'
import type { GlobalEntity } from '@/types/entities'
import { useGlobal } from '@/composables/useGlobal'

/**
 * Check if instance is a component child
 * WHY: Component children should be grouped separately
 * PATTERN: Check if instance ID is in componentChildIds set
 */
function isComponentChild(instance: GlobalEntity<'blockInstance'>, componentChildIds: Set<string>): boolean {
  return componentChildIds.has(String(instance.id))
}

/**
 * Check if instance is dependent
 * WHY: Dependent instances should be grouped separately
 */
function isInstanceDependent(instance: GlobalEntity<'blockInstance'>): boolean {
  type BlockInstanceEntityWithFlags = GlobalEntity<'blockInstance'> & { dependent?: boolean }
  return (instance as BlockInstanceEntityWithFlags).dependent === true
}

export interface UseInstanceFilteringOptions {
  blockInstancesByShape: ComputedRef<Map<string, GlobalEntity<'blockInstance'>[]>>
}

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
    const relationships = globalData.value?.relationships?.instanceComponents ?? []

    return relationships.reduce((acc, rel) => {
      if (rel.relationshipKind !== 'instanceComponents') return acc
      rel.children.forEach((child) => {
        acc.add(String(child.id))
      })
      return acc
    }, new Set<string>())
  })

  /**
   * Split instances into main vs grouped (components/dependent)
   * WHY: Makes it visually obvious which instances are not shown in booking main lists
   * PATTERN: Main list stays draggable; grouped list lives in a collapsible section
   */
  const mainInstancesByShape = computed((): Map<string, GlobalEntity<'blockInstance'>[]> => {
    const result = new Map<string, GlobalEntity<'blockInstance'>[]>()

    blockInstancesByShape.value.forEach((instances, blockShapeId) => {
      const mainInstances = instances.filter((instance) => !isComponentChild(instance, componentChildIds.value) && !isInstanceDependent(instance))
      result.set(blockShapeId, mainInstances)
    })

    return result
  })

  const groupedInstancesByShape = computed((): Map<string, GlobalEntity<'blockInstance'>[]> => {
    const result = new Map<string, GlobalEntity<'blockInstance'>[]>()

    blockInstancesByShape.value.forEach((instances, blockShapeId) => {
      const groupedInstances = instances.filter((instance) => isComponentChild(instance, componentChildIds.value) || isInstanceDependent(instance))
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
