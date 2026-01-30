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
import type { TimeSlot, AppointmentShape } from '@/types/appointment'

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
  // Helper to create mock AppointmentShape
  const createMockAppointmentShape = (params: {
    onSite?: number
    clientPresent?: number
    totalDuration?: number
    moveable?: number
    clientStartOffset?: number
  }): AppointmentShape => ({
    finalizedParts: [],
    slotShape: {
      totalDuration: params.totalDuration ?? (params.onSite ?? 0) + (params.clientPresent ?? 0),
      onSite: params.onSite ?? 0,
      clientPresent: params.clientPresent ?? 0,
      moveable: params.moveable ?? 0,
      clientStartOffset: params.clientStartOffset ?? 0
    }
  })

  describe('onSiteTotal', () => {
    it('should return 0 when appointmentShape is null', () => {
      const { onSiteTotal } = useTimeSlotCalculations({
        wizard: {
          selectedServiceTypeBlocks: ref([])
        },
        appointmentShape: computed(() => null),
        inspectorTimeSlot: ref(null),
        clientTimeSlot: ref(null),
        isDifferentialService: computed(() => false),
      })

      expect(onSiteTotal.value).toBe(0)
    })

    it('should return onSite duration from SlotShape', () => {
      const shape = createMockAppointmentShape({ onSite: 90 })

      const { onSiteTotal } = useTimeSlotCalculations({
        wizard: {
          selectedServiceTypeBlocks: ref([])
        },
        appointmentShape: computed(() => shape),
        inspectorTimeSlot: ref(null),
        clientTimeSlot: ref(null),
        isDifferentialService: computed(() => false),
      })

      expect(onSiteTotal.value).toBe(90)
    })

    it('should return 0 when onSite is 0', () => {
      const shape = createMockAppointmentShape({ onSite: 0 })

      const { onSiteTotal } = useTimeSlotCalculations({
        wizard: {
          selectedServiceTypeBlocks: ref([])
        },
        appointmentShape: computed(() => shape),
        inspectorTimeSlot: ref(null),
        clientTimeSlot: ref(null),
        isDifferentialService: computed(() => false),
      })

      expect(onSiteTotal.value).toBe(0)
    })
  })

  describe('presentationDuration', () => {
    it('should return 0 when appointmentShape is null', () => {
      const { presentationDuration } = useTimeSlotCalculations({
        wizard: {
          selectedServiceTypeBlocks: ref([])
        },
        appointmentShape: computed(() => null),
        inspectorTimeSlot: ref(null),
        clientTimeSlot: ref(null),
        isDifferentialService: computed(() => false),
      })

      expect(presentationDuration.value).toBe(0)
    })

    it('should return clientPresent duration from SlotShape', () => {
      const shape = createMockAppointmentShape({ clientPresent: 50 })

      const { presentationDuration } = useTimeSlotCalculations({
        wizard: {
          selectedServiceTypeBlocks: ref([])
        },
        appointmentShape: computed(() => shape),
        inspectorTimeSlot: ref(null),
        clientTimeSlot: ref(null),
        isDifferentialService: computed(() => true),
      })

      expect(presentationDuration.value).toBe(50)
    })

    it('should return 0 when clientPresent is 0', () => {
      const shape = createMockAppointmentShape({ clientPresent: 0 })

      const { presentationDuration } = useTimeSlotCalculations({
        wizard: {
          selectedServiceTypeBlocks: ref([])
        },
        appointmentShape: computed(() => shape),
        inspectorTimeSlot: ref(null),
        clientTimeSlot: ref(null),
        isDifferentialService: computed(() => true),
      })

      expect(presentationDuration.value).toBe(0)
    })
  })

  describe('timeOnSiteBlocks', () => {
    it('should return duration labels when no time slot selected', () => {
      const shape = createMockAppointmentShape({ onSite: 60, clientPresent: 30 })

      const { timeOnSiteBlocks } = useTimeSlotCalculations({
        wizard: {
          selectedServiceTypeBlocks: ref([])
        },
        appointmentShape: computed(() => shape),
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
      const shape = createMockAppointmentShape({ onSite: 60 })

      const { timeOnSiteBlocks } = useTimeSlotCalculations({
        wizard: {
          selectedServiceTypeBlocks: ref([])
        },
        appointmentShape: computed(() => shape),
        inspectorTimeSlot: ref(null),
        clientTimeSlot: ref(null),
        isDifferentialService: computed(() => false),
      })

      expect(timeOnSiteBlocks.value.client).toBeNull()
    })

    it('should calculate time blocks when inspector time slot selected', () => {
      const shape = createMockAppointmentShape({ onSite: 60, clientPresent: 30 })

      const inspectorTimeSlot: TimeSlot = {
        startTime: '2026-01-15T09:00:00Z',
        endTime: '2026-01-15T11:00:00Z',
        duration: 120
      }

      const { timeOnSiteBlocks } = useTimeSlotCalculations({
        wizard: {
          selectedServiceTypeBlocks: ref([])
        },
        appointmentShape: computed(() => shape),
        inspectorTimeSlot: ref(inspectorTimeSlot),
        clientTimeSlot: ref(null),
        isDifferentialService: computed(() => true),
      })

      expect(timeOnSiteBlocks.value.inspector.timeBlock).toBeTruthy()
      expect(timeOnSiteBlocks.value.client).not.toBeNull()
      expect(timeOnSiteBlocks.value.client!.timeBlock).toBeTruthy()
    })

    it('should use client time slot when provided for differential services', () => {
      const shape = createMockAppointmentShape({ onSite: 60, clientPresent: 30 })

      const inspectorTimeSlot: TimeSlot = {
        startTime: '2026-01-15T09:00:00Z',
        endTime: '2026-01-15T10:00:00Z',
        duration: 60
      }

      const clientTimeSlot: TimeSlot = {
        startTime: '2026-01-15T14:00:00Z',
        endTime: '2026-01-15T14:30:00Z',
        duration: 30
      }

      const { timeOnSiteBlocks } = useTimeSlotCalculations({
        wizard: {
          selectedServiceTypeBlocks: ref([])
        },
        appointmentShape: computed(() => shape),
        inspectorTimeSlot: ref(inspectorTimeSlot),
        clientTimeSlot: ref(clientTimeSlot),
        isDifferentialService: computed(() => true),
      })

      expect(timeOnSiteBlocks.value.client).not.toBeNull()
      expect(timeOnSiteBlocks.value.client!.timeBlock).toBeTruthy()
    })
  })
})
