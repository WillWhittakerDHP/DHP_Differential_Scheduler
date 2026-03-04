import { computed, type ComputedRef } from 'vue'
import { useAppointment } from '@/composables/useAppointment'
import { useProperty } from '@/composables/useProperty'
import { useUser } from '@/composables/useUser'
import { useNotification } from '@/composables/useNotification'
import type { AppointmentRequest, AppointmentResponse } from '@/types/appointment'
import type { PropertyResponse } from '@/types/property'
import type { UserResponse } from '@/types/user'
import { useCrudDataTableModel } from './useCrudDataTableModel'
import { getAppointmentFieldFormatter } from '@/utils/appointmentFieldFormatters'
import { APPOINTMENTS_TABLE_UI } from '@/constants/appointmentsTableConstants'
import { createLogger } from '@/utils/logger'

import type { CrudDataTableModel } from '@/types/admin/tables/crudDataTableModel'

const logger = createLogger('useAppointmentsTableModel')

/** Grouped to keep return surface under 10 (composable-health). */
export interface AppointmentsTableLookups {
  properties: ComputedRef<PropertyResponse[]>
  users: ComputedRef<UserResponse[]>
  getDisplayValue: (appointment: AppointmentResponse, field: string) => string
  getPropertyById: (propertyVersionId: string | null | undefined) => PropertyResponse | undefined
  getUserById: (userId: string | null | undefined) => UserResponse | undefined
  getPropertyTypeNames: (propertyVersionId: string | null | undefined) => string
}

export interface AppointmentsTableModel extends CrudDataTableModel<
  AppointmentResponse,
  AppointmentRequest,
  Partial<AppointmentRequest>
> {
  lookups: AppointmentsTableLookups
  confirmAppointment: (id: string) => Promise<boolean>
}

/**
PATTERN: Thin view uses this composable + a he...
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

  /** Type guard: narrows string to keyof AppointmentResponse so we can index without cast. */
  const isAppointmentResponseKey = (obj: AppointmentResponse, field: string): field is keyof AppointmentResponse =>
    field in obj

  const getDisplayValue = (appointment: AppointmentResponse, field: string): string => {
    const value = isAppointmentResponseKey(appointment, field) ? appointment[field] : undefined
    const formatter = getAppointmentFieldFormatter(field)
    return formatter(appointment, value, properties.value, users.value)
  }

  const getPropertyById = (propertyVersionId: string | null | undefined): PropertyResponse | undefined => {
    if (!propertyVersionId) return undefined
    return properties.value.find(p => p.propertyVersionId === propertyVersionId || p.id === propertyVersionId)
  }

  const getUserById = (userId: string | null | undefined): UserResponse | undefined => {
    if (!userId) return undefined
    return users.value.find(u => u.id === userId)
  }

  const getPropertyTypeNames = (propertyVersionId: string | null | undefined): string => {
    const property = getPropertyById(propertyVersionId)
    if (!property?.propertyTypes || property.propertyTypes.length === 0) return '—'

    const names = property.propertyTypes
      .map(pt => pt.blockInstance?.name)
      .filter(Boolean)

    return names.length ? names.join(', ') : '—'
  }

  const confirmAppointment = async (id: string): Promise<boolean> => {
    try {
      await update.mutateAsync({ id, data: { status: 'confirmed' } as Partial<AppointmentRequest> })
      success(APPOINTMENTS_TABLE_UI.CONFIRM_SUCCESS)
      return true
    } catch (err) {
      logger.error(APPOINTMENTS_TABLE_UI.CONFIRM_ERROR, { error: err, appointmentId: id })
      error(APPOINTMENTS_TABLE_UI.CONFIRM_ERROR)
      return false
    }
  }

  const crud = useCrudDataTableModel<AppointmentResponse, AppointmentRequest, Partial<AppointmentRequest>>({
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
    getCreateDefaults: () => ({
      status: 'started',
      isQuoteMode: false,
      scheduledById: null,
    } as AppointmentRequest),
    validateCreate: (payload) => {
      if (!payload.propertyVersionId) return 'Property is required'
      return null
    },
    mapItemToEditPayload: (appointment) => ({
      propertyVersionId: appointment.propertyVersionId || null,
      userTypeBlockId: appointment.userTypeId || null,
      selectedOptionIds: appointment.selectedOptionIds || null,
      selectedDate: appointment.selectedDate || null,
      selectedDateRangeEnd: appointment.selectedDateRangeEnd || null,
      selectedTimeSlots: appointment.selectedTimeSlots ? (appointment.selectedTimeSlots as Array<{ time: string; duration: number }>).map(slot => ({
        startTime: slot.time,
        endTime: slot.time, // NOTE: endTime not available in this slot format, using startTime
        duration: slot.duration
      })) : null,
      isQuoteMode: appointment.isQuoteMode,
      quotePdfUrl: appointment.quotePdfUrl || null,
      status: appointment.status,
      /** scheduledById: Tracks which user engaged/interacted with the scheduler */
      scheduledById: appointment.scheduledById || null,
      propertyDetails: appointment.propertyDetails || null,
      /** Attendees array replaces legacy clientId/agentId/additionalContacts */
      attendees: appointment.attendees?.map(attendee => ({
        userId: attendee.userId,
        userTypeBlockInstanceId: attendee.userTypeBlockInstanceId || null,
        shouldReceiveInvitation: attendee.shouldReceiveInvitation ?? true,
      })) || null,
    }),
  })

  return {
    ...crud.data,
    ...crud.editState,
    ...crud.dialogs,
    ...crud.actions,
    lookups: {
      properties,
      users,
      getDisplayValue,
      getPropertyById,
      getUserById,
      getPropertyTypeNames,
    },
    confirmAppointment,
  }
}


