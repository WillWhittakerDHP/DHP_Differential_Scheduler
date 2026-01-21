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
import { fitTimeSlotsWithAvailability, parseLocalDate, timeRangesOverlap, type BusinessHoursMap, type BusyTimeRange } from '@/utils/booking/timeSlotFitter'
import { rfc3339ToBusinessHoursTime } from '@/utils/datetime'

interface UseAvailableStartTimesParams {
  selectedDate: Ref<{ start: string | null; end: string | null }>
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
      console.error('Error loading availability settings:', err)
    } finally {
      isLoading.value = false
    }
  })
  
  // LEARNING: Generate start times based on selected date and settings
  // WHY: Computed property ensures reactivity when date or settings change
  // PATTERN: Use fitTimeSlots() core utility for consistent slot generation
  // Session 1.4.14: Refactored to use fitTimeSlots() instead of manual calculation
  const availableStartTimes = computed(() => {
    if (!selectedDate.value.start) {
      return []
    }
    
    if (!internalSettings.value) {
      // LEARNING: Return empty array if settings not loaded yet
      // WHY: Prevents errors and allows UI to show loading state
      return []
    }
    
    // LEARNING: Parse date in local timezone
    // WHY: Ensures correct day of week calculation regardless of timezone
    // PATTERN: Extract date part and create Date object in local timezone
    const date = parseLocalDate(selectedDate.value.start)
    const dayOfWeek = date.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6
    const dayHours = internalSettings.value.businessHours[dayOfWeek]
    
    if (!dayHours) {
      console.warn(`[useAvailableStartTimes] No business hours for day ${dayOfWeek}`)
      return []
    }
    
    // LEARNING: Extract time-of-day from RFC3339 business hours
    // WHY: Business hours stored as RFC3339, need to extract HH:mm for calculations
    // PATTERN: Convert RFC3339 to HH:mm, then parse
    const endTimeStr = rfc3339ToBusinessHoursTime(dayHours.end)
    const [endHour, endMinute] = endTimeStr.split(':').map(Number)
    
    // LEARNING: Validate parsed times
    // WHY: Ensures times are valid numbers before calculation
    if (isNaN(endHour) || isNaN(endMinute)) {
      console.error('[useAvailableStartTimes] Invalid time format:', {
        end: dayHours.end,
        endTimeStr
      })
      return []
    }
    
    // Create end of day boundary
    const endBoundary = new Date(date)
    endBoundary.setHours(endHour, endMinute, 0, 0)
    
    // LEARNING: Use fitTimeSlotsWithAvailability() for unified availability handling
    // WHY: Generates all slots and marks availability status
    // PATTERN: Use new availability manager, return all times with availability map
    const duration = appointmentDuration?.value || 0
    const busyPeriods = busyTimes?.value || []
    
    // LEARNING: Define slot generation boundaries for filtering
    // WHY: Need to filter busy periods to only those that overlap with actual slot generation range
    // PATTERN: Use same boundaries that will be passed to fitTimeSlotsWithAvailability
    // LEARNING: Apply leadTime buffer for today's date
    // WHY: Prevents booking appointments too close to current time
    // PATTERN: For today, use now + leadTime (rounded to increment); for future dates, use start of day
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const selectedDateOnly = new Date(date)
    selectedDateOnly.setHours(0, 0, 0, 0)
    const isToday = selectedDateOnly.getTime() === today.getTime()
    
    const minuteIncrement = internalSettings.value.minuteIncrement
    const leadTimeMinutes = internalSettings.value.leadTime || 0
    
    const slotStartBoundary = isToday
      ? (() => {
          const now = new Date()
          const minStartTime = new Date(now.getTime() + leadTimeMinutes * 60 * 1000)
          // LEARNING: Round up to next increment to align with slot generation
          // WHY: Ensures slots align with configured minuteIncrement intervals
          // PATTERN: Calculate remainder, round up to next increment boundary
          const currentMinutes = minStartTime.getMinutes()
          const remainder = currentMinutes % minuteIncrement
          const roundedMinutes = remainder === 0 ? currentMinutes : currentMinutes + (minuteIncrement - remainder)
          minStartTime.setMinutes(roundedMinutes, 0, 0)
          return minStartTime
        })()
      : new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0) // Start of day for future dates
    
    const slotEndBoundary = new Date(endBoundary)
    
    // LEARNING: Filter busy periods to only those that overlap with slot generation boundaries
    // WHY: Busy periods are generated for a wider date range (dateRangeForApi), but slots are only generated for the selected day
    // PATTERN: Use timeRangesOverlap to check if busy period overlaps with slot generation range
    const filteredBusyPeriods = busyPeriods.filter((busy, index) => {
      const busyStart = new Date(busy.start)
      const busyEnd = new Date(busy.end)
      
      // Check if busy period overlaps with slot generation range
      const overlaps = timeRangesOverlap(
        { start: busyStart, end: busyEnd },
        { start: slotStartBoundary, end: slotEndBoundary }
      )
      
      // LEARNING: Log filtering for first few busy periods in availableStartTimes
      // WHY: Helps debug why busy periods might not be matching slots
      // PATTERN: Log sample filtering decisions
      if (index < 3) {
        console.log('[useAvailableStartTimes] availableStartTimes - Filtering busy period:', {
          busyPeriod: {
            start: busy.start,
            end: busy.end,
            startDate: busyStart.toISOString(),
            endDate: busyEnd.toISOString()
          },
          slotRange: {
            start: slotStartBoundary.toISOString(),
            end: slotEndBoundary.toISOString()
          },
          overlaps,
          busyStartBeforeSlotEnd: busyStart < slotEndBoundary,
          busyEndAfterSlotStart: busyEnd > slotStartBoundary
        })
      }
      
      return overlaps
    })
    
    const result = fitTimeSlotsWithAvailability({
      startBoundary: slotStartBoundary.toISOString(),
      endBoundary: slotEndBoundary.toISOString(),
      duration,
      businessHours: internalSettings.value.businessHours as BusinessHoursMap,
      minuteIncrement: internalSettings.value.minuteIncrement,
      busyTimes: filteredBusyPeriods
    })
    
    // Extract all start times (available + busy)
    return result.slots.map(slot => slot.startTime)
  })

  // LEARNING: Create availability map for quick lookup
  // WHY: Allows components to check if a specific start time is available
  // PATTERN: Computed map of startTime -> isAvailable
  const slotAvailability = computed(() => {
    if (!selectedDate.value.start) {
      return new Map<string, boolean>()
    }
    
    if (!internalSettings.value) {
      return new Map<string, boolean>()
    }
    
    const date = parseLocalDate(selectedDate.value.start)
    const dayOfWeek = date.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6
    const dayHours = internalSettings.value.businessHours[dayOfWeek]
    
    if (!dayHours) {
      return new Map<string, boolean>()
    }
    
    // LEARNING: Extract time-of-day from RFC3339 business hours
    // WHY: Business hours stored as RFC3339, need to extract HH:mm for calculations
    // PATTERN: Convert RFC3339 to HH:mm, then parse
    const endTimeStr = rfc3339ToBusinessHoursTime(dayHours.end)
    const [endHour, endMinute] = endTimeStr.split(':').map(Number)
    
    if (isNaN(endHour) || isNaN(endMinute)) {
      return new Map<string, boolean>()
    }
    
    const endBoundary = new Date(date)
    endBoundary.setHours(endHour, endMinute, 0, 0)
    
    // LEARNING: Define slot generation boundaries for filtering
    // WHY: Need to filter busy periods to only those that overlap with actual slot generation range
    // PATTERN: Use same boundaries that will be passed to fitTimeSlotsWithAvailability
    // LEARNING: Apply leadTime buffer for today's date
    // WHY: Prevents booking appointments too close to current time
    // PATTERN: For today, use now + leadTime (rounded to increment); for future dates, use start of day
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const selectedDateOnly = new Date(date)
    selectedDateOnly.setHours(0, 0, 0, 0)
    const isToday = selectedDateOnly.getTime() === today.getTime()
    
    const minuteIncrement = internalSettings.value.minuteIncrement
    const leadTimeMinutes = internalSettings.value.leadTime || 0
    
    const slotStartBoundary = isToday
      ? (() => {
          const now = new Date()
          const minStartTime = new Date(now.getTime() + leadTimeMinutes * 60 * 1000)
          // LEARNING: Round up to next increment to align with slot generation
          // WHY: Ensures slots align with configured minuteIncrement intervals
          // PATTERN: Calculate remainder, round up to next increment boundary
          const currentMinutes = minStartTime.getMinutes()
          const remainder = currentMinutes % minuteIncrement
          const roundedMinutes = remainder === 0 ? currentMinutes : currentMinutes + (minuteIncrement - remainder)
          minStartTime.setMinutes(roundedMinutes, 0, 0)
          return minStartTime
        })()
      : new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0) // Start of day for future dates
    
    const slotEndBoundary = new Date(endBoundary)
    
    const duration = appointmentDuration?.value || 0
    const busyPeriods = busyTimes?.value || []
    
    // LEARNING: Filter busy periods to only those that overlap with slot generation boundaries
    // WHY: Busy periods are generated for a wider date range (dateRangeForApi), but slots are only generated for the selected day
    // PATTERN: Use timeRangesOverlap to check if busy period overlaps with slot generation range
    const filteredBusyPeriods = busyPeriods.filter((busy, index) => {
      const busyStart = new Date(busy.start)
      const busyEnd = new Date(busy.end)
      
      // Check if busy period overlaps with slot generation range
      const overlaps = timeRangesOverlap(
        { start: busyStart, end: busyEnd },
        { start: slotStartBoundary, end: slotEndBoundary }
      )
      
      // LEARNING: Log filtering for first few busy periods
      // WHY: Helps debug why busy periods might not be matching slots
      // PATTERN: Log sample filtering decisions
      if (index < 3) {
        console.log('[useAvailableStartTimes] Filtering busy period:', {
          busyPeriod: {
            start: busy.start,
            end: busy.end,
            startDate: busyStart.toISOString(),
            endDate: busyEnd.toISOString()
          },
          slotRange: {
            start: slotStartBoundary.toISOString(),
            end: slotEndBoundary.toISOString()
          },
          overlaps,
          busyStartBeforeSlotEnd: busyStart < slotEndBoundary,
          busyEndAfterSlotStart: busyEnd > slotStartBoundary
        })
      }
      
      return overlaps
    })
    
    const result = fitTimeSlotsWithAvailability({
      startBoundary: slotStartBoundary.toISOString(),
      endBoundary: slotEndBoundary.toISOString(),
      duration,
      businessHours: internalSettings.value.businessHours as BusinessHoursMap,
      minuteIncrement: internalSettings.value.minuteIncrement,
      busyTimes: filteredBusyPeriods
    })
    
    // LEARNING: Create map of startTime -> isAvailable
    // WHY: Enables quick lookup of availability status
    // PATTERN: Use Map constructor with array of entries
    const availabilityMap = new Map(
      result.slots.map(slot => [slot.startTime, slot.isAvailable])
    )
    
    // LEARNING: Log availability map for debugging
    // WHY: Confirms which slots are marked as busy in the map and verifies key format
    // PATTERN: Log count, sample entries, and busy entries to verify format consistency
    const busyEntries = Array.from(availabilityMap.entries()).filter(([_, isAvail]) => !isAvail)
    const sampleKeys = Array.from(availabilityMap.keys()).slice(0, 5)
    const allBusyTimes = busyEntries.map(([time, _]) => time)
    const firstThreeSlots = availableStartTimes.value.slice(0, 3)
    console.log('[useAvailableStartTimes] Availability map created:', {
      totalEntries: availabilityMap.size,
      busyEntriesCount: busyEntries.length,
      sampleKeys,
      sampleBusyEntries: busyEntries.slice(0, 10).map(([time, _]) => ({ time, isAvailable: false })),
      allBusyTimes: allBusyTimes,
      firstAvailableStartTime: availableStartTimes.value[0],
      mapFirstKey: sampleKeys[0],
      keysMatch: availableStartTimes.value[0] === sampleKeys[0],
      firstThreeSlots,
      firstThreeAreBusy: firstThreeSlots.map(time => ({
        time,
        isBusy: !availabilityMap.get(time),
        mapValue: availabilityMap.get(time)
      })),
      busyPeriodsReceived: busyPeriods.length,
      filteredBusyPeriodsCount: filteredBusyPeriods.length,
      sampleFilteredBusyPeriods: filteredBusyPeriods.slice(0, 3),
      slotGenerationRange: {
        start: slotStartBoundary.toISOString(),
        end: slotEndBoundary.toISOString()
      },
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
