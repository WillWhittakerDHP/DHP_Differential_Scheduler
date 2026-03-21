/**
 * WHY: Admin Primitive Metadata Mutations Composable
     Renamed from useAdmin...
 */
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import apiClient, { getAdminPrimitiveMetadataEndpoint } from '@/utils/api'
import type { EntityMetadataType, FieldMetadataEntry } from '@/constants/fieldMetadata'
import { buildMetadataEntry } from '@/utils/admin/buildMetadataEntry'
import { useMetadataCache } from '@/composables/admin/useMetadataCache'
import { createLogger } from '@/utils/logger'

const logger = createLogger('useAdminPrimitiveMetadataMutations')

export interface UseAdminPrimitiveMetadataMutationsReturn {
  saveFieldRendering: (
    entityType: EntityMetadataType,
    entityId: string,
    fieldKey: string,
    renderingUpdates: Partial<FieldMetadataEntry>,
    existingMetadata?: FieldMetadataEntry
  ) => Promise<unknown>
  deleteFieldOverride: (
    entityType: EntityMetadataType,
    entityId: string,
    fieldKey: string
  ) => Promise<unknown>
  isSaving: import('vue').Ref<boolean>
}

export function useAdminPrimitiveMetadataMutations(): UseAdminPrimitiveMetadataMutationsReturn {
  const queryClient = useQueryClient()
  const { getFieldMetadata } = useMetadataCache()

  type SavePrimitiveFieldVariables = {
    entityType: EntityMetadataType
    entityId: string
    fieldKey: string
    renderingUpdates: Partial<FieldMetadataEntry>
    existingMetadata: FieldMetadataEntry | undefined
  }
  const saveFieldRenderingMutation = useMutation<unknown, Error, SavePrimitiveFieldVariables>({
    mutationFn: async ({
      entityType,
      entityId,
      fieldKey,
      renderingUpdates,
      existingMetadata,
    }: SavePrimitiveFieldVariables) => {
      // PATTERN: Like entity mutations accept fields (primitives + relationships) and dehydrate together
      
      // PATTERN: Get primitive metadata from GlobalData, extract fieldKey entry (declarative object access)
      if (!existingMetadata) {
        // PATTERN: Use useMetadataCache.getFieldMetadata for declarative lookup
        existingMetadata = getFieldMetadata(entityType, fieldKey)
      }

      // PATTERN: Fail explicitly if existingMetadata is missing
      if (!existingMetadata) {
        throw new Error(
          `[useAdminPrimitiveMetadataMutations] Missing existingMetadata for ${entityType}.${fieldKey}. ` +
          `Cannot create new metadata entry without canonical fields. ` +
          `Fields must be configured in /admin-metadata before updating rendering config.`
        )
      }

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
      
      logger.debug('Saving metadata:', {
        endpoint,
        entityType,
        entityId,
        fieldKey,
        fullEntry,
        hasExistingMetadata: !!existingMetadata
      })
      
      const response = await apiClient.post(endpoint, fullEntry)
      logger.debug('Save response:', response.data)
      return response.data
    },
    onSuccess: (_, variables) => {
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

  type DeletePrimitiveFieldVariables = {
    entityType: EntityMetadataType
    entityId: string
    fieldKey: string
  }
  const deleteFieldOverrideMutation = useMutation<void, Error, DeletePrimitiveFieldVariables>({
    mutationFn: async ({
      entityType,
      entityId,
      fieldKey,
    }: DeletePrimitiveFieldVariables) => {
      const endpoint = `${getAdminPrimitiveMetadataEndpoint(entityType, entityId)}/${fieldKey}`
      await apiClient.delete(endpoint)
    },
    onSuccess: (_, variables) => {
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

    isSaving: saveFieldRenderingMutation.isPending || deleteFieldOverrideMutation.isPending,
  }
}
