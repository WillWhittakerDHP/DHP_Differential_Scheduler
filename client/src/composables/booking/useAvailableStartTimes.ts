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
import { fitTimeSlotsWithAvailability, DEFAULT_INCLUDE_FLAGS, type BusinessHoursMap, type BusyTimeRange } from '@/utils/booking/timeSlotFitter'
import { rfc3339ToBusinessHoursTime } from '@/utils/datetime'
import type { ISO8601Date, RFC3339DateTime } from '@/types/datetime'
import { createLogger } from '@/utils/logger'

// LEARNING: Use scoped logger for controllable debug output
// WHY: Prevents debug logs in production, allows scope-based filtering
// PATTERN: createLogger(scope) provides debug/info/warn/error methods
const logger = createLogger('useAvailableStartTimes')

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
      error.value = err instanceof Error ? err : new Error('Failed to load availability settings')
      logger.error('Error loading availability settings:', err)
    } finally {
      isLoading.value = false
    }
  })
  
  // LEARNING: Shared slot generation computed
  // WHY: Generates slots once, eliminates duplicate computation (50% performance gain)
  // PATTERN: Computed that returns full result, derived computeds extract what they need
  const slotGenerationResult = computed(() => {
    if (!selectedDate.value.start) {
      logger.debug('No selected date')
      return { slots: [], earliestCompletion: null }
    }
    
    if (!internalSettings.value) {
      logger.debug('Settings not loaded yet, date:', selectedDate.value.start)
      return { slots: [], earliestCompletion: null }
    }
    
    logger.debug('Generating slots for date:', selectedDate.value.start, 'settings loaded:', !!internalSettings.value)
    
    // LEARNING: Parse date and convert to UTC for boundary calculations
    // WHY: Boundaries must be UTC to match busy periods and slot generation
    // PATTERN: Extract date components and create UTC date
    // NOTE: selectedDate.value.start is ISO 8601 date format (YYYY-MM-DD)
    const dateString = selectedDate.value.start.includes('T') 
      ? selectedDate.value.start.split('T')[0] 
      : selectedDate.value.start
    
    const [year, month, day] = dateString.split('-').map(Number)
    if (isNaN(year) || isNaN(month) || isNaN(day)) {
      logger.error('Invalid date string:', dateString)
      return { slots: [], earliestCompletion: null }
    }
    
    // LEARNING: Create date in LOCAL timezone for business hours interpretation
    // WHY: Business hours are LOCAL time-of-day, so we need local date components
    // PATTERN: Create local date, then convert to UTC for boundaries
    const dateLocal = new Date(year, month - 1, day, 0, 0, 0) // Local midnight for the selected date
    
    const dayOfWeek = dateLocal.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6
    const dayHours = internalSettings.value.businessHours[dayOfWeek]
    
    if (!dayHours) {
      logger.warn(`No business hours for day ${dayOfWeek}`)
      return { slots: [], earliestCompletion: null }
    }
    
    // LEARNING: Extract time-of-day from business hours (LOCAL time, not UTC)
    // WHY: Business hours represent LOCAL time-of-day (e.g., "09:00" = 9 AM local)
    // PATTERN: Extract HH:mm and apply to local date, then convert to UTC
    const endTimeStr = rfc3339ToBusinessHoursTime(dayHours.end)
    const [endHour, endMinute] = endTimeStr.split(':').map(Number)
    
    if (isNaN(endHour) || isNaN(endMinute)) {
      logger.error('Invalid time format:', {
        end: dayHours.end,
        endTimeStr
      })
      return { slots: [], earliestCompletion: null }
    }
    
    // LEARNING: Calculate end boundary in LOCAL timezone, then it will be converted to UTC
    // WHY: Business hours are LOCAL time, so apply to local date
    // PATTERN: Create local datetime with business hours, convert to UTC when needed
    const endBoundaryLocal = new Date(year, month - 1, day, endHour, endMinute, 0, 0)
    
    const duration = appointmentDuration?.value || 0
    const busyPeriods = busyTimes?.value || []
    
    // Calculate slot start boundary with leadTime
    // LEARNING: Compare LOCAL dates for "today" check (business hours are local)
    // WHY: Need to check if selected date is today in local timezone
    const now = new Date()
    const todayLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
    const isToday = dateLocal.getTime() === todayLocal.getTime()
    
    const minuteIncrement = internalSettings.value.minuteIncrement
    const leadTimeMinutes = internalSettings.value.leadTime || 0
    
    const slotStartBoundary = isToday
      ? (() => {
          // LEARNING: Apply leadTime in LOCAL timezone, then convert to UTC
          // WHY: leadTime is local time, so apply to local now, then convert
          const nowLocal = new Date()
          const minStartTime = new Date(nowLocal.getTime() + leadTimeMinutes * 60 * 1000)
          const currentMinutes = minStartTime.getMinutes()
          const remainder = currentMinutes % minuteIncrement
          const roundedMinutes = remainder === 0 ? currentMinutes : currentMinutes + (minuteIncrement - remainder)
          minStartTime.setMinutes(roundedMinutes, 0, 0)
          return minStartTime // Will be converted to UTC via toISOString()
        })()
      : dateLocal // Start of day in local time
    
    const slotEndBoundary = endBoundaryLocal // End boundary in local time
    
    // LEARNING: Pass all busy periods directly to slot generation
    // WHY: The availability check handles overlap detection correctly, filtering here can exclude valid busy periods
    // PATTERN: Let checkSlotAvailability handle all overlap logic - it correctly checks if slots overlap busy periods
    // Generate slots once
    // LEARNING: toISOString() always produces valid RFC3339 format (UTC with Z suffix)
    // WHY: Date.toISOString() is guaranteed to return RFC3339-compliant string
    // PATTERN: Use type assertion since we know the format is correct
    logger.debug('Calling fitTimeSlotsWithAvailability with:', {
      startBoundary: slotStartBoundary.toISOString(),
      endBoundary: slotEndBoundary.toISOString(),
      startBoundaryLocal: slotStartBoundary.toLocaleString(),
      endBoundaryLocal: slotEndBoundary.toLocaleString(),
      duration,
      businessHours: Object.keys(internalSettings.value.businessHours),
      minuteIncrement: internalSettings.value.minuteIncrement,
      busyTimesCount: busyPeriods.length
    })
    
    const result = fitTimeSlotsWithAvailability({
      startBoundary: slotStartBoundary.toISOString() as RFC3339DateTime,
      endBoundary: slotEndBoundary.toISOString() as RFC3339DateTime,
      duration,
      businessHours: internalSettings.value.businessHours as BusinessHoursMap,
      minuteIncrement: internalSettings.value.minuteIncrement,
      busyTimes: busyPeriods,  // Pass all busy periods - availability check handles overlap detection
      includeFlags: DEFAULT_INCLUDE_FLAGS
    })
    
    logger.debug('Generated slots:', result.slots.length, 'first slot:', result.slots[0]?.startTime)
    
    // LEARNING: Debug logging to verify timezone alignment
    // WHY: Helps verify that busy periods and slots are in the same timezone (UTC)
    // PATTERN: Log sample busy periods and slots with both UTC and local times
    if (busyPeriods.length > 0 && result.slots.length > 0) {
      logger.debug('Timezone alignment check:', {
        boundaries: {
          startUTC: slotStartBoundary.toISOString(),
          endUTC: slotEndBoundary.toISOString(),
          startLocal: slotStartBoundary.toLocaleString(),
          endLocal: slotEndBoundary.toLocaleString()
        },
        busyPeriodsSample: busyPeriods.slice(0, 3).map(bp => {
          const start = new Date(bp.start)
          const end = new Date(bp.end)
          return {
            startUTC: bp.start,
            endUTC: bp.end,
            startLocal: start.toLocaleString(),
            endLocal: end.toLocaleString(),
            startHourUTC: start.getUTCHours(),
            startHourLocal: start.getHours()
          }
        }),
        slotsSample: result.slots.slice(0, 5).map(slot => {
          const start = new Date(slot.startTime)
          return {
            startTimeUTC: slot.startTime,
            startTimeLocal: start.toLocaleString(),
            startHourUTC: start.getUTCHours(),
            startHourLocal: start.getHours(),
            isAvailable: slot.isAvailable
          }
        })
      })
    }
    
    return result
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
    
    const availabilityMap = new Map(
      result.slots.map(slot => [slot.startTime, slot.isAvailable])
    )
    
    // Keep existing logging for debugging (derive values directly from result.slots to avoid dependency on availableStartTimes)
    const busyEntries = Array.from(availabilityMap.entries()).filter(([_, isAvail]) => !isAvail)
    const sampleKeys = Array.from(availabilityMap.keys()).slice(0, 5)
    const allBusyTimes = busyEntries.map(([time, _]) => time)
    const firstThreeStartTimes = result.slots.slice(0, 3).map(s => s.startTime)
    
    logger.debug('Availability map created:', {
      totalEntries: availabilityMap.size,
      busyEntriesCount: busyEntries.length,
      sampleKeys,
      sampleBusyEntries: busyEntries.slice(0, 10).map(([time, _]) => ({ time, isAvailable: false })),
      allBusyTimes,
      firstStartTime: result.slots[0]?.startTime,
      mapFirstKey: sampleKeys[0],
      keysMatch: result.slots[0]?.startTime === sampleKeys[0],
      firstThreeStartTimes,
      firstThreeAreBusy: firstThreeStartTimes.map(time => ({
        time,
        isBusy: !availabilityMap.get(time),
        mapValue: availabilityMap.get(time)
      })),
      resultSlotsSample: result.slots.slice(0, 5).map(s => ({
        startTime: s.startTime,
        isAvailable: s.isAvailable
      }))
    })
    
    return availabilityMap
  })
  
  return {
    availableStartTimes,
    slotAvailability,
    isLoading,
    error
  }
}
