/**
 * USETIMESLOTCALCULATIONS TESTS
 * 
 * Unit tests for useTimeSlotCalculations composable.
 * Tests duration calculations and time block formatting.
 * 
 * Coverage:
 * - onSiteTotal computed (sum of onSite part baseTime)
 * - presentationDuration computed (sum of clientPresent part baseTime)
 * - timeOnSiteBlocks computed (time block display data)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref, computed } from 'vue'
import { useTimeSlotCalculations } from '../useTimeSlotCalculations'
import type { TimeSlot } from '@/types/appointment'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'

// Mock useTimeFormatting
vi.mock('@/composables/useTimeFormatting', () => ({
  useTimeFormatting: vi.fn(() => ({
    formatDuration: vi.fn((minutes: number) => {
      if (minutes < 60) return `${minutes}m`
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
    }),
  })),
}))

describe('useTimeSlotCalculations', () => {
  // Test fixtures
  const createMockService = (partInstances: Array<{ baseTime: number; onSite?: boolean; clientPresent?: boolean }>): BookingBlockInstance => ({
    id: 'service-1',
    name: 'Service 1',
    partInstances: partInstances.map((pi, i) => ({
      id: `part-${i}`,
      name: `Part ${i}`,
      baseTime: pi.baseTime,
      onSite: pi.onSite ?? false,
      clientPresent: pi.clientPresent ?? false,
    })),
  } as BookingBlockInstance)

  describe('onSiteTotal', () => {
    it('should return 0 when no services selected', () => {
      const { onSiteTotal } = useTimeSlotCalculations({
        wizard: { selectedServices: ref([]) },
        inspectorTimeSlot: ref(null),
        clientTimeSlot: ref(null),
        isDifferentialService: computed(() => false),
      })

      expect(onSiteTotal.value).toBe(0)
    })

    it('should sum baseTime for onSite parts', () => {
      const service = createMockService([
        { baseTime: 30, onSite: true },
        { baseTime: 60, onSite: true },
        { baseTime: 20, onSite: false },
      ])

      const { onSiteTotal } = useTimeSlotCalculations({
        wizard: { selectedServices: ref([service]) },
        inspectorTimeSlot: ref(null),
        clientTimeSlot: ref(null),
        isDifferentialService: computed(() => false),
      })

      expect(onSiteTotal.value).toBe(90) // 30 + 60
    })

    it('should fallback to all parts when no onSite parts', () => {
      const service = createMockService([
        { baseTime: 30, onSite: false },
        { baseTime: 60, onSite: false },
      ])

      const { onSiteTotal } = useTimeSlotCalculations({
        wizard: { selectedServices: ref([service]) },
        inspectorTimeSlot: ref(null),
        clientTimeSlot: ref(null),
        isDifferentialService: computed(() => false),
      })

      expect(onSiteTotal.value).toBe(90) // 30 + 60 (fallback)
    })

    it('should sum across multiple services', () => {
      const service1 = createMockService([{ baseTime: 30, onSite: true }])
      const service2 = createMockService([{ baseTime: 45, onSite: true }])

      const { onSiteTotal } = useTimeSlotCalculations({
        wizard: { selectedServices: ref([service1, service2]) },
        inspectorTimeSlot: ref(null),
        clientTimeSlot: ref(null),
        isDifferentialService: computed(() => false),
      })

      expect(onSiteTotal.value).toBe(75) // 30 + 45
    })

    it('should handle services with no partInstances', () => {
      const service = { id: 'service-1', name: 'Service 1', partInstances: [] } as unknown as BookingBlockInstance

      const { onSiteTotal } = useTimeSlotCalculations({
        wizard: { selectedServices: ref([service]) },
        inspectorTimeSlot: ref(null),
        clientTimeSlot: ref(null),
        isDifferentialService: computed(() => false),
      })

      expect(onSiteTotal.value).toBe(0)
    })
  })

  describe('presentationDuration', () => {
    it('should return 0 when no services selected', () => {
      const { presentationDuration } = useTimeSlotCalculations({
        wizard: { selectedServices: ref([]) },
        inspectorTimeSlot: ref(null),
        clientTimeSlot: ref(null),
        isDifferentialService: computed(() => false),
      })

      expect(presentationDuration.value).toBe(0)
    })

    it('should sum baseTime for clientPresent parts', () => {
      const service = createMockService([
        { baseTime: 30, clientPresent: true },
        { baseTime: 20, clientPresent: true },
        { baseTime: 60, clientPresent: false },
      ])

      const { presentationDuration } = useTimeSlotCalculations({
        wizard: { selectedServices: ref([service]) },
        inspectorTimeSlot: ref(null),
        clientTimeSlot: ref(null),
        isDifferentialService: computed(() => true),
      })

      expect(presentationDuration.value).toBe(50) // 30 + 20
    })

    it('should sum across multiple services', () => {
      const service1 = createMockService([{ baseTime: 30, clientPresent: true }])
      const service2 = createMockService([{ baseTime: 15, clientPresent: true }])

      const { presentationDuration } = useTimeSlotCalculations({
        wizard: { selectedServices: ref([service1, service2]) },
        inspectorTimeSlot: ref(null),
        clientTimeSlot: ref(null),
        isDifferentialService: computed(() => true),
      })

      expect(presentationDuration.value).toBe(45) // 30 + 15
    })
  })

  describe('timeOnSiteBlocks', () => {
    it('should return duration labels when no time slot selected', () => {
      const service = createMockService([
        { baseTime: 60, onSite: true },
        { baseTime: 30, clientPresent: true },
      ])

      const { timeOnSiteBlocks } = useTimeSlotCalculations({
        wizard: { selectedServices: ref([service]) },
        inspectorTimeSlot: ref(null),
        clientTimeSlot: ref(null),
        isDifferentialService: computed(() => true),
      })

      expect(timeOnSiteBlocks.value.inspector.label).toBe('Inspector')
      expect(timeOnSiteBlocks.value.inspector.duration).toBe('1h')
      expect(timeOnSiteBlocks.value.inspector.timeBlock).toBeNull()
      
      expect(timeOnSiteBlocks.value.client).not.toBeNull()
      expect(timeOnSiteBlocks.value.client!.label).toBe('Client Formal Presentation')
      expect(timeOnSiteBlocks.value.client!.duration).toBe('30m')
      expect(timeOnSiteBlocks.value.client!.timeBlock).toBeNull()
    })

    it('should return null client block for non-differential services', () => {
      const service = createMockService([{ baseTime: 60, onSite: true }])

      const { timeOnSiteBlocks } = useTimeSlotCalculations({
        wizard: { selectedServices: ref([service]) },
        inspectorTimeSlot: ref(null),
        clientTimeSlot: ref(null),
        isDifferentialService: computed(() => false),
      })

      expect(timeOnSiteBlocks.value.client).toBeNull()
    })

    it('should calculate time blocks when inspector time slot selected', () => {
      const service = createMockService([
        { baseTime: 60, onSite: true },
        { baseTime: 30, clientPresent: true },
      ])

      const inspectorTimeSlot: TimeSlot = {
        slotStart: '2026-01-15T09:00:00',
        slotEnd: '2026-01-15T11:00:00',
      }

      const { timeOnSiteBlocks } = useTimeSlotCalculations({
        wizard: { selectedServices: ref([service]) },
        inspectorTimeSlot: ref(inspectorTimeSlot),
        clientTimeSlot: ref(null),
        isDifferentialService: computed(() => true),
      })

      expect(timeOnSiteBlocks.value.inspector.timeBlock).toBe('9:00 AM - 10:00 AM')
      expect(timeOnSiteBlocks.value.client).not.toBeNull()
      expect(timeOnSiteBlocks.value.client!.timeBlock).toBe('10:00 AM - 10:30 AM')
    })

    it('should use client time slot when provided for differential services', () => {
      const service = createMockService([
        { baseTime: 60, onSite: true },
        { baseTime: 30, clientPresent: true },
      ])

      const inspectorTimeSlot: TimeSlot = {
        slotStart: '2026-01-15T09:00:00',
        slotEnd: '2026-01-15T10:00:00',
      }

      const clientTimeSlot: TimeSlot = {
        slotStart: '2026-01-15T14:00:00',
        slotEnd: '2026-01-15T14:30:00',
      }

      const { timeOnSiteBlocks } = useTimeSlotCalculations({
        wizard: { selectedServices: ref([service]) },
        inspectorTimeSlot: ref(inspectorTimeSlot),
        clientTimeSlot: ref(clientTimeSlot),
        isDifferentialService: computed(() => true),
      })

      expect(timeOnSiteBlocks.value.client).not.toBeNull()
      expect(timeOnSiteBlocks.value.client!.timeBlock).toBe('2:00 PM - 2:30 PM')
    })
  })
})
