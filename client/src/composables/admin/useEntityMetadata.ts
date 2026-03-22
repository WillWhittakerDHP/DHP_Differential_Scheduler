/**
 * WHY: Unified Entity Metadata Composable
WHY: Single composable for all entity...
 */
import type { ComputedRef } from 'vue'
import { computed, unref, type MaybeRef } from 'vue'
import { useMetadataCache } from '@/composables/admin/useMetadataCache'
import { resolveBlockInstanceMetadataFromCache } from '@/utils/admin/resolveBlockInstanceMetadata'
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
    
    if (entityType === 'blockInstance' && entityKey === 'blockInstance') {
      const blockInstanceEntity = entityValue.value as GlobalEntity<'blockInstance'>
      return resolveBlockInstanceMetadataFromCache(data, blockInstanceEntity.blockShapeRef)
    }

    const raw = data.global[entityType]
    const metadata = (raw !== undefined && raw !== null ? raw : {}) as Record<string, FieldMetadataEntry>
    return metadata
  })
  
  return {
    fieldMetadata,
    
    /**
Loading state from metadata cache
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
