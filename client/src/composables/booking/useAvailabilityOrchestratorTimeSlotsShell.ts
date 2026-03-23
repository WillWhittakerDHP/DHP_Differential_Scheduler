import { computed, shallowRef, type ComputedRef, type ShallowRef } from 'vue'
import type { TimeSlot } from '@/types/appointment'

export interface AvailabilityOrchestratorTimeSlotsShell {
  timeSlotsWrapper: ShallowRef<ComputedRef<TimeSlot[]> | null>
  timeSlotsForDefaults: ComputedRef<TimeSlot[] | null>
  timeSlotsForLogic: ComputedRef<TimeSlot[]>
}

export function createAvailabilityOrchestratorTimeSlotsShell(): AvailabilityOrchestratorTimeSlotsShell {
  const timeSlotsWrapper = shallowRef<ComputedRef<TimeSlot[]> | null>(null)
  const timeSlotsForDefaults = computed<TimeSlot[] | null>(() => {
    const inner = timeSlotsWrapper.value
    if (inner === null) return null
    return inner.value
  })
  const timeSlotsForLogic = computed<TimeSlot[]>(() => {
    const inner = timeSlotsWrapper.value
    if (inner === null) return []
    return inner.value
  })

  return { timeSlotsWrapper, timeSlotsForDefaults, timeSlotsForLogic }
}
