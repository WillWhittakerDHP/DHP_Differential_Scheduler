/**
 * useAppointment Composable
 * 
 * LEARNING: Vue composable for appointment CRUD operations
 * WHY: Provides reactive appointment mutations with error handling
 * PATTERN: Vue Query useMutation for data mutations
 * 
 * Session 1.4.9: Refactored to use BusinessData cache
 * ARCHITECTURAL DECISION: Business entities use ['businessData'] cache key
 * - Keeps business data changes from invalidating static configuration data
 * - Uses optimistic updates + refetchQueries for cache consistency
 * - Mirrors globalData architecture for consistency
 */

import { computed, type ComputedRef } from 'vue'
import { useQueryClient } from '@tanstack/vue-query'
import { getAppointmentByIdEndpoint, getAppointmentEndpoint } from '@/utils/api'
import type { AppointmentRequest, AppointmentResponse } from '@/types/appointment'
import type { BusinessData } from '@/utils/transformers/fetchToBusinessTransformer'
import { pickRandomItem } from '@/utils/collections/pickRandomItem'
import { useBusinessDataCollectionCrud } from './businessDataCollections/useBusinessDataCollectionCrud'
import { useBusiness, BUSINESS_DATA_QUERY_KEY } from './useBusiness'
import type { UseMutationReturnType } from '@tanstack/vue-query'

type UpdateByIdPayload = {
  id: string
  data: Partial<AppointmentRequest>
}

/**
 * useAppointment composable
 * 
 * LEARNING: Provides appointment CRUD operations from BusinessData cache
 * WHY: Centralizes appointment API logic with reactive state management
 * PATTERN: Uses useBusinessDataCollectionCrud for standardized CRUD operations
 * 
 * Session 1.4.9: Refactored to use BusinessData cache with optimistic + refetchQueries pattern
 */
type UseAppointmentReturn = {
  create: UseMutationReturnType<AppointmentResponse, unknown, AppointmentRequest, unknown>
  update: UseMutationReturnType<AppointmentResponse, unknown, UpdateByIdPayload, unknown>
  patch: UseMutationReturnType<AppointmentResponse, unknown, UpdateByIdPayload, unknown>
  remove: UseMutationReturnType<void, unknown, string, unknown>
  fetchAll: {
    data: ComputedRef<AppointmentResponse[]>
    isLoading: ComputedRef<boolean>
    error: ComputedRef<unknown | undefined>
  }
  fetchById: (id: string) => {
    data: ComputedRef<AppointmentResponse | undefined>
    isLoading: ComputedRef<boolean>
    error: ComputedRef<unknown | undefined>
  }
  fetchRandom: () => Promise<AppointmentResponse | null>
}

export function useAppointment(): UseAppointmentReturn {
  const queryClient = useQueryClient()
  const { businessData, isLoading, error } = useBusiness()
  
  // Use BusinessData collection CRUD for standardized operations
  const { create, update, patch, remove, fetchAll: baseFetchAll, fetchById } = useBusinessDataCollectionCrud<
    AppointmentResponse,
    AppointmentRequest,
    Partial<AppointmentRequest>
  >({
    collectionName: 'appointments',
    selectCollection: (data: BusinessData) => data.appointments,
    updateCollection: (data: BusinessData, updated: readonly AppointmentResponse[]) => ({
      ...data,
      appointments: [...updated],
    }),
    endpoints: {
      listEndpoint: getAppointmentEndpoint,
      byIdEndpoint: getAppointmentByIdEndpoint,
    },
  })

  // Wrap fetchAll to include loading state from useBusiness
  const fetchAll = {
    data: baseFetchAll.data,
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
  }

  /**
   * Fetch random appointment
   * 
   * LEARNING: Domain-specific helper for picking a random appointment
   * WHY: Useful for testing and demo scenarios
   * PATTERN: Wait for data to load, then pick random item
   */
  const fetchRandom = async (): Promise<AppointmentResponse | null> => {
    try {
      // If data is loading, wait for it (poll every 100ms, max 5 seconds)
      if (isLoading.value) {
        let attempts = 0
        const maxAttempts = 50
        while (isLoading.value && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 100))
          attempts++
        }
      }
      
      // If no data after loading, try refetching
      if (!businessData.value || businessData.value.appointments.length === 0) {
        await queryClient.refetchQueries({ queryKey: BUSINESS_DATA_QUERY_KEY })
        // Wait a bit for refetch to complete
        await new Promise(resolve => setTimeout(resolve, 500))
      }
      
      const appointments = businessData.value?.appointments || []
      return pickRandomItem(appointments)
    } catch (_error) {
      return null
    }
  }

  return {
    create,
    update,
    patch,
    remove,
    fetchAll,
    fetchById,
    fetchRandom,
  }
}

