/**
 * useAppointmentLoader Composable
 * 
 * LEARNING: Helper composable for loading appointments by ID with cache refresh
 * WHY: BookingWizard needs to ensure appointment is loaded with all relationships
 * PATTERN: Refetches businessData cache if appointment not found, then uses fetchById
 * 
 * ARCHITECTURAL DECISION: Wraps useAppointment.fetchById with cache refresh logic
 * - Ensures appointment is fresh from API when needed
 * - Falls back to cache if already loaded
 * - Provides loading state for async operations
 */

import { ref, type Ref } from 'vue'
import { useQueryClient } from '@tanstack/vue-query'
import { useAppointment } from '@/composables/useAppointment'
import { BUSINESS_DATA_QUERY_KEY } from '@/composables/useBusiness'
import type { AppointmentResponse } from '@/types/appointment'

export function useAppointmentLoader() {
  const { fetchById } = useAppointment()
  const queryClient = useQueryClient()
  const isLoading: Ref<boolean> = ref(false)

  const loadAppointmentById = async (appointmentId: string): Promise<AppointmentResponse | null> => {
    isLoading.value = true
    try {
      // PATTERN: Use fetchById which reads from businessData cache
      const cachedResult = fetchById(appointmentId)
      
      await new Promise(resolve => setTimeout(resolve, 0))
      
      if (cachedResult.data.value) {
        return cachedResult.data.value
      }

      // PATTERN: Refetch businessData cache, then check again
      await queryClient.refetchQueries({ queryKey: BUSINESS_DATA_QUERY_KEY })
      
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const refreshedResult = fetchById(appointmentId)
      await new Promise(resolve => setTimeout(resolve, 0))
      
      return refreshedResult.data.value || null
    } catch (error) {
      console.error('[useAppointmentLoader] Error loading appointment:', error)
      return null
    } finally {
      isLoading.value = false
    }
  }

  return {
    loadAppointmentById,
    isLoading,
  }
}
