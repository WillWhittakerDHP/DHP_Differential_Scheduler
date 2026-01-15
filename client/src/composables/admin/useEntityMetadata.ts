/**
 * LEARNING: Unified Entity Metadata Composable
 * WHY: Single composable for all entity types, handles inheritance automatically
 * PATTERN: Uses entity type mapping utility to eliminate special casing
 * 
 * This composable replaces useFormFieldMetadata and removes all special casing
 * for different entity types. It works uniformly for blockShape, partShape,
 * blockInstance, and partInstance entities.
 */

import { computed, unref, type MaybeRef } from 'vue'
import { useAdmin } from '@/composables/useAdmin'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'
import type { FieldMetadataEntry } from '@/types/entityMetadata'

/**
 * Fetch admin input metadata for an entity
 * Handles inheritance automatically: instance entities inherit from their shape
 * 
 * @param entityKey - Entity key (blockShape, partShape, blockInstance, partInstance, etc.)
 * @param entity - Entity object (used to get entity ID and shape references)
 * @returns Object with fieldMetadata, isLoading, and error
 */
export function useEntityMetadata<GE extends GlobalEntityKey>(
  entityKey: GE,
  entity: MaybeRef<GlobalEntity<GE> | null>
) {
  // Unwrap ref to get reactive entity
  const entityValue = computed(() => unref(entity))
  
  // LEARNING: Read metadata from GlobalData (synchronous, like getEntity)
  // WHY: Metadata is now part of GlobalData transformation, available as early as entities
  // PATTERN: Use useAdmin().getMetadata() to read from transformed GlobalData
  const admin = useAdmin()
  
  // LEARNING: Computed property that reads metadata from GlobalData
  // WHY: Reactive access to metadata that updates when GlobalData changes
  // PATTERN: Computed that calls getMetadata with current entity value
  const fieldMetadata = computed<Record<string, FieldMetadataEntry>>(() => {
    if (!entityValue.value) {
      return {}
    }
    
    // LEARNING: getMetadata handles inheritance automatically
    // WHY: Instance entities inherit from shape, getMetadata merges them
    // PATTERN: Pass entity directly, getMetadata handles all lookup logic
    return admin.getMetadata(entityKey, entityValue.value)
  })
  
  return {
    /**
     * Field metadata in Record format (Record<fieldKey, FieldMetadataEntry>)
     * Empty object if entity is null or metadata not available
     * Updates reactively when entity or GlobalData changes
     */
    fieldMetadata,
    
    /**
     * Loading state - always false (metadata is synchronous from GlobalData)
     * LEARNING: Metadata is part of GlobalData, so it's available immediately
     * WHY: No async fetch needed, metadata is transformed alongside entities
     */
    isLoading: computed(() => false),
    
    /**
     * Error - always null (metadata is synchronous from GlobalData)
     * LEARNING: Metadata is part of GlobalData, so no fetch errors possible
     * WHY: No async fetch needed, metadata is transformed alongside entities
     */
    error: computed(() => null),
    
    /**
     * Refetch function - no-op (metadata is part of GlobalData cache)
     * LEARNING: Metadata updates when GlobalData cache is invalidated
     * WHY: No separate refetch needed, use useGlobal().refetch() to refresh all GlobalData
     */
    refetch: () => Promise.resolve(),
  }
}
