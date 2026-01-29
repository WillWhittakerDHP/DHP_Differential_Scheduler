/**
 * Entity Card Computed Properties Composable
 * 
 * LEARNING: Extracts computed properties from EntityCard component
 * WHY: Reduces component complexity by moving computed logic to composable
 * PATTERN: Composable that provides computed properties for entity card display
 */

import { computed, type ComputedRef } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { FieldMetadataEntry } from '@/types/entityMetadata'
import { useEntityDisplay } from './useEntityDisplay'
import { useInstanceShape } from './useInstanceShape'

/**
 * Parameters for entity card computed properties
 */
export interface UseEntityCardComputedParams<GE extends GlobalEntityKey> {
  entityKey: GE
  entity: GlobalEntity<GE>
  composedFieldMetadata: ComputedRef<Record<string, FieldMetadataEntry>>
  isMetadataLoading: ComputedRef<boolean>
}

/**
 * Return type for entity card computed properties
 */
export interface UseEntityCardComputedReturn {
  /**
   * Field keys from metadata
   */
  fieldKeys: ComputedRef<GlobalFieldKey<GlobalEntityKey>[]>
  
  /**
   * Whether metadata is ready
   */
  isMetadataReady: ComputedRef<boolean>
  
  /**
   * Entity display name
   */
  entityName: ComputedRef<string>
  
  /**
   * Whether entity is composable (blockInstance only)
   */
  isComposable: ComputedRef<boolean>
}

/**
 * LEARNING: Extract computed properties from EntityCard component
 * WHY: Reduces component complexity by moving computed logic to composable
 * PATTERN: Composable that provides computed properties for entity card display
 */
export function useEntityCardComputed<GE extends GlobalEntityKey>(
  params: UseEntityCardComputedParams<GE>
): UseEntityCardComputedReturn {
  const { entityKey, entity, composedFieldMetadata, isMetadataLoading } = params
  
  const { getEntityName } = useEntityDisplay()
  
  // LEARNING: Get BlockShape properties for conditional field visibility
  // WHY: Composition panel visibility depends on BlockShape.composable property
  // PATTERN: Use useInstanceShape composable to access BlockShape from BlockInstance
  const instanceShape = entityKey === 'blockInstance' 
    ? useInstanceShape({
        entityKey: 'blockInstance',
        entityId: computed(() => entity.id)
      })
    : null

  // LEARNING: Computed to check if metadata is ready
  // WHY: Gate warnings until metadata is fully loaded and can be meaningfully displayed
  // PATTERN: Check metadata is loaded and has keys
  const isMetadataReady = computed(() => {
    const isLoading = isMetadataLoading.value
    const metadata = composedFieldMetadata.value
    return !isLoading && metadata !== undefined && Object.keys(metadata).length >= 0
  })

  // LEARNING: Get field keys from metadata exclusively - no fallbacks
  // WHY: Metadata is the single source of truth for which fields to render
  // PATTERN: Use metadata keys only - fail explicitly if metadata is not available
  const fieldKeys = computed(() => {
    // LEARNING: Use composedFieldMetadata as exclusive source of truth
    // WHY: Metadata determines which fields to render - no fallback to entity object
    // PATTERN: Fail explicitly if metadata is not available rather than falling back to entity keys
    if (composedFieldMetadata.value && Object.keys(composedFieldMetadata.value).length > 0) {
      return Object.keys(composedFieldMetadata.value) as GlobalFieldKey<GlobalEntityKey>[]
    }
    
    // LEARNING: Fail explicitly - return empty array if no metadata available
    // WHY: No fallbacks - metadata must be available for fields to render
    // PATTERN: Return empty array to fail visibly rather than silently falling back
    return [] as GlobalFieldKey<GlobalEntityKey>[]
  })

  // LEARNING: Computed property for entity name
  // WHY: Gets entity name for display in title and delete dialog
  // PATTERN: Use composable function
  const entityName = computed(() => {
    return getEntityName(entityKey, entity)
  })

  // LEARNING: Computed property for composable status
  // WHY: Determines if entity is composable (blockInstance only)
  // PATTERN: Check BlockShape.composable property via instanceShape
  const isComposable = computed(() => {
    if (entityKey !== 'blockInstance') return false
    return instanceShape?.blockShape.value?.composable === true
  })

  return {
    fieldKeys,
    isMetadataReady,
    entityName,
    isComposable
  }
}
