/**
 * SLOT COMPUTATION SERVICE TESTS
 *
 * Unit tests for server-side slot generation and constraint checking.
 * Covers: slot generation for a date range, range/overlap/capacity checks,
 * and drive-time anchoring (buffer at event end, not OOO end).
 *
 * What it covers:
 * - computeSlotsForDateRange returns slots keyed by YYYY-MM-DD
 * - Business hours and timezone: only slots within day boundaries
 * - Drive-from buffer anchored at event end (not at OOO end)
 * - Direct overlap with event and OOO marks slot unavailable
 *
 * Dependencies: jest, shared types, date-fns-tz
 */

import { describe, it, expect } from '@jest/globals'
import { computeSlotsForDateRange } from '../slotComputationService.js'
import type {
  CalendarEvent,
  Constraint,
  RFC3339DateTime,
} from '../../../../shared/types/availabilityTypes.js'
import type { BusinessHoursConfig } from '../../../../shared/types/availabilityTypes.js'

const UTC = 'UTC'

function businessHoursAllDays(): BusinessHoursConfig['hours'] {
  const day = {
    start: '2000-01-01T09:00:00.000Z' as RFC3339DateTime,
    end: '2000-01-01T17:00:00.000Z' as RFC3339DateTime,
  }
  return {
    0: day,
    1: day,
    2: day,
    3: day,
    4: day,
    5: day,
    6: day,
  }
}

function rangeConstraintWithBusinessHours(hours: BusinessHoursConfig['hours']): Constraint {
  return {
    category: 'range',
    type: 'businessHours',
    enforcement: 'hard',
    config: { hours },
  }
}

describe('slotComputationService', () => {
  describe('computeSlotsForDateRange', () => {
    it('returns slots keyed by YYYY-MM-DD for a single day with business hours', () => {
      const dateRange = { start: '2026-02-10T00:00:00.000Z', end: '2026-02-11T00:00:00.000Z' }
      const hours = businessHoursAllDays()
      const constraints: Constraint[] = [rangeConstraintWithBusinessHours(hours)]

      const result = computeSlotsForDateRange(
        dateRange,
        60,
        60,
        constraints,
        [],
        [],
        {},
        { hours },
        UTC
      )

      expect(Object.keys(result)).toContain('2026-02-10')
      const slots = result['2026-02-10']
      expect(Array.isArray(slots)).toBe(true)
      expect(slots.length).toBeGreaterThan(0)
      expect(slots[0]).toMatchObject({
        duration: 60,
        startTime: expect.any(String),
        endTime: expect.any(String),
        isAvailable: true,
        violations: [],
      })
    })

    it('drive-from buffer is anchored at event end, not at OOO end', () => {
      // Event 10:00–12:00 UTC, driveFrom 20 min → buffer 12:00–12:20 UTC
      // OOO 12:00–13:30 UTC (does not extend the buffer)
      // Slot 12:00–13:00 should be unavailable (overlaps buffer 12:00–12:20 and/or OOO)
      // Slot 12:20–13:20 should be available (no overlap with buffer; buffer ends at 12:20)
      const dateRange = { start: '2026-02-10T00:00:00.000Z', end: '2026-02-11T00:00:00.000Z' }
      const hours = businessHoursAllDays()
      const constraints: Constraint[] = [
        rangeConstraintWithBusinessHours(hours),
        {
          category: 'overlap',
          type: 'driveFromCandidate',
          placement: 'after',
          enforcement: 'hard',
          minutes: 20,
        },
      ]

      const placeId = 'place-1'
      const regularEvents: CalendarEvent[] = [
        {
          id: 'evt-1',
          start: '2026-02-10T10:00:00.000Z',
          end: '2026-02-10T12:00:00.000Z',
          placeId,
          summary: 'Meeting',
          eventType: 'default',
          transparency: 'opaque',
        },
      ]
      const outOfOfficeEvents: CalendarEvent[] = [
        {
          id: 'ooo-1',
          start: '2026-02-10T12:00:00.000Z',
          end: '2026-02-10T13:30:00.000Z',
          summary: 'OOO',
          eventType: 'outOfOffice',
          transparency: 'opaque',
        },
      ]
      const driveTimesByPlaceId: Record<string, { driveToCandidate?: number; driveFromCandidate?: number }> = {
        [placeId]: { driveFromCandidate: 20 },
      }

      const result = computeSlotsForDateRange(
        dateRange,
        60,
        15,
        constraints,
        regularEvents,
        outOfOfficeEvents,
        driveTimesByPlaceId,
        { hours },
        UTC
      )

      const slots = result['2026-02-10'] ?? []
      const slot1200 = slots.find((s) => s.startTime.startsWith('2026-02-10T12:00:00'))
      const slot1330 = slots.find((s) => s.startTime.startsWith('2026-02-10T13:30:00'))

      expect(slot1200).toBeDefined()
      expect(slot1200!.isAvailable).toBe(false)
      expect(
        slot1200!.violations.some((v) => v.startsWith('overlap.driveFromCandidate.buffer'))
      ).toBe(true)

      expect(slot1330).toBeDefined()
      expect(slot1330!.isAvailable).toBe(true)
      expect(slot1330!.violations).toEqual([])
    })

    it('marks slot unavailable when it directly overlaps an event', () => {
      const dateRange = { start: '2026-02-10T00:00:00.000Z', end: '2026-02-11T00:00:00.000Z' }
      const hours = businessHoursAllDays()
      const constraints: Constraint[] = [rangeConstraintWithBusinessHours(hours)]

      const regularEvents: CalendarEvent[] = [
        {
          id: 'evt-1',
          start: '2026-02-10T10:00:00.000Z',
          end: '2026-02-10T11:00:00.000Z',
          summary: 'Meeting',
          eventType: 'default',
          transparency: 'opaque',
        },
      ]

      const result = computeSlotsForDateRange(
        dateRange,
        60,
        60,
        constraints,
        regularEvents,
        [],
        {},
        { hours },
        UTC
      )

      const slots = result['2026-02-10'] ?? []
      const duringEvent = slots.find((s) => s.startTime === '2026-02-10T10:00:00.000Z')
      expect(duringEvent).toBeDefined()
      expect(duringEvent!.isAvailable).toBe(false)
      expect(duringEvent!.violations.some((v) => v.includes('overlap') && v.includes('direct'))).toBe(true)
    })
  })
})
