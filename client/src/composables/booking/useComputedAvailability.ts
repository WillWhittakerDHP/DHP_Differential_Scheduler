
import { ref, watch, computed, type Ref, type ComputedRef } from 'vue'
import { UNKNOWN_ERROR_MESSAGE } from '@/constants/errorMessages'
import type { RFC3339DateTime } from '@shared/types/primitiveBrands'
import type { PropertyDetailsStepData } from '@/types/wizard'
import type { CalendarEvent } from '@/services/calendarApiService'
import type {
  Constraint,
  ComputedSlot,
  ComputedSlotAvailabilityData,
  DurationRoundingConfig,
} from '@shared/types/availabilityTypes'
import { fetchComputedAvailabilityData } from '@/services/calendarApiService'
import { createLogger } from '@/utils/logger'

const logger = createLogger('useComputedAvailability')

/** 14-day prefetch range from today (UTC) */
function getPrefetchDateRange(): { start: RFC3339DateTime; end: RFC3339DateTime } {
  const now = new Date()
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0))
  const end = new Date(start)
  end.setUTCDate(end.getUTCDate() + 14)
  return {
    start: start.toISOString() as RFC3339DateTime,
    end: end.toISOString() as RFC3339DateTime,
  }
}

export interface UseComputedAvailabilityParams {
  propertyDetailsStepData: Ref<PropertyDetailsStepData | null>
  dateRange: ComputedRef<{ start: RFC3339DateTime; end: RFC3339DateTime }>
  activeStep: Ref<number>
  duration?: Ref<number | null>
  /** When user picks a day; if not in cache, we fetch that day ±1 and merge */
  selectedDate?: Ref<string | null>
  /**
   * Controls which external APIs the server calls:
   * - 'real' (default): Full pipeline — Calendar Events API, Routes API, capacity
   * - 'mock': Settings + constraints only — no Google API calls (dev without credentials)
   * - 'none': Minimal response — settings metadata only, empty slots/events (pure UI dev)
   */
  dataSource?: Ref<'real' | 'mock' | 'none'>
}

export interface UseComputedAvailabilityReturn {
  calendarEvents: Ref<CalendarEvent[]>
  /** Cached slots by date key (YYYY-MM-DD); merge from each fetch */
  slotsByDay: Ref<Map<string, ComputedSlot[]>>
  constraints: Ref<Constraint[]>
  computedData: ComputedRef<ComputedSlotAvailabilityData | null>
  isLoading: Ref<boolean>
  error: Ref<Error | null>
}

