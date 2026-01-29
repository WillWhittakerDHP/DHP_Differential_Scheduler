/**
 * APPOINTMENT SLOT BUILDER TESTS
 * 
 * Unit tests for appointmentSlotBuilder utility functions.
 * Tests pure functions for building AppointmentShape and AppointmentSlot.
 * 
 * What it covers:
 * - createTimeRange: Time range creation from start time and duration
 * - createTimeSlot: Time slot creation with flags
 * - sumDuration: Sum baseTime for parts matching predicate
 * - sumOnSite, sumClientPresent, sumMoveable, sumTotal: Duration sum helpers
 * - buildAppointmentShape: Building appointment shape from block instances
 * - applyShapeToTime: Applying shape to specific start time
 * - derivePerspective: Deriving TimeRange for given perspective
 * 
 * How it works:
 * - Tests pure functions with various inputs
 * - Tests edge cases (empty arrays, zero durations, null values)
 * - Tests validation logic (endTime alignment)
 * 
 * Dependencies:
 * - vitest for testing
 */

import { describe, it, expect, vi } from 'vitest'
import {
  createTimeRange,
  createTimeSlot,
  sumDuration,
  sumOnSite,
  sumClientPresent,
  sumMoveable,
  sumTotal,
  buildAppointmentShape,
  applyShapeToTime,
  derivePerspective
} from '../appointmentSlotBuilder'
import type { BookingBlockInstance, BookingPartInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { AppointmentShape, AppointmentSlot } from '@/types/appointment'

// Mock dependencies
vi.mock('@/utils/timeSlotCalculations', () => ({
  roundUpToIncrement: vi.fn((duration: number, increment: number) => {
    return Math.ceil(duration / increment) * increment
  })
}))

// Helper to create mock part instance
function createPartInstance(
  id: string,
  baseTime: number,
  options: {
    onSite?: boolean
    clientPresent?: boolean
    moveable?: boolean
    zeroOutPart?: boolean
    name?: string
    partShape?: string
  } = {}
): BookingPartInstance {
  return {
    id,
    entityKey: 'partInstance',
    name: options.name || `Part ${id}`,
    partShape: options.partShape || 'shape-1',
    onSite: options.onSite ?? false,
    clientPresent: options.clientPresent ?? false,
    moveable: options.moveable ?? false,
    baseTime,
    rateOverBaseTime: 0,
    baseFee: 0,
    rateOverBaseFee: 0,
    orderIndex: 0,
    disabled: false,
    zeroOutPart: options.zeroOutPart ?? false
  } as BookingPartInstance
}

// Helper to create mock block instance
function createBlockInstance(
  id: string,
  partInstances: BookingPartInstance[] = []
): BookingBlockInstance {
  return {
    id,
    entityKey: 'blockInstance',
    name: `Block ${id}`,
    baseSqFt: 0,
    partInstances
  } as BookingBlockInstance
}

describe('appointmentSlotBuilder', () => {
  describe('createTimeRange', () => {
    it('should create time range from start time and duration', () => {
      const startTime = '2026-01-15T10:00:00Z'
      const duration = 60 // 60 minutes
      
      const result = createTimeRange(startTime, duration)
      
      expect(result.startTime).toBe('2026-01-15T10:00:00.000Z')
      expect(result.endTime).toBe('2026-01-15T11:00:00.000Z')
      expect(result.duration).toBe(60)
    })

    it('should handle zero duration', () => {
      const startTime = '2026-01-15T10:00:00Z'
      const duration = 0
      
      const result = createTimeRange(startTime, duration)
      
      expect(result.startTime).toBe('2026-01-15T10:00:00.000Z')
      expect(result.endTime).toBe('2026-01-15T10:00:00.000Z')
      expect(result.duration).toBe(0)
    })

    it('should handle negative duration', () => {
      const startTime = '2026-01-15T10:00:00Z'
      const duration = -30
      
      const result = createTimeRange(startTime, duration)
      
      expect(result.startTime).toBe('2026-01-15T10:00:00.000Z')
      expect(result.endTime).toBe('2026-01-15T09:30:00.000Z')
      expect(result.duration).toBe(-30)
    })
  })

  describe('createTimeSlot', () => {
    it('should create time slot with all flags', () => {
      const startTime = '2026-01-15T10:00:00Z'
      const duration = 60
      const flags = {
        onSite: true,
        clientPresent: true,
        moveable: false,
        isAvailable: true
      }
      
      const result = createTimeSlot(startTime, duration, flags)
      
      expect(result.startTime).toBe('2026-01-15T10:00:00.000Z')
      expect(result.endTime).toBe('2026-01-15T11:00:00.000Z')
      expect(result.duration).toBe(60)
      expect(result.onSite).toBe(true)
      expect(result.clientPresent).toBe(true)
      expect(result.moveable).toBe(false)
      expect(result.isAvailable).toBe(true)
    })
  })

  describe('sumDuration', () => {
    it('should sum baseTime for parts matching predicate', () => {
      const parts = [
        createPartInstance('1', 30, { onSite: true }),
        createPartInstance('2', 45, { onSite: false }),
        createPartInstance('3', 60, { onSite: true })
      ]
      
      const result = sumDuration(parts, part => part.onSite === true)
      
      expect(result).toBe(90) // 30 + 60
    })

    it('should return 0 for empty array', () => {
      const result = sumDuration([], () => true)
      expect(result).toBe(0)
    })

    it('should handle parts with undefined baseTime', () => {
      const parts = [
        createPartInstance('1', 30),
        { ...createPartInstance('2', 0), baseTime: undefined } as BookingPartInstance
      ]
      
      const result = sumDuration(parts, () => true)
      expect(result).toBe(30)
    })
  })

  describe('sumOnSite', () => {
    it('should sum baseTime for parts where onSite is true', () => {
      const parts = [
        createPartInstance('1', 30, { onSite: true }),
        createPartInstance('2', 45, { onSite: false }),
        createPartInstance('3', 60, { onSite: true })
      ]
      
      const result = sumOnSite(parts)
      expect(result).toBe(90)
    })
  })

  describe('sumClientPresent', () => {
    it('should sum baseTime for parts where clientPresent is true', () => {
      const parts = [
        createPartInstance('1', 30, { clientPresent: true }),
        createPartInstance('2', 45, { clientPresent: false }),
        createPartInstance('3', 60, { clientPresent: true })
      ]
      
      const result = sumClientPresent(parts)
      expect(result).toBe(90)
    })
  })

  describe('sumMoveable', () => {
    it('should sum baseTime for parts where moveable is true', () => {
      const parts = [
        createPartInstance('1', 30, { moveable: true }),
        createPartInstance('2', 45, { moveable: false }),
        createPartInstance('3', 60, { moveable: true })
      ]
      
      const result = sumMoveable(parts)
      expect(result).toBe(90)
    })
  })

  describe('sumTotal', () => {
    it('should sum baseTime for all parts', () => {
      const parts = [
        createPartInstance('1', 30),
        createPartInstance('2', 45),
        createPartInstance('3', 60)
      ]
      
      const result = sumTotal(parts)
      expect(result).toBe(135)
    })
  })

  describe('buildAppointmentShape', () => {
    it('should return empty shape for empty block instances', () => {
      const result = buildAppointmentShape([])
      
      expect(result.earlyArrivalShape).toBeNull()
      expect(result.dataCollectionShape).toBeNull()
      expect(result.reportWritingShape).toBeNull()
      expect(result.clientPresentationShape).toBeNull()
      expect(result.totalOnSiteDuration).toBe(0)
      expect(result.totalClientPresentDuration).toBe(0)
      expect(result.totalMoveableDuration).toBe(0)
      expect(result.totalDuration).toBe(0)
      expect(result.clientStartOffset).toBe(0)
    })

    it('should build shape from block instances with parts', () => {
      const parts = [
        createPartInstance('1', 30, { onSite: true, clientPresent: true, moveable: true, partShape: 'early-arrival' }),
        createPartInstance('2', 45, { onSite: true, clientPresent: false, partShape: 'data-collection' }),
        createPartInstance('3', 60, { onSite: false, clientPresent: true, partShape: 'report-writing' })
      ]
      const blockInstance = createBlockInstance('block-1', parts)
      
      const result = buildAppointmentShape([blockInstance])
      
      expect(result.totalDuration).toBe(135)
      expect(result.totalOnSiteDuration).toBe(75) // 30 + 45, rounded
      expect(result.totalClientPresentDuration).toBe(90) // 30 + 60
      expect(result.totalMoveableDuration).toBe(30) // moveable=true
      expect(result.clientStartOffset).toBe(45) // onSite=true, clientPresent=false
    })

    it('should zero out finalized parts when zeroOutPart is true', () => {
      const parts = [
        createPartInstance('1', 30, { onSite: true, moveable: true, partShape: 'early-arrival', zeroOutPart: true }),
        createPartInstance('2', 45, { onSite: true, moveable: true, partShape: 'early-arrival' })
      ]
      const blockInstance = createBlockInstance('block-1', parts)
      
      const result = buildAppointmentShape([blockInstance])
      
      // Early arrival shape should be null (zeroed out)
      expect(result.earlyArrivalShape).toBeNull()
      // Total duration should exclude zeroed parts
      expect(result.totalDuration).toBe(0)
    })

    it('should handle multiple block instances', () => {
      const block1 = createBlockInstance('block-1', [
        createPartInstance('1', 30, { onSite: true, moveable: true, partShape: 'early-arrival' })
      ])
      const block2 = createBlockInstance('block-2', [
        createPartInstance('2', 45, { onSite: true, clientPresent: false, partShape: 'data-collection' })
      ])
      
      const result = buildAppointmentShape([block1, block2])
      
      expect(result.totalDuration).toBe(75)
    })
  })

  describe('applyShapeToTime', () => {
    it('should apply shape to start time', () => {
      const shape: AppointmentShape = {
        earlyArrivalShape: { duration: 30, onSite: true, clientPresent: true, moveable: false },
        dataCollectionShape: null,
        reportWritingShape: null,
        clientPresentationShape: null,
        totalOnSiteDuration: 30,
        totalClientPresentDuration: 30,
        totalMoveableDuration: 0,
        totalDuration: 30,
        clientStartOffset: 0
      }
      
      const result = applyShapeToTime(shape, '2026-01-15T10:00:00Z', 0, undefined, true)
      
      expect(result.buttonIndex).toBe(0)
      expect(result.isAvailable).toBe(true)
      expect(result.earlyArrivalSlot?.startTime).toBe('2026-01-15T10:00:00.000Z')
      expect(result.earlyArrivalSlot?.endTime).toBe('2026-01-15T10:30:00.000Z')
      expect(result.totalTime.startTime).toBe('2026-01-15T10:00:00.000Z')
      expect(result.totalTime.endTime).toBe('2026-01-15T10:30:00.000Z')
    })

    it('should use fallbackDuration when totalDuration is 0', () => {
      const shape: AppointmentShape = {
        earlyArrivalShape: null,
        dataCollectionShape: null,
        reportWritingShape: null,
        clientPresentationShape: null,
        totalOnSiteDuration: 0,
        totalClientPresentDuration: 0,
        totalMoveableDuration: 0,
        totalDuration: 0,
        clientStartOffset: 0
      }
      
      const result = applyShapeToTime(shape, '2026-01-15T10:00:00Z', 0, 60, true)
      
      expect(result.totalTime.duration).toBe(60)
    })

    it('should validate that totalClientPresent and totalOnSite end at same time', () => {
      const shape: AppointmentShape = {
        earlyArrivalShape: null,
        dataCollectionShape: null,
        reportWritingShape: null,
        clientPresentationShape: null,
        totalOnSiteDuration: 60,
        totalClientPresentDuration: 30,
        totalMoveableDuration: 0,
        totalDuration: 60,
        clientStartOffset: 30
      }
      
      // Should not throw - clientPresent ends when onSite ends
      const result = applyShapeToTime(shape, '2026-01-15T10:00:00Z', 0, undefined, true)
      
      expect(result.totalOnSite?.endTime).toBe(result.totalClientPresent?.endTime)
    })

    it('should ensure totalClientPresent and totalOnSite end times match when both exist', () => {
      // The implementation calculates totalClientPresent to end when totalOnSite ends
      // This test verifies that the validation ensures they match
      const shape: AppointmentShape = {
        earlyArrivalShape: null,
        dataCollectionShape: null,
        reportWritingShape: null,
        clientPresentationShape: null,
        totalOnSiteDuration: 60,
        totalClientPresentDuration: 30,
        totalMoveableDuration: 0,
        totalDuration: 60,
        clientStartOffset: 30 // Client starts 30 minutes after inspector
      }
      
      const result = applyShapeToTime(shape, '2026-01-15T10:00:00Z', 0, undefined, true)
      
      // Both should exist
      expect(result.totalOnSite).toBeTruthy()
      expect(result.totalClientPresent).toBeTruthy()
      // They should end at the same time (when inspector finishes on-site work)
      expect(result.totalOnSite?.endTime).toBe(result.totalClientPresent?.endTime)
    })
  })

  describe('derivePerspective', () => {
    it('should derive onSite perspective', () => {
      const slot: AppointmentSlot = {
        buttonIndex: 0,
        isAvailable: true,
        earlyArrivalSlot: null,
        dataCollectionSlot: null,
        reportWritingSlot: null,
        clientPresentationSlot: null,
        totalOnSite: { startTime: '2026-01-15T10:00:00Z' as any, endTime: '2026-01-15T11:00:00Z' as any, duration: 60 },
        totalClientPresent: null,
        totalMoveable: null,
        totalTime: { startTime: '2026-01-15T10:00:00Z' as any, endTime: '2026-01-15T12:00:00Z' as any, duration: 120 }
      }
      
      const result = derivePerspective(slot, 'onSite')
      
      expect(result).toBe(slot.totalOnSite)
    })

    it('should fallback to totalTime when totalOnSite is null', () => {
      const slot: AppointmentSlot = {
        buttonIndex: 0,
        isAvailable: true,
        earlyArrivalSlot: null,
        dataCollectionSlot: null,
        reportWritingSlot: null,
        clientPresentationSlot: null,
        totalOnSite: null,
        totalClientPresent: null,
        totalMoveable: null,
        totalTime: { startTime: '2026-01-15T10:00:00Z' as any, endTime: '2026-01-15T12:00:00Z' as any, duration: 120 }
      }
      
      const result = derivePerspective(slot, 'onSite')
      
      expect(result).toBe(slot.totalTime)
    })

    it('should derive clientPresent perspective', () => {
      const slot: AppointmentSlot = {
        buttonIndex: 0,
        isAvailable: true,
        earlyArrivalSlot: null,
        dataCollectionSlot: null,
        reportWritingSlot: null,
        clientPresentationSlot: null,
        totalOnSite: null,
        totalClientPresent: { startTime: '2026-01-15T10:30:00Z' as any, endTime: '2026-01-15T11:00:00Z' as any, duration: 30 },
        totalMoveable: null,
        totalTime: { startTime: '2026-01-15T10:00:00Z' as any, endTime: '2026-01-15T12:00:00Z' as any, duration: 120 }
      }
      
      const result = derivePerspective(slot, 'clientPresent')
      
      expect(result).toBe(slot.totalClientPresent)
    })

    it('should derive nonDifferential perspective', () => {
      const slot: AppointmentSlot = {
        buttonIndex: 0,
        isAvailable: true,
        earlyArrivalSlot: null,
        dataCollectionSlot: null,
        reportWritingSlot: null,
        clientPresentationSlot: null,
        totalOnSite: { startTime: '2026-01-15T10:00:00Z' as any, endTime: '2026-01-15T11:00:00Z' as any, duration: 60 },
        totalClientPresent: null,
        totalMoveable: null,
        totalTime: { startTime: '2026-01-15T10:00:00Z' as any, endTime: '2026-01-15T12:00:00Z' as any, duration: 120 }
      }
      
      const result = derivePerspective(slot, 'nonDifferential')
      
      expect(result).toBe(slot.totalOnSite)
    })
  })
})
