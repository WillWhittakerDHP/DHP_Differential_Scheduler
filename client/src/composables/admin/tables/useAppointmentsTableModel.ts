import { computed, type ComputedRef } from 'vue'
import { useAppointment } from '@/composables/useAppointment'
import { useProperty } from '@/composables/useProperty'
import { useUser } from '@/composables/useUser'
import { useNotification } from '@/composables/useNotification'
import type { AppointmentRequest, AppointmentResponse } from '@/types/appointment'
import type { PropertyResponse } from '@/types/property'
import type { UserResponse } from '@/types/user'
import { useCrudDataTableModel, type CrudDataTableModel } from './useCrudDataTableModel'

export interface AppointmentsTableModel extends CrudDataTableModel<
  AppointmentResponse,
  AppointmentRequest,
  Partial<AppointmentRequest>
> {
  properties: ComputedRef<PropertyResponse[]>
  users: ComputedRef<UserResponse[]>
  getDisplayValue: (appointment: AppointmentResponse, field: string) => string
}

/**
 * useAppointmentsTableModel
 *
 * LEARNING: Table-specific wrapper around the generic CRUD table model.
 * WHY: Appointments need relationship display mapping (property + users).
 * PATTERN: Thin view uses this composable + a headers constant.
 */
export function useAppointmentsTableModel(): AppointmentsTableModel {
  const { success, error } = useNotification()
  const { fetchAll, create, update, remove } = useAppointment()
  const { fetchAll: fetchProperties } = useProperty()
  const { fetchAll: fetchUsers } = useUser()

  const properties = computed<PropertyResponse[]>(() => {
    const data = fetchProperties.data.value
    return Array.isArray(data) ? data : []
  })

  const users = computed<UserResponse[]>(() => {
    const data = fetchUsers.data.value
    return Array.isArray(data) ? data : []
  })

  const formatNullValue = (value: unknown): string => {
    if (value === null || value === undefined) return '—'
    if (typeof value === 'object') return JSON.stringify(value)
    return String(value)
  }

  const getDisplayValue = (appointment: AppointmentResponse, field: string): string => {
    const value = (appointment as unknown as Record<string, unknown>)[field]

    if ((field === 'propertyVersionId' || field === 'propertyId') && value) {
      const propertyVersionId = appointment.propertyVersionId || appointment.propertyId
      if (propertyVersionId) {
        const property = properties.value.find(p => p.propertyVersionId === propertyVersionId || p.id === propertyVersionId)
        if (property) return `${property.address}, ${property.city}, ${property.state}`
      }
      if (appointment.propertyVersion?.address) {
        const addr = appointment.propertyVersion.address
        return `${addr.address}, ${addr.city}, ${addr.state}`
      }
      return String(value)
    }

    // Handle user-related fields (clientId, agentId)
    if ((field === 'clientId' || field === 'agentId') && value) {
      const user = users.value.find(u => u.id === value)
      return user ? `${user.firstName} ${user.lastName}` : String(value)
    }

    // Handle scheduledById - shows role in cell, name in tooltip
    // LEARNING: User requested role in cell to quickly see who type scheduled
    if (field === 'scheduledById' && value) {
      const user = users.value.find(u => u.id === value)
      return user ? user.userRole : String(value)
    }

    /**
     * LEARNING: Default status changed from 'draft' to 'started'
     * WHY: New status workflow uses 'started' for appointments in creation
     */
    if (field === 'status') return String(value || 'started')

    if (field === 'selectedDate' && value) return new Date(String(value)).toLocaleDateString()

    if (field === 'selectedTimeSlots' && value) {
      return Array.isArray(value) ? `${value.length} slot(s)` : formatNullValue(value)
    }

    if (field === 'selectedOptionTypeBlocks' && value) {
      return Array.isArray(value) ? `${value.length} option(s)` : formatNullValue(value)
    }

    if (field === 'propertyDetails' || field === 'additionalContacts') return formatNullValue(value)

    return formatNullValue(value)
  }

  const model = useCrudDataTableModel<AppointmentResponse, AppointmentRequest, Partial<AppointmentRequest>>({
    entityLabel: 'Appointment',
    itemsSource: computed(() => {
      const data = fetchAll.data.value
      if (!data) return []
      return Array.isArray(data) ? data : []
    }),
    isLoadingSource: computed(() => fetchAll.isLoading.value),
    errorSource: computed(() => fetchAll.error.value),
    createItem: async (payload) => create.mutateAsync(payload),
    updateItem: async (id, payload) => update.mutateAsync({ id, data: payload }),
    deleteItem: async (id) => remove.mutateAsync(id),
    notifySuccess: (message) => success(message),
    notifyError: (message) => error(message),
    /**
     * LEARNING: Default values for new appointments
     * WHY: 'started' is the initial status for appointments being created
     * 
     * TODO: Future logic - Consider auto-setting scheduledById from current logged-in user
     */
    getCreateDefaults: () => ({
      status: 'started',
      isQuoteMode: false,
      scheduledById: null,
    } as AppointmentRequest),
    validateCreate: (payload) => {
      if (!payload.propertyVersionId && !payload.propertyId) return 'Property is required'
      return null
    },
    mapItemToEditPayload: (appointment) => ({
      propertyVersionId: appointment.propertyVersionId || appointment.propertyId || null,
      userTypeBlockId: appointment.userTypeBlockId || null,
      selectedOptionTypeBlocks: appointment.selectedOptionTypeBlocks || null,
      selectedDate: appointment.selectedDate || null,
      selectedDateRangeEnd: appointment.selectedDateRangeEnd || null,
      selectedTimeSlots: (appointment.selectedTimeSlots as { time: string; duration: number; }[] | null | undefined) || null,
      isQuoteMode: appointment.isQuoteMode,
      quotePdfUrl: appointment.quotePdfUrl || null,
      status: appointment.status,
      clientId: appointment.clientId || null,
      agentId: appointment.agentId || null,
      /** scheduledById: Tracks which user engaged/interacted with the scheduler */
      scheduledById: appointment.scheduledById || null,
      additionalContacts: appointment.additionalContacts || null,
      propertyDetails: appointment.propertyDetails || null,
    }),
  })

  return {
    ...model,
    properties,
    users,
    getDisplayValue,
  }
}


