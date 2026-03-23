/**
 * WHY: Resolve appointment for wizard load (fetch random vs by id) without UI side effects.
 */

import type { AppointmentResponse } from '@/types/appointment'
import { APPOINTMENT_NOT_FOUND } from '@/constants/errorMessages'

export type FetchAppointmentForWizardLoadResult =
  | { ok: true; appointment: AppointmentResponse }
  | { ok: false; message: string }

export interface WizardAppointmentLoadLogger {
  error: (message: string, context?: Record<string, unknown>) => void
}

export async function fetchAppointmentForWizardLoad(
  appointmentIdOrRandom: string,
  fetchRandom: () => Promise<AppointmentResponse | null>,
  loadAppointmentById: (id: string) => Promise<AppointmentResponse | null>,
  logger: WizardAppointmentLoadLogger
): Promise<FetchAppointmentForWizardLoadResult> {
  if (appointmentIdOrRandom === 'random') {
    const appointment = await fetchRandom()
    if (!appointment) {
      return { ok: false, message: 'No appointments available to load' }
    }
    return { ok: true, appointment }
  }

  try {
    const appointment = await loadAppointmentById(appointmentIdOrRandom)
    if (!appointment) {
      return { ok: false, message: APPOINTMENT_NOT_FOUND }
    }
    return { ok: true, appointment }
  } catch (error) {
    logger.error('Error loading appointment by ID', { error })
    const message = error instanceof Error ? error.message : APPOINTMENT_NOT_FOUND
    return { ok: false, message }
  }
}
