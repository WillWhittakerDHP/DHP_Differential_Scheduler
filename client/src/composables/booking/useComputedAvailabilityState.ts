import { ref } from 'vue'
import type { CalendarEvent } from '@/services/calendarApiService'
import type {
  ComputedSlot,
  ComputedSlotAvailabilityData,
  Constraint,
  DurationRoundingConfig,
} from '@shared/types/availabilityTypes'
import type { ComputedAvailabilityFetchRefs } from '@/composables/booking/computedAvailabilityFetchCore'

/** Same ref bundle as fetch core; split name documents role in composable return (UNIFY with ComputedAvailabilityFetchRefs). */
type ComputedAvailabilityMutableRefs = ComputedAvailabilityFetchRefs

export interface ComputedAvailabilityMutableBundle {
  refs: ComputedAvailabilityMutableRefs
  fetchRefs: ComputedAvailabilityFetchRefs
  clearSlotsCache: () => void
}

export function useComputedAvailabilityState(): ComputedAvailabilityMutableBundle {
  const calendarEvents = ref<CalendarEvent[]>([])
  const slotsByDay = ref<Map<string, ComputedSlot[]>>(new Map())
  const constraints = ref<Constraint[]>([])
  const minuteIncrement = ref<number>(15)
  const timezone = ref<string | undefined>(undefined)
  const durationRounding = ref<DurationRoundingConfig | undefined>(undefined)
  const outOfOfficeEvents = ref<CalendarEvent[]>([])
  const computedDataMeta = ref<ComputedSlotAvailabilityData['_meta'] | null>(null)
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  const fetchRefs: ComputedAvailabilityFetchRefs = {
    slotsByDay,
    calendarEvents,
    constraints,
    minuteIncrement,
    timezone,
    durationRounding,
    outOfOfficeEvents,
    computedDataMeta,
    isLoading,
    error,
  }

  const clearSlotsCache = (): void => {
    slotsByDay.value = new Map()
  }

  const refs: ComputedAvailabilityMutableRefs = {
    calendarEvents,
    slotsByDay,
    constraints,
    minuteIncrement,
    timezone,
    durationRounding,
    outOfOfficeEvents,
    computedDataMeta,
    isLoading,
    error,
  }

  return {
    refs,
    fetchRefs,
    clearSlotsCache,
  }
}
