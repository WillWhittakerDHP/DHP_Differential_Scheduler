/**
 * WHY: useAppointment Composable
 */
import { computed, type ComputedRef } from 'vue'
import { useQueryClient } from '@tanstack/vue-query'
import { getAppointmentByIdEndpoint, getAppointmentEndpoint } from '@/utils/api'
import type { AppointmentRequest, AppointmentResponse } from '@/types/appointment'
import type { BusinessData } from '@/utils/transformers/fetchToBusinessTransformer'
import { useBusinessDataCollectionCrud } from '@/composables/businessDataCollections/useBusinessDataCollectionCrud'
import { useBusiness, BUSINESS_DATA_QUERY_KEY } from './useBusiness'
import type { UseMutationReturnType } from '@tanstack/vue-query'
import { getAvailabilitySettings } from '@/configs/availabilitySettings'
import { APPOINTMENT_STATUS_HELD, APPOINTMENT_STATUS_STARTED } from '@shared/constants/appointmentStatusLiterals'
import { fetchRandomAppointment } from '@/utils/appointment/fetchRandomAppointment'

const FALLBACK_HOLD_DURATION_MINUTES = 15

type UpdateByIdPayload = {
  id: string
  data: Partial<AppointmentRequest>
}

type UseAppointmentReturn = {
  create: UseMutationReturnType<AppointmentResponse, unknown, AppointmentRequest, unknown>
  update: UseMutationReturnType<AppointmentResponse, unknown, UpdateByIdPayload, unknown>
  patch: UseMutationReturnType<AppointmentResponse, unknown, UpdateByIdPayload, unknown>
  remove: UseMutationReturnType<void, unknown, string, unknown>
  holdSlot: (id: string, durationMinutes?: number) => Promise<void>
  releaseSlot: (id: string) => void
  applyOverrideConstraints: (id: string, constraints: Record<string, boolean> | null) => void
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

  const holdSlot = async (id: string, durationMinutes?: number): Promise<void> => {
    const minutes =
      durationMinutes !== undefined
        ? durationMinutes
        : (await getAvailabilitySettings()).calendarConfig?.holdDurationMinutes ?? FALLBACK_HOLD_DURATION_MINUTES
    patch.mutate({ id, data: { status: APPOINTMENT_STATUS_HELD, holdDurationMinutes: minutes } })
  }

  const releaseSlot = (id: string): void => {
    patch.mutate({ id, data: { status: APPOINTMENT_STATUS_STARTED } })
  }

  const applyOverrideConstraints = (id: string, constraints: Record<string, boolean> | null): void => {
    patch.mutate({ id, data: { overrideConstraints: constraints } })
  }

  const fetchRandom = async (): Promise<AppointmentResponse | null> =>
    fetchRandomAppointment({
      queryClient,
      businessDataQueryKey: BUSINESS_DATA_QUERY_KEY,
      isLoading,
      businessData,
    })

  return {
    create,
    update,
    patch,
    remove,
    holdSlot,
    releaseSlot,
    applyOverrideConstraints,
    fetchAll,
    fetchById,
    fetchRandom,
  }
}
