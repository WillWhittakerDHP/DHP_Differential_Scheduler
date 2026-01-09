import type { ComputedRef } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import apiClient from '@/utils/api'
import { getBlockInstanceAnnotationsEndpoint, getEntityEndpoint } from '@/utils/api'
import type {
  AnnotationAssignmentResponse,
  BlockInstanceAnnotationResponse,
  BlockInstanceResponse,
} from '@/types/annotations'
import { createLogger } from '@/utils/logger'

/**
 * Query module: fetch assignment relationships for a block instance + a cached "all instances" view.
 */
export function useAnnotationAssignmentsQuery(
  blockInstanceId: ComputedRef<string | undefined>
): {
  blockInstanceAnnotations: ReturnType<typeof useQuery<AnnotationAssignmentResponse[]>>['data']
  refetchRelationships: ReturnType<typeof useQuery<AnnotationAssignmentResponse[]>>['refetch']
  allBlockInstanceAnnotations: ReturnType<typeof useQuery<BlockInstanceAnnotationResponse[]>>['data']
} {
  const logger = createLogger('useAnnotationAssignmentsQuery')
  const { data: blockInstanceAnnotations, refetch: refetchRelationships } = useQuery<AnnotationAssignmentResponse[]>({
    queryKey: ['blockInstanceAnnotations', blockInstanceId],
    queryFn: async (): Promise<AnnotationAssignmentResponse[]> => {
      if (!blockInstanceId.value) return []
      const response = await apiClient.get(getBlockInstanceAnnotationsEndpoint(blockInstanceId.value))
      return response.data as AnnotationAssignmentResponse[]
    },
    enabled: () => !!blockInstanceId.value,
  })

  const { data: allBlockInstanceAnnotations } = useQuery<BlockInstanceAnnotationResponse[]>({
    queryKey: ['allBlockInstanceAnnotations'],
    queryFn: async (): Promise<BlockInstanceAnnotationResponse[]> => {
      const blockInstancesResponse = await apiClient.get(getEntityEndpoint('blockInstance'))
      const blockInstances = (blockInstancesResponse.data || []) as BlockInstanceResponse[]

      const annotationPromises = blockInstances.map(
        async (blockInstance: BlockInstanceResponse): Promise<BlockInstanceAnnotationResponse[]> => {
          try {
            const rels = await apiClient.get(getBlockInstanceAnnotationsEndpoint(blockInstance.id))
            if (rels.data && Array.isArray(rels.data)) {
              return (rels.data as AnnotationAssignmentResponse[]).map((rel: AnnotationAssignmentResponse) => ({
                ...rel,
                blockInstanceId: blockInstance.id,
                blockInstanceName: blockInstance.name,
              }))
            }
            return []
          } catch (error) {
            logger.warn('Failed to fetch block instance annotations', {
              blockInstanceId: blockInstance.id,
              error,
            })
            return []
          }
        }
      )

      const results = await Promise.all(annotationPromises)
      return results.flat()
    },
    staleTime: 30000,
  })

  return {
    blockInstanceAnnotations,
    refetchRelationships,
    allBlockInstanceAnnotations,
  }
}


