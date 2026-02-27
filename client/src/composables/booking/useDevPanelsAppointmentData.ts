import type { DevPanelsComputedData } from '@/types/booking/devPanelsComputed'
/**
 * PATTERN: Unwrap dev panel data refs into a single appointmentData computed.
 * WHY: Keeps DevPanelsContainer.vue under vue-architecture script line limit.
 */
import { computed, type ComputedRef } from 'vue'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { AppointmentShape, AppointmentSlot } from '@/types/appointment'
import type { useDevPanelData } from '@/composables/booking/useAvailabilityDevPanel'

function unwrapRef<T>(r: unknown): T {
  if (r && typeof r === 'object' && 'value' in r) return (r as { value: T }).value
  return r as T
}

export function useDevPanelsAppointmentData(
  devPanelData: ReturnType<typeof useDevPanelData>
): ComputedRef<DevPanelsComputedData> {
  return computed<DevPanelsComputedData>(() => {
    const data = devPanelData.value
    const slots: AppointmentSlot[] = Array.isArray(unwrapRef<AppointmentSlot[]>(data.appointmentSlots))
      ? unwrapRef<AppointmentSlot[]>(data.appointmentSlots)
      : []
    const appointmentShape: AppointmentShape | null =
      (unwrapRef<AppointmentShape | null | undefined>(data.appointmentShape) ?? null) as AppointmentShape | null
    const selectedBlockInstances: BookingBlockInstance[] = Array.isArray(
      unwrapRef<BookingBlockInstance[]>(data.selectedBlockInstances)
    )
      ? unwrapRef<BookingBlockInstance[]>(data.selectedBlockInstances)
      : []
    const selectedDate: string | undefined = unwrapRef<string | undefined>(data.selectedDate)
    const selectedTime: string | undefined = unwrapRef<string | undefined>(data.selectedTime)
    return {
      selectedBlockInstances,
      appointmentSlots: slots,
      appointmentShape,
      selectedDate,
      selectedTime,
    }
  })
}
