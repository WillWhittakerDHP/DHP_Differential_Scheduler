/**
 * WHY: Unified Entity Metadata Composable
WHY: Single composable for all entity...
 */
import type { ComputedRef } from 'vue'
import { computed, unref, type MaybeRef } from 'vue'
import { useMetadataCache } from '@/composables/admin/useMetadataCache'
import { getEntityTypeForMetadata } from '@/utils/entities/entityTypeMapping'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'
import type { FieldMetadataEntry } from '@/constants/fieldMetadata'

export interface UseEntityMetadataReturn<_GE extends GlobalEntityKey> {
  fieldMetadata: ComputedRef<Record<string, FieldMetadataEntry>>
  isLoading: ComputedRef<boolean>
  error: ComputedRef<unknown>
  refetch: () => Promise<void>
}

export function useEntityMetadata<GE extends GlobalEntityKey>(
  entityKey: GE,
  entity: MaybeRef<GlobalEntity<GE> | null>
): UseEntityMetadataReturn<GE> {
  const entityValue = computed(() => unref(entity))
  
  // LEARNING: Access metadata cache directly for reactive tracking
  // PATTERN: Access metadataQuery.data directly in computed so Vue tracks the dependency
  const metadataCache = useMetadataCache()
  
  // PATTERN: Access metadataCache.metadataData.value directly in computed
  const fieldMetadata = computed<Record<string, FieldMetadataEntry>>(() => {
    if (!entityValue.value) {
      return {}
    }
    
    const entityType = getEntityTypeForMetadata(entityKey)
    if (!entityType) {
      return {}
    }
    
    // PATTERN: Read from metadataCache.metadataData.value directly in computed
    const data = metadataCache.metadataData.value
    
    if (!data) {
      return {}
    }
    
    let blockShapeRef: string | null = null
    if (entityType === 'blockInstance' && entityKey === 'blockInstance') {
      const blockInstanceEntity = entityValue.value as GlobalEntity<'blockInstance'>
      blockShapeRef = blockInstanceEntity.blockShapeRef || null
    }
    
    if (entityType === 'blockInstance' && blockShapeRef) {
      const blockShapeSpecific = data.blockShapeSpecific[blockShapeRef]
      if (blockShapeSpecific && Object.keys(blockShapeSpecific).length > 0) {
        return blockShapeSpecific as Record<string, FieldMetadataEntry>
      }
    }
    
    const raw = data.global[entityType]
    const metadata = (raw !== undefined && raw !== null ? raw : {}) as Record<string, FieldMetadataEntry>
    return metadata
  })
  
  return {
    fieldMetadata,
    
    /**
Loading state from metadata cache
LEARNING: Metadata is lazy-loaded,...
     */
    isLoading: computed(() => metadataCache.isLoading.value),
    
    /**
Error from metadata cache
WHY: Reflects actual error state from meta...
     */
    error: computed(() => metadataCache.error.value),
    
    refetch: () => Promise.resolve(),
  }
}
