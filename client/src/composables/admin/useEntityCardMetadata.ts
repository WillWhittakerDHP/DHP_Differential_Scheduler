/**
 * Entity Card Metadata Composable
 * 
 * LEARNING: Extracts metadata-related computed properties from EntityCard component
 * WHY: Reduces component complexity by moving metadata logic to composable
 * PATTERN: Composable that provides composed metadata and loading state
 */

import { computed, type ComputedRef } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalEntity } from '@/types/entities'
import type { FieldMetadataEntry } from '@/types/entityMetadata'
import { useEntityMetadata } from './useEntityMetadata'

/**
 * Parameters for entity card metadata
 */
export interface UseEntityCardMetadataParams<GE extends GlobalEntityKey> {
  /**
   * Entity key
   */
  entityKey: GE
  
  /**
   * Entity instance
   */
  entity: GlobalEntity<GE>
  
  /**
   * Optional filtered metadata from props
   */
  filteredMetadata?: Record<string, FieldMetadataEntry>
}

/**
 * Return type for entity card metadata
 */
export interface UseEntityCardMetadataReturn {
  /**
   * Composed field metadata (filtered or fetched)
   */
  composedFieldMetadata: ComputedRef<Record<string, FieldMetadataEntry>>
  
  /**
   * Whether metadata is loading
   */
  isMetadataLoading: ComputedRef<boolean>
  
  /**
   * Fetched metadata composable (for accessing other properties if needed)
   */
  fetchedMetadata: ReturnType<typeof useEntityMetadata<GlobalEntityKey>>
}

/**
 * LEARNING: Extract metadata-related computed properties from EntityCard
 * WHY: Reduces component complexity by moving metadata logic to composable
 * PATTERN: Composable that provides composed metadata and loading state
 */
export function useEntityCardMetadata<GE extends GlobalEntityKey>(
  params: UseEntityCardMetadataParams<GE>
): UseEntityCardMetadataReturn {
  const { entityKey, entity, filteredMetadata } = params

  // LEARNING: Use unified metadata composable for all entity types
  // WHY: Single composable handles all entity types without special casing
  // PATTERN: Pass entityKey and entity, composable handles entity type mapping and inheritance
  const fetchedMetadata = useEntityMetadata(
    entityKey,
    computed(() => entity)
  )

  // LEARNING: Use unified metadata (already includes both primitive and relationship metadata)
  // WHY: useEntityMetadata.getMetadata() already merges primitive and relationship metadata
  // PATTERN: Use fetchedMetadata directly - no additional merging needed
  const composedFieldMetadata = computed(() => {
    if (filteredMetadata) {
      // LEARNING: When filtered metadata is provided, use it as-is
      // WHY: Parent components (like bulk edit modals) have already filtered to desired fields
      // PATTERN: Parent controls which fields to show
      return filteredMetadata
    }
    
    // LEARNING: fetchedMetadata.fieldMetadata already includes both primitive and relationship metadata
    // WHY: useAdmin().getMetadata() merges them automatically
    // PATTERN: Use directly without additional merging
    return fetchedMetadata.fieldMetadata.value
  })

  const isMetadataLoading = computed(() => {
    // LEARNING: Metadata is synchronous from GlobalData, so isLoading is always false
    // WHY: useEntityMetadata returns isLoading: computed(() => false)
    // PATTERN: Use fetchedMetadata.isLoading directly
    return fetchedMetadata.isLoading.value
  })

  return {
    composedFieldMetadata,
    isMetadataLoading,
    fetchedMetadata
  }
}
