/**
 * useAvailableStartTimes Composable
 * 
 * LEARNING: Generates available start times for appointment buttons based on availability settings
 * WHY: Separates time generation logic from component, makes it reactive and reusable
 * PATTERN: Composable that takes selected date and returns computed start times array
 */

import { computed, ref, watchEffect, type ComputedRef, type Ref } from 'vue'
import { getAvailabilitySettings } from '@/configs/availabilitySettings'
import type { AvailabilitySettings } from '@/configs/availabilitySettings'
import { fitAllTimeSlotsWithAvailability, DEFAULT_INCLUDE_FLAGS, type BusyTimeRange, type BusinessHoursMap } from '@/utils/booking/timeSlotFitter'
import type { ISO8601Date, RFC3339DateTime, DayOfWeek } from '@/types/datetime'
import type { TimeSlot } from '@/types/appointment'
import { useNotification } from '@/composables/useNotification'
import { ConstraintValidationError } from '@/utils/booking/slotAvailabilityManager'
import { extractBusinessHoursMinutes } from '@/composables/useLocalTime'
import type { CalendarEvent } from '@/services/calendarApiService'
import { createLogger } from '@/utils/logger'
import type {
  RangeConstraint,
  OverlapConstraint,
  CapacityConstraint,
} from '@shared/types/availabilityTypes'

const { error: showErrorNotification } = useNotification()
const logger = createLogger('useAvailableStartTimes')

interface UseAvailableStartTimesParams {
  selectedDate: Ref<{ start: ISO8601Date | null; end: ISO8601Date | null }>
  settings?: Ref<AvailabilitySettings | null> // @deprecated Phase 12: Use minuteIncrement parameter instead
  appointmentDuration?: Ref<number | null> // Optional: duration in minutes to filter start times (ensures end time <= day end)
  busyTimes?: Ref<BusyTimeRange[]> // Optional: calendar busy periods
  busyTimesLoading?: Ref<boolean> // Optional: whether busy times are currently loading
  prefetchedCalendarEvents?: Ref<CalendarEvent[]> // Optional: prefetched calendar events from orchestrator
  // Phase 6: Pre-computed constraints from server orchestrator
  prefetchedRangeConstraints?: Ref<RangeConstraint[]>
  prefetchedOverlapConstraints?: Ref<OverlapConstraint[]>
  prefetchedCapacityConstraints?: Ref<CapacityConstraint[]>
  prefetchedDriveTimesByDate?: Ref<Record<string, { driveTimeTo?: number; driveTimeFrom?: number }>>
  prefetchedScheduledHoursByKey?: Ref<Record<string, number>>
  // Phase 12: Server-provided minuteIncrement (prevents redundant settings fetch)
  minuteIncrement?: Ref<number | null> | ComputedRef<number | null>
}

interface UseAvailableStartTimesReturn {
  availableStartTimes: ComputedRef<string[]> // All start times (available + busy)
  slotAvailability: ComputedRef<Map<string, boolean>> // Map of startTime -> isAvailable
  slotViolations: ComputedRef<Map<string, string[] | undefined>> // Map of startTime -> flexibleViolations
  isLoading: Ref<boolean>
  error: Ref<Error | null>
}

