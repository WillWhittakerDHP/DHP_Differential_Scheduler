import { ref, type Ref } from 'vue'
import type { AppointmentResponse } from '@/types/appointment'
import {
  attendeesFromClientAndAgent,
  getClientIdFromAttendees,
  getAgentIdFromAttendees,
} from '@/composables/admin/tables/useAppointmentAttendees'
import { formatAppointmentTimestamp } from '@/composables/admin/tables/useAppointmentHelpers'

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

export function useAppointmentsTableHandlers(params: UseAppointmentsTableHandlersParams) {
  const {
    newAppointment,
    editedData,
    saveCreate,
    saveEdit,
    startEdit,
    cancelEdit,
    startCreate,
    cancelCreate,
    emit,
  } = params

  const formClientId = ref<string | null>(null)
  const formAgentId = ref<string | null>(null)
  const editingClientId = ref<string | null>(null)
  const editingAgentId = ref<string | null>(null)
  const confirmingAppointment = ref<AppointmentResponse | null>(null)
  const showConfirmDialog = ref(false)

  const handleOpenConfirmDialog = (item: AppointmentResponse): void => {
    confirmingAppointment.value = item
    showConfirmDialog.value = true
  }

  const handleCancelConfirm = (): void => {
    confirmingAppointment.value = null
    showConfirmDialog.value = false
  }

  const handleSaveCreate = async (): Promise<void> => {
    const attendees = attendeesFromClientAndAgent(formClientId.value, formAgentId.value)
    newAppointment.value = { ...newAppointment.value, attendees }
    formClientId.value = null
    formAgentId.value = null
    await saveCreate()
  }

  const handleSaveEdit = async (): Promise<void> => {
    const attendees = attendeesFromClientAndAgent(editingClientId.value, editingAgentId.value)
    editedData.value = { ...editedData.value, attendees }
    editingClientId.value = null
    editingAgentId.value = null
    await saveEdit()
  }

  const handleStartEdit = (item: AppointmentResponse): void => {
    startEdit(item)
    editingClientId.value = getClientIdFromAttendees(item) ?? null
    editingAgentId.value = getAgentIdFromAttendees(item) ?? null
  }

  const handleCancelEdit = (): void => {
    cancelEdit()
    editingClientId.value = null
    editingAgentId.value = null
  }

  const handleStartCreate = (): void => {
    startCreate()
    formClientId.value = null
    formAgentId.value = null
  }

  const handleCancelCreate = (): void => {
    cancelCreate()
    formClientId.value = null
    formAgentId.value = null
  }

  const applyCreatePatch = (patch: Partial<Record<string, unknown>>): void => {
    Object.assign(newAppointment.value, patch)
  }

  const navigateToProperties = (): void => {
    emit('navigate-to-tab', 'properties')
  }

  const navigateToUsers = (): void => {
    emit('navigate-to-tab', 'users')
  }

  const setFormClientId = (v: string | null): void => {
    formClientId.value = v
  }

  const setFormAgentId = (v: string | null): void => {
    formAgentId.value = v
  }

  return {
    formClientId,
    formAgentId,
    editingClientId,
    editingAgentId,
    confirmingAppointment,
    showConfirmDialog,
    handleOpenConfirmDialog,
    handleCancelConfirm,
    handleSaveCreate,
    handleSaveEdit,
    handleStartEdit,
    handleCancelEdit,
    handleStartCreate,
    handleCancelCreate,
    applyCreatePatch,
    navigateToProperties,
    navigateToUsers,
    setFormClientId,
    setFormAgentId,
    formatTimestamp: formatAppointmentTimestamp,
  }
}
