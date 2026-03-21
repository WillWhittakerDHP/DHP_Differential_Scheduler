import { computed } from 'vue'
import type { GlobalEntity } from '@/types/entities'
import { DEFAULT_VALUES } from '@/constants/entityFieldConstants'
import { useGlobal } from '@/composables/useGlobal'
import type { UseInstanceFilteringOptions, UseInstanceFilteringReturn } from '@/types/admin/instanceFiltering'

const DEFAULT_BOOKING_MODE = DEFAULT_VALUES.BOOKING_MODE

function isComponentChild(instance: GlobalEntity<'blockInstance'>, componentChildIds: Set<string>): boolean {
  return componentChildIds.has(instance.id)
}


export function useInstanceFiltering(
  options: UseInstanceFilteringOptions
): UseInstanceFilteringReturn {
  const { blockInstancesByShape } = options

  const { globalData } = useGlobal()

  /**
   * WHY: Instances used only as components should be visually grouped and clearly marked as "not in booking main lists".
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
