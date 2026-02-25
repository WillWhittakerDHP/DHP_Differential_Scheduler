/**
 * Composable that wires matchLoadedTimeSlotsImmutable to Vue refs.
 * Pure logic lives in utils/booking/timeSlotMatching.ts.
 */
import type { Ref } from 'vue'
import type { TimeSlot } from '@/types/appointment'
import {
  matchLoadedTimeSlotsImmutable,
  type LoadedTimeSlot,
} from '@/utils/booking/timeSlotMatching'

/**
 * Match loaded time slots to available slots and update refs (major → inspector, minor → client).
 */
export function matchLoadedTimeSlots(
  loadedSlots: LoadedTimeSlot[],
  availableSlots: TimeSlot[],
  majorAppointmentSlotRef: Ref<TimeSlot | null>,
  minorAppointmentSlotRef: Ref<TimeSlot | null>
): void {
  const { inspectorSlot, clientSlot } = matchLoadedTimeSlotsImmutable(
    loadedSlots,
    availableSlots
  )
  majorAppointmentSlotRef.value = inspectorSlot
  minorAppointmentSlotRef.value = clientSlot
}
