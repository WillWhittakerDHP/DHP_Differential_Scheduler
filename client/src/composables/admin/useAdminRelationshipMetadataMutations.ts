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
import type { EntityMetadataType, FieldMetadataEntry } from '@/constants/fieldMetadata'
import { buildMetadataEntry } from '@/utils/admin/buildMetadataEntry'
import { useMetadataCache } from '@/composables/admin/useMetadataCache'

export function useAdminRelationshipMetadataMutations() {
  const queryClient = useQueryClient()
  const { getFieldMetadata } = useMetadataCache()

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
      // PATTERN: Like entity mutations accept fields (primitives + relationships) and dehydrate together
      
      // PATTERN: Get relationship metadata from GlobalData, extract relationshipKey entry (declarative object access)
      if (!existingMetadata) {
        // PATTERN: Use useMetadataCache.getFieldMetadata for declarative lookup
        existingMetadata = getFieldMetadata(entityType, relationshipKey)
      }

      // PATTERN: Fail explicitly if existingMetadata is missing
      if (!existingMetadata) {
        throw new Error(
          `[useAdminRelationshipMetadataMutations] Missing existingMetadata for ${entityType}.${relationshipKey}. ` +
          `Cannot create new metadata entry without canonical fields. ` +
          `Fields must be configured in /admin-relationship-metadata before updating rendering config.`
        )
      }

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

    isSaving: saveRelationshipFieldRenderingMutation.isPending || deleteRelationshipFieldOverrideMutation.isPending,
  }
}
