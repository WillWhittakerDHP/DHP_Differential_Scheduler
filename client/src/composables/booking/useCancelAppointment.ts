/**
 * Composable for client-facing cancel flow: fetch appointment, validate status, PATCH to cancelled.
 * Used by CancelConfirmView (/cancel?appointmentId=<id>).
 */
import { ref, type Ref } from 'vue'
import { useQueryClient } from '@tanstack/vue-query'
import { useRouter } from 'vue-router'
import apiClient, { getAppointmentByIdEndpoint } from '@/utils/api'
import type { AppointmentResponse } from '@/types/appointment'
import type { AppointmentStatus } from '@/types/appointmentStatus'
import { VALID_STATUS_TRANSITIONS } from '@/constants/appointmentStatus'
import { BUSINESS_DATA_QUERY_KEY } from '@/composables/useBusiness'
import { APPOINTMENT_NOT_FOUND } from '@/constants/errorMessages'
import { createLogger } from '@/utils/logger'

const logger = createLogger('useCancelAppointment')

function isCancellable(status: AppointmentStatus): boolean {
  const allowed = VALID_STATUS_TRANSITIONS[status]
  return allowed !== undefined && allowed.includes('cancelled')
}

export interface UseCancelAppointmentReturn {
  appointment: Ref<AppointmentResponse | null>
  isLoading: Ref<boolean>
  isCancelling: Ref<boolean>
  error: Ref<string | null>
  isCancellable: (status: AppointmentStatus) => boolean
  fetchAppointment: (id: string) => Promise<void>
  cancelAppointment: (id: string) => Promise<boolean>
}

export function useCancelAppointment(): UseCancelAppointmentReturn {
  const router = useRouter()
  const queryClient = useQueryClient()

  const appointment = ref<AppointmentResponse | null>(null)
  const isLoading = ref(false)
  const isCancelling = ref(false)
  const error = ref<string | null>(null)

  const fetchAppointment = async (id: string): Promise<void> => {
    isLoading.value = true
    error.value = null
    appointment.value = null
    try {
      const response = await apiClient.get<AppointmentResponse>(getAppointmentByIdEndpoint(id))
      appointment.value = response.data
    } catch (err) {
      logger.error('Failed to fetch appointment for cancel', { error: err })
      error.value = err instanceof Error ? err.message : APPOINTMENT_NOT_FOUND
    } finally {
      isLoading.value = false
    }
  }

  const cancelAppointment = async (id: string): Promise<boolean> => {
    isCancelling.value = true
    error.value = null
    try {
      await apiClient.patch<AppointmentResponse>(getAppointmentByIdEndpoint(id), {
        status: 'cancelled',
      })
      await queryClient.invalidateQueries({ queryKey: BUSINESS_DATA_QUERY_KEY })
      await router.push({ path: '/' })
      return true
    } catch (err) {
      logger.error('Failed to cancel appointment', { error: err })
      error.value = err instanceof Error ? err.message : 'Failed to cancel appointment'
      return false
    } finally {
      isCancelling.value = false
    }
  }

  return {
    appointment,
    isLoading,
    isCancelling,
    error,
    isCancellable,
    fetchAppointment,
    cancelAppointment,
  }
}
