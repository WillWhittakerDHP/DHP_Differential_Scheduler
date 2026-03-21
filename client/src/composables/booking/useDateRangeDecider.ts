import { computed, type ComputedRef, type Ref } from 'vue'
import type { RFC3339DateTime } from '@shared/types/primitiveBrands'
import type { DisplayedMonth } from '@/types/booking/dateRangeDecider'


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
    
    const start = new Date(Date.UTC(year, monthIndex, 1, 0, 0, 0, 0))
    
    const end = new Date(Date.UTC(year, monthIndex + 1, 0, 23, 59, 59, 999))
    
    return {
      start: start.toISOString() as RFC3339DateTime,
      end: end.toISOString() as RFC3339DateTime
    }
  })
}
