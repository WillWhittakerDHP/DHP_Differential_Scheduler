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
import { fitTimeSlotsWithAvailability, parseLocalDate, type BusinessHoursMap, type BusyTimeRange } from '@/utils/booking/timeSlotFitter'

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
    
    // Parse end time to create end boundary
    const [endHour, endMinute] = dayHours.end.split(':').map(Number)
    
    // LEARNING: Validate parsed times
    // WHY: Ensures times are valid numbers before calculation
    if (isNaN(endHour) || isNaN(endMinute)) {
      console.error('[useAvailableStartTimes] Invalid time format:', {
        end: dayHours.end
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
    
    const result = fitTimeSlotsWithAvailability({
      startBoundary: date.toISOString(),
      endBoundary: endBoundary.toISOString(),
      duration,
      businessHours: internalSettings.value.businessHours as BusinessHoursMap,
      minuteIncrement: internalSettings.value.minuteIncrement,
      busyTimes: busyPeriods
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
    
    const [endHour, endMinute] = dayHours.end.split(':').map(Number)
    
    if (isNaN(endHour) || isNaN(endMinute)) {
      return new Map<string, boolean>()
    }
    
    const endBoundary = new Date(date)
    endBoundary.setHours(endHour, endMinute, 0, 0)
    
    const duration = appointmentDuration?.value || 0
    const busyPeriods = busyTimes?.value || []
    
    const result = fitTimeSlotsWithAvailability({
      startBoundary: date.toISOString(),
      endBoundary: endBoundary.toISOString(),
      duration,
      businessHours: internalSettings.value.businessHours as BusinessHoursMap,
      minuteIncrement: internalSettings.value.minuteIncrement,
      busyTimes: busyPeriods
    })
    
    // LEARNING: Create map of startTime -> isAvailable
    // WHY: Enables quick lookup of availability status
    // PATTERN: Use Map constructor with array of entries
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
