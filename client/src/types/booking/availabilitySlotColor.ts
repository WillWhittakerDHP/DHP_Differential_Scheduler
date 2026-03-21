import type { ComputedRef, Ref } from 'vue'
import type { ComputedSlot } from '@shared/types/availabilityTypes'

export interface UseAvailabilitySlotColorParams {
  startTimeType: Ref<'major' | 'minor' | 'nonDifferential'>
  slotsByDay: Ref<Map<string, ComputedSlot[]>>
}

export interface UseAvailabilitySlotColorReturn {
  slotColor: ComputedRef<'primary' | 'secondary'>
  allowedDates: ComputedRef<(date: unknown) => boolean>
  firstAvailableDate: ComputedRef<string | null>
}