export function useAvailableStartTimes(
  params: UseAvailableStartTimesParams
): UseAvailableStartTimesReturn {
  const {
    selectedDate,
    settings: externalSettings,
    appointmentDuration,
    busyTimes,
    busyTimesLoading,
    prefetchedCalendarEvents,
    prefetchedRangeConstraints,
    prefetchedOverlapConstraints,
    prefetchedCapacityConstraints,
    prefetchedDriveTimesByDate,
    prefetchedScheduledHoursByKey,
    minuteIncrement: externalMinuteIncrement,
  } = params
  
  const isLoading = ref(false)
  const error = ref<Error | null>(null)
  const internalSettings = ref<AvailabilitySettings | null>(null)
  
  // Phase 12: Use server-provided minuteIncrement if available, otherwise fetch settings
  // WHY: Prevents redundant API call when server already provides minuteIncrement
  // PATTERN: Check for external minuteIncrement first, fall back to settings fetch only if needed
  const minuteIncrementRef = ref<number | null>(null)
  
  watchEffect(async () => {
    const externalMinuteIncrementValue = externalMinuteIncrement?.value ?? null
    
    // Phase 12: Use server-provided minuteIncrement if available
    if (externalMinuteIncrementValue !== null && externalMinuteIncrementValue > 0) {
      minuteIncrementRef.value = externalMinuteIncrementValue
      // Still need settings for businessHours - but only if not provided via prefetchedRangeConstraints
      // For now, keep the settings fetch for backward compatibility, but it's only used for businessHours
      const external = externalSettings?.value
      if (external) {
        internalSettings.value = external
        return
      }
      // If we have prefetchedRangeConstraints, we don't need settings at all
      // But keep the fetch for now to avoid breaking changes
      try {
        isLoading.value = true
        const settings = await getAvailabilitySettings()
        internalSettings.value = settings
        error.value = null
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load availability settings'
        error.value = err instanceof Error ? err : new Error(errorMessage)
        showErrorNotification(`Failed to load availability settings: ${errorMessage}`)
      } finally {
        isLoading.value = false
      }
      return
    }
    
    // Fallback: fetch settings if minuteIncrement not provided
    const external = externalSettings?.value
    
    if (external) {
      internalSettings.value = external
      minuteIncrementRef.value = external.minuteIncrement
      return
    }
    
    try {
      isLoading.value = true
      const settings = await getAvailabilitySettings()
      internalSettings.value = settings
      minuteIncrementRef.value = settings.minuteIncrement
      error.value = null
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load availability settings'
      error.value = err instanceof Error ? err : new Error(errorMessage)
      showErrorNotification(`Failed to load availability settings: ${errorMessage}`)
    } finally {
      isLoading.value = false
    }
  })
  
  // PATTERN: Ref with watchEffect to update asynchronously when dependencies change
  // FIXED: Changed from computed to ref+watchEffect to handle async fitAllTimeSlotsWithAvailability
  const slotGenerationResult = ref<{ slots: TimeSlot[]; earliestCompletion: RFC3339DateTime | null }>({ slots: [], earliestCompletion: null })

  // PATTERN: WatchEffect tracks dependencies, calls async function to update ref
  watchEffect(async () => {
    if (!selectedDate.value.start) {
      slotGenerationResult.value = { slots: [], earliestCompletion: null }
      return
    }
    
    // PATTERN: Wait for busy times to finish loading before generating slots
    // WHY: Prevents race condition where slots are generated with stale busy times
    // FIX: Skip slot generation while busy times are loading - watchEffect will re-run when loading completes
    if (busyTimesLoading?.value) {
      // Don't clear existing results - keep showing previous slots until new data is ready
      return
    }
    
    if (!internalSettings.value) {
      slotGenerationResult.value = { slots: [], earliestCompletion: null }
      return
    }
    
    // LEARNING: Parse date and convert to UTC for boundary calculations
    // WHY: Boundaries must be UTC to match busy periods and slot generation
    // PATTERN: Extract date components and create UTC date
    const dateString = selectedDate.value.start.includes('T') 
      ? selectedDate.value.start.split('T')[0] 
      : selectedDate.value.start
    
    const [year, month, day] = dateString.split('-').map(Number)
    if (isNaN(year) || isNaN(month) || isNaN(day)) {
      const errorMessage = `Invalid date string: ${dateString}`
      error.value = new Error(errorMessage)
      showErrorNotification(errorMessage)
      slotGenerationResult.value = { slots: [], earliestCompletion: null }
      return
    }
    
    // LEARNING: Use UTC day of week for business hours
    // WHY: All business rules are UTC-only; UI performs the only localization
    // PATTERN: Create UTC date and use getUTCDay()
    const dateUTC = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0))
    const dayOfWeek: DayOfWeek = dateUTC.getUTCDay() as DayOfWeek
    
    // Phase 12: Use prefetchedRangeConstraints for businessHours instead of internalSettings
    // WHY: Server already provides rangeConstraints, no need to fetch settings
    // PATTERN: Extract businessHours from prefetched constraints, fallback to internalSettings for backward compat
    const businessHoursConstraint = prefetchedRangeConstraints?.value?.find(c => c.type === 'businessHours') 
      ?? internalSettings.value?.rangeConstraints?.businessHours
    if (!businessHoursConstraint || businessHoursConstraint.type !== 'businessHours') {
      throw new Error('businessHours must be provided in rangeConstraints.businessHours')
    }
    const businessHours = (businessHoursConstraint.config as { hours: BusinessHoursMap }).hours
    if (!businessHours) {
      throw new Error('businessHours config.hours must be provided')
    }
    
    const dayHours = businessHours[dayOfWeek]
    
    if (!dayHours) {
      slotGenerationResult.value = { slots: [], earliestCompletion: null }
      return
    }
    
    // LEARNING: Extract time-of-day from business hours (UTC time-of-day)
    // WHY: All business rules are UTC-only; UI performs the only localization
    // PATTERN: Extract UTC hours/minutes from RFC3339 business hours
    const endDate = new Date(dayHours.end)
    if (isNaN(endDate.getTime())) {
      error.value = new Error(`Invalid business hours end time for day ${dayOfWeek}: ${dayHours.end}`)
      showErrorNotification(`Invalid business hours configuration for selected day`)
      slotGenerationResult.value = { slots: [], earliestCompletion: null }
      return
    }
    
    // LEARNING: Extract business hours as local time-of-day values
    // WHY: Business hours stored as RFC3339 with reference date represent local time-of-day, not UTC times
    // PATTERN: Use useLocalTime composable to extract local hours/minutes from business hours RFC3339
    const endTime = extractBusinessHoursMinutes(endDate.toISOString() as RFC3339DateTime)
    const endHour = endTime.hours
    const endMinute = endTime.minutes
    
    // LEARNING: Business hours are stored as RFC3339 with reference date (2000-01-01T09:00:00Z)
    // WHY: Business hours are semantic time-of-day values, not absolute UTC times
    // PATTERN: Extract UTC hours/minutes from reference date, interpret as local time-of-day
    // This is an intentional exception to the UTC-only principle because:
    const startBoundaryLocal = new Date(year, month - 1, day, 0, 0, 0, 0)
    const startBoundaryUTCString = startBoundaryLocal.toISOString() as RFC3339DateTime
    const startBoundaryUTC = new Date(startBoundaryUTCString)
    
    const endBoundaryLocal = new Date(year, month - 1, day, endHour, endMinute, 0, 0)
    const endBoundaryUTCString = endBoundaryLocal.toISOString() as RFC3339DateTime
    const endBoundaryUTC = new Date(endBoundaryUTCString)
    
    // LEARNING: Slot generation always starts at increment boundaries from midnight UTC
    // PATTERN: Do NOT adjust startBoundary based on current time - leadTime filtering happens later in constraint checking
    
    const duration = appointmentDuration?.value || 0
    const busyPeriods = busyTimes?.value || []
    
    // Phase 6: Use pre-computed constraints from orchestrator if available, otherwise extract from settings
    // Phase 6: Use pre-computed constraints from server orchestrator (required)
    // WHY: All constraint extraction happens server-side, eliminating client-side extraction
    // PATTERN: Synchronous consumption of pre-computed constraints
    if (!prefetchedRangeConstraints?.value || !prefetchedOverlapConstraints?.value || !prefetchedCapacityConstraints?.value) {
      // Pre-computed constraints are required - this composable should only be used with orchestrator data
      const errorMessage = 'useAvailableStartTimes requires pre-computed constraints from server orchestrator'
      error.value = new Error(errorMessage)
      logger.error('[useAvailableStartTimes]', errorMessage)
      slotGenerationResult.value = { slots: [], earliestCompletion: null }
      return
    }
    
    let rangeConstraints: RangeConstraint[] = prefetchedRangeConstraints.value
    const overlapConstraints: OverlapConstraint[] = prefetchedOverlapConstraints.value
    const capacityConstraints: CapacityConstraint[] = prefetchedCapacityConstraints.value
    
    // Still need to ensure dateRange constraint is set for the selected date
    const dateRangeToSet = {
      start: startBoundaryUTC.toISOString(),
      end: endBoundaryUTC.toISOString()
    }
    // Check if dateRange constraint exists, add if missing
    const hasDateRangeConstraint = rangeConstraints.some(c => c.type === 'dateRange')
    if (!hasDateRangeConstraint) {
      rangeConstraints = [
        ...rangeConstraints,
        {
          type: 'dateRange',
          enforcement: 'hard',
          config: {
            start: dateRangeToSet.start,
            end: dateRangeToSet.end
          }
        }
      ]
    }
    
    // LEARNING: Use prefetched calendar events from orchestrator
    // WHY: Orchestrator prefetches events when placeId available or month changes
    // PATTERN: Consume prefetched data, no API calls here
    // Session 2.2.3: Refactored to consume prefetched data instead of fetching
    const calendarEvents: CalendarEvent[] = prefetchedCalendarEvents?.value ?? []
    
    if (prefetchedCalendarEvents) {
      logger.debug('[useAvailableStartTimes] Using prefetched calendar events', calendarEvents.length)
    } else {
      logger.debug('[useAvailableStartTimes] No prefetched calendar events available, using empty array')
    }

    try {
      // WHY: Generates ALL slots and marks them as available/busy using unified constraint system
      // PATTERN: Pass constraint arrays to fitAllTimeSlotsWithAvailability
      // Session 2.2.3: Pass calendar events and defaultLocation for drive time calculations
      const slotGenParams = {
        startBoundary: startBoundaryUTC.toISOString() as RFC3339DateTime,
        endBoundary: endBoundaryUTC.toISOString() as RFC3339DateTime,
        duration,
        minuteIncrement: minuteIncrementRef.value ?? internalSettings.value?.minuteIncrement ?? 15,
        busyTimes: busyPeriods,
        includeFlags: DEFAULT_INCLUDE_FLAGS
      }
      // Phase 6: Function is now synchronous (all data pre-computed server-side)
      const result = fitAllTimeSlotsWithAvailability(
        slotGenParams, 
        rangeConstraints, 
        overlapConstraints, 
        capacityConstraints,
        {
          // Phase 6: Pass pre-computed data from orchestrator (required)
          precomputedDriveTimesByDate: prefetchedDriveTimesByDate?.value,
          precomputedCapacityHours: prefetchedScheduledHoursByKey?.value,
        }
      )
      
      slotGenerationResult.value = result
      error.value = null
    } catch (err) {
      if (err instanceof ConstraintValidationError) {
        const errorMessage = `Invalid ${err.constraintType} constraint configuration: ${err.message}`
        error.value = err
        showErrorNotification(errorMessage)
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error generating slots'
        error.value = err instanceof Error ? err : new Error(errorMessage)
        showErrorNotification(`Failed to generate available start times: ${errorMessage}`)
      }
      slotGenerationResult.value = { slots: [], earliestCompletion: null }
    }
  })
  
  // PATTERN: Computed that maps over shared result
  const availableStartTimes = computed(() => {
    return slotGenerationResult.value.slots.map(slot => slot.startTime)
  })
  
  // PATTERN: Computed that creates Map from shared result
  const slotAvailability = computed(() => {
    const result = slotGenerationResult.value
    
    return new Map(
      result.slots.map(slot => [slot.startTime, slot.isAvailable])
    )
  })
  
  // PATTERN: Computed that creates Map for violations from shared result
  // WHY: Exposes flexibleViolations for debugging overlay to show WHY slots are blocked
  const slotViolations = computed(() => {
    const result = slotGenerationResult.value
    
    return new Map(
      result.slots.map(slot => [slot.startTime, slot.flexibleViolations])
    )
  })
  
  return {
    availableStartTimes,
    slotAvailability,
    slotViolations,
    isLoading,
    error
  }
}
