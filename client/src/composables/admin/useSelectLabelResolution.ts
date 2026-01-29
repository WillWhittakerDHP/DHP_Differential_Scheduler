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
import type { FieldContextType } from '@/composables/useFieldContext'
import type { GlobalEntity } from '@/types/entities'

export interface UseSelectLabelResolutionOptions {
  /**
   * Field context containing label and entity information
   */
  fieldContext: FieldContextType<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>>
  
  /**
   * Current entity for resolving placeholders
   */
  currentEntity: ComputedRef<GlobalEntity<GlobalEntityKey> | null>
}

export interface UseSelectLabelResolutionReturn {
  /**
   * Resolved label with placeholders replaced
   */
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
    const rawLabel = fieldContext.displayConfig.label || ''
    
    // Check if label contains the {blockShapeName} placeholder
    if (!rawLabel.includes('{blockShapeName}')) {
      return rawLabel
    }
    
    // Get the block shape name from the current entity
    const entity = currentEntity.value
    if (!entity) return rawLabel
    
    // Get blockShapeRef from entity - it's stored as a string ID reference
    const blockShapeRef = getEntityFieldValue(entity, 'blockShapeRef') as string | undefined
    if (!blockShapeRef) return rawLabel.replace('{blockShapeName}', 'Instance')
    
    // Look up the block shape entity to get its name
    const blockShape = adminComp.getEntity('blockShape', blockShapeRef)
    const shapeName = blockShape?.name as string || 'Instance'
    
    return rawLabel.replace('{blockShapeName}', shapeName)
  })

  return {
    resolvedLabel
  }
}
