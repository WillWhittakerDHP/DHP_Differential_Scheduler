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

interface UseAvailableStartTimesParams {
  selectedDate: Ref<{ start: string | null; end: string | null }>
  settings?: Ref<AvailabilitySettings | null> // Optional: can be passed in or fetched internally
  appointmentDuration?: Ref<number | null> // Optional: duration in minutes to filter start times (ensures end time <= day end)
}

interface UseAvailableStartTimesReturn {
  availableStartTimes: ComputedRef<string[]> // ISO date strings
  isLoading: Ref<boolean>
  error: Ref<Error | null>
}

export function useAvailableStartTimes(
  params: UseAvailableStartTimesParams
): UseAvailableStartTimesReturn {
  const { selectedDate, settings: externalSettings, appointmentDuration } = params
  
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
  // PATTERN: Calculate times from dayStart + (interval * buttonIndex)
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
    const parseLocalDate = (dateString: string): Date => {
      const datePart = dateString.includes('T') ? dateString.split('T')[0] : dateString
      const [year, month, day] = datePart.split('-').map(Number)
      return new Date(year, month - 1, day) // month is 0-indexed
    }
    
    const date = parseLocalDate(selectedDate.value.start)
    const dayOfWeek = date.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6
    const dayHours = internalSettings.value.businessHours[dayOfWeek]
    
    if (!dayHours) {
      console.warn(`[useAvailableStartTimes] No business hours for day ${dayOfWeek}`)
      return []
    }
    
    // Parse start and end times (format: "HH:MM")
    const [startHour, startMinute] = dayHours.start.split(':').map(Number)
    const [endHour, endMinute] = dayHours.end.split(':').map(Number)
    const minuteIncrement = internalSettings.value.minuteIncrement
    
    // LEARNING: Validate parsed times
    // WHY: Ensures times are valid numbers before calculation
    if (isNaN(startHour) || isNaN(startMinute) || isNaN(endHour) || isNaN(endMinute)) {
      console.error('[useAvailableStartTimes] Invalid time format:', {
        start: dayHours.start,
        end: dayHours.end
      })
      return []
    }
    
    // Calculate day start and end in minutes from midnight
    const dayStartMinutes = startHour * 60 + startMinute
    const dayEndMinutes = endHour * 60 + endMinute
    
    // LEARNING: Validate end time is after start time
    // WHY: Prevents infinite loops and invalid ranges
    if (dayEndMinutes <= dayStartMinutes) {
      console.error('[useAvailableStartTimes] End time must be after start time:', {
        start: dayHours.start,
        end: dayHours.end,
        dayOfWeek
      })
      return []
    }
    
    // Generate start times at intervals
    // LEARNING: Button 0 = dayStart, Button 1 = dayStart + increment, Button 2 = dayStart + increment*2, etc.
    // WHY: Creates sequential time slots based on configured interval
    // PATTERN: Loop from dayStart to dayEnd, incrementing by minuteIncrement
    const startTimes: string[] = []
    let currentMinutes = dayStartMinutes
    
    // LEARNING: Get appointment duration if provided
    // WHY: Need to ensure startTime + duration <= dayEnd
    // PATTERN: Use provided duration or default to 0 (no filtering)
    const duration = appointmentDuration?.value || 0
    
    while (currentMinutes < dayEndMinutes) {
      // LEARNING: Check if this start time + duration would extend past day end
      // WHY: Ensures last appointment ends at or before day end time
      // PATTERN: Skip start times where startTime + duration > dayEnd
      if (duration > 0) {
        const endMinutes = currentMinutes + duration
        if (endMinutes > dayEndMinutes) {
          // This start time would extend past day end, stop generating
          break
        }
      }
      
      // Create date object for this time slot in local timezone
      const slotDate = new Date(date)
      slotDate.setHours(Math.floor(currentMinutes / 60), currentMinutes % 60, 0, 0)
      
      startTimes.push(slotDate.toISOString())
      
      // Move to next interval
      currentMinutes += minuteIncrement
    }
    
    return startTimes
  })
  
  return {
    availableStartTimes,
    isLoading,
    error
  }
}
