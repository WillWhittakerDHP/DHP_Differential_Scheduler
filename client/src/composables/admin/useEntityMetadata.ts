/**
 * LEARNING: Unified Entity Metadata Composable
 * WHY: Single composable for all entity types
 * PATTERN: Uses entity type mapping utility to eliminate special casing
 * 
 * This composable replaces useFormFieldMetadata and removes all special casing
 * for different entity types. It works uniformly for blockShape, partShape,
 * blockInstance, and partInstance entities.
 * NOTE: All entity types have completely independent metadata (no inheritance between shapes and instances)
 */

import { computed, unref, type MaybeRef } from 'vue'
import { useMetadataCache } from '@/composables/admin/useMetadataCache'
import { getEntityTypeForMetadata } from '@/utils/entities/entityTypeMapping'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'
import type { FieldMetadataEntry } from '@/types/entityMetadata'

/**
 * Fetch admin input metadata for an entity
 * All entity types have completely independent metadata (no inheritance between shapes and instances)
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
  
  // LEARNING: Access metadata cache directly for reactive tracking
  // WHY: admin.getMetadata() is non-reactive - Vue can't track metadataQuery.data inside it
  // PATTERN: Access metadataQuery.data directly in computed so Vue tracks the dependency
  const metadataCache = useMetadataCache()
  
  // LEARNING: Computed property that reads metadata reactively from metadata cache
  // WHY: Direct access to reactive metadataQuery.data allows Vue to track changes
  // PATTERN: Access metadataCache.metadataData.value directly in computed
  const fieldMetadata = computed<Record<string, FieldMetadataEntry>>(() => {
    if (!entityValue.value) {
      return {}
    }
    
    const entityType = getEntityTypeForMetadata(entityKey)
    if (!entityType) {
      return {}
    }
    
    // LEARNING: Access reactive metadata data directly
    // WHY: Vue can track computed ref access, but not inside function calls
    // PATTERN: Read from metadataCache.metadataData.value directly in computed
    const data = metadataCache.metadataData.value
    
    if (!data) {
      return {}
    }
    
    // LEARNING: Extract blockShapeRef for blockInstance entities
    // WHY: BlockInstance metadata can be BlockShape-specific
    let blockShapeRef: string | null = null
    if (entityType === 'blockInstance' && entityKey === 'blockInstance') {
      const blockInstanceEntity = entityValue.value as GlobalEntity<'blockInstance'>
      blockShapeRef = blockInstanceEntity.blockShapeRef || null
    }
    
    // For blockInstance with blockShapeRef, try BlockShape-specific first
    if (entityType === 'blockInstance' && blockShapeRef) {
      const blockShapeSpecific = data.blockShapeSpecific[blockShapeRef]
      if (blockShapeSpecific && Object.keys(blockShapeSpecific).length > 0) {
        return blockShapeSpecific as Record<string, FieldMetadataEntry>
      }
    }
    
    // Return global config for this entity type
    return (data.global[entityType] || {}) as Record<string, FieldMetadataEntry>
  })
  
  return {
    /**
     * Field metadata in Record format (Record<fieldKey, FieldMetadataEntry>)
     * Empty object if entity is null or metadata not available
     * Updates reactively when entity or metadata cache changes
     */
    fieldMetadata,
    
    /**
     * Loading state from metadata cache
     * LEARNING: Metadata is lazy-loaded, so loading state is available
     * WHY: Reflects actual loading state from metadata query
     */
    isLoading: computed(() => metadataCache.isLoading.value),
    
    /**
     * Error from metadata cache
     * LEARNING: Metadata query can have errors
     * WHY: Reflects actual error state from metadata query
     */
    error: computed(() => metadataCache.error.value),
    
    /**
     * Refetch function - no-op (metadata updates reactively via cache)
     * LEARNING: Metadata updates when metadata cache is invalidated/refetched
     * WHY: No separate refetch needed, cache invalidation triggers reactive updates
     */
    refetch: () => Promise.resolve(),
  }
}
