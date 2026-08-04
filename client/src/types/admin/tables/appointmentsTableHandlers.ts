import type { Ref } from 'vue'
import type { AppointmentResponse } from '@/types/appointment'
import type { AppointmentRequest } from '@/types/appointment'

/** Grouped return for composable-health (oversized-return repair). */
export interface UseAppointmentsTableHandlersReturn {
  state: {
    formBuyerId: Ref<string | null>
    formAgentId: Ref<string | null>
    editingBuyerId: Ref<string | null>
    editingAgentId: Ref<string | null>
    confirmingAppointment: Ref<AppointmentResponse | null>
    showConfirmDialog: Ref<boolean>
  }
  actions: {
    handleOpenConfirmDialog: (item: AppointmentResponse) => void
    handleConfirmAppointment: () => Promise<void>
    handleCancelConfirm: () => void
    handleSaveCreate: () => Promise<void>
    handleSaveEdit: () => Promise<void>
    handleStartEdit: (item: AppointmentResponse) => void
    handleCancelEdit: () => void
    handleStartCreate: () => void
    handleCancelCreate: () => void
    applyCreatePatch: (patch: Partial<Record<string, unknown>>) => void
    navigateToProperties: () => void
    navigateToUsers: () => void
    setFormBuyerId: (v: string | null) => void
    setFormAgentId: (v: string | null) => void
  }
  formatTimestamp: (value: string | null | undefined) => string
}

export interface UseAppointmentsTableHandlersParams {
  newAppointment: Ref<AppointmentRequest>
  editedData: Ref<Partial<AppointmentRequest>>
  saveCreate: () => Promise<void>
  saveEdit: () => Promise<void>
  startEdit: (item: AppointmentResponse) => void
  cancelEdit: () => void
  startCreate: () => void
  cancelCreate: () => void
  confirmAppointment: (id: string) => Promise<boolean>
  emit: (e: 'navigate-to-tab', tab: 'properties' | 'users') => void
}
