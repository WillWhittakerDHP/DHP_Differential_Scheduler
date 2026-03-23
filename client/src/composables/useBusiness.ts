/**
 * PATTERN: Business Data Composable

PATTERN: Mirrors useGlobal composable for cons...
 */
import { computed } from 'vue'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { businessTransformer, type BusinessData } from '@/utils/transformers/fetchToBusinessTransformer'
import type { UseBusinessReturn } from '@/types/business'


export const BUSINESS_DATA_QUERY_KEY = ['businessData'] as const

export function useBusiness(): UseBusinessReturn {
  const queryClient = useQueryClient()

  const businessQuery = useQuery<BusinessData>({
    queryKey: BUSINESS_DATA_QUERY_KEY,
    queryFn: () => businessTransformer.fetchAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  })

  return {
    businessData: computed(() => businessQuery.data.value),
    isLoading: computed(() => businessQuery.isLoading.value),
    error: computed(() => businessQuery.error.value),
    refetch: async () => {
      await queryClient.refetchQueries({ queryKey: BUSINESS_DATA_QUERY_KEY })
    },
  }
}

