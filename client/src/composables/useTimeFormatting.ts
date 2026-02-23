/**
 * useTimeFormatting (shim)
 *
 * This composable remains as a stable import point for existing call sites.
 */

import type { TimeRange, TimeSlot } from '@/types/appointment'
import {
  areSlotsEqual,
  formatDuration,
  formatTimeRange,
  getFirstAvailabilityDate,
  getTodayDate,
} from '@/utils/time/timeFormatting'

export type { TimeRange, TimeSlot }

export interface UseTimeFormattingReturn {
  formatTimeRange: (range: TimeRange | TimeSlot) => string
  areSlotsEqual: (
    slot1: TimeRange | TimeSlot | null, 
    slot2: TimeRange | TimeSlot | null
  ) => boolean
  formatDuration: (minutes: number) => string
  getTodayDate: () => string
  getFirstAvailabilityDate: (
    timeSlots: (TimeRange | TimeSlot)[] | { value: (TimeRange | TimeSlot)[] }
  ) => string
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

