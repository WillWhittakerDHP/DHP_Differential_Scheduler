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
  /**
   * Color for appointment slot grid
   */
  slotColor: ComputedRef<'primary' | 'secondary'>

  /**
   * Function for VDatePicker's :allowed-dates prop
   *          returns false (disabled) only for days fetched with zero available slots
   */
  allowedDates: ComputedRef<(date: unknown) => boolean>

  /**
   * Earliest date (YYYY-MM-DD) with at least one available slot, or null if none found yet
   */
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

  /**
   */
  const slotColor = computed<'primary' | 'secondary'>(() => {
    if (startTimeType.value === 'minor') {
      return 'secondary'
    }
    return 'primary'
  })

  /**
   *   - Normalize the incoming date value to a 'YYYY-MM-DD' key
   *   - If the day has NOT been fetched yet → allow it (don't block unfetched days)
   *   - If the day HAS been fetched but every slot is unavailable → disable it
   *   - If the day has at least one available slot → allow it
   */
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

  /**
   */
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


/**
 * WHY: Normalize a VDatePicker date value to 'YYYY-MM-DD' string
LEARNING: VDat...
 */
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
