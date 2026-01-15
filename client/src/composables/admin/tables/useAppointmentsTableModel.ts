import { computed, type ComputedRef } from 'vue'
import { useAppointment } from '@/composables/useAppointment'
import { useProperty } from '@/composables/useProperty'
import { useUser } from '@/composables/useUser'
import { useNotification } from '@/composables/useNotification'
import type { AppointmentRequest, AppointmentResponse } from '@/types/appointment'
import type { PropertyResponse } from '@/types/property'
import type { UserResponse } from '@/types/user'
import { useCrudDataTableModel, type CrudDataTableModel } from './useCrudDataTableModel'
import { getAppointmentFieldFormatter } from '@/utils/appointmentFieldFormatters'

export interface AppointmentsTableModel extends CrudDataTableModel<
  AppointmentResponse,
  AppointmentRequest,
  Partial<AppointmentRequest>
> {
  properties: ComputedRef<PropertyResponse[]>
  users: ComputedRef<UserResponse[]>
  getDisplayValue: (appointment: AppointmentResponse, field: string) => string
  getPropertyById: (propertyVersionId: string | null | undefined) => PropertyResponse | undefined
  getUserById: (userId: string | null | undefined) => UserResponse | undefined
  getPropertyTypeNames: (propertyVersionId: string | null | undefined) => string
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

  // FIX: Use config-driven field formatters instead of repeated field checks
  const getDisplayValue = (appointment: AppointmentResponse, field: string): string => {
    const value = (appointment as unknown as Record<string, unknown>)[field]
    const formatter = getAppointmentFieldFormatter(field)
    return formatter(appointment, value, properties.value, users.value)
  }

  /**
   * LEARNING: Helper to find property by ID for tooltip display
   * WHY: Retrieves full property data for tooltip content
   */
  const getPropertyById = (propertyVersionId: string | null | undefined): PropertyResponse | undefined => {
    if (!propertyVersionId) return undefined
    return properties.value.find(p => p.propertyVersionId === propertyVersionId || p.id === propertyVersionId)
  }

  /**
   * LEARNING: Helper to find user by ID for tooltip display
   * WHY: Retrieves full user data for tooltip content
   */
  const getUserById = (userId: string | null | undefined): UserResponse | undefined => {
    if (!userId) return undefined
    return users.value.find(u => u.id === userId)
  }

  /**
   * LEARNING: Helper to derive property type names for display
   * WHY: Appointments should show the property type(s) now that properties are normalized
   * PATTERN: Look up the property by propertyVersionId and join its type names
   */
  const getPropertyTypeNames = (propertyVersionId: string | null | undefined): string => {
    const property = getPropertyById(propertyVersionId)
    if (!property?.propertyTypes || property.propertyTypes.length === 0) return '—'

    const names = property.propertyTypes
      .map(pt => pt.blockInstance?.name)
      .filter(Boolean)

    return names.length ? names.join(', ') : '—'
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
    getPropertyById,
    getUserById,
    getPropertyTypeNames,
  }
}


