/**
 * Metadata Cache Composable
 * 
 * LEARNING: Lazy-loaded metadata cache, only fetched when admin page is accessed
 * WHY: Metadata is only needed for admin page - don't load during app startup
 * PATTERN: Dedicated cache key ['adminMetadata'] separate from globalData
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
import type { FieldMetadataEntry } from '@/types/entityMetadata'

/**
 * MetadataCache type - structured metadata for all entity types
 * LEARNING: Mirrors the batch endpoint response structure
 * WHY: Clear separation between global configs and BlockShape-specific configs
 */
export interface MetadataCache {
  global: {
    blockShape: Record<string, FieldMetadataEntry>
    partShape: Record<string, FieldMetadataEntry>
    blockInstance: Record<string, FieldMetadataEntry>
    partInstance: Record<string, FieldMetadataEntry>
    eventShape: Record<string, FieldMetadataEntry>
    eventInstance: Record<string, FieldMetadataEntry>
    annotationShape: Record<string, FieldMetadataEntry>
    annotationInstance: Record<string, FieldMetadataEntry>
  }
  blockShapeSpecific: Record<string, Record<string, FieldMetadataEntry>>
}

// SINGLETON: Shared query instance for metadata cache
let metadataCacheInstance: ReturnType<typeof createMetadataCacheInstance> | null = null

/**
 * Fetch all admin metadata from batch endpoint
 * LEARNING: Single API call fetches all metadata
 * WHY: Replaces N+4 individual calls with 1 batch call
 */
async function fetchAllAdminMetadata(): Promise<MetadataCache> {
  const endpoint = getAdminMetadataBatchEndpoint()
  const response = await apiClient.get<MetadataCache>(endpoint)
  return response.data
}

/**
 * Create the metadata cache instance
 * LEARNING: Separated to enable singleton pattern
 */
function createMetadataCacheInstance() {
  const queryClient = useQueryClient()
  
  // Track if metadata loading has been requested
  // LEARNING: Reactive flag to control when query is enabled
  // WHY: Allows synchronous enabling of query when admin page mounts
  // PATTERN: Use ref for reactive flag, computed for enabled state
  const metadataLoadRequested = ref(false)
  
  /**
   * Metadata query with lazy loading
   * LEARNING: enabled is computed based on whether loading was requested
   * WHY: Only fetch when admin page explicitly requests it via ensureMetadataLoaded()
   * PATTERN: Use computed enabled to control when query runs reactively
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
   * Ensure metadata is loaded
   * LEARNING: Called when admin page mounts to trigger fetch synchronously
   * WHY: Lazy loading - only fetch when actually needed, but enable immediately
   * PATTERN: Enable query synchronously, Vue Query handles async fetch and loading state
   * FIX: Changed from async to sync to prevent race condition with component rendering
   */
  function ensureMetadataLoaded(): void {
    // Check if metadata is already in cache
    const existingData = queryClient.getQueryData<MetadataCache>(['adminMetadata'])
    
    if (!existingData && !metadataLoadRequested.value) {
      // Enable query to trigger fetch (Vue Query will handle it reactively)
      // LEARNING: Setting this to true enables the query immediately
      // WHY: Components can check isLoading/isLoaded while metadata fetches
      metadataLoadRequested.value = true
    }
  }
  
  /**
   * Get metadata for a specific entity
   * LEARNING: Handles global vs BlockShape-specific lookup logic
   * WHY: Provides same interface as old useAdmin.getMetadata()
   * PATTERN: For blockInstance, check BlockShape-specific first, fall back to global
   * 
   * @param entityType - Entity type (blockShape, partShape, blockInstance, partInstance, eventShape, eventInstance, annotationShape, annotationInstance)
   * @param blockShapeRef - BlockShape ID for blockInstance entities (optional)
   * @returns Record<fieldKey, FieldMetadataEntry>
   */
  function getMetadata(
    entityType: 'blockShape' | 'partShape' | 'blockInstance' | 'partInstance' | 'eventShape' | 'eventInstance' | 'annotationShape' | 'annotationInstance',
    blockShapeRef?: string | null
  ): Record<string, FieldMetadataEntry> {
    const data = metadataQuery.data.value
    
    if (!data) {
      return {}
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
  }
  
  /**
   * Get metadata entry for a specific field
   * LEARNING: Convenience function for single field lookup
   * WHY: Some components need just one field's metadata
   */
  function getFieldMetadata(
    entityType: 'blockShape' | 'partShape' | 'blockInstance' | 'partInstance' | 'eventShape' | 'eventInstance' | 'annotationShape' | 'annotationInstance',
    fieldKey: string,
    blockShapeRef?: string | null
  ): FieldMetadataEntry | undefined {
    const metadata = getMetadata(entityType, blockShapeRef)
    return metadata[fieldKey]
  }
  
  /**
   * Check if metadata is loaded
   * LEARNING: Computed property for reactive loading state
   * WHY: Components can show loading states while metadata fetches
   */
  const isLoaded = computed(() => !!metadataQuery.data.value)
  
  /**
   * Invalidate metadata cache
   * LEARNING: Called after metadata mutations to refresh cache
   * WHY: Ensures cache stays in sync with backend
   */
  function invalidateMetadataCache(): void {
    queryClient.invalidateQueries({ queryKey: ['adminMetadata'] })
  }
  
  /**
   * Get the full metadata cache (for components that need full access)
   * LEARNING: Returns the complete MetadataCache object
   * WHY: Some components like useAdmin need access to full structure
   */
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
    // LEARNING: Expose reactive metadata data for direct access
    // WHY: Allows useEntityMetadata to track metadataQuery.data changes reactively
    // PATTERN: Expose computed ref that tracks metadataQuery.data
    metadataData: computed(() => metadataQuery.data.value),
  }
}

/**
 * Metadata cache composable
 * LEARNING: Provides lazy-loaded metadata access for admin page
 * WHY: Centralizes metadata caching logic with singleton pattern
 * PATTERN: Singleton - creates instance on first call, reuses afterwards
 * 
 * Usage:
 * 1. In admin page: call ensureMetadataLoaded() on mount
 * 2. In components: call getMetadata(entityType, blockShapeRef) to get metadata
 */
export function useMetadataCache() {
  // SINGLETON: Create instance on first call, reuse afterwards
  if (!metadataCacheInstance) {
    metadataCacheInstance = createMetadataCacheInstance()
  }
  
  return metadataCacheInstance
}

/**
 * Reset metadata cache (for testing)
 * LEARNING: Allows resetting singleton for clean test state
 */
export function resetMetadataCache(): void {
  metadataCacheInstance = null
}
