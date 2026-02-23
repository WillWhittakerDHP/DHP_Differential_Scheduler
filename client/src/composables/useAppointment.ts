/**
 * WHY: useAppointment Composable

LEARNING: Vue composable for appointment CRUD...
 */
import { computed, type ComputedRef } from 'vue'
import { useQueryClient } from '@tanstack/vue-query'
import { getAppointmentByIdEndpoint, getAppointmentEndpoint } from '@/utils/api'
import type { AppointmentRequest, AppointmentResponse } from '@/types/appointment'
import type { BusinessData } from '@/utils/transformers/fetchToBusinessTransformer'
import { pickRandomItem } from '@/utils/collections/pickRandomItem'
import { useBusinessDataCollectionCrud } from '@/composables/businessDataCollections/useBusinessDataCollectionCrud'
import { useBusiness, BUSINESS_DATA_QUERY_KEY } from './useBusiness'
import type { UseMutationReturnType } from '@tanstack/vue-query'
import { createLogger } from '@/utils/logger'

const logger = createLogger('useAppointment')

type UpdateByIdPayload = {
  id: string
  data: Partial<AppointmentRequest>
}

/**
 * WHY: useAppointment composable

WHY: Centralizes appointment API logic with r...
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

  const fetchAll = {
    data: baseFetchAll.data,
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
  }

  const fetchRandom = async (): Promise<AppointmentResponse | null> => {
    try {
      if (isLoading.value) {
        let attempts = 0
        const maxAttempts = 50
        while (isLoading.value && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 100))
          attempts++
        }
      }
      
      if (!businessData.value || businessData.value.appointments.length === 0) {
        await queryClient.refetchQueries({ queryKey: BUSINESS_DATA_QUERY_KEY })
        await new Promise(resolve => setTimeout(resolve, 500))
      }
      
      const raw = businessData.value?.appointments
      const appointments = raw !== undefined && raw !== null && Array.isArray(raw) ? raw : []
      return pickRandomItem(appointments)
    } catch (_error) {
      logger.error('Fetch random appointment failed', { error: _error })
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

