/**
 * Business Data Composable
 * 
 * LEARNING: Provides access to business data (appointments, properties, users)
 * WHY: Unified cache for business entities that change frequently
 * PATTERN: Mirrors useGlobal composable for consistency
 * 
 * Session 1.4.7: Created as part of data flow consolidation
 * ARCHITECTURAL DECISION: Business entities use separate ['businessData'] cache key
 * - Keeps business data changes from invalidating static configuration data
 * - Uses optimistic updates + refetchQueries for cache consistency
 */

import { computed, type ComputedRef } from 'vue'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { businessTransformer, type BusinessData } from '@/utils/transformers/fetchToBusinessTransformer'

export const BUSINESS_DATA_QUERY_KEY = ['businessData'] as const

/**
 * useBusiness composable
 * 
 * LEARNING: Provides reactive access to business data
 * WHY: Components can read business data without managing cache directly
 * PATTERN: Similar to useGlobal for configuration data
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
 * LEARNING: Convenience accessor for appointments from businessData
 * WHY: Components often need just appointments, not full businessData
 * PATTERN: Computed ref that reads from businessData cache
 */
export function useAppointments(): ComputedRef<BusinessData['appointments']> {
  const { businessData } = useBusiness()
  return computed(() => businessData.value?.appointments ?? [])
}

/**
 * useProperties computed ref
 * 
 * LEARNING: Convenience accessor for properties from businessData
 * WHY: Components often need just properties, not full businessData
 * PATTERN: Computed ref that reads from businessData cache
 */
export function useProperties(): ComputedRef<BusinessData['properties']> {
  const { businessData } = useBusiness()
  return computed(() => businessData.value?.properties ?? [])
}

/**
 * useUsers computed ref
 * 
 * LEARNING: Convenience accessor for users from businessData
 * WHY: Components often need just users, not full businessData
 * PATTERN: Computed ref that reads from businessData cache
 */
export function useUsers(): ComputedRef<BusinessData['users']> {
  const { businessData } = useBusiness()
  return computed(() => businessData.value?.users ?? [])
}

