/**
 * Metadata cache composable — code-first (Feature 20.6.1.1).
 * WHY: Admin reads field layout from `buildCodeFirstMetadataCache()`; no legacy metadata batch HTTP.
 */

import { computed, ref } from 'vue'
import type { FieldMetadataEntry } from '@/constants/fieldMetadata'
import type { MetadataCache, MetadataEntityType, UseMetadataCacheReturn } from '@/types/admin/metadataCache'
import { buildCodeFirstMetadataCache } from '@/utils/admin/codeFirstMetadataCache'
import { resolveMetadataRecordForEntity } from '@/utils/admin/metadataCacheResolvers'

let metadataCacheInstance: UseMetadataCacheReturn | null = null

function createMetadataCacheInstance(): UseMetadataCacheReturn {
  const cache = ref<MetadataCache>(buildCodeFirstMetadataCache())
  const isLoading = ref(false)
  const error = ref<unknown>(null)

  function ensureMetadataLoaded(): void {
    // No network load; cache is always populated synchronously.
  }

  function getMetadata(
    entityType: MetadataEntityType,
    blockShapeRef?: string | null
  ): Record<string, FieldMetadataEntry> {
    return resolveMetadataRecordForEntity(cache.value, entityType, blockShapeRef)
  }

  function getFieldMetadata(
    entityType: MetadataEntityType,
    fieldKey: string,
    blockShapeRef?: string | null
  ): FieldMetadataEntry | undefined {
    return getMetadata(entityType, blockShapeRef)[fieldKey]
  }

  const isLoaded = computed(() => true)

  function invalidateMetadataCache(): void {
    cache.value = buildCodeFirstMetadataCache()
  }

  function getMetadataCache(): MetadataCache | null {
    return cache.value
  }

  return {
    ensureMetadataLoaded,
    getMetadata,
    getFieldMetadata,
    getMetadataCache,
    invalidateMetadataCache,
    isLoading,
    isLoaded,
    error,
    metadataData: computed(() => cache.value),
  }
}

export function useMetadataCache(): UseMetadataCacheReturn {
  if (!metadataCacheInstance) {
    metadataCacheInstance = createMetadataCacheInstance()
  }

  return metadataCacheInstance
}
