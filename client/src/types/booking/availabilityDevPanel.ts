import type { Ref, ComputedRef } from 'vue'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { AppointmentSlot, AppointmentShape } from '@/types/appointment'
import type { RFC3339DateTime, ISO8601Date } from '@shared/types/primitiveBrands'
import type { BusyTimeRange } from '@shared/types/availabilityTypes'
import type { MoveableSchedulingWindow } from '@/types/booking/moveableSchedulingWindow'

export interface UseAvailabilityDevPanelParams {
  selectedBlockInstances: ComputedRef<BookingBlockInstance[]>
  appointmentSlots: ComputedRef<AppointmentSlot[]>
  appointmentShape: ComputedRef<AppointmentShape | null>
  selectedDate: Ref<{ start: ISO8601Date | null; end: ISO8601Date | null }>
  selectedSlot: Ref<AppointmentSlot | null>
  dateRange: ComputedRef<{ start: RFC3339DateTime; end: RFC3339DateTime } | null>
  busyPeriods: Ref<BusyTimeRange[]> | ComputedRef<BusyTimeRange[]>
  refreshKey: Ref<number>
  isEffectivelyDifferential: ComputedRef<boolean>
  /** Transient client-only moveable window; omitted when availability step is not mounted. */
  moveableSchedulingWindow?: ComputedRef<MoveableSchedulingWindow | null>
}
