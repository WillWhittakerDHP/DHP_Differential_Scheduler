/**
 * useSelectLabelResolution Composable
 * 
 * LEARNING: Extracts label resolution logic from SelectInputs component
 * WHY: Moves label placeholder replacement logic out of component into reusable composable
 * PATTERN: Composable that resolves dynamic label placeholders like {blockShapeName}
 */

import { computed, type ComputedRef } from 'vue'
import { useAdmin } from '@/composables/useAdmin'
import { getEntityFieldValue } from '@/utils/entities/entityFieldAccess'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { FieldContextType } from '@/composables/fieldContext/types'
import { toGlobalEntityId, type GlobalEntity } from '@/types/entities'

export interface UseSelectLabelResolutionOptions {
  fieldContext: FieldContextType<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>>
  
  currentEntity: ComputedRef<GlobalEntity<GlobalEntityKey> | null>
}

export interface UseSelectLabelResolutionReturn {
  resolvedLabel: ComputedRef<string>
}

/**
 * LEARNING: Select label resolution composable
 * WHY: Extracts label placeholder replacement logic from component to composable
 * PATTERN: Composable that resolves dynamic label placeholders
 */
export function useSelectLabelResolution(
  options: UseSelectLabelResolutionOptions
): UseSelectLabelResolutionReturn {
  const { fieldContext, currentEntity } = options
  const adminComp = useAdmin()

  /**
   * LEARNING: Resolve dynamic label placeholders like {blockShapeName}
   * WHY: Labels should reflect the entity's context (e.g., "Service Components" vs "User Components")
   * PATTERN: Replace placeholders in label with actual values from entity relationships
   */
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
