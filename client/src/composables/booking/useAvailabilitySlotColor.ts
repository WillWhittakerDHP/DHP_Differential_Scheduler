/**
 * useAvailabilitySlotColor Composable
 * 
 * LEARNING: Determines color for appointment slot grid and calendar date availability
 * WHY: Centralizes visual state logic for both slot buttons and calendar date buttons
 * PATTERN: Composable that provides computed properties for slot color and date availability
 * 
 * Responsibilities:
 * - slotColor: Maps startTimeType to Vuetify color prop (primary/secondary)
 * - allowedDates: Function for VDatePicker's allowed-dates prop — disables days with no available slots
 * - firstAvailableDate: Earliest date in slotsByDay with at least one available slot
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
   * LEARNING: Maps startTimeType to Vuetify color prop
   * WHY: Provides visual distinction between major and minor perspectives
   * PATTERN: Minor uses secondary color, major/nonDifferential use primary color
   */
  slotColor: ComputedRef<'primary' | 'secondary'>

  /**
   * Function for VDatePicker's :allowed-dates prop
   * LEARNING: Disables calendar days where every slot is unavailable
   * WHY: Gives users immediate visual feedback about which days have openings
   * PATTERN: Returns true (allowed) for days not yet fetched or with ≥1 available slot;
   *          returns false (disabled) only for days fetched with zero available slots
   */
  allowedDates: ComputedRef<(date: unknown) => boolean>

  /**
   * Earliest date (YYYY-MM-DD) with at least one available slot, or null if none found yet
   * LEARNING: Scans slotsByDay in chronological order to find the first bookable day
   * WHY: Enables auto-navigating the calendar to the first available date
   * PATTERN: Returns null until server data loads; returns ISO date string once available
   */
  firstAvailableDate: ComputedRef<string | null>
}

/**
 * useAvailabilitySlotColor composable
 * 
 * LEARNING: Determines color for appointment slot grid and calendar date availability
 * WHY: Extracts color + date-availability logic from component to composable
 * PATTERN: Composable that returns reactive computed properties
 */
export function useAvailabilitySlotColor(
  params: UseAvailabilitySlotColorParams
): UseAvailabilitySlotColorReturn {
  const { startTimeType, slotsByDay } = params

  /**
   * LEARNING: Map startTimeType to color
   * WHY: Minor perspective uses secondary color, major/nonDifferential use primary color
   * PATTERN: Return 'secondary' for minor, 'primary' for major/nonDifferential
   */
  const slotColor = computed<'primary' | 'secondary'>(() => {
    if (startTimeType.value === 'minor') {
      return 'secondary'
    }
    return 'primary'
  })

  /**
   * LEARNING: Build allowed-dates function from slotsByDay data
   * WHY: VDatePicker's allowed-dates prop accepts (date) => boolean
   * PATTERN: 
   *   - Normalize the incoming date value to a 'YYYY-MM-DD' key
   *   - If the day has NOT been fetched yet → allow it (don't block unfetched days)
   *   - If the day HAS been fetched but every slot is unavailable → disable it
   *   - If the day has at least one available slot → allow it
   */
  const allowedDates = computed(() => {
    // LEARNING: Capture the current Map reference so the function closes over a snapshot
    // WHY: Vue re-evaluates this computed when slotsByDay changes, producing a fresh function
    const slotsMap = slotsByDay.value

    return (date: unknown): boolean => {
      const dateKey = normalizeDateToKey(date)
      if (!dateKey) return true // Could not parse → allow by default

      const slotsForDay = slotsMap.get(dateKey)

      // LEARNING: Day not yet in cache → allow so clicking triggers per-day fetch
      // WHY: useComputedAvailability fetches day ±1 on selection; blocking here would prevent that
      if (!slotsForDay) return true

      // LEARNING: Day fetched but has zero slots (e.g. weekend / holiday) → allow
      // WHY: An empty array means the server returned no slot windows, not that slots are blocked
      if (slotsForDay.length === 0) return true

      // LEARNING: Day has slots — allow if at least one is available
      return slotsForDay.some(slot => slot.isAvailable)
    }
  })

  /**
   * LEARNING: Find the earliest date in slotsByDay that has at least one available slot
   * WHY: Allows auto-navigating the calendar and showing a notification when today is fully booked
   * PATTERN: Sort Map keys chronologically, return the first with an available slot; null if none
   */
  const firstAvailableDate = computed<string | null>(() => {
    const slotsMap = slotsByDay.value
    if (slotsMap.size === 0) return null

    // LEARNING: Map keys are 'YYYY-MM-DD' strings — lexicographic sort equals chronological sort
    const sortedDays = Array.from(slotsMap.keys()).sort()

    for (const dayKey of sortedDays) {
      const slots = slotsMap.get(dayKey)
      if (slots && slots.length > 0 && slots.some(slot => slot.isAvailable)) {
        return dayKey
      }
    }

    // LEARNING: All fetched days are fully booked — return null
    return null
  })

  return {
    slotColor,
    allowedDates,
    firstAvailableDate
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Normalize a VDatePicker date value to 'YYYY-MM-DD' string
 * LEARNING: VDatePicker may pass Date objects, ISO strings, or other formats
 * WHY: We need a consistent key to look up in slotsByDay Map
 * PATTERN: Handle Date, string, and fallback cases
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
    // Handle ISO strings like '2026-02-10T00:00:00.000Z' or plain 'YYYY-MM-DD'
    return date.includes('T') ? date.split('T')[0] : date
  }

  return null
}
