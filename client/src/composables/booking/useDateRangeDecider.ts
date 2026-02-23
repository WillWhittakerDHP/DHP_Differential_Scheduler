/**
 * useDateRangeDecider Composable
 * 
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
 * WHY: useDateRangeDecider

WHY: Single source of truth for date range used by ...
 */
export function useDateRangeDecider(
  displayedMonth?: Ref<DisplayedMonth> | ComputedRef<DisplayedMonth>
): ComputedRef<{ start: RFC3339DateTime; end: RFC3339DateTime }> {
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
