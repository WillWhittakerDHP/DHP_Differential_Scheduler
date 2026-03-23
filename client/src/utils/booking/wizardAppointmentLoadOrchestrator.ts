/**
 * WHY: Fetch + transform appointment for wizard load (no UI); composable handles toasts and persistence keys.
 */

import type { AppointmentResponse } from '@/types/appointment'
import type { BookingData } from '@/utils/transformers/globalToBookingTransformer'
import type { WizardStateData } from '@/utils/transformers/appointmentToWizardTransformer'
import { transformAppointmentToWizard } from '@/utils/transformers/appointmentToWizardTransformer'
import { fetchAppointmentForWizardLoad } from '@/utils/booking/wizardAppointmentLoadSteps'
import type { AppLogger } from '@/utils/logger'

type WizardAppointmentResolveOutcome =
  | { ok: true; appointment: AppointmentResponse; wizardState: WizardStateData }
  | { ok: false; message: string }

export async function resolveWizardStateForAppointmentLoad(input: {
  appointmentIdOrRandom: string
  fetchRandom: () => Promise<AppointmentResponse | null>
  loadAppointmentById: (id: string) => Promise<AppointmentResponse | null>
  bookingDataSnapshot: BookingData | null
  logger: AppLogger
}): Promise<WizardAppointmentResolveOutcome> {
  const fetched = await fetchAppointmentForWizardLoad(
    input.appointmentIdOrRandom,
    input.fetchRandom,
    input.loadAppointmentById,
    input.logger
  )
  if (!fetched.ok) {
    return { ok: false, message: fetched.message }
  }

  if (!input.bookingDataSnapshot) {
    return { ok: false, message: 'Unable to load appointment data' }
  }

  try {
    const wizardState = await transformAppointmentToWizard(fetched.appointment, input.bookingDataSnapshot)
    return { ok: true, appointment: fetched.appointment, wizardState }
  } catch (error) {
    input.logger.error('Failed to transform appointment for wizard', { error })
    const message = error instanceof Error ? error.message : 'Failed to load appointment'
    return { ok: false, message }
  }
}
