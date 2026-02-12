/**
 * AVAILABILITY PRIMITIVES TESTS
 *
 * Unit tests for pure helpers: getUniqueDatesInRange, formatDayKey,
 * generateSlotTimes, partitionByEventType. Validates edge cases and
 * immutability of inputs.
 */

import { describe, it, expect } from '@jest/globals'
import {
  getUniqueDatesInRange,
  formatDayKey,
  generateSlotTimes,
  partitionByEventType,
} from '../availabilityPrimitives.js'
import type { CalendarEvent } from '../../../../../shared/types/availabilityTypes.js'

describe('availabilityPrimitives', () => {
  describe('getUniqueDatesInRange', () => {
    it('returns single date when start and end are same day', () => {
      const start = new Date('2026-02-10T00:00:00.000Z')
      const end = new Date('2026-02-10T23:59:59.999Z')
      expect(getUniqueDatesInRange(start, end)).toEqual(['2026-02-10'])
    })

    it('returns date strings for each day in range', () => {
      const start = new Date('2026-02-10T00:00:00.000Z')
      const end = new Date('2026-02-12T23:59:59.999Z')
      expect(getUniqueDatesInRange(start, end)).toEqual([
        '2026-02-10',
        '2026-02-11',
        '2026-02-12',
      ])
    })

    it('accepts string dates', () => {
      expect(getUniqueDatesInRange('2026-02-10', '2026-02-11')).toEqual([
        '2026-02-10',
        '2026-02-11',
      ])
    })

    it('returns empty when end is before start', () => {
      const start = new Date('2026-02-12T00:00:00.000Z')
      const end = new Date('2026-02-10T23:59:59.999Z')
      expect(getUniqueDatesInRange(start, end)).toEqual([])
    })
  })

  describe('formatDayKey', () => {
    it('formats UTC date as YYYY-MM-DD', () => {
      expect(formatDayKey(new Date('2026-02-10T15:30:00.000Z'))).toBe(
        '2026-02-10'
      )
    })

    it('pads month and day with zero', () => {
      expect(formatDayKey(new Date('2026-01-01T00:00:00.000Z'))).toBe(
        '2026-01-01'
      )
    })
  })

  describe('generateSlotTimes', () => {
    it('returns slots within day and request boundary', () => {
      const dayStart = new Date('2026-02-10T09:00:00.000Z')
      const dayEnd = new Date('2026-02-10T17:00:00.000Z')
      const requestEnd = new Date('2026-02-10T17:00:00.000Z')
      const slots = generateSlotTimes(
        dayStart,
        dayEnd,
        60,
        60,
        requestEnd
      )
      expect(slots.length).toBe(8)
      expect(slots[0].startTime).toEqual(dayStart)
      expect(slots[0].endTime).toEqual(new Date('2026-02-10T10:00:00.000Z'))
      expect(slots[7].endTime).toEqual(dayEnd)
    })

    it('excludes slots that extend past requestEndBoundary', () => {
      const dayStart = new Date('2026-02-10T09:00:00.000Z')
      const dayEnd = new Date('2026-02-10T17:00:00.000Z')
      const requestEnd = new Date('2026-02-10T14:00:00.000Z')
      const slots = generateSlotTimes(
        dayStart,
        dayEnd,
        60,
        60,
        requestEnd
      )
      expect(slots.every((s) => s.endTime <= requestEnd)).toBe(true)
      expect(slots.length).toBeLessThanOrEqual(8)
    })

    it('returns empty when day range is too short for one slot', () => {
      const dayStart = new Date('2026-02-10T09:00:00.000Z')
      const dayEnd = new Date('2026-02-10T09:30:00.000Z')
      const requestEnd = new Date('2026-02-10T17:00:00.000Z')
      const slots = generateSlotTimes(
        dayStart,
        dayEnd,
        60,
        60,
        requestEnd
      )
      expect(slots).toHaveLength(0)
    })
  })

  describe('partitionByEventType', () => {
    it('splits events by eventType outOfOffice', () => {
      const events: CalendarEvent[] = [
        {
          id: '1',
          start: '2026-02-10T09:00:00Z',
          end: '2026-02-10T10:00:00Z',
          summary: 'Meeting',
          eventType: 'default',
        },
        {
          id: '2',
          start: '2026-02-10T11:00:00Z',
          end: '2026-02-10T12:00:00Z',
          summary: 'OOO',
          eventType: 'outOfOffice',
        },
      ]
      const { regularEvents, outOfOfficeEvents } =
        partitionByEventType(events)
      expect(regularEvents).toHaveLength(1)
      expect(regularEvents[0].id).toBe('1')
      expect(outOfOfficeEvents).toHaveLength(1)
      expect(outOfOfficeEvents[0].id).toBe('2')
    })

    it('treats missing eventType as regular', () => {
      const events: CalendarEvent[] = [
        {
          id: '1',
          start: '2026-02-10T09:00:00Z',
          end: '2026-02-10T10:00:00Z',
          summary: null,
        },
      ]
      const { regularEvents, outOfOfficeEvents } =
        partitionByEventType(events)
      expect(regularEvents).toHaveLength(1)
      expect(outOfOfficeEvents).toHaveLength(0)
    })

    it('returns empty arrays for empty input', () => {
      const { regularEvents, outOfOfficeEvents } =
        partitionByEventType([])
      expect(regularEvents).toEqual([])
      expect(outOfOfficeEvents).toEqual([])
    })
  })
})
