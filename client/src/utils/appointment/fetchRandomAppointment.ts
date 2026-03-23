/**
 * WHY: Random appointment picker with loading / refetch guards (useAppointment length audit).
 */

import type { QueryClient, QueryKey } from '@tanstack/vue-query'
import type { Ref } from 'vue'
import type { AppointmentResponse } from '@/types/appointment'
import type { BusinessData } from '@/utils/transformers/fetchToBusinessTransformer'
import { pickRandomItem } from '@/utils/collections/pickRandomItem'
import { createLogger } from '@/utils/logger'

const logger = createLogger('fetchRandomAppointment')

export async function fetchRandomAppointment(input: {
  queryClient: QueryClient
  businessDataQueryKey: QueryKey
  isLoading: Ref<boolean>
  businessData: Ref<BusinessData | null | undefined>
}): Promise<AppointmentResponse | null> {
  const { queryClient, businessDataQueryKey, isLoading, businessData } = input

  try {
    if (isLoading.value) {
      let attempts = 0
      const maxAttempts = 50
      while (isLoading.value && attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 100))
        attempts += 1
      }
    }

    if (!businessData.value || businessData.value.appointments.length === 0) {
      await queryClient.refetchQueries({ queryKey: businessDataQueryKey })
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    const raw = businessData.value?.appointments
    const appointments = raw !== undefined && raw !== null && Array.isArray(raw) ? raw : []
    return pickRandomItem(appointments)
  } catch (error) {
    logger.error('Fetch random appointment failed', { error })
    return null
  }
}
