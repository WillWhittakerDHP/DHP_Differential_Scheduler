/**
 * WHY: Unified Admin Metadata Mutations Composable
WHY: Single composable for s...
 */
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import apiClient, { getAdminMetadataEndpoint } from '@/utils/api'
import type { EntityMetadataType, FieldMetadataEntry } from '@/constants/fieldMetadata'
import { buildMetadataEntry } from '@/utils/admin/buildMetadataEntry'
import { useMetadataCache } from '@/composables/admin/useMetadataCache'
import { RELATIONSHIP_KEYS } from '@/constants/relationships'
import { createLogger } from '@/utils/logger'

const logger = createLogger('useAdminMetadataMutations')

export interface UseAdminMetadataMutationsReturn {
  saveFieldMetadata: (variables: {
    entityType: EntityMetadataType
    entityId: string
    fieldKey: string
    renderingUpdates: Partial<FieldMetadataEntry>
    existingMetadata: FieldMetadataEntry | undefined
    blockShapeRef?: string | null
  }) => Promise<unknown>
  deleteFieldMetadata: (variables: {
    entityType: EntityMetadataType
    entityId: string
    fieldKey: string
    blockShapeRef?: string | null
  }) => Promise<unknown>
  isSaving: import('vue').Ref<boolean>
  isDeleting: import('vue').Ref<boolean>
}

export function useAdminMetadataMutations(): UseAdminMetadataMutationsReturn {
  const queryClient = useQueryClient()
  const { getFieldMetadata } = useMetadataCache()

  type SaveFieldMetadataVariables = {
    entityType: EntityMetadataType
    entityId: string
    fieldKey: string
    renderingUpdates: Partial<FieldMetadataEntry>
    existingMetadata: FieldMetadataEntry | undefined
    blockShapeRef?: string | null
  }
  const saveFieldMetadataMutation = useMutation<unknown, Error, SaveFieldMetadataVariables>({
    mutationFn: async ({
      entityType,
      entityId,
      fieldKey,
      renderingUpdates,
      existingMetadata,
      blockShapeRef,
    }: SaveFieldMetadataVariables) => {
      // PATTERN: Like entity mutations accept fields (primitives + relationships) and dehydrate together
      
      // PATTERN: Use lazy-loaded metadata cache instead of globalData
      if (!existingMetadata) {
        existingMetadata = getFieldMetadata(entityType, fieldKey, blockShapeRef)
      }

      // PATTERN: Fail explicitly if existingMetadata is missing
      if (!existingMetadata) {
        throw new Error(
          `[useAdminMetadataMutations] Missing existingMetadata for ${entityType}.${fieldKey}. ` +
          `Cannot create new metadata entry without canonical fields. ` +
          `Fields must be configured in /admin-metadata before updating rendering config.`
        )
      }

      // PATTERN: Check RELATIONSHIP_KEYS to determine type (matches backend logic)
      const isRelationship = fieldKey in RELATIONSHIP_KEYS

      // PATTERN: Extract common logic to shared utility function
      const fullEntry = {
        ...buildMetadataEntry({
          key: fieldKey,
          renderingUpdates,
          existingMetadata,
          isRelationship
        }),
        fieldKey,
        blockShapeRef: blockShapeRef || null, // Include blockShapeRef for BlockShape-specific instance metadata
      } as { fieldKey: string; blockShapeRef: string | null } & Record<string, unknown>

      const endpoint = getAdminMetadataEndpoint(entityType, entityId)
      
      logger.debug('Saving metadata:', {
        endpoint,
        entityType,
        entityId,
        fieldKey,
        blockShapeRef: blockShapeRef || null,
        fullEntry,
        hasExistingMetadata: !!existingMetadata,
        isRelationship
      })
      
      const response = await apiClient.post(endpoint, fullEntry)
      
      logger.debug('Save response:', response.data)
      
      return response.data
    },
    onSuccess: () => {
      // LEARNING: Invalidate cache to mark as stale
      // PATTERN: Invalidate in mutation, refetch manually in component to await completion
      queryClient.invalidateQueries({ queryKey: ['adminMetadata'] })
    },
  })

  type DeleteFieldMetadataVariables = {
    entityType: EntityMetadataType
    entityId: string
    fieldKey: string
    blockShapeRef?: string | null
  }
  const deleteFieldMetadataMutation = useMutation<void, Error, DeleteFieldMetadataVariables>({
    mutationFn: async ({
      entityType,
      entityId,
      fieldKey,
      blockShapeRef,
    }: DeleteFieldMetadataVariables) => {
      const endpoint = `${getAdminMetadataEndpoint(entityType, entityId)}/${fieldKey}`
      const url = blockShapeRef ? `${endpoint}?blockShapeRef=${blockShapeRef}` : endpoint
      await apiClient.delete(url)
    },
    onSuccess: () => {
      // LEARNING: Invalidate cache to mark as stale
      // PATTERN: Invalidate in mutation, refetch manually in component to await completion
      queryClient.invalidateQueries({ queryKey: ['adminMetadata'] })
      // PATTERN: Invalidate both adminMetadata and globalData after metadata saves
      queryClient.invalidateQueries({ queryKey: ['globalData'] })
    },
  })

  return {
    saveFieldMetadata: saveFieldMetadataMutation.mutateAsync,
    deleteFieldMetadata: deleteFieldMetadataMutation.mutateAsync,
    isSaving: saveFieldMetadataMutation.isPending,
    isDeleting: deleteFieldMetadataMutation.isPending,
  }
}
