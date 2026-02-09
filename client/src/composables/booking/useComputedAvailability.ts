/**
 * useComputedAvailability Composable
 * 
 * LEARNING: Fetches and holds the server's pre-computed availability data
 * WHY: Single API call replaces multiple client-side API calls (free-busy, events, drive time, constraints)
 * PATTERN: Watches dateRange/duration/placeId, fetches ComputedAvailabilityData from server, distributes to reactive refs
 * 
 * Phase 6: Created for server-side computed availability refactor
 * Phase 11: Renamed from useApiOrchestrator — name now reflects actual role (fetch + hold, not orchestrate)
 */

import { ref, watch, computed, type Ref, type ComputedRef } from 'vue'
import type { RFC3339DateTime } from '@/types/datetime'
import type { PropertyDetailsStepData } from '@/types/wizard'
import type { CalendarEvent } from '@/services/calendarApiService'
import type { BusyTimeRange } from '@/utils/booking/timeSlotFitter'
import type {
  RangeConstraint,
  OverlapConstraint,
  CapacityConstraint,
  ComputedAvailabilityData,
  DurationRoundingConfig,
} from '@shared/types/availabilityTypes'
import { fetchComputedAvailabilityData } from '@/services/calendarApiService'
import { createLogger } from '@/utils/logger'

const logger = createLogger('useComputedAvailability')

export interface UseComputedAvailabilityParams {
  /** Property details step data (contains placeId) */
  propertyDetailsStepData: Ref<PropertyDetailsStepData | null>
  
  /** Date range for displayed calendar month */
  dateRange: ComputedRef<{ start: RFC3339DateTime; end: RFC3339DateTime }>
  
  /** Current active step index (0-based) */
  activeStep: Ref<number>
  
  /** Appointment duration in minutes (for capacity calculations) */
  duration?: Ref<number | null>
}

export interface UseComputedAvailabilityReturn {
  /** Prefetched calendar events for displayed month */
  calendarEvents: Ref<CalendarEvent[]>
  
  /** Prefetched busy times for displayed month */
  busyTimes: Ref<BusyTimeRange[]>
  
  /** Prefetched range constraints */
  rangeConstraints: Ref<RangeConstraint[]>
  
  /** Prefetched overlap constraints */
  overlapConstraints: Ref<OverlapConstraint[]>
  
  /** Prefetched capacity constraints */
  capacityConstraints: Ref<CapacityConstraint[]>
  
  /** Precomputed drive times by date */
  driveTimesByDate: Ref<Record<string, { driveTimeTo?: number; driveTimeFrom?: number }>>
  
  /** Precomputed scheduled hours by capacity key */
  scheduledHoursByKey: Ref<Record<string, number>>
  
  /** Complete computed availability data object (reconstructed from individual pieces) */
  computedData: ComputedRef<ComputedAvailabilityData | null>
  
  /** Whether availability data is currently being fetched */
  isLoading: Ref<boolean>
  
  /** Error from last fetch attempt */
  error: Ref<Error | null>
}

/**
 * useComputedAvailability
 * 
 * LEARNING: Fetches server-computed availability data and holds it in reactive refs
 * WHY: Server computes constraints, busy periods, drive times, and calendar events in one call
 * PATTERN: Single fetch replaces the old multi-API orchestration chain
 * 
 * Triggers re-fetch when:
 * - dateRange changes (user navigates calendar months)
 * - placeId becomes available (drive time data improves)
 * - duration changes (affects capacity calculations)
 * - activeStep changes (placeId may have been set)
 */
