/**
 * Metadata Cache Composable
 * 
 * 
 * Key benefits:
 * - Non-admin users: Zero metadata API calls
 * - Admin users: 1 batch call only when visiting admin page (instead of N+4 on every app load)
 * - Faster app startup, reduced bandwidth
 * - Independent cache invalidation from globalData
 */

import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed, ref } from 'vue'
import apiClient, { getAdminMetadataBatchEndpoint } from '@/utils/api'
import type { FieldMetadataEntry } from '@/constants/fieldMetadata'
import type { MetadataCache, MetadataEntityType } from '@/types/admin/metadataCache'

export type { MetadataCache, UseMetadataCacheReturn } from '@/types/admin/metadataCache'

let metadataCacheInstance: ReturnType<typeof createMetadataCacheInstance> | null = null

async function fetchAllAdminMetadata(): Promise<MetadataCache> {
  const endpoint = getAdminMetadataBatchEndpoint()
  const response = await apiClient.get<MetadataCache>(endpoint)
  return response.data
}

function createMetadataCacheInstance() {
  const queryClient = useQueryClient()
  
  // PATTERN: Use ref for reactive flag, computed for enabled state
  const metadataLoadRequested = ref(false)
  
  /**
   * Metadata query with lazy loading
   */
  const metadataQuery = useQuery<MetadataCache>({
    queryKey: ['adminMetadata'],
    queryFn: fetchAllAdminMetadata,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    enabled: computed(() => metadataLoadRequested.value), // LAZY: Only fetches when enabled
  })
  
  /**
Ensure metadata is loaded
PATTERN: Enable query synchronously, Vue Q...
   */
  function ensureMetadataLoaded(): void {
    const existingData = queryClient.getQueryData<MetadataCache>(['adminMetadata'])
    
    if (!existingData && !metadataLoadRequested.value) {
      metadataLoadRequested.value = true
    }
  }
  
  /**
   * Get metadata for a specific entity
   * 
   * @param entityType - Entity type (blockShape, partShape, blockInstance, partInstance, eventShape, eventInstance, annotationShape, annotationInstance)
   * @param blockShapeRef - BlockShape ID for blockInstance entities (optional)
   * @returns Record<fieldKey, FieldMetadataEntry>
   */
  function getMetadata(
    entityType: MetadataEntityType,
    blockShapeRef?: string | null
  ): Record<string, FieldMetadataEntry> {
    const data = metadataQuery.data.value
    
    if (!data) {
      return {}
    }
    
    if (entityType === 'blockInstance' && blockShapeRef) {
      const blockShapeSpecific = data.blockShapeSpecific[blockShapeRef]
      if (blockShapeSpecific && Object.keys(blockShapeSpecific).length > 0) {
        return blockShapeSpecific as Record<string, FieldMetadataEntry>
      }
    }
    
    const raw = data.global[entityType]
    return (raw !== undefined && raw !== null ? raw : {}) as Record<string, FieldMetadataEntry>
  }
  
  function getFieldMetadata(
    entityType: MetadataEntityType,
    fieldKey: string,
    blockShapeRef?: string | null
  ): FieldMetadataEntry | undefined {
    const metadata = getMetadata(entityType, blockShapeRef)
    return metadata[fieldKey]
  }
  
  /**
Check if metadata is loaded
LEARNING: Computed property for reactive...
   */
  const isLoaded = computed(() => !!metadataQuery.data.value)
  
  function invalidateMetadataCache(): void {
    queryClient.invalidateQueries({ queryKey: ['adminMetadata'] })
  }
  
  function getMetadataCache(): MetadataCache | null {
    return metadataQuery.data.value || null
  }
  
  return {
    ensureMetadataLoaded,
    getMetadata,
    getFieldMetadata,
    getMetadataCache,
    invalidateMetadataCache,
    isLoading: metadataQuery.isLoading,
    isLoaded,
    error: metadataQuery.error,
    // PATTERN: Expose computed ref that tracks metadataQuery.data
    metadataData: computed(() => metadataQuery.data.value),
  }
}

/**
 * WHY: Metadata cache composable
WHY: Centralizes metadata caching logic with s...
 */
export function useMetadataCache() {
  if (!metadataCacheInstance) {
    metadataCacheInstance = createMetadataCacheInstance()
  }
  
  return metadataCacheInstance
}

/**
LEARNING: Allows resetting singleton ...
 */
export function resetMetadataCache(): void {
  metadataCacheInstance = null
}
