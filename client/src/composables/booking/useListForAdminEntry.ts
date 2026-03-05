/**
 * Fetches the list of appointments for the admin entry dropdown (Edit quote / Reschedule).
 * Session 6.8.6.3 — uses GET list-for-admin-entry; resolve client/agent names via users lookup.
 */
import type { ComputedRef } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import apiClient from '@/utils/api'
import { getListForAdminEntryEndpoint } from '@/utils/api'
import type { AdminEntryAppointmentItem } from '@shared/types/appointmentTypes'
import type { UserResponse } from '@/types/user'

const LIST_FOR_ADMIN_ENTRY_QUERY_KEY = ['appointments', 'list-for-admin-entry'] as const

export interface UseListForAdminEntryReturn {
  data: ComputedRef<AdminEntryAppointmentItem[] | undefined>
  isLoading: ComputedRef<boolean>
  error: ComputedRef<unknown>
  refetch: () => void
}

export function useListForAdminEntry(): UseListForAdminEntryReturn {
  const query = useQuery({
    queryKey: LIST_FOR_ADMIN_ENTRY_QUERY_KEY,
    queryFn: async (): Promise<AdminEntryAppointmentItem[]> => {
      const { data } = await apiClient.get<AdminEntryAppointmentItem[]>(getListForAdminEntryEndpoint())
      return Array.isArray(data) ? data : []
    },
  })
  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  }
}

/** Format display name for dropdown row (same pattern as admin appointments table). */
export function formatUserDisplayName(user: UserResponse | undefined): string {
  if (!user) return '—'
  return [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || '—'
}
