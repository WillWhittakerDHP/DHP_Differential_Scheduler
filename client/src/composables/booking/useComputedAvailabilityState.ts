import { ref } from 'vue'
import type { Ref } from 'vue'
import type { CalendarEvent } from '@/services/calendarApiService'
import type {
  Constraint,
  ComputedSlot,
  ComputedSlotAvailabilityData,
  DurationRoundingConfig,
} from '@shared/types/availabilityTypes'
import type { ComputedAvailabilityFetchRefs } from '@/composables/booking/computedAvailabilityFetchCore'

export interface ComputedAvailabilityMutableBundle {
  calendarEvents: Ref<CalendarEvent[]>
  slotsByDay: Ref<Map<string, ComputedSlot[]>>
  constraints: Ref<Constraint[]>
  minuteIncrement: Ref<number>
  timezone: Ref<string | undefined>
  durationRounding: Ref<DurationRoundingConfig | undefined>
  outOfOfficeEvents: Ref<CalendarEvent[]>
  computedDataMeta: Ref<ComputedSlotAvailabilityData['_meta'] | null>
  isLoading: Ref<boolean>
  error: Ref<Error | null>
  fetchRefs: ComputedAvailabilityFetchRefs
  clearSlotsCache: () => void
}

export function createComputedAvailabilityMutableState(): ComputedAvailabilityMutableBundle {
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

  return {
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
    fetchRefs,
    clearSlotsCache,
  }
}
