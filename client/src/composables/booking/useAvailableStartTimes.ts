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
import { ConstraintValidationError } from '@/utils/booking/timeAvailabilityManager'
import { extractAllConstraints, ensureDateRangeInSettings } from '@/utils/booking/constraintHelpers'
import { extractBusinessHoursMinutes } from '@/composables/useLocalTime'

const { error: showErrorNotification } = useNotification()

interface UseAvailableStartTimesParams {
  selectedDate: Ref<{ start: ISO8601Date | null; end: ISO8601Date | null }>
  settings?: Ref<AvailabilitySettings | null> // Optional: can be passed in or fetched internally
  appointmentDuration?: Ref<number | null> // Optional: duration in minutes to filter start times (ensures end time <= day end)
  busyTimes?: Ref<BusyTimeRange[]> // Optional: calendar busy periods
}

interface UseAvailableStartTimesReturn {
  availableStartTimes: ComputedRef<string[]> // All start times (available + busy)
  slotAvailability: ComputedRef<Map<string, boolean>> // Map of startTime -> isAvailable
  isLoading: Ref<boolean>
  error: Ref<Error | null>
}

export function useAvailableStartTimes(
  params: UseAvailableStartTimesParams
): UseAvailableStartTimesReturn {
  const { selectedDate, settings: externalSettings, appointmentDuration, busyTimes } = params
  
  const isLoading = ref(false)
  const error = ref<Error | null>(null)
  const internalSettings = ref<AvailabilitySettings | null>(null)
  
  // LEARNING: Fetch settings if not provided externally
  // WHY: Allows composable to work standalone or with pre-fetched settings
  // PATTERN: Watch for settings changes, fetch if needed
  // NOTE: watchEffect runs immediately and tracks dependencies
  watchEffect(async () => {
    // Track externalSettings to ensure reactivity
    const external = externalSettings?.value
    
    if (external) {
      internalSettings.value = external
      return
    }
    
    try {
      isLoading.value = true
      // LEARNING: Always fetch fresh settings (cache is handled in getAvailabilitySettings)
      // WHY: Ensures we get the latest settings, especially after admin updates
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
  })
  
  // LEARNING: Ref for slot generation result (reactive)
  // WHY: Provides reactive slot generation that updates when dependencies change
  // PATTERN: Ref with watchEffect to update asynchronously when dependencies change
  // FIXED: Changed from computed to ref+watchEffect to handle async fitAllTimeSlotsWithAvailability
  const slotGenerationResult = ref<{ slots: TimeSlot[]; earliestCompletion: RFC3339DateTime | null }>({ slots: [], earliestCompletion: null })

  // LEARNING: Watch dependencies and update slot generation result asynchronously
  // WHY: Updates slot generation when selectedDate, settings, appointmentDuration, or busyTimes change
  // PATTERN: WatchEffect tracks dependencies, calls async function to update ref
  watchEffect(async () => {
    if (!selectedDate.value.start) {
      slotGenerationResult.value = { slots: [], earliestCompletion: null }
      return
    }
    
    if (!internalSettings.value) {
      slotGenerationResult.value = { slots: [], earliestCompletion: null }
      return
    }
    
    // LEARNING: Parse date and convert to UTC for boundary calculations
    // WHY: Boundaries must be UTC to match busy periods and slot generation
    // PATTERN: Extract date components and create UTC date
    // NOTE: selectedDate.value.start is ISO 8601 date format (YYYY-MM-DD)
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
    
    // LEARNING: Extract businessHours from structured rangeConstraints
    // WHY: No top-level businessHours fallback - must use structured format
    const businessHoursConstraint = internalSettings.value.rangeConstraints?.businessHours
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
    
    // ARCHITECTURE DECISION: Intentional Exception for Business Hours Interpretation
    // --------------------------------------------------------------------------------
    // LEARNING: Business hours are stored as RFC3339 with reference date (2000-01-01T09:00:00Z)
    //           but represent LOCAL time-of-day (e.g., "9:00 AM" in admin's local timezone)
    // WHY: Business hours are semantic time-of-day values, not absolute UTC times
    //      When admin sets "9:00 AM" business hours, they mean 9:00 AM in their local timezone
    // PATTERN: Extract UTC hours/minutes from reference date, interpret as local time-of-day
    //          Create Date objects in local timezone, then convert to UTC RFC3339
    //
    // This is an intentional exception to the UTC-only principle because:
    // 1. Business hours semantically represent local time-of-day
    // 2. We need to create boundaries that align with local business hours
    // 3. Converting local Date to UTC via toISOString() ensures correct UTC representation
    //
    // FUTURE IMPROVEMENT: Consider storing admin timezone in settings and using UTC methods
    //                    with explicit timezone conversion for more predictable behavior
    // --------------------------------------------------------------------------------
    // Create start of day in local timezone (midnight local), convert to UTC RFC3339
    const startBoundaryLocal = new Date(year, month - 1, day, 0, 0, 0, 0)
    const startBoundaryUTCString = startBoundaryLocal.toISOString() as RFC3339DateTime
    const startBoundaryUTC = new Date(startBoundaryUTCString)
    
    // Create end boundary in local timezone using business hours, convert to UTC RFC3339
    const endBoundaryLocal = new Date(year, month - 1, day, endHour, endMinute, 0, 0)
    const endBoundaryUTCString = endBoundaryLocal.toISOString() as RFC3339DateTime
    const endBoundaryUTC = new Date(endBoundaryUTCString)
    
    // LEARNING: Slot generation always starts at increment boundaries from midnight UTC
    // WHY: Ensures consistent slot generation regardless of current time - all days start at :00, :15, :30, :45
    // PATTERN: Do NOT adjust startBoundary based on current time - leadTime filtering happens later in constraint checking
    // NOTE: startBoundaryUTC remains at midnight of selected day - slot generation will round to increment boundaries
    
    const duration = appointmentDuration?.value || 0
    const busyPeriods = busyTimes?.value || []
    
    // LEARNING: Ensure dateRange is set in structured rangeConstraints before extraction
    // WHY: No fallbacks - all constraints must be in structured format
    // PATTERN: Use helper function to set dateRange in rangeConstraints if not already present
    const dateRangeToSet = {
      start: startBoundaryUTC.toISOString(),
      end: endBoundaryUTC.toISOString()
    }
    const settingsWithDateRange = ensureDateRangeInSettings(internalSettings.value, dateRangeToSet)

    // LEARNING: Extract all constraints using shared helper function
    // WHY: DRY principle - eliminates duplication across composables
    // PATTERN: Use extractAllConstraints helper to extract all constraint types at once
    const { rangeConstraints, overlapConstraints, capacityConstraints } = extractAllConstraints(settingsWithDateRange)

    try {
      // LEARNING: Use unified availability manager with constraint arrays
      // WHY: Generates ALL slots and marks them as available/busy using unified constraint system
      // PATTERN: Pass constraint arrays to fitAllTimeSlotsWithAvailability
      const slotGenParams = {
        startBoundary: startBoundaryUTC.toISOString() as RFC3339DateTime,
        endBoundary: endBoundaryUTC.toISOString() as RFC3339DateTime,
        duration,
        minuteIncrement: internalSettings.value.minuteIncrement,
        busyTimes: busyPeriods,
        includeFlags: DEFAULT_INCLUDE_FLAGS
      }
      const result = await fitAllTimeSlotsWithAvailability(
        slotGenParams, rangeConstraints, overlapConstraints, capacityConstraints)
      
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
  
  // LEARNING: Derive start times from shared slot generation
  // WHY: Extracts just the start times from pre-computed slots
  // PATTERN: Computed that maps over shared result
  const availableStartTimes = computed(() => {
    return slotGenerationResult.value.slots.map(slot => slot.startTime)
  })
  
  // LEARNING: Derive availability map from shared slot generation
  // WHY: Extracts availability flags from pre-computed slots
  // PATTERN: Computed that creates Map from shared result
  const slotAvailability = computed(() => {
    const result = slotGenerationResult.value
    
    return new Map(
      result.slots.map(slot => [slot.startTime, slot.isAvailable])
    )
  })
  
  return {
    availableStartTimes,
    slotAvailability,
    isLoading,
    error
  }
}
