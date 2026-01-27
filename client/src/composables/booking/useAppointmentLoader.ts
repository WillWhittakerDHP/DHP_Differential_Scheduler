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

/**
 * Load appointment by ID, refreshing cache if needed
 * 
 * LEARNING: Ensures appointment is loaded with all relationships
 * WHY: BookingWizard needs fresh appointment data for transformation
 * PATTERN: Check cache first, refetch if not found, then return from cache
 * 
 * @param appointmentId - Appointment ID to load
 * @returns Promise resolving to appointment or null if not found
 */
export function useAppointmentLoader() {
  const { fetchById } = useAppointment()
  const queryClient = useQueryClient()
  const isLoading: Ref<boolean> = ref(false)

  const loadAppointmentById = async (appointmentId: string): Promise<AppointmentResponse | null> => {
    isLoading.value = true
    try {
      // LEARNING: Check cache first
      // WHY: If appointment is already in cache, use it immediately
      // PATTERN: Use fetchById which reads from businessData cache
      const cachedResult = fetchById(appointmentId)
      
      // Wait a tick for computed to update
      await new Promise(resolve => setTimeout(resolve, 0))
      
      if (cachedResult.data.value) {
        return cachedResult.data.value
      }

      // LEARNING: Refetch businessData if appointment not in cache
      // WHY: Ensures we get fresh appointment data with all relationships from API
      // PATTERN: Refetch businessData cache, then check again
      await queryClient.refetchQueries({ queryKey: BUSINESS_DATA_QUERY_KEY })
      
      // Wait a bit for refetch to complete
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Check cache again after refetch
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