export function useComputedAvailability(
  params: UseComputedAvailabilityParams
): UseComputedAvailabilityReturn {
  const { propertyDetailsStepData, dateRange, activeStep, duration, selectedDate, dataSource } = params

  const placeId = computed(() => propertyDetailsStepData.value?.candidatePlaceId)

  const canFetchAvailability = computed(() => !!dateRange.value?.start && !!dateRange.value?.end)

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

  function mergeSlotsIntoMap(newSlotsByDay: Record<string, ComputedSlot[]>): void {
    const map = new Map(slotsByDay.value)
    for (const [day, slots] of Object.entries(newSlotsByDay)) {
      map.set(day, slots)
    }
    slotsByDay.value = map
  }

  function clearSlotsCache(): void {
    slotsByDay.value = new Map()
  }

  const fetchWithRange = async (
    range: { start: RFC3339DateTime; end: RFC3339DateTime },
    label: string
  ): Promise<void> => {
    const currentPlaceId = placeId.value
    const rawDuration = duration?.value
    const currentDuration = rawDuration !== undefined && rawDuration !== null ? rawDuration : 60

    isLoading.value = true
    error.value = null

    try {
      logger.debug(`[useComputedAvailability] ${label}:`, range.start, 'to', range.end)

      const data = await fetchComputedAvailabilityData({
        dateRange: { start: range.start, end: range.end },
        candidatePlaceId: currentPlaceId ?? undefined,
        duration: currentDuration,
        dataSource: dataSource?.value ?? 'real',
      })

      mergeSlotsIntoMap(data.slotsByDay)
      calendarEvents.value = data.calendarEvents
      constraints.value = data.constraints
      minuteIncrement.value = data.minuteIncrement
      timezone.value = data.timezone
      durationRounding.value = data.durationRounding
      outOfOfficeEvents.value = data.outOfOfficeEvents
      computedDataMeta.value = data._meta
    } catch (err) {
      logger.error(err)
      const errorMessage = err instanceof Error ? err.message : UNKNOWN_ERROR_MESSAGE
      error.value = err instanceof Error ? err : new Error(errorMessage)
      logger.error('[useComputedAvailability] Failed to fetch computed availability', { error: err })
      if (label === 'prefetch') {
        calendarEvents.value = []
        constraints.value = []
        minuteIncrement.value = 15
        timezone.value = undefined
        durationRounding.value = undefined
        outOfOfficeEvents.value = []
        computedDataMeta.value = null
      }
    } finally {
      isLoading.value = false
    }
  }

  const lastPlaceId = ref<string | undefined>(undefined)
  const lastDuration = ref<number>(60)

  /** Prefetch: 14 days from today; clear cache when placeId or duration changes */
  watch(
    [activeStep, placeId, duration],
    () => {
      if (!canFetchAvailability.value) return

      const pid = placeId.value
      const rawDur = duration?.value
      const dur = rawDur !== undefined && rawDur !== null ? rawDur : 60
      if (lastPlaceId.value !== pid || lastDuration.value !== dur) {
        clearSlotsCache()
        lastPlaceId.value = pid
        lastDuration.value = dur
      }

      fetchWithRange(getPrefetchDateRange(), 'prefetch')
    },
    { immediate: true }
  )

  watch(
    dateRange,
    (newRange) => {
      if (!canFetchAvailability.value) return
      const monthEndDay = newRange.end.slice(0, 10)
      if (slotsByDay.value.has(monthEndDay)) return
      logger.debug('[useComputedAvailability] month-prefetch: displayed month not in cache, fetching', newRange.start, 'to', newRange.end)
      fetchWithRange(newRange, 'month-prefetch')
    }
  )

  /** Per-day fallback: when selectedDate is set and not in cache, fetch that day ±1 */
  if (selectedDate) {
    watch(
      selectedDate,
      (day) => {
        if (!day || !canFetchAvailability.value) return
        if (slotsByDay.value.has(day)) return

        const startDate = new Date(day + 'T00:00:00.000Z')
        const startDay = new Date(startDate)
        startDay.setUTCDate(startDay.getUTCDate() - 1)
        const endDay = new Date(startDate)
        endDay.setUTCDate(endDay.getUTCDate() + 2)
        const startStr = startDay.toISOString().slice(0, 10)
        const endStr = endDay.toISOString().slice(0, 10)
        const range = {
          start: `${startStr}T00:00:00.000Z` as RFC3339DateTime,
          end: `${endStr}T00:00:00.000Z` as RFC3339DateTime,
        }
        fetchWithRange(range, 'per-day')
      },
      { immediate: true }
    )
  }

  const computedData = computed<ComputedSlotAvailabilityData | null>(() => {
    if (!computedDataMeta.value) return null
    const map = slotsByDay.value
    const slotsByDayRecord: Record<string, ComputedSlot[]> = Object.fromEntries(map)
    return {
      slotsByDay: slotsByDayRecord,
      constraints: constraints.value,
      minuteIncrement: minuteIncrement.value,
      timezone: timezone.value,
      durationRounding: durationRounding.value,
      calendarEvents: calendarEvents.value,
      outOfOfficeEvents: outOfOfficeEvents.value,
      _meta: computedDataMeta.value,
    }
  })

  return {
    calendarEvents,
    slotsByDay,
    constraints,
    computedData,
    isLoading,
    error,
  }
}
