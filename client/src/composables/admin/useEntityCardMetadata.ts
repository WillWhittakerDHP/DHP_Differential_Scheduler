/**
 * WHY: Entity Card Metadata Composable

WHY: Reduces component complexity by mo...
 */
import { computed } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import { useEntityMetadata } from './useEntityMetadata'
import type { UseEntityCardMetadataParams, UseEntityCardMetadataReturn } from '@/types/admin/entityCardMetadata'

export function useEntityCardMetadata<GE extends GlobalEntityKey>(
  params: UseEntityCardMetadataParams<GE>
): UseEntityCardMetadataReturn {
  const { entityKey, entity, filteredMetadata } = params

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
