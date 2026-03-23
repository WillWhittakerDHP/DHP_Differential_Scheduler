/**
 * WHY: Unified Admin Metadata Mutations Composable
 * WHY: Single composable for s...
 */
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import apiClient, { getAdminMetadataEndpoint } from '@/utils/api'
import { useMetadataCache } from '@/composables/admin/useMetadataCache'
import { postSaveFieldMetadataRequest } from '@/utils/admin/adminMetadataSaveRequest'
import type {
  DeleteFieldMetadataMutationVariables,
  SaveFieldMetadataMutationVariables,
} from '@/types/admin/fieldMetadataMutationVariables'
import type { MetadataEntityType } from '@/types/admin/metadataCache'
import type { Ref } from 'vue'

export interface UseAdminMetadataMutationsReturn {
  saveFieldMetadata: (variables: SaveFieldMetadataMutationVariables) => Promise<unknown>
  deleteFieldMetadata: (variables: DeleteFieldMetadataMutationVariables) => Promise<unknown>
  isSaving: Ref<boolean>
  isDeleting: Ref<boolean>
}

export function useAdminMetadataMutations(): UseAdminMetadataMutationsReturn {
  const queryClient = useQueryClient()
  const { getFieldMetadata } = useMetadataCache()

  const saveFieldMetadataMutation = useMutation<unknown, Error, SaveFieldMetadataMutationVariables>({
    mutationFn: async (variables) =>
      postSaveFieldMetadataRequest(variables, (entityType, fieldKey, blockShapeRef) =>
        getFieldMetadata(entityType as MetadataEntityType, fieldKey, blockShapeRef ?? undefined)
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminMetadata'] })
    },
  })

  const deleteFieldMetadataMutation = useMutation<void, Error, DeleteFieldMetadataMutationVariables>({
    mutationFn: async ({ entityType, entityId, fieldKey, blockShapeRef }) => {
      const endpoint = `${getAdminMetadataEndpoint(entityType, entityId)}/${fieldKey}`
      const url = blockShapeRef ? `${endpoint}?blockShapeRef=${blockShapeRef}` : endpoint
      await apiClient.delete(url)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminMetadata'] })
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
