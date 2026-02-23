/**
 * WHY: useAvailabilitySlotColor Composable

WHY: Centralizes visual state logic...
 */
import { computed, type ComputedRef, type Ref } from 'vue'
import type { ComputedSlot } from '@shared/types/availabilityTypes'

export interface UseAvailabilitySlotColorParams {
  startTimeType: Ref<'major' | 'minor' | 'nonDifferential'>
  /** Server-computed slots grouped by day key (YYYY-MM-DD) */
  slotsByDay: Ref<Map<string, ComputedSlot[]>>
}

export interface UseAvailabilitySlotColorReturn {
  slotColor: ComputedRef<'primary' | 'secondary'>

  allowedDates: ComputedRef<(date: unknown) => boolean>

  firstAvailableDate: ComputedRef<string | null>
}

/**
 * WHY: useAvailabilitySlotColor composable

WHY: Extracts color + date-availabi...
 */
export function useAvailabilitySlotColor(
  params: UseAvailabilitySlotColorParams
): UseAvailabilitySlotColorReturn {
  const { startTimeType, slotsByDay } = params

  const slotColor = computed<'primary' | 'secondary'>(() => {
    if (startTimeType.value === 'minor') {
      return 'secondary'
    }
    return 'primary'
  })

  const allowedDates = computed(() => {
    const slotsMap = slotsByDay.value

    return (date: unknown): boolean => {
      const dateKey = normalizeDateToKey(date)
      if (!dateKey) return true // Could not parse → allow by default

      const slotsForDay = slotsMap.get(dateKey)

      if (!slotsForDay) return true

      if (slotsForDay.length === 0) return true

      return slotsForDay.some(slot => slot.isAvailable)
    }
  })

  const firstAvailableDate = computed<string | null>(() => {
    const slotsMap = slotsByDay.value
    if (slotsMap.size === 0) return null

    const sortedDays = Array.from(slotsMap.keys()).sort()

    for (const dayKey of sortedDays) {
      const slots = slotsMap.get(dayKey)
      if (slots && slots.length > 0 && slots.some(slot => slot.isAvailable)) {
        return dayKey
      }
    }

    return null
  })

  return {
    slotColor,
    allowedDates,
    firstAvailableDate
  }
}


function normalizeDateToKey(date: unknown): string | null {
  if (date instanceof Date) {
    // LEARNING: Use UTC methods to avoid timezone shift issues
    const year = date.getUTCFullYear()
    const month = String(date.getUTCMonth() + 1).padStart(2, '0')
    const day = String(date.getUTCDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  if (typeof date === 'string') {
    return date.includes('T') ? date.split('T')[0] : date
  }

  return null
}
