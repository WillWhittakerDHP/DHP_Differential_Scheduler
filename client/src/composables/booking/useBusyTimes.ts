/**
 * useBusyTimes Composable
 * 
 * LEARNING: Computes busy times from calendar for availability checking
 * WHY: Extracts busy times calculation logic from AvailabilityStep component
 * PATTERN: Composable that provides computed property for busy times
 */

import { computed, type ComputedRef, type Ref } from 'vue'
import { getCalendarAvailability } from '@/utils/timeSlotCalculations'
import type { RFC3339DateTime } from '@/types/datetime'
import type { BusyTimeRange } from '@/utils/booking/timeSlotFitter'

export interface UseBusyTimesParams {
  dateRangeForApi: ComputedRef<{ start: RFC3339DateTime; end: RFC3339DateTime } | null>
  
  mockRefreshKey: Ref<number>
}

export interface UseBusyTimesReturn {
  /**
   * Busy times from calendar for availability checking
   * LEARNING: Marks slots as busy when they overlap calendar busy periods
   * WHY: Need to mark slots as busy when they overlap calendar busy periods
   */
  busyTimes: ComputedRef<BusyTimeRange[]>
}

/**
 * useBusyTimes composable
 * 
 * LEARNING: Computes busy times from calendar for availability checking
 * WHY: Extracts busy times calculation logic from component to composable
 * PATTERN: Composable that returns reactive computed property
 */
export function useBusyTimes(
  params: UseBusyTimesParams
): UseBusyTimesReturn {
  const { dateRangeForApi, mockRefreshKey } = params

  /**
   * LEARNING: Get busy times from calendar for availability checking
   * WHY: Need to mark slots as busy when they overlap calendar busy periods
   * PATTERN: Get busy times from dateRangeForApi, return empty array if dateRange is null
   */
  const busyTimes = computed<BusyTimeRange[]>(() => {
    if (!dateRangeForApi.value) {
      return []
    }
    
    // LEARNING: Include refreshKey in dependency to force recalculation
    // PATTERN: Reference refreshKey in computed to trigger recalculation
    void mockRefreshKey.value // Force dependency tracking
    
    const dateRangeValue = dateRangeForApi.value
    
    // PATTERN: Call function and store result in const
    const busyTimesResult = getCalendarAvailability({
      start: dateRangeValue.start,
      end: dateRangeValue.end
    })
    
    return busyTimesResult
  })

  return {
    busyTimes
  }
}
