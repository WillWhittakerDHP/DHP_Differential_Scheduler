/**
 * WHY: useSelectLabelResolution Composable

WHY: Moves label placeholder replac...
 */
import { computed } from 'vue'
import { useAdmin } from '@/composables/admin/useAdmin'
import { getEntityFieldValue } from '@/utils/entities/entityFieldAccess'
import { toGlobalEntityId } from '@/utils/globalEntity'
import type { UseSelectLabelResolutionOptions, UseSelectLabelResolutionReturn } from '@/types/admin/selectLabelResolution'

export type { UseSelectLabelResolutionOptions, UseSelectLabelResolutionReturn } from '@/types/admin/selectLabelResolution'

/**
 * WHY: Select label resolution composable
WHY: Extracts label placeholder repla...
 */
export function useSelectLabelResolution(
  options: UseSelectLabelResolutionOptions
): UseSelectLabelResolutionReturn {
  const { fieldContext, currentEntity } = options
  const adminComp = useAdmin()

  const resolvedLabel = computed(() => {
    const labelVal = fieldContext.displayConfig.label
    const rawLabel = labelVal !== undefined && labelVal !== null && labelVal !== '' ? labelVal : ''
    
    if (!rawLabel.includes('{blockShapeName}')) {
      return rawLabel
    }
    
    const entity = currentEntity.value
    if (!entity) return rawLabel
    
    const blockShapeRef = getEntityFieldValue(entity, 'blockShapeRef') as string | undefined
    if (!blockShapeRef) return rawLabel.replace('{blockShapeName}', 'Instance')
    
    const blockShape = adminComp.getEntity('blockShape', toGlobalEntityId(blockShapeRef))
    const shapeName = blockShape?.name as string || 'Instance'
    
    return rawLabel.replace('{blockShapeName}', shapeName)
  })

  return {
    resolvedLabel
  }
}
