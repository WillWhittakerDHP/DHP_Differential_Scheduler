/**
 * WHY: Route query + localStorage hydration for appointment load (extracted from composable onMounted).
 */

import type { Ref } from 'vue'
import type { RouteLocationNormalizedLoaded } from 'vue-router'

const PERSIST_KEY_APPOINTMENT_ID_CORE = 'booking-wizard-appointment-id'

export const PERSIST_KEY_APPOINTMENT_ID = PERSIST_KEY_APPOINTMENT_ID_CORE

function isRescheduleOrQuoteMode(mode: string): mode is 'reschedule' | 'quote' {
  return mode === 'reschedule' || mode === 'quote'
}

export function scheduleInitialAppointmentLoadFromRouteAndStorage(
  route: RouteLocationNormalizedLoaded,
  loadedAppointmentId: Ref<string | null>,
  load: (appointmentId: string, options?: { mode?: 'reschedule' | 'quote' }) => void | Promise<void>
): void {
  const queryMode = route.query.mode as string | undefined
  const queryAppointmentId = route.query.appointmentId as string | undefined

  if (queryMode && queryAppointmentId && isRescheduleOrQuoteMode(queryMode)) {
    void load(queryAppointmentId, { mode: queryMode })
    return
  }

  if (typeof localStorage === 'undefined') {
    return
  }
  const persistedId = localStorage.getItem(PERSIST_KEY_APPOINTMENT_ID_CORE)
  if (persistedId && !loadedAppointmentId.value) {
    void load(persistedId)
  }
}

