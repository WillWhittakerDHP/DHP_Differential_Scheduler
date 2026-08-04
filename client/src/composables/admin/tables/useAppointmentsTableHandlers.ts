import { ref } from 'vue'
import type { AppointmentResponse } from '@/types/appointment'
import {
  attendeesFromBuyerAndAgent,
  getBuyerIdFromAttendees,
  getAgentIdFromAttendees,
} from '@/utils/admin/appointmentAttendees'
import { formatAppointmentTimestamp } from '@/utils/admin/appointmentHelpers'
import type {
  UseAppointmentsTableHandlersParams,
  UseAppointmentsTableHandlersReturn,
} from '@/types/admin/tables/appointmentsTableHandlers'


export function useAppointmentsTableHandlers(params: UseAppointmentsTableHandlersParams): UseAppointmentsTableHandlersReturn {
  const {
    newAppointment,
    editedData,
    saveCreate,
    saveEdit,
    startEdit,
    cancelEdit,
    startCreate,
    cancelCreate,
    confirmAppointment,
    emit,
  } = params

  const formBuyerId = ref<string | null>(null)
  const formAgentId = ref<string | null>(null)
  const editingBuyerId = ref<string | null>(null)
  const editingAgentId = ref<string | null>(null)
  const confirmingAppointment = ref<AppointmentResponse | null>(null)
  const showConfirmDialog = ref(false)

  const handleOpenConfirmDialog = (item: AppointmentResponse): void => {
    confirmingAppointment.value = item
    showConfirmDialog.value = true
  }

  const handleConfirmAppointment = async (): Promise<void> => {
    if (!confirmingAppointment.value) return
    await confirmAppointment(confirmingAppointment.value.id)
    confirmingAppointment.value = null
    showConfirmDialog.value = false
  }

  const handleCancelConfirm = (): void => {
    confirmingAppointment.value = null
    showConfirmDialog.value = false
  }

  const handleSaveCreate = async (): Promise<void> => {
    const attendees = attendeesFromBuyerAndAgent(formBuyerId.value, formAgentId.value)
    newAppointment.value = { ...newAppointment.value, attendees }
    formBuyerId.value = null
    formAgentId.value = null
    await saveCreate()
  }

  const handleSaveEdit = async (): Promise<void> => {
    const attendees = attendeesFromBuyerAndAgent(editingBuyerId.value, editingAgentId.value)
    editedData.value = { ...editedData.value, attendees }
    editingBuyerId.value = null
    editingAgentId.value = null
    await saveEdit()
  }

  const handleStartEdit = (item: AppointmentResponse): void => {
    startEdit(item)
    editingBuyerId.value = getBuyerIdFromAttendees(item) ?? null
    editingAgentId.value = getAgentIdFromAttendees(item) ?? null
  }

  const handleCancelEdit = (): void => {
    cancelEdit()
    editingBuyerId.value = null
    editingAgentId.value = null
  }

  const handleStartCreate = (): void => {
    startCreate()
    formBuyerId.value = null
    formAgentId.value = null
  }

  const handleCancelCreate = (): void => {
    cancelCreate()
    formBuyerId.value = null
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

  const setFormBuyerId = (v: string | null): void => {
    formBuyerId.value = v
  }

  const setFormAgentId = (v: string | null): void => {
    formAgentId.value = v
  }

  return {
    state: {
      formBuyerId,
      formAgentId,
      editingBuyerId,
      editingAgentId,
      confirmingAppointment,
      showConfirmDialog,
    },
    actions: {
      handleOpenConfirmDialog,
      handleConfirmAppointment,
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
      setFormBuyerId,
      setFormAgentId,
    },
    formatTimestamp: formatAppointmentTimestamp,
  }
}