export function useComputedAvailability(
  params: UseComputedAvailabilityParams
): UseComputedAvailabilityReturn {
  const { propertyDetailsStepData, dateRange, activeStep, duration } = params
  
  const placeId = computed(() => propertyDetailsStepData.value?.placeId)
  
  // LEARNING: Run whenever dateRange is available
  // WHY: Server handles all API work and placeId is optional (drive times return empty without it)
  //      Duration defaults to 60 minutes on server if not provided, so not required for guard
  // PATTERN: Fetch early so data is ready by the time user reaches the availability step
  // Phase 11: Removed legacy step/placeId gate — server gracefully handles missing placeId
  // Phase 12: Removed duration requirement — server defaults to 60 minutes, fetch re-triggers when duration changes
  const canFetchAvailability = computed(() => {
    return !!dateRange.value?.start && !!dateRange.value?.end
  })
  
  const calendarEvents = ref<CalendarEvent[]>([])
  const busyTimes = ref<BusyTimeRange[]>([])
  const rangeConstraints = ref<RangeConstraint[]>([])
  const overlapConstraints = ref<OverlapConstraint[]>([])
  const capacityConstraints = ref<CapacityConstraint[]>([])
  const driveTimesByDate = ref<Record<string, { driveTimeTo?: number; driveTimeFrom?: number }>>({})
  const scheduledHoursByKey = ref<Record<string, number>>({})
  const minuteIncrement = ref<number>(15)
  const timezone = ref<string | undefined>(undefined)
  const durationRounding = ref<DurationRoundingConfig | undefined>(undefined)
  const outOfOfficeEvents = ref<CalendarEvent[]>([])
  const computedDataMeta = ref<ComputedAvailabilityData['_meta'] | null>(null)
  const isLoading = ref(false)
  const error = ref<Error | null>(null)
  
  // DEBUG: Log placeId changes
  watch(placeId, (newPlaceId, oldPlaceId) => {
    if (newPlaceId !== oldPlaceId) {
      logger.debug(
        '[useComputedAvailability] placeId changed:',
        `from=${oldPlaceId || '(none)'}`,
        `to=${newPlaceId || '(none)'}`,
        `propertyDetailsStepData=${JSON.stringify(propertyDetailsStepData.value ? { address: propertyDetailsStepData.value.address, placeId: propertyDetailsStepData.value.placeId } : null)}`
      )
    }
  }, { immediate: true })
  
  /**
   * Fetch computed availability data from the server
   * LEARNING: Single API call that returns all pre-computed availability data
   * WHY: Eliminates multiple client-side API calls and constraint extraction
   * 
   * Phase 6: Server-Side Computed Availability Data Refactor
   */
  const fetchComputedAvailability = async (): Promise<void> => {
    const currentPlaceId = placeId.value
    const currentDateRange = dateRange.value
    const currentDuration = duration?.value || 60 // Default to 60 minutes if duration not available
    
    // Guard: Only run if we have a valid dateRange
    if (!canFetchAvailability.value) {
      logger.debug(
        '[useComputedAvailability] Skipping fetch - missing dateRange',
        `dateRange=${currentDateRange?.start || '(none)'} to ${currentDateRange?.end || '(none)'}`,
        'Will fetch when dateRange is available'
      )
      return
    }
    
    isLoading.value = true
    error.value = null
    
    try {
      logger.debug(
        '[useComputedAvailability] Fetching computed availability data:',
        `placeId=${currentPlaceId || '(none)'}`,
        `dateRange=${currentDateRange.start} to ${currentDateRange.end}`,
        `duration=${currentDuration} minutes`
      )
      
      // Single API call that returns everything
      const data = await fetchComputedAvailabilityData({
        dateRange: {
          start: currentDateRange.start,
          end: currentDateRange.end,
        },
        placeId: currentPlaceId || undefined,
        duration: currentDuration,
        dataSource: 'real', // TODO: Support dataSource toggle from dev panel
      })
      
      // Distribute returned data to existing refs
      calendarEvents.value = data.calendarEvents
      busyTimes.value = data.busyPeriods
      rangeConstraints.value = data.rangeConstraints
      overlapConstraints.value = data.overlapConstraints
      capacityConstraints.value = data.capacityConstraints
      driveTimesByDate.value = data.driveTimesByDate
      scheduledHoursByKey.value = data.scheduledHoursByKey
      minuteIncrement.value = data.minuteIncrement
      timezone.value = data.timezone
      durationRounding.value = data.durationRounding
      outOfOfficeEvents.value = data.outOfOfficeEvents
      computedDataMeta.value = data._meta
      
      logger.debug(
        '[useComputedAvailability] Computed data received:',
        `rangeConstraints=${data.rangeConstraints.length}`,
        `overlapConstraints=${data.overlapConstraints.length}`,
        `capacityConstraints=${data.capacityConstraints.length}`,
        `busyPeriods=${data.busyPeriods.length}`,
        `calendarEvents=${data.calendarEvents.length}`,
        `outOfOfficeEvents=${data.outOfOfficeEvents.length}`,
        `driveTimesByDate=${Object.keys(data.driveTimesByDate).length} dates`,
        `scheduledHoursByKey=${Object.keys(data.scheduledHoursByKey).length} keys`
      )
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      error.value = err instanceof Error ? err : new Error(errorMessage)
      logger.error('[useComputedAvailability] Failed to fetch computed availability data', { error: err })
      
      // Clear all data on error
      calendarEvents.value = []
      busyTimes.value = []
      rangeConstraints.value = []
      overlapConstraints.value = []
      capacityConstraints.value = []
      driveTimesByDate.value = {}
      scheduledHoursByKey.value = {}
      minuteIncrement.value = 15
      timezone.value = undefined
      durationRounding.value = undefined
      outOfOfficeEvents.value = []
      computedDataMeta.value = null
    } finally {
      isLoading.value = false
    }
  }
  
  // Watch for changes that should trigger a re-fetch
  // LEARNING: Re-fetches when:
  //   - activeStep changes (placeId may have been set in Property Details step)
  //   - placeId becomes available (drive time data improves)
  //   - Month changes (dateRange updates)
  //   - Duration changes (affects capacity calculations)
  // WHY: Ensures data stays current as user progresses through booking flow
  watch(
    [activeStep, placeId, dateRange, duration],
    () => {
      fetchComputedAvailability()
    },
    { immediate: true }
  )
  
  // Reconstruct ComputedAvailabilityData from individual pieces
  // WHY: useAvailability expects the full ComputedAvailabilityData object
  // PATTERN: Computed property that reconstructs the object when all pieces are available
  const computedData = computed<ComputedAvailabilityData | null>(() => {
    // Only return data if we have the essential pieces (meta indicates successful fetch)
    if (!computedDataMeta.value) {
      return null
    }
    
    return {
      rangeConstraints: rangeConstraints.value,
      overlapConstraints: overlapConstraints.value,
      capacityConstraints: capacityConstraints.value,
      minuteIncrement: minuteIncrement.value,
      timezone: timezone.value,
      durationRounding: durationRounding.value,
      busyPeriods: busyTimes.value,
      calendarEvents: calendarEvents.value,
      outOfOfficeEvents: outOfOfficeEvents.value,
      driveTimesByDate: driveTimesByDate.value,
      scheduledHoursByKey: scheduledHoursByKey.value,
      _meta: computedDataMeta.value,
    }
  })
  
  return {
    calendarEvents,
    busyTimes,
    rangeConstraints,
    overlapConstraints,
    capacityConstraints,
    driveTimesByDate,
    scheduledHoursByKey,
    computedData,
    isLoading,
    error
  }
}
