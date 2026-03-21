/**
 * Contract tests for appointment type definitions.
 * Covers: AppointmentStatus, APPOINTMENT_STATUSES, and minimal AppointmentResponse shape.
 * Validates: no accidental breaking changes to types/appointment.ts.
 * Dependencies: vitest.
 */

import { describe, it, expect } from 'vitest'
import {
  type AppointmentStatus,
  APPOINTMENT_STATUSES,
  type AppointmentResponse,
  type AppointmentRequest,
  type TimeRange,
  type TimeSlot,
} from '@/types/appointment'

const EXPECTED_STATUSES: AppointmentStatus[] = [
  'started',
  'held',
  'rescheduling',
  'quoted',
  'submitted',
  'confirmed',
  'cancelled',
  'deleted',
]

describe('appointment contract', () => {
  describe('APPOINTMENT_STATUSES', () => {
    it('matches expected status list', () => {
      expect(APPOINTMENT_STATUSES).toEqual(EXPECTED_STATUSES)
    })

    it('each entry is a string', () => {
      APPOINTMENT_STATUSES.forEach((s) => {
        expect(typeof s).toBe('string')
      })
    })
  })

  describe('AppointmentResponse minimal shape', () => {
    it('dummy object satisfies required fields', () => {
      const minimal: AppointmentResponse = {
        id: 'apt-1',
        isQuoteMode: false,
        status: 'started',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      }
      expect(minimal.id).toBe('apt-1')
      expect(minimal.status).toBe('started')
      expect(minimal.isQuoteMode).toBe(false)
      expect(minimal.createdAt).toBeDefined()
      expect(minimal.updatedAt).toBeDefined()
    })
  })

  describe('AppointmentRequest and domain types', () => {
    it('AppointmentRequest accepts empty optional shape', () => {
      const req: AppointmentRequest = {}
      expect(req).toBeDefined()
    })

    it('TimeRange has required fields', () => {
      const tr: TimeRange = {
        startTime: '2025-01-01T09:00:00Z',
        endTime: '2025-01-01T10:00:00Z',
        duration: 60,
      }
      expect(tr.duration).toBe(60)
    })

    it('TimeSlot extends TimeRange with slotKind', () => {
      const slot: TimeSlot = {
        startTime: '2025-01-01T09:00:00Z',
        endTime: '2025-01-01T10:00:00Z',
        duration: 60,
        slotKind: 'major',
        isAvailable: true,
      }
      expect(slot.slotKind).toBe('major')
      expect(slot.isAvailable).toBe(true)
    })
  })
})
