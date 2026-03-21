/**
 * PATTERN: Business Data Composable

PATTERN: Mirrors useGlobal composable for cons...
 */
import { computed, type ComputedRef } from 'vue'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { businessTransformer, type BusinessData } from '@/utils/transformers/fetchToBusinessTransformer'
import { asEmptyArray } from '@/utils/safeDefaults'
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

export function useAppointments(): ComputedRef<BusinessData['appointments']> {
  const { businessData } = useBusiness()
  return computed(() => asEmptyArray(businessData.value?.appointments))
}

export function useProperties(): ComputedRef<BusinessData['properties']> {
  const { businessData } = useBusiness()
  return computed(() => asEmptyArray(businessData.value?.properties))
}

export function useUsers(): ComputedRef<BusinessData['users']> {
  const { businessData } = useBusiness()
  return computed(() => asEmptyArray(businessData.value?.users))
}

