import type { Ref } from 'vue'
import type { RFC3339DateTime } from '@shared/types/primitiveBrands'
import type { CalendarEvent } from '@/services/calendarApiService'
import type {
  Constraint,
  ComputedSlot,
  ComputedSlotAvailabilityData,
  DurationRoundingConfig,
} from '@shared/types/availabilityTypes'
import { fetchComputedAvailabilityData } from '@/services/calendarApiService'
import { UNKNOWN_ERROR_MESSAGE } from '@/constants/errorMessages'
import { createLogger } from '@/utils/logger'

const logger = createLogger('computedAvailabilityFetchCore')

/** 14-day prefetch range from today (UTC) */
export function getPrefetchDateRange(): { start: RFC3339DateTime; end: RFC3339DateTime } {
  const now = new Date()
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0))
  const end = new Date(start)
  end.setUTCDate(end.getUTCDate() + 14)
  return {
    start: start.toISOString() as RFC3339DateTime,
    end: end.toISOString() as RFC3339DateTime,
  }
}

function mergeSlotsIntoMap(
  existing: Map<string, ComputedSlot[]>,
  newSlotsByDay: Record<string, ComputedSlot[]>
): Map<string, ComputedSlot[]> {
  const map = new Map(existing)
  for (const [day, slots] of Object.entries(newSlotsByDay)) {
    map.set(day, slots)
  }
  return map
}

export interface ComputedAvailabilityFetchRefs {
  slotsByDay: Ref<Map<string, ComputedSlot[]>>
  calendarEvents: Ref<CalendarEvent[]>
  constraints: Ref<Constraint[]>
  minuteIncrement: Ref<number>
  timezone: Ref<string | undefined>
  durationRounding: Ref<DurationRoundingConfig | undefined>
  outOfOfficeEvents: Ref<CalendarEvent[]>
  computedDataMeta: Ref<ComputedSlotAvailabilityData['_meta'] | null>
  isLoading: Ref<boolean>
  error: Ref<Error | null>
}

export async function fetchComputedAvailabilityForRange(
  refs: ComputedAvailabilityFetchRefs,
  range: { start: RFC3339DateTime; end: RFC3339DateTime },
  label: string,
  request: {
    placeId: string | undefined
    appointmentId: string | null
    duration: number
    dataSource: 'real' | 'mock' | 'none'
  }
): Promise<void> {
  const { placeId, appointmentId, duration, dataSource } = request

  refs.isLoading.value = true
  refs.error.value = null

  try {
    logger.debug(`[useComputedAvailability] ${label}:`, range.start, 'to', range.end)

    const data = await fetchComputedAvailabilityData({
      dateRange: { start: range.start, end: range.end },
      candidatePlaceId: placeId ?? undefined,
      appointmentId: appointmentId ?? undefined,
      duration,
      dataSource,
    })

    refs.slotsByDay.value = mergeSlotsIntoMap(refs.slotsByDay.value, data.slotsByDay)
    refs.calendarEvents.value = data.calendarEvents
    refs.constraints.value = data.constraints
    refs.minuteIncrement.value = data.minuteIncrement
    refs.timezone.value = data.timezone
    refs.durationRounding.value = data.durationRounding
    refs.outOfOfficeEvents.value = data.outOfOfficeEvents
    refs.computedDataMeta.value = data._meta
  } catch (err) {
    logger.error(err)
    const errorMessage = err instanceof Error ? err.message : UNKNOWN_ERROR_MESSAGE
    refs.error.value = err instanceof Error ? err : new Error(errorMessage)
    logger.error('[useComputedAvailability] Failed to fetch computed availability', { error: err })
    if (label === 'prefetch') {
      refs.calendarEvents.value = []
      refs.constraints.value = []
      refs.minuteIncrement.value = 15
      refs.timezone.value = undefined
      refs.durationRounding.value = undefined
      refs.outOfOfficeEvents.value = []
      refs.computedDataMeta.value = null
    }
  } finally {
    refs.isLoading.value = false
  }
}

export function buildComputedSlotAvailabilityData(
  slotsByDay: Map<string, ComputedSlot[]>,
  constraints: Constraint[],
  minuteIncrement: number,
  timezone: string | undefined,
  durationRounding: DurationRoundingConfig | undefined,
  calendarEvents: CalendarEvent[],
  outOfOfficeEvents: CalendarEvent[],
  computedDataMeta: ComputedSlotAvailabilityData['_meta'] | null
): ComputedSlotAvailabilityData | null {
  if (!computedDataMeta) return null
  const slotsByDayRecord: Record<string, ComputedSlot[]> = Object.fromEntries(slotsByDay)
  return {
    slotsByDay: slotsByDayRecord,
    constraints,
    minuteIncrement,
    timezone,
    durationRounding,
    calendarEvents,
    outOfOfficeEvents,
    _meta: computedDataMeta,
  }
}

export function perDayRangeAroundUtcDate(day: string): { start: RFC3339DateTime; end: RFC3339DateTime } {
  const startDate = new Date(day + 'T00:00:00.000Z')
  const startDay = new Date(startDate)
  startDay.setUTCDate(startDay.getUTCDate() - 1)
  const endDay = new Date(startDate)
  endDay.setUTCDate(endDay.getUTCDate() + 2)
  const startStr = startDay.toISOString().slice(0, 10)
  const endStr = endDay.toISOString().slice(0, 10)
  return {
    start: `${startStr}T00:00:00.000Z` as RFC3339DateTime,
    end: `${endStr}T00:00:00.000Z` as RFC3339DateTime,
  }
}
