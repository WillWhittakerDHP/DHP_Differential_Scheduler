import { computed } from 'vue'
import { useAppointment } from '@/composables/useAppointment'
import type { AppointmentRequest, AppointmentResponse } from '@/types/appointment'
import { useCrudDataTableModel } from './useCrudDataTableModel'
import { mapAppointmentToEditPayload } from '@/utils/appointment/mapAppointmentToEditPayload'
import { useNotification } from '@/composables/useNotification'
import { APPOINTMENT_STATUS_STARTED } from '@shared/constants/appointmentStatusLiterals'
import type { CrudDataTableModel } from '@/types/admin/tables/crudDataTableModel'
import { useAppointmentsTableLookups, type AppointmentsTableLookups } from './useAppointmentsTableLookups'
import { useAppointmentsTableStatusActions } from './useAppointmentsTableStatusActions'

interface AppointmentsTableModel extends CrudDataTableModel<
  AppointmentResponse,
  AppointmentRequest,
  Partial<AppointmentRequest>
> {
  lookups: AppointmentsTableLookups
  confirmAppointment: (id: string) => Promise<boolean>
  markCancelled: (id: string) => Promise<boolean>
}

/**
 * PATTERN: Thin view uses this composable + a he...
 */
export function useAppointmentsTableModel(): AppointmentsTableModel {
  const { success, error } = useNotification()
  const { fetchAll, create, update, remove } = useAppointment()
  const lookups = useAppointmentsTableLookups()
  const { confirmAppointment, markCancelled } = useAppointmentsTableStatusActions()

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
    getCreateDefaults: () =>
      ({
        status: APPOINTMENT_STATUS_STARTED,
        isQuoteMode: false,
        scheduledById: null,
      }) as AppointmentRequest,
    validateCreate: (payload) => {
      if (!payload.propertyVersionId) return 'Property is required'
      return null
    },
    mapItemToEditPayload: mapAppointmentToEditPayload,
  })

  return {
    ...crud.data,
    ...crud.editState,
    ...crud.dialogs,
    ...crud.actions,
    lookups,
    confirmAppointment,
    markCancelled,
  }
}
