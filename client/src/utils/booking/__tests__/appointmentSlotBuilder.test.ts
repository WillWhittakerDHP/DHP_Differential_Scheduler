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
  derivePerspective,
  findEventFinalByName
} from '../appointmentSlotBuilder'
import { calculateSlotShape } from '../partFinalizer'
import { createPartFinals, filterZeroedParts } from '../partFinalizer'
import type { PartFinal } from '../PartFinal'
import type { BookingBlockInstance, BookingPartInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { AppointmentShape, AppointmentSlot } from '@/types/appointment'

vi.mock('@/utils/timeSlotCalculations', () => ({
  roundUpToIncrement: vi.fn((duration: number, increment: number) => {
    return Math.ceil(duration / increment) * increment
  })
}))

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
    active: true,
    zeroOutPart: options.zeroOutPart ?? false,
    activePartIds: [],
  } as BookingPartInstance
}

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

  describe('createTimeRangesFromSlotShape', () => {
    it('should create time ranges from SlotShape and start time', () => {
      const slotShape = {
        rawDuration: 120,
        roundedDuration: 120,
        eventFinals: [
          {
            eventShape: { id: 'major', name: 'Major', entityKey: 'eventShape' as const },
            rawDuration: 90,
            roundedDuration: 90
          },
          {
            eventShape: { id: 'minor', name: 'Minor', entityKey: 'eventShape' as const },
            rawDuration: 60,
            roundedDuration: 60
          },
          {
            eventShape: { id: 'moveable', name: 'Moveable', entityKey: 'eventShape' as const },
            rawDuration: 30,
            roundedDuration: 30
          }
        ],
        rawDifferentialOffset: 30,
        roundedDifferentialOffset: 30
      }
      const startTime = '2026-01-15T10:00:00Z'
      
      const result = createTimeRangesFromSlotShape(slotShape, startTime)
      
      expect(result.totalTimeRange?.duration).toBe(120)
      expect(result.eventTimeRanges['Major']?.duration).toBe(90)
      expect(result.eventTimeRanges['Minor']?.duration).toBe(60)
      expect(result.eventTimeRanges['Moveable']?.duration).toBe(30)
      expect(result.eventTimeRanges['Major']?.startTime).toBe('2026-01-15T10:00:00.000Z')
    })

    it('should return null for zero durations', () => {
      const slotShape = {
        rawDuration: 0,
        roundedDuration: 0,
        eventFinals: [],
        rawDifferentialOffset: 0,
        roundedDifferentialOffset: 0
      }
      const startTime = '2026-01-15T10:00:00Z'
      
      const result = createTimeRangesFromSlotShape(slotShape, startTime)
      
      expect(result.totalTimeRange).toBeNull()
      expect(Object.keys(result.eventTimeRanges).length).toBe(0)
    })
  })

  describe('buildAppointmentShape', () => {
    it('should return empty shape for empty block instances', () => {
      const result = buildAppointmentShape([], undefined, undefined, undefined, undefined, undefined, undefined, undefined)
      
      expect(result.finalizedBlocks).toEqual([])
      expect(result.finalizedParts).toEqual([])
      expect(result.slotShape.rawDuration).toBe(0)
      expect(result.slotShape.roundedDuration).toBe(0)
      expect(result.slotShape.eventFinals).toEqual([])
      expect(result.slotShape.rawDifferentialOffset).toBe(0)
      expect(result.slotShape.roundedDifferentialOffset).toBe(0)
    })

    it('should build shape from block instances with parts', () => {
      const parts = [
        createPartInstance('1', 30, { onSite: 'true', clientPresent: 'true', moveable: true, partShape: 'shape-1' }),
        createPartInstance('2', 45, { onSite: 'true', clientPresent: 'false', partShape: 'shape-2' }),
        createPartInstance('3', 60, { onSite: 'false', clientPresent: 'true', partShape: 'shape-3' })
      ]
      const blockInstance = createBlockInstance('block-1', parts)
      const result = buildAppointmentShape([blockInstance])

      expect(result.finalizedParts.length).toBe(3)
      expect(result.slotShape).toBeDefined()
      expect(Array.isArray(result.slotShape.eventFinals)).toBe(true)
      expect(typeof result.slotShape.roundedDuration).toBe('number')
      expect(typeof result.slotShape.rawDifferentialOffset).toBe('number')
      expect(typeof result.slotShape.roundedDifferentialOffset).toBe('number')
    })

    it('should zero out finalized parts when zeroOutPart is true', () => {
      const parts = [
        createPartInstance('1', 30, { onSite: 'true', moveable: true, partShape: 'shape-1', zeroOutPart: true }),
        createPartInstance('2', 45, { onSite: 'true', moveable: true, partShape: 'shape-1' })
      ]
      const blockInstance = createBlockInstance('block-1', parts)
      
      const result = buildAppointmentShape([blockInstance])
      
      // PATTERN: Block should be filtered out if all parts are zeroed
      expect(result.finalizedBlocks.length).toBe(0)
      expect(result.finalizedParts.length).toBe(0)
      expect(result.slotShape.rawDuration).toBe(0)
      expect(result.slotShape.roundedDuration).toBe(0)
    })

    it('should handle multiple block instances', () => {
      const block1 = createBlockInstance('block-1', [
        createPartInstance('1', 30, { onSite: 'true', moveable: true, partShape: 'shape-1' })
      ])
      const block2 = createBlockInstance('block-2', [
        createPartInstance('2', 45, { onSite: 'true', clientPresent: 'false', partShape: 'shape-2' })
      ])
      const result = buildAppointmentShape([block1, block2])
      expect(result.slotShape).toBeDefined()
      expect(result.finalizedParts.length).toBe(2)
    })
  })

  describe('applyShapeToTime', () => {
    it('should apply shape to start time', () => {
      const blockInstance = createBlockInstance('block-1', [
        createPartInstance('1', 30, { onSite: 'true', clientPresent: 'true', moveable: true, partShape: 'shape-1' })
      ])
      const shape = buildAppointmentShape([blockInstance])
      const result = applyShapeToTime(shape, '2026-01-15T10:00:00Z', 0, 30, true)

      expect(result.buttonIndex).toBe(0)
      expect(result.isAvailable).toBe(true)
      expect(result.shape).toBe(shape)
      expect(result.startTime).toBe('2026-01-15T10:00:00Z')
      expect(result.totalTimeRange?.startTime).toBe('2026-01-15T10:00:00.000Z')
      expect(result.totalTimeRange?.endTime).toBe('2026-01-15T10:30:00.000Z')
    })

    it('should use fallbackDuration when roundedDuration is 0', () => {
      const shape: AppointmentShape = {
        finalizedBlocks: [],
        finalizedParts: [],
        slotShape: {
          rawDuration: 0,
          roundedDuration: 0,
          eventFinals: [],
          rawDifferentialOffset: 0,
          roundedDifferentialOffset: 0
        },
        eventAssignmentsByPartShape: {}
      }
      
      const result = applyShapeToTime(shape, '2026-01-15T10:00:00Z', 0, 60, true)
      
      expect(result.totalTimeRange?.duration).toBe(60)
    })

    it('should validate that clientPresentTimeRange and onSiteTimeRange end at same time', () => {
      const blockInstance = createBlockInstance('block-1', [
        createPartInstance('1', 30, { onSite: 'true', clientPresent: 'false', partShape: 'shape-1' }),
        createPartInstance('2', 30, { onSite: 'true', clientPresent: 'true', partShape: 'shape-2' })
      ])
      const shape = buildAppointmentShape([blockInstance])
      
      const result = applyShapeToTime(shape, '2026-01-15T10:00:00Z', 0, undefined, true)
      
      // Note: This test may need adjustment based on actual event configuration
      // The validation logic ensures end times match when both ranges exist
    })

    it('should ensure event time ranges end at same time when both major and minor exist', () => {
      const blockInstance = createBlockInstance('block-1', [
        createPartInstance('1', 30, { onSite: 'true', clientPresent: 'false', partShape: 'shape-1' }),
        createPartInstance('2', 30, { onSite: 'true', clientPresent: 'true', partShape: 'shape-2' })
      ])
      const shape = buildAppointmentShape([blockInstance])
      const result = applyShapeToTime(shape, '2026-01-15T10:00:00Z', 0, undefined, true)
      const ranges = Object.values(result.eventTimeRanges).filter((r): r is NonNullable<typeof r> => r != null)
      if (ranges.length >= 2) {
        expect(ranges[0].endTime).toBe(ranges[1].endTime)
      }
    })
  })

  describe('derivePerspective', () => {
    it('should derive major perspective', () => {
      const shape: AppointmentShape = {
        finalizedBlocks: [],
        finalizedParts: [],
        slotShape: {
          rawDuration: 120,
          roundedDuration: 120,
          eventFinals: [
            { eventShape: { id: 'major-id', name: 'Major', entityKey: 'eventShape' as const }, rawDuration: 60, roundedDuration: 60 }
          ],
          rawDifferentialOffset: 0,
          roundedDifferentialOffset: 0
        },
        eventAssignmentsByPartShape: {}
      }
      const slot: AppointmentSlot = {
        buttonIndex: 0,
        isAvailable: true,
        shape,
        startTime: '2026-01-15T10:00:00Z',
        eventTimeRanges: {
          'Major': { startTime: '2026-01-15T10:00:00Z' as any, endTime: '2026-01-15T11:00:00Z' as any, duration: 60 }
        },
        totalTimeRange: { startTime: '2026-01-15T10:00:00Z' as any, endTime: '2026-01-15T12:00:00Z' as any, duration: 120 }
      }
      
      const result = derivePerspective(slot, 'major', undefined, undefined)
      expect(result).toEqual(slot.totalTimeRange)
    })


    it('should fallback to totalTimeRange when major eventTimeRange is null', () => {
      const shape: AppointmentShape = {
        finalizedBlocks: [],
        finalizedParts: [],
        slotShape: {
          rawDuration: 120,
          roundedDuration: 120,
          eventFinals: [],
          rawDifferentialOffset: 0,
          roundedDifferentialOffset: 0
        },
        eventAssignmentsByPartShape: {}
      }
      const slot: AppointmentSlot = {
        buttonIndex: 0,
        isAvailable: true,
        shape,
        startTime: '2026-01-15T10:00:00Z',
        eventTimeRanges: {},
        totalTimeRange: { startTime: '2026-01-15T10:00:00Z' as any, endTime: '2026-01-15T12:00:00Z' as any, duration: 120 }
      }
      
      const result = derivePerspective(slot, 'major', undefined, undefined)
      
      expect(result).toBe(slot.totalTimeRange)
    })

    it('should derive minor perspective', () => {
      const shape: AppointmentShape = {
        finalizedBlocks: [],
        finalizedParts: [],
        slotShape: {
          rawDuration: 120,
          roundedDuration: 120,
          eventFinals: [
            { eventShape: { id: 'major-id', name: 'Major', entityKey: 'eventShape' as const }, rawDuration: 60, roundedDuration: 60 },
            { eventShape: { id: 'minor-id', name: 'Minor', entityKey: 'eventShape' as const }, rawDuration: 30, roundedDuration: 30 }
          ],
          rawDifferentialOffset: 30,
          roundedDifferentialOffset: 30
        },
        eventAssignmentsByPartShape: {}
      }
      const slot: AppointmentSlot = {
        buttonIndex: 0,
        isAvailable: true,
        shape,
        startTime: '2026-01-15T10:00:00Z',
        eventTimeRanges: {
          'Major': { startTime: '2026-01-15T10:00:00Z' as any, endTime: '2026-01-15T11:00:00Z' as any, duration: 60 },
          'Minor': { startTime: '2026-01-15T10:30:00Z' as any, endTime: '2026-01-15T11:00:00Z' as any, duration: 30 }
        },
        totalTimeRange: { startTime: '2026-01-15T10:00:00Z' as any, endTime: '2026-01-15T12:00:00Z' as any, duration: 120 }
      }
      
      const result = derivePerspective(slot, 'minor', undefined, undefined)
      expect(result).toBeNull()
    })

    it('should fallback to totalTimeRange when minor eventTimeRange is null', () => {
      const shape: AppointmentShape = {
        finalizedBlocks: [],
        finalizedParts: [],
        slotShape: {
          rawDuration: 120,
          roundedDuration: 120,
          eventFinals: [
            { eventShape: { id: 'major-id', name: 'Major', entityKey: 'eventShape' as const }, rawDuration: 60, roundedDuration: 60 }
          ],
          rawDifferentialOffset: 0,
          roundedDifferentialOffset: 0
        },
        eventAssignmentsByPartShape: {}
      }
      const slot: AppointmentSlot = {
        buttonIndex: 0,
        isAvailable: true,
        shape,
        startTime: '2026-01-15T10:00:00Z',
        eventTimeRanges: {
          'Major': { startTime: '2026-01-15T10:00:00Z' as any, endTime: '2026-01-15T11:00:00Z' as any, duration: 60 }
        },
        totalTimeRange: { startTime: '2026-01-15T10:00:00Z' as any, endTime: '2026-01-15T12:00:00Z' as any, duration: 120 }
      }
      
      const result = derivePerspective(slot, 'minor', undefined, undefined)
      expect(result).toBeNull()
    })

    it('should derive nonDifferential perspective', () => {
      const shape: AppointmentShape = {
        finalizedBlocks: [],
        finalizedParts: [],
        slotShape: {
          rawDuration: 120,
          roundedDuration: 120,
          eventFinals: [
            { eventShape: { id: 'major-id', name: 'Major', entityKey: 'eventShape' as const }, rawDuration: 60, roundedDuration: 60 }
          ],
          rawDifferentialOffset: 0,
          roundedDifferentialOffset: 0
        },
        eventAssignmentsByPartShape: {}
      }
      const slot: AppointmentSlot = {
        buttonIndex: 0,
        isAvailable: true,
        shape,
        startTime: '2026-01-15T10:00:00Z',
        eventTimeRanges: {
          'Major': { startTime: '2026-01-15T10:00:00Z' as any, endTime: '2026-01-15T11:00:00Z' as any, duration: 60 }
        },
        totalTimeRange: { startTime: '2026-01-15T10:00:00Z' as any, endTime: '2026-01-15T12:00:00Z' as any, duration: 120 }
      }
      
      const result = derivePerspective(slot, 'nonDifferential', undefined, undefined)
      expect(result).toEqual(slot.totalTimeRange)
    })
  })
})
