/**
 * useTimeFormatting (shim)
 *
 * WHY: The underlying logic is pure, so it now lives in `src/utils/time/timeFormatting.ts`.
 * This composable remains as a stable import point for existing call sites.
 */

import type { TimeSlot } from '@/utils/time/timeFormatting'
import {
  areSlotsEqual,
  formatDuration,
  formatTimeRange,
  getFirstAvailabilityDate,
  getTodayDate,
} from '@/utils/time/timeFormatting'

export type { TimeSlot }

export interface UseTimeFormattingReturn {
  formatTimeRange: (slot: TimeSlot) => string
  areSlotsEqual: (slot1: TimeSlot | null, slot2: TimeSlot | null) => boolean
  formatDuration: (minutes: number) => string
  getTodayDate: () => string
  getFirstAvailabilityDate: (timeSlots: TimeSlot[] | { value: TimeSlot[] }) => string
}

export function useTimeFormatting(): UseTimeFormattingReturn {
  return {
    formatTimeRange,
    areSlotsEqual,
    formatDuration,
    getTodayDate,
    getFirstAvailabilityDate,
  }
}

