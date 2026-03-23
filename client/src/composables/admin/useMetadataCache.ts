/**
 * Metadata Cache Composable
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
import type { MetadataCache, MetadataEntityType, UseMetadataCacheReturn } from '@/types/admin/metadataCache'
import { resolveMetadataRecordForEntity } from '@/utils/admin/metadataCacheResolvers'

let metadataCacheInstance: UseMetadataCacheReturn | null = null

async function fetchAllAdminMetadata(): Promise<MetadataCache> {
  const endpoint = getAdminMetadataBatchEndpoint()
  const response = await apiClient.get<MetadataCache>(endpoint)
  return response.data
}

function createMetadataCacheInstance(): UseMetadataCacheReturn {
  const queryClient = useQueryClient()

  const metadataLoadRequested = ref(false)

  const metadataQuery = useQuery<MetadataCache>({
    queryKey: ['adminMetadata'],
    queryFn: fetchAllAdminMetadata,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    enabled: computed(() => metadataLoadRequested.value),
  })

  function ensureMetadataLoaded(): void {
    const existingData = queryClient.getQueryData<MetadataCache>(['adminMetadata'])

    if (!existingData && !metadataLoadRequested.value) {
      metadataLoadRequested.value = true
    }
  }

  function getMetadata(
    entityType: MetadataEntityType,
    blockShapeRef?: string | null
  ): Record<string, FieldMetadataEntry> {
    return resolveMetadataRecordForEntity(metadataQuery.data.value, entityType, blockShapeRef)
  }

  function getFieldMetadata(
    entityType: MetadataEntityType,
    fieldKey: string,
    blockShapeRef?: string | null
  ): FieldMetadataEntry | undefined {
    const metadata = getMetadata(entityType, blockShapeRef)
    return metadata[fieldKey]
  }

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
    metadataData: computed(() => metadataQuery.data.value),
  }
}

/**
 * WHY: Metadata cache composable
 * WHY: Centralizes metadata caching logic with s...
 */
export function useMetadataCache(): UseMetadataCacheReturn {
  if (!metadataCacheInstance) {
    metadataCacheInstance = createMetadataCacheInstance()
  }

  return metadataCacheInstance
}
