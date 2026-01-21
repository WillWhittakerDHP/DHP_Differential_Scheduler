/**
 * LEARNING: Admin Primitive Metadata Mutations Composable
 * WHY: Provides mutations for saving/deleting admin primitive metadata
 *      Renamed from useAdminInputMetadataMutations to align with entity data pattern
 * PATTERN: Vue Query mutations with proper cache invalidation
 * 
 * This composable handles:
 * - Saving field rendering configuration (POST with full entry)
 * - Deleting field overrides (DELETE)
 * - Invalidating Vue Query cache after mutations
 */

import { useMutation, useQueryClient } from '@tanstack/vue-query'
import apiClient, { getAdminPrimitiveMetadataEndpoint } from '@/utils/api'
import type { EntityMetadataType, FieldMetadataEntry } from '@/types/entityMetadata'
import { buildMetadataEntry } from '@/utils/admin/buildMetadataEntry'
import { useGlobal } from '@/composables/useGlobal'
import { metadataTransformer } from '@/utils/transformers/metadataTransformer'

/**
 * Save field rendering configuration
 * Merges rendering updates with existing canonical fields and POSTs full entry
 * 
 * @param entityType - Entity type (blockShape, partShape, blockInstance, partInstance)
 * @param entityId - Entity ID (sentinel UUID for shapes, actual ID for instances)
 * @param fieldKey - Field key to update
 * @param renderingUpdates - Rendering field updates (visibility, layout, displayOrder, etc.)
 */
export function useAdminPrimitiveMetadataMutations() {
  const queryClient = useQueryClient()
  const { getGlobalData } = useGlobal()

  const saveFieldRenderingMutation = useMutation({
    mutationFn: async ({
      entityType,
      entityId,
      fieldKey,
      renderingUpdates,
      existingMetadata,
    }: {
      entityType: EntityMetadataType
      entityId: string
      fieldKey: string
      renderingUpdates: Partial<FieldMetadataEntry>
      existingMetadata: FieldMetadataEntry | undefined
    }) => {
      // LEARNING: Use existingMetadata as-is (like dehydrateEntity accepts fields as-is)
      // WHY: Accept what's passed, don't filter or validate - declarative transformation only
      // PATTERN: Like entity mutations accept fields (primitives + relationships) and dehydrate together
      //          Metadata mutations should accept existingMetadata and use it directly
      //          Dehydration happens at metadata structure level (separating primitives/relationships in GlobalData)
      //          not at individual entry level - the entry itself is already correct from the correct source
      
      // LEARNING: Get existingMetadata from primitive metadata source (declarative - like dehydrateEntity gets from entity)
      // WHY: Ensure we're using the correct source for primitive metadata entries
      // PATTERN: Get primitive metadata from GlobalData, extract fieldKey entry (declarative object access)
      const globalData = getGlobalData()
      if (globalData?.metadata && !existingMetadata) {
        const primitiveMetadata = globalData.metadata.primitiveMetadata?.[entityType]?.[entityId] || {}
        // LEARNING: Direct access to fieldKey entry (declarative - like dehydrateEntity accesses entity fields)
        // WHY: Get existingMetadata from primitive metadata source if not provided
        // PATTERN: Simple object property access, no filtering
        existingMetadata = primitiveMetadata[fieldKey]
      }

      // LEARNING: NO FALLBACKS - existingMetadata is required for new fields
      // WHY: Canonical fields must be explicitly provided - no derivation from formFieldConfig
      // PATTERN: Fail explicitly if existingMetadata is missing
      if (!existingMetadata) {
        throw new Error(
          `[useAdminPrimitiveMetadataMutations] Missing existingMetadata for ${entityType}.${fieldKey}. ` +
          `Cannot create new metadata entry without canonical fields. ` +
          `Fields must be configured in /admin-primitive-metadata before updating rendering config.`
        )
      }

      // LEARNING: Use shared utility to build metadata entry
      // WHY: Eliminates duplication between primitive and relationship metadata mutations
      // PATTERN: Extract common logic to shared utility function
      const fullEntry = {
        ...buildMetadataEntry({
          key: fieldKey,
          renderingUpdates,
          existingMetadata,
          isRelationship: false
        }),
        fieldKey
      } as { fieldKey: string } & Record<string, unknown>

      const endpoint = getAdminPrimitiveMetadataEndpoint(entityType, entityId)
      
      // LEARNING: Debug logging to trace save flow
      // WHY: Help diagnose why saves aren't persisting
      console.log('[useAdminPrimitiveMetadataMutations] Saving metadata:', {
        endpoint,
        entityType,
        entityId,
        fieldKey,
        fullEntry,
        hasExistingMetadata: !!existingMetadata
      })
      
      const response = await apiClient.post(endpoint, fullEntry)
      console.log('[useAdminPrimitiveMetadataMutations] Save response:', response.data)
      return response.data
    },
    onSuccess: (_, variables) => {
      // LEARNING: Invalidate metadata queries using predicate for robust matching
      // WHY: Ensures all queries with matching entityType and entityId are invalidated
      //      This handles cases where query keys might be constructed differently
      // PATTERN: Use predicate to match query key pattern instead of exact key
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey
          return (
            queryKey[0] === 'adminPrimitiveMetadata' &&
            queryKey[1] === variables.entityType &&
            queryKey[2] === variables.entityId
          )
        },
      })
      // Also invalidate GlobalData cache since metadata is part of GlobalData
      queryClient.invalidateQueries({
        queryKey: ['globalData'],
      })
    },
  })

  const deleteFieldOverrideMutation = useMutation({
    mutationFn: async ({
      entityType,
      entityId,
      fieldKey,
    }: {
      entityType: EntityMetadataType
      entityId: string
      fieldKey: string
    }) => {
      const endpoint = `${getAdminPrimitiveMetadataEndpoint(entityType, entityId)}/${fieldKey}`
      await apiClient.delete(endpoint)
    },
    onSuccess: (_, variables) => {
      // LEARNING: Invalidate metadata queries using predicate for robust matching
      // WHY: Ensures all queries with matching entityType and entityId are invalidated
      //      This handles cases where query keys might be constructed differently
      // PATTERN: Use predicate to match query key pattern instead of exact key
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey
          return (
            queryKey[0] === 'adminPrimitiveMetadata' &&
            queryKey[1] === variables.entityType &&
            queryKey[2] === variables.entityId
          )
        },
      })
    },
  })

  return {
    /**
     * Save field rendering configuration
     * Merges rendering updates with existing canonical fields
     */
    saveFieldRendering: async (
      entityType: EntityMetadataType,
      entityId: string,
      fieldKey: string,
      renderingUpdates: Partial<FieldMetadataEntry>,
      existingMetadata?: FieldMetadataEntry
    ) => {
      return saveFieldRenderingMutation.mutateAsync({
        entityType,
        entityId,
        fieldKey,
        renderingUpdates,
        existingMetadata,
      })
    },

    /**
     * Delete field override (instanceOverride mode only)
     */
    deleteFieldOverride: async (
      entityType: EntityMetadataType,
      entityId: string,
      fieldKey: string
    ) => {
      return deleteFieldOverrideMutation.mutateAsync({
        entityType,
        entityId,
        fieldKey,
      })
    },

    /**
     * Loading state for save operation
     */
    isSaving: saveFieldRenderingMutation.isPending || deleteFieldOverrideMutation.isPending,
  }
}
