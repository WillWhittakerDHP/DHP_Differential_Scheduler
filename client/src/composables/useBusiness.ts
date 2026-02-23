/**
 * PATTERN: Business Data Composable

PATTERN: Mirrors useGlobal composable for cons...
 */
import { computed, type ComputedRef } from 'vue'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { businessTransformer, type BusinessData } from '@/utils/transformers/fetchToBusinessTransformer'
import { asEmptyArray } from '@/utils/safeDefaults'

export const BUSINESS_DATA_QUERY_KEY = ['businessData'] as const

/**
 * useBusiness composable
 * 
 * 
 * @returns businessData - Reactive business data (appointments, properties, users)
 * @returns isLoading - Loading state
 * @returns error - Error state
 * @returns refetch - Function to manually refetch business data
 */
export function useBusiness(): {
  businessData: ComputedRef<BusinessData | undefined>
  isLoading: ComputedRef<boolean>
  error: ComputedRef<Error | null>
  refetch: () => Promise<void>
} {
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

/**
 * useAppointments computed ref
 * 
 */
export function useAppointments(): ComputedRef<BusinessData['appointments']> {
  const { businessData } = useBusiness()
  return computed(() => asEmptyArray(businessData.value?.appointments))
}

/**
 * useProperties computed ref
 * 
 */
export function useProperties(): ComputedRef<BusinessData['properties']> {
  const { businessData } = useBusiness()
  return computed(() => asEmptyArray(businessData.value?.properties))
}

/**
 * useUsers computed ref
 * 
 */
export function useUsers(): ComputedRef<BusinessData['users']> {
  const { businessData } = useBusiness()
  return computed(() => asEmptyArray(businessData.value?.users))
}

