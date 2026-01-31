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
  createTimeRangesFromSlotShape,
  buildAppointmentShape,
  applyShapeToTime,
  derivePerspective
} from '../appointmentSlotBuilder'
import { calculateSlotShape } from '../partFinalizer'
import { createPartFinals, filterZeroedParts } from '../partFinalizer'
import type { PartFinal } from '../PartFinal'
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
    onSite?: 'true' | 'false' | 'override'
    clientPresent?: 'true' | 'false' | 'override'
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
      onSite: (options.onSite ?? 'false') as 'true' | 'false' | 'override',
      clientPresent: (options.clientPresent ?? 'false') as 'true' | 'false' | 'override',
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
        onSite: 'true',
        clientPresent: 'true',
        moveable: false,
        isAvailable: true
      }
      
      const result = createTimeSlot(startTime, duration, flags)
      
      expect(result.startTime).toBe('2026-01-15T10:00:00.000Z')
      expect(result.endTime).toBe('2026-01-15T11:00:00.000Z')
      expect(result.duration).toBe(60)
      expect(result.onSite).toBe('true')
      expect(result.clientPresent).toBe('true')
      expect(result.moveable).toBe(false)
      expect(result.isAvailable).toBe(true)
    })
  })

  describe('createTimeRangesFromSlotShape', () => {
    it('should create time ranges from SlotShape and start time', () => {
      const slotShape = {
        totalDuration: 120,
        onSite: 90,
        clientPresent: 60,
        moveable: 30,
        clientStartOffset: 30
      }
      const startTime = '2026-01-15T10:00:00Z'
      
      const result = createTimeRangesFromSlotShape(slotShape, startTime)
      
      expect(result.totalTimeRange?.duration).toBe(120)
      expect(result.onSiteTimeRange?.duration).toBe(90)
      expect(result.clientPresentTimeRange?.duration).toBe(60)
      expect(result.moveableTimeRange?.duration).toBe(30)
      expect(result.clientPresentTimeRange?.startTime).toBe('2026-01-15T10:30:00.000Z') // startTime + 30 min offset
    })

    it('should return null for zero durations', () => {
      const slotShape = {
        totalDuration: 0,
        onSite: 0,
        clientPresent: 0,
        moveable: 0,
        clientStartOffset: 0
      }
      const startTime = '2026-01-15T10:00:00Z'
      
      const result = createTimeRangesFromSlotShape(slotShape, startTime)
      
      expect(result.totalTimeRange).toBeNull()
      expect(result.onSiteTimeRange).toBeNull()
      expect(result.clientPresentTimeRange).toBeNull()
      expect(result.moveableTimeRange).toBeNull()
    })
  })

  describe('buildAppointmentShape', () => {
    it('should return empty shape for empty block instances', () => {
      const result = buildAppointmentShape([])
      
      expect(result.finalizedParts).toEqual([])
      expect(result.slotShape.totalDuration).toBe(0)
      expect(result.slotShape.onSite).toBe(0)
      expect(result.slotShape.clientPresent).toBe(0)
      expect(result.slotShape.moveable).toBe(0)
      expect(result.slotShape.clientStartOffset).toBe(0)
    })

    it('should build shape from block instances with parts', () => {
      const parts = [
        createPartInstance('1', 30, { onSite: 'true', clientPresent: 'true', moveable: true, partShape: 'shape-1' }),
        createPartInstance('2', 45, { onSite: 'true', clientPresent: 'false', partShape: 'shape-2' }),
        createPartInstance('3', 60, { onSite: 'false', clientPresent: 'true', partShape: 'shape-3' })
      ]
      const blockInstance = createBlockInstance('block-1', parts)
      
      const result = buildAppointmentShape([blockInstance])
      
      expect(result.finalizedParts.length).toBe(3) // Three different part shapes
      expect(result.slotShape.totalDuration).toBe(135) // 30 + 45 + 60
      expect(result.slotShape.onSite).toBe(75) // 30 + 45 (rounded)
      expect(result.slotShape.clientPresent).toBe(90) // 30 + 60
      expect(result.slotShape.moveable).toBe(30) // moveable=true
      expect(result.slotShape.clientStartOffset).toBe(45) // onSite=true, clientPresent=false
    })

    it('should zero out finalized parts when zeroOutPart is true', () => {
      const parts = [
        createPartInstance('1', 30, { onSite: 'true', moveable: true, partShape: 'shape-1', zeroOutPart: true }),
        createPartInstance('2', 45, { onSite: 'true', moveable: true, partShape: 'shape-1' })
      ]
      const blockInstance = createBlockInstance('block-1', parts)
      
      const result = buildAppointmentShape([blockInstance])
      
      // Zeroed parts should be filtered out
      expect(result.finalizedParts.length).toBe(0)
      expect(result.slotShape.totalDuration).toBe(0)
    })

    it('should handle multiple block instances', () => {
      const block1 = createBlockInstance('block-1', [
        createPartInstance('1', 30, { onSite: 'true', moveable: true, partShape: 'shape-1' })
      ])
      const block2 = createBlockInstance('block-2', [
        createPartInstance('2', 45, { onSite: 'true', clientPresent: 'false', partShape: 'shape-2' })
      ])
      
      const result = buildAppointmentShape([block1, block2])
      
      expect(result.slotShape.totalDuration).toBe(75)
      expect(result.finalizedParts.length).toBe(2) // Two different part shapes
    })
  })

  describe('applyShapeToTime', () => {
    it('should apply shape to start time', () => {
      const finalizedParts = createFinalizedParts([
        createPartInstance('1', 30, { onSite: 'true', clientPresent: 'true', moveable: true, partShape: 'shape-1' })
      ])
      const shape: AppointmentShape = {
        finalizedParts: filterZeroedParts(finalizedParts),
        slotShape: calculateSlotShape(filterZeroedParts(finalizedParts))
      }
      
      const result = applyShapeToTime(shape, '2026-01-15T10:00:00Z', 0, undefined, true)
      
      expect(result.buttonIndex).toBe(0)
      expect(result.isAvailable).toBe(true)
      expect(result.shape).toBe(shape)
      expect(result.startTime).toBe('2026-01-15T10:00:00Z')
      expect(result.totalTimeRange?.startTime).toBe('2026-01-15T10:00:00.000Z')
      expect(result.totalTimeRange?.endTime).toBe('2026-01-15T10:30:00.000Z')
      expect(result.onSiteTimeRange?.duration).toBe(30)
    })

    it('should use fallbackDuration when totalDuration is 0', () => {
      const shape: AppointmentShape = {
        finalizedParts: [],
        slotShape: {
          totalDuration: 0,
          onSite: 0,
          clientPresent: 0,
          moveable: 0,
          clientStartOffset: 0
        }
      }
      
      const result = applyShapeToTime(shape, '2026-01-15T10:00:00Z', 0, 60, true)
      
      expect(result.totalTimeRange?.duration).toBe(60)
    })

    it('should validate that clientPresentTimeRange and onSiteTimeRange end at same time', () => {
      const finalizedParts = createPartFinals([
        createPartInstance('1', 30, { onSite: true, clientPresent: false, partShape: 'shape-1' }),
        createPartInstance('2', 30, { onSite: true, clientPresent: true, partShape: 'shape-2' })
      ])
      const shape: AppointmentShape = {
        finalizedParts: filterZeroedParts(finalizedParts),
        slotShape: calculateSlotShape(filterZeroedParts(finalizedParts))
      }
      
      // Should not throw - clientPresentTimeRange ends when onSiteTimeRange ends
      const result = applyShapeToTime(shape, '2026-01-15T10:00:00Z', 0, undefined, true)
      
      expect(result.onSiteTimeRange?.endTime).toBe(result.clientPresentTimeRange?.endTime)
    })

    it('should ensure clientPresentTimeRange and onSiteTimeRange end times match when both exist', () => {
      // The implementation calculates clientPresentTimeRange to end when onSiteTimeRange ends
      // This test verifies that the validation ensures they match
      const finalizedParts = createPartFinals([
        createPartInstance('1', 30, { onSite: true, clientPresent: false, partShape: 'shape-1' }),
        createPartInstance('2', 30, { onSite: true, clientPresent: true, partShape: 'shape-2' })
      ])
      const shape: AppointmentShape = {
        finalizedParts: filterZeroedParts(finalizedParts),
        slotShape: calculateSlotShape(filterZeroedParts(finalizedParts))
      }
      
      const result = applyShapeToTime(shape, '2026-01-15T10:00:00Z', 0, undefined, true)
      
      // Both should exist
      expect(result.onSiteTimeRange).toBeTruthy()
      expect(result.clientPresentTimeRange).toBeTruthy()
      // They should end at the same time (when inspector finishes on-site work)
      expect(result.onSiteTimeRange?.endTime).toBe(result.clientPresentTimeRange?.endTime)
    })
  })

  describe('derivePerspective', () => {
    it('should derive onSite perspective', () => {
      const shape: AppointmentShape = {
        finalizedParts: [],
        slotShape: {
          totalDuration: 120,
          onSite: 60,
          clientPresent: 0,
          moveable: 0,
          clientStartOffset: 0
        }
      }
      const slot: AppointmentSlot = {
        buttonIndex: 0,
        isAvailable: true,
        shape,
        startTime: '2026-01-15T10:00:00Z',
        onSiteTimeRange: { startTime: '2026-01-15T10:00:00Z' as any, endTime: '2026-01-15T11:00:00Z' as any, duration: 60 },
        clientPresentTimeRange: null,
        moveableTimeRange: null,
        totalTimeRange: { startTime: '2026-01-15T10:00:00Z' as any, endTime: '2026-01-15T12:00:00Z' as any, duration: 120 }
      }
      
      const result = derivePerspective(slot, 'onSite')
      
      expect(result).toBe(slot.onSiteTimeRange)
    })


    it('should fallback to totalTimeRange when onSiteTimeRange is null', () => {
      const shape: AppointmentShape = {
        finalizedParts: [],
        slotShape: {
          totalDuration: 120,
          onSite: 0,
          clientPresent: 0,
          moveable: 0,
          clientStartOffset: 0
        }
      }
      const slot: AppointmentSlot = {
        buttonIndex: 0,
        isAvailable: true,
        shape,
        startTime: '2026-01-15T10:00:00Z',
        onSiteTimeRange: null,
        clientPresentTimeRange: null,
        moveableTimeRange: null,
        totalTimeRange: { startTime: '2026-01-15T10:00:00Z' as any, endTime: '2026-01-15T12:00:00Z' as any, duration: 120 }
      }
      
      const result = derivePerspective(slot, 'onSite')
      
      expect(result).toBe(slot.totalTimeRange)
    })

    it('should derive clientPresent perspective', () => {
      const shape: AppointmentShape = {
        finalizedParts: [],
        slotShape: {
          totalDuration: 120,
          onSite: 60,
          clientPresent: 30,
          moveable: 0,
          clientStartOffset: 30
        }
      }
      const slot: AppointmentSlot = {
        buttonIndex: 0,
        isAvailable: true,
        shape,
        startTime: '2026-01-15T10:00:00Z',
        onSiteTimeRange: { startTime: '2026-01-15T10:00:00Z' as any, endTime: '2026-01-15T11:00:00Z' as any, duration: 60 },
        clientPresentTimeRange: { startTime: '2026-01-15T10:30:00Z' as any, endTime: '2026-01-15T11:00:00Z' as any, duration: 30 },
        moveableTimeRange: null,
        totalTimeRange: { startTime: '2026-01-15T10:00:00Z' as any, endTime: '2026-01-15T12:00:00Z' as any, duration: 120 }
      }
      
      const result = derivePerspective(slot, 'clientPresent')
      
      expect(result).toBe(slot.clientPresentTimeRange)
    })

    it('should fallback to totalTimeRange when clientPresentTimeRange is null', () => {
      const shape: AppointmentShape = {
        finalizedParts: [],
        slotShape: {
          totalDuration: 120,
          onSite: 60,
          clientPresent: 0,
          moveable: 0,
          clientStartOffset: 0
        }
      }
      const slot: AppointmentSlot = {
        buttonIndex: 0,
        isAvailable: true,
        shape,
        startTime: '2026-01-15T10:00:00Z',
        onSiteTimeRange: { startTime: '2026-01-15T10:00:00Z' as any, endTime: '2026-01-15T11:00:00Z' as any, duration: 60 },
        clientPresentTimeRange: null,
        moveableTimeRange: null,
        totalTimeRange: { startTime: '2026-01-15T10:00:00Z' as any, endTime: '2026-01-15T12:00:00Z' as any, duration: 120 }
      }
      
      const result = derivePerspective(slot, 'clientPresent')
      
      expect(result).toBe(slot.totalTimeRange)
    })

    it('should derive nonDifferential perspective', () => {
      const shape: AppointmentShape = {
        finalizedParts: [],
        slotShape: {
          totalDuration: 120,
          onSite: 60,
          clientPresent: 0,
          moveable: 0,
          clientStartOffset: 0
        }
      }
      const slot: AppointmentSlot = {
        buttonIndex: 0,
        isAvailable: true,
        shape,
        startTime: '2026-01-15T10:00:00Z',
        onSiteTimeRange: { startTime: '2026-01-15T10:00:00Z' as any, endTime: '2026-01-15T11:00:00Z' as any, duration: 60 },
        clientPresentTimeRange: null,
        moveableTimeRange: null,
        totalTimeRange: { startTime: '2026-01-15T10:00:00Z' as any, endTime: '2026-01-15T12:00:00Z' as any, duration: 120 }
      }
      
      const result = derivePerspective(slot, 'nonDifferential')
      
      expect(result).toBe(slot.onSiteTimeRange)
    })
  })
})
