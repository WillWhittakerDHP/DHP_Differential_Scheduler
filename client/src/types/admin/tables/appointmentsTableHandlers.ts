import type { Ref } from 'vue'
import type { AppointmentResponse } from '@/types/appointment'

export interface UseAppointmentsTableHandlersParams {
  newAppointment: Ref<Record<string, unknown>>
  editedData: Ref<Record<string, unknown>>
  saveCreate: () => Promise<void>
  saveEdit: () => Promise<void>
  startEdit: (item: AppointmentResponse) => void
  cancelEdit: () => void
  startCreate: () => void
  cancelCreate: () => void
  emit: (e: 'navigate-to-tab', tab: 'properties' | 'users') => void
}
