import { computed } from 'vue'
import type { GlobalEntity } from '@/types/entities'
import type { BlockInstanceEntity } from '@/types/entities'
import type { UseInstanceFilteringReturn } from '@/types/admin/instanceFiltering'
import type { UseInstanceBlockInstancesByShapeOptions } from '@/types/admin/instanceComposableOptions'
import { isWizardTopLine } from '@shared/constants/wizardPlacement'

function isAdminStandaloneSection(instance: GlobalEntity<'blockInstance'>): boolean {
  const b = instance as BlockInstanceEntity
  return isWizardTopLine(b.wizardPlacement)
}

/**
 * Main admin grid shows top-line-capable instances (placement topLine or both); the grouped
 * section shows the rest (subOption / hidden). Aligned with the booking main-pool vs line-item split.
 */
export function useInstanceFiltering(
  options: UseInstanceBlockInstancesByShapeOptions
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
