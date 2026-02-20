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
import type { FieldMetadataEntry } from '@/constants/fieldMetadata'
import { useEntityMetadata } from './useEntityMetadata'

export interface UseEntityCardMetadataParams<GE extends GlobalEntityKey> {
  entityKey: GE
  
  entity: GlobalEntity<GE>
  
  filteredMetadata?: Record<string, FieldMetadataEntry>
}

export interface UseEntityCardMetadataReturn {
  composedFieldMetadata: ComputedRef<Record<string, FieldMetadataEntry>>
  
  isMetadataLoading: ComputedRef<boolean>
  
  fetchedMetadata: ReturnType<typeof useEntityMetadata<GlobalEntityKey>>
}

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

  // PATTERN: Use fetchedMetadata directly - no additional merging needed
  const composedFieldMetadata = computed(() => {
    if (filteredMetadata) {
      // PATTERN: Parent controls which fields to show
      return filteredMetadata
    }
    
    // PATTERN: Use directly without additional merging
    return fetchedMetadata.fieldMetadata.value
  })

  const isMetadataLoading = computed(() => {
    // PATTERN: Use fetchedMetadata.isLoading directly
    return fetchedMetadata.isLoading.value
  })

  return {
    composedFieldMetadata,
    isMetadataLoading,
    fetchedMetadata
  }
}
