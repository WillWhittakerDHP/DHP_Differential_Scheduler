import { useAppointment } from '@/composables/useAppointment'
import { useNotification } from '@/composables/useNotification'
import type { AppointmentRequest } from '@/types/appointment'
import { APPOINTMENTS_TABLE_UI } from '@/constants/appointmentsTableConstants'
import { createLogger } from '@/utils/logger'
import {
  APPOINTMENT_STATUS_CANCELLED,
  APPOINTMENT_STATUS_CONFIRMED,
} from '@shared/constants/appointmentStatusLiterals'

const logger = createLogger('useAppointmentsTableStatusActions')

export function useAppointmentsTableStatusActions(): {
  confirmAppointment: (id: string) => Promise<boolean>
  markCancelled: (id: string) => Promise<boolean>
} {
  const { success, error } = useNotification()
  const { update } = useAppointment()

  const confirmAppointment = async (id: string): Promise<boolean> => {
    try {
      await update.mutateAsync({ id, data: { status: APPOINTMENT_STATUS_CONFIRMED } as Partial<AppointmentRequest> })
      success(APPOINTMENTS_TABLE_UI.CONFIRM_SUCCESS)
      return true
    } catch (err) {
      logger.error(APPOINTMENTS_TABLE_UI.CONFIRM_ERROR, { error: err, appointmentId: id })
      error(APPOINTMENTS_TABLE_UI.CONFIRM_ERROR)
      return false
    }
  }

  const markCancelled = async (id: string): Promise<boolean> => {
    try {
      await update.mutateAsync({ id, data: { status: APPOINTMENT_STATUS_CANCELLED } as Partial<AppointmentRequest> })
      success(APPOINTMENTS_TABLE_UI.MARK_CANCELLED_SUCCESS)
      return true
    } catch (err) {
      logger.error(APPOINTMENTS_TABLE_UI.MARK_CANCELLED_ERROR, { error: err, appointmentId: id })
      error(APPOINTMENTS_TABLE_UI.MARK_CANCELLED_ERROR)
      return false
    }
  }

  return { confirmAppointment, markCancelled }
}
