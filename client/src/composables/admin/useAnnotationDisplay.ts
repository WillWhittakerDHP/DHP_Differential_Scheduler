/**
 * Annotation Display Composable
 * 
 * LEARNING: Extracts annotation display logic from EntityCard component
 * WHY: Components should be thin UI wrappers - annotation display belongs in composables
 * PATTERN: Composable that provides annotation display formatting
 * 
 * This composable handles:
 * - Active annotations extraction
 * - Annotation label generation (Default, Generic, or userTypeBlock)
 * - Annotation display object transformation
 */

import { computed, type ComputedRef } from 'vue'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'

/**
 * Annotation Display Object
 */
interface AnnotationDisplay {
  id: string
  text: string
  label: string
  isDefault: boolean
  userTypeBlock: string | null
}

/**
 * Annotation Display Composable Options
 */
interface UseAnnotationDisplayOptions {
  /**
   * Entity key
   */
  entityKey: GlobalEntityKey
  
  /**
   * Entity
   */
  entity: ComputedRef<GlobalEntity<GlobalEntityKey>>
}

/**
 * Annotation Display Composable Return Type
 */
interface UseAnnotationDisplayReturn {
  /**
   * Active annotations display array
   */
  annotationAssignmentsDisplay: ComputedRef<AnnotationDisplay[]>
}

/**
 * Annotation Display Composable
 * 
 * LEARNING: Provides annotation display logic extracted from EntityCard component
 * WHY: Moves business logic out of components into reusable composable
 * PATTERN: Composable with computed property for annotation display
 */
export function useAnnotationDisplay(
  options: UseAnnotationDisplayOptions
): UseAnnotationDisplayReturn {
  const { entityKey, entity } = options

  /**
   * LEARNING: Computed property for active annotations display
   * WHY: Show active annotations as individual chips for better layout and readability
   * PATTERN: Return array of annotation display objects instead of single comma-separated string
   */
  const activeAnnotationsDisplay = computed(() => {
    if (entityKey !== 'blockInstance') return []
    
    // LEARNING: Use cached annotations from entity (attached during hydration in fetchToGlobalTransformer)
    // WHY: Annotations are already available in props.entity.annotations, no API call needed
    // PATTERN: Access annotations directly from entity prop and transform to display format
    const blockInstance = entity.value as import('@/types/entities').BlockInstanceEntity
    const annotations = blockInstance.annotations || []
    
    if (annotations.length === 0) {
      return []
    }
    
    // LEARNING: Transform annotations to display objects with meaningful labels
    // WHY: Show annotation text (truncated) for meaningful display instead of Default/Generic
    // PATTERN: Map annotations to display objects with text-based labels
    // UPDATED: Labels now show annotation text (truncated) instead of state context
    return annotations.map(ann => {
      // Use annotation text as the label, truncated for chip display
      const text = ann.text || 'Note'
      const label = text.length > 20 ? `${text.substring(0, 17)}...` : text
      
      return {
        id: ann.id,
        text: ann.text || 'Annotation',
        label,
        isDefault: ann.isDefault || false,
        userTypeBlock: ann.userTypeBlock
      }
    })
  })

  return {
    activeAnnotationsDisplay
  }
}

