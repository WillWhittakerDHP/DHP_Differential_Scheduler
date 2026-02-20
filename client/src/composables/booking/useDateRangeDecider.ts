/**
 * useDateRangeDecider Composable
 * 
 * LEARNING: Calculates date range for displayed calendar month
 * WHY: Provides shared date range calculation for all API composables
 * PATTERN: Accepts displayed month parameter, returns reactive computed date range
 * 
 * Session 2.2.3: Created for API call timing optimization
 */

import { computed, type ComputedRef, type Ref } from 'vue'
import type { RFC3339DateTime } from '@shared/types/primitiveBrands'

export interface DisplayedMonth {
  year: number
  month: number // 0-11 (0 = January)
}

/**
 * useDateRangeDecider
 * 
 * LEARNING: Calculates date range for displayed calendar month
 * WHY: Single source of truth for date range used by all API composables
 * PATTERN: Reactive computed that updates when displayedMonth changes
 * 
 * @param displayedMonth - Reactive month parameter (year, month) from calendar widget
 * @returns Computed date range (start and end of month in UTC)
 */
export function useDateRangeDecider(
  displayedMonth?: Ref<DisplayedMonth> | ComputedRef<DisplayedMonth>
): ComputedRef<{ start: RFC3339DateTime; end: RFC3339DateTime }> {
  // Default to current month if no month provided
  const defaultMonth = computed<DisplayedMonth>(() => {
    const now = new Date()
    return { year: now.getUTCFullYear(), month: now.getUTCMonth() }
  })
  
  const month = displayedMonth || defaultMonth
  
  return computed(() => {
    const monthValue = month.value
    const year = monthValue.year
    const monthIndex = monthValue.month // 0-11 (0 = January)
    
    // Start of displayed month (UTC)
    const start = new Date(Date.UTC(year, monthIndex, 1, 0, 0, 0, 0))
    
    // End of displayed month (UTC)
    const end = new Date(Date.UTC(year, monthIndex + 1, 0, 23, 59, 59, 999))
    
    return {
      start: start.toISOString() as RFC3339DateTime,
      end: end.toISOString() as RFC3339DateTime
    }
  })
}
