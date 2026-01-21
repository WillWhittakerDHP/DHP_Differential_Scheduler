/**
 * LEARNING: Admin Relationship Metadata Mutations Composable
 * WHY: Provides mutations for saving/deleting admin relationship metadata
 * PATTERN: Vue Query mutations with proper cache invalidation
 * 
 * This composable handles:
 * - Saving relationship field rendering configuration (POST with full entry)
 * - Deleting relationship field overrides (DELETE)
 * - Invalidating Vue Query cache after mutations
 */

import { useMutation, useQueryClient } from '@tanstack/vue-query'
import apiClient, { getAdminRelationshipMetadataEndpoint } from '@/utils/api'
import type { EntityMetadataType, FieldMetadataEntry } from '@/types/entityMetadata'
import { buildMetadataEntry } from '@/utils/admin/buildMetadataEntry'
import { useGlobal } from '@/composables/useGlobal'
import { metadataTransformer } from '@/utils/transformers/metadataTransformer'

/**
 * Save relationship field rendering configuration
 * Merges rendering updates with existing canonical fields and POSTs full entry
 * 
 * @param entityType - Entity type (blockShape, partShape, blockInstance, partInstance)
 * @param entityId - Entity ID (sentinel UUID for shapes, actual ID for instances)
 * @param relationshipKey - Relationship key to update (e.g., 'activeParts')
 * @param renderingUpdates - Rendering field updates (visibility, layout, displayOrder, etc.)
 */
export function useAdminRelationshipMetadataMutations() {
  const queryClient = useQueryClient()
  const { getGlobalData } = useGlobal()

  const saveRelationshipFieldRenderingMutation = useMutation({
    mutationFn: async ({
      entityType,
      entityId,
      relationshipKey,
      renderingUpdates,
      existingMetadata,
    }: {
      entityType: EntityMetadataType
      entityId: string
      relationshipKey: string
      renderingUpdates: Partial<FieldMetadataEntry>
      existingMetadata: FieldMetadataEntry | undefined
    }) => {
      // LEARNING: Use existingMetadata as-is (like dehydrateEntity accepts fields as-is)
      // WHY: Accept what's passed, don't filter or validate - declarative transformation only
      // PATTERN: Like entity mutations accept fields (primitives + relationships) and dehydrate together
      //          Metadata mutations should accept existingMetadata and use it directly
      //          Dehydration happens at metadata structure level (separating primitives/relationships in GlobalData)
      //          not at individual entry level - the entry itself is already correct from the correct source
      
      // LEARNING: Get existingMetadata from relationship metadata source (declarative - like dehydrateEntity gets from entity)
      // WHY: Ensure we're using the correct source for relationship metadata entries
      // PATTERN: Get relationship metadata from GlobalData, extract relationshipKey entry (declarative object access)
      const globalData = getGlobalData()
      if (globalData?.metadata && !existingMetadata) {
        const relationshipMetadata = globalData.metadata.relationshipMetadata?.[entityType]?.[entityId] || {}
        // LEARNING: Direct access to relationshipKey entry (declarative - like dehydrateEntity accesses entity fields)
        // WHY: Get existingMetadata from relationship metadata source if not provided
        // PATTERN: Simple object property access, no filtering
        existingMetadata = relationshipMetadata[relationshipKey]
      }

      // LEARNING: NO FALLBACKS - existingMetadata is required for new fields
      // WHY: Canonical fields must be explicitly provided - no derivation from formFieldConfig
      // PATTERN: Fail explicitly if existingMetadata is missing
      if (!existingMetadata) {
        throw new Error(
          `[useAdminRelationshipMetadataMutations] Missing existingMetadata for ${entityType}.${relationshipKey}. ` +
          `Cannot create new metadata entry without canonical fields. ` +
          `Fields must be configured in /admin-relationship-metadata before updating rendering config.`
        )
      }

      // LEARNING: Use shared utility to build metadata entry
      // WHY: Eliminates duplication between primitive and relationship metadata mutations
      // PATTERN: Extract common logic to shared utility function
      const fullEntry = {
        ...buildMetadataEntry({
          key: relationshipKey,
          renderingUpdates,
          existingMetadata,
          isRelationship: true
        }),
        relationshipKey
      } as { relationshipKey: string } & Record<string, unknown>

      const endpoint = getAdminRelationshipMetadataEndpoint(entityType, entityId)
      const response = await apiClient.post(endpoint, fullEntry)
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
            queryKey[0] === 'adminRelationshipMetadata' &&
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

  const deleteRelationshipFieldOverrideMutation = useMutation({
    mutationFn: async ({
      entityType,
      entityId,
      relationshipKey,
    }: {
      entityType: EntityMetadataType
      entityId: string
      relationshipKey: string
    }) => {
      const endpoint = `${getAdminRelationshipMetadataEndpoint(entityType, entityId)}/${relationshipKey}`
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
            queryKey[0] === 'adminRelationshipMetadata' &&
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

  return {
    /**
     * Save relationship field rendering configuration
     * Merges rendering updates with existing canonical fields
     */
    saveRelationshipFieldRendering: async (
      entityType: EntityMetadataType,
      entityId: string,
      relationshipKey: string,
      renderingUpdates: Partial<FieldMetadataEntry>,
      existingMetadata?: FieldMetadataEntry
    ) => {
      return saveRelationshipFieldRenderingMutation.mutateAsync({
        entityType,
        entityId,
        relationshipKey,
        renderingUpdates,
        existingMetadata,
      })
    },

    /**
     * Delete relationship field override (instanceOverride mode only)
     */
    deleteRelationshipFieldOverride: async (
      entityType: EntityMetadataType,
      entityId: string,
      relationshipKey: string
    ) => {
      return deleteRelationshipFieldOverrideMutation.mutateAsync({
        entityType,
        entityId,
        relationshipKey,
      })
    },

    /**
     * Loading state for save operation
     */
    isSaving: saveRelationshipFieldRenderingMutation.isPending || deleteRelationshipFieldOverrideMutation.isPending,
  }
}
