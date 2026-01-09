/**
 * USEAVAILABILITYUI TESTS
 * 
 * Unit tests for useAvailabilityUI composable.
 * Tests UI state management for availability step.
 * 
 * Coverage:
 * - currentTimeSlots computed (filtered by startTimeType)
 * - selectedTimeSlot computed (getter/setter based on mode)
 * - handleTimeSlotClick (selection toggle)
 * - shouldMoveGridBelow computed (responsive layout)
 * - handleDateChange (date validation)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref, computed, nextTick } from 'vue'
import { useAvailabilityUI } from '../useAvailabilityUI'
import type { TimeSlot } from '@/types/appointment'

// Mock useFormValidation
vi.mock('@/composables/useFormValidation', () => ({
  useFormValidation: vi.fn(() => ({
    dateNotInPast: vi.fn(() => (date: string) => {
      // Simple mock: dates starting with '2025' are "in the past"
      if (date.startsWith('2025')) return 'Date cannot be in the past'
      return true
    }),
  })),
}))

describe('useAvailabilityUI', () => {
  let originalInnerWidth: number

  // Test fixtures
  const createTimeSlot = (start: string, end: string): TimeSlot => ({
    slotStart: start,
    slotEnd: end,
  })

  beforeEach(() => {
    vi.clearAllMocks()
    originalInnerWidth = window.innerWidth
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true })
  })

  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', { value: originalInnerWidth, writable: true })
  })

  describe('currentTimeSlots', () => {
    it('should return baseCurrentTimeSlots for non-differential services', () => {
      const baseSlots = [createTimeSlot('2026-01-15T09:00:00', '2026-01-15T10:00:00')]
      
      const { currentTimeSlots } = useAvailabilityUI({
        selectedDate: ref({ start: '2026-01-15', end: null }),
        inspectorTimeSlot: ref(null),
        clientTimeSlot: ref(null),
        startTimeType: ref(null),
        isDifferentialService: computed(() => false),
        timeSlotsPerDay: ref([]),
        baseCurrentTimeSlots: computed(() => baseSlots),
        fieldErrors: ref({}),
      })

      expect(currentTimeSlots.value).toEqual(baseSlots)
    })

    it('should return empty array when startTimeType is null for differential services', () => {
      const { currentTimeSlots } = useAvailabilityUI({
        selectedDate: ref({ start: '2026-01-15', end: null }),
        inspectorTimeSlot: ref(null),
        clientTimeSlot: ref(null),
        startTimeType: ref(null),
        isDifferentialService: computed(() => true),
        timeSlotsPerDay: ref([]),
        baseCurrentTimeSlots: computed(() => []),
        fieldErrors: ref({}),
      })

      expect(currentTimeSlots.value).toEqual([])
    })

    it('should return inspector time slots when startTimeType is inspector', () => {
      const inspectorSlots = [createTimeSlot('2026-01-15T09:00:00', '2026-01-15T10:00:00')]
      const clientSlots = [createTimeSlot('2026-01-15T14:00:00', '2026-01-15T15:00:00')]

      const { currentTimeSlots } = useAvailabilityUI({
        selectedDate: ref({ start: '2026-01-15', end: null }),
        inspectorTimeSlot: ref(null),
        clientTimeSlot: ref(null),
        startTimeType: ref<'inspector' | 'client' | null>('inspector'),
        isDifferentialService: computed(() => true),
        timeSlotsPerDay: ref([{
          date: '2026-01-15',
          inspectorTimeSlots: inspectorSlots,
          clientTimeSlots: clientSlots,
        }]),
        baseCurrentTimeSlots: computed(() => []),
        fieldErrors: ref({}),
      })

      expect(currentTimeSlots.value).toEqual(inspectorSlots)
    })

    it('should return client time slots when startTimeType is client', () => {
      const inspectorSlots = [createTimeSlot('2026-01-15T09:00:00', '2026-01-15T10:00:00')]
      const clientSlots = [createTimeSlot('2026-01-15T14:00:00', '2026-01-15T15:00:00')]

      const { currentTimeSlots } = useAvailabilityUI({
        selectedDate: ref({ start: '2026-01-15', end: null }),
        inspectorTimeSlot: ref(null),
        clientTimeSlot: ref(null),
        startTimeType: ref<'inspector' | 'client' | null>('client'),
        isDifferentialService: computed(() => true),
        timeSlotsPerDay: ref([{
          date: '2026-01-15',
          inspectorTimeSlots: inspectorSlots,
          clientTimeSlots: clientSlots,
        }]),
        baseCurrentTimeSlots: computed(() => []),
        fieldErrors: ref({}),
      })

      expect(currentTimeSlots.value).toEqual(clientSlots)
    })
  })

  describe('selectedTimeSlot', () => {
    it('should get inspector time slot for non-differential services', () => {
      const slot = createTimeSlot('2026-01-15T09:00:00', '2026-01-15T10:00:00')
      const inspectorTimeSlot = ref<TimeSlot | null>(slot)

      const { selectedTimeSlot } = useAvailabilityUI({
        selectedDate: ref({ start: '2026-01-15', end: null }),
        inspectorTimeSlot,
        clientTimeSlot: ref(null),
        startTimeType: ref(null),
        isDifferentialService: computed(() => false),
        timeSlotsPerDay: ref([]),
        baseCurrentTimeSlots: computed(() => []),
        fieldErrors: ref({}),
      })

      expect(selectedTimeSlot.value).toEqual(slot)
    })

    it('should set inspector time slot for non-differential services', () => {
      const slot = createTimeSlot('2026-01-15T09:00:00', '2026-01-15T10:00:00')
      const inspectorTimeSlot = ref<TimeSlot | null>(null)

      const { selectedTimeSlot } = useAvailabilityUI({
        selectedDate: ref({ start: '2026-01-15', end: null }),
        inspectorTimeSlot,
        clientTimeSlot: ref(null),
        startTimeType: ref(null),
        isDifferentialService: computed(() => false),
        timeSlotsPerDay: ref([]),
        baseCurrentTimeSlots: computed(() => []),
        fieldErrors: ref({}),
      })

      selectedTimeSlot.value = slot
      expect(inspectorTimeSlot.value).toEqual(slot)
    })

    it('should return null when startTimeType is null for differential services', () => {
      const slot = createTimeSlot('2026-01-15T09:00:00', '2026-01-15T10:00:00')
      const inspectorTimeSlot = ref<TimeSlot | null>(slot)

      const { selectedTimeSlot } = useAvailabilityUI({
        selectedDate: ref({ start: '2026-01-15', end: null }),
        inspectorTimeSlot,
        clientTimeSlot: ref(null),
        startTimeType: ref(null),
        isDifferentialService: computed(() => true),
        timeSlotsPerDay: ref([]),
        baseCurrentTimeSlots: computed(() => []),
        fieldErrors: ref({}),
      })

      expect(selectedTimeSlot.value).toBeNull()
    })

    it('should get/set inspector time slot when startTimeType is inspector', () => {
      const slot = createTimeSlot('2026-01-15T09:00:00', '2026-01-15T10:00:00')
      const inspectorTimeSlot = ref<TimeSlot | null>(null)

      const { selectedTimeSlot } = useAvailabilityUI({
        selectedDate: ref({ start: '2026-01-15', end: null }),
        inspectorTimeSlot,
        clientTimeSlot: ref(null),
        startTimeType: ref<'inspector' | 'client' | null>('inspector'),
        isDifferentialService: computed(() => true),
        timeSlotsPerDay: ref([]),
        baseCurrentTimeSlots: computed(() => []),
        fieldErrors: ref({}),
      })

      selectedTimeSlot.value = slot
      expect(inspectorTimeSlot.value).toEqual(slot)
    })

    it('should get/set client time slot when startTimeType is client', () => {
      const slot = createTimeSlot('2026-01-15T14:00:00', '2026-01-15T15:00:00')
      const clientTimeSlot = ref<TimeSlot | null>(null)

      const { selectedTimeSlot } = useAvailabilityUI({
        selectedDate: ref({ start: '2026-01-15', end: null }),
        inspectorTimeSlot: ref(null),
        clientTimeSlot,
        startTimeType: ref<'inspector' | 'client' | null>('client'),
        isDifferentialService: computed(() => true),
        timeSlotsPerDay: ref([]),
        baseCurrentTimeSlots: computed(() => []),
        fieldErrors: ref({}),
      })

      selectedTimeSlot.value = slot
      expect(clientTimeSlot.value).toEqual(slot)
    })
  })

  describe('handleTimeSlotClick', () => {
    it('should select time slot', () => {
      const slot = createTimeSlot('2026-01-15T09:00:00', '2026-01-15T10:00:00')
      const inspectorTimeSlot = ref<TimeSlot | null>(null)

      const { handleTimeSlotClick } = useAvailabilityUI({
        selectedDate: ref({ start: '2026-01-15', end: null }),
        inspectorTimeSlot,
        clientTimeSlot: ref(null),
        startTimeType: ref(null),
        isDifferentialService: computed(() => false),
        timeSlotsPerDay: ref([]),
        baseCurrentTimeSlots: computed(() => []),
        fieldErrors: ref({}),
      })

      handleTimeSlotClick(slot)
      expect(inspectorTimeSlot.value).toEqual(slot)
    })

    it('should deselect when clicking same slot', () => {
      const slot = createTimeSlot('2026-01-15T09:00:00', '2026-01-15T10:00:00')
      const inspectorTimeSlot = ref<TimeSlot | null>(slot)

      const { handleTimeSlotClick } = useAvailabilityUI({
        selectedDate: ref({ start: '2026-01-15', end: null }),
        inspectorTimeSlot,
        clientTimeSlot: ref(null),
        startTimeType: ref(null),
        isDifferentialService: computed(() => false),
        timeSlotsPerDay: ref([]),
        baseCurrentTimeSlots: computed(() => []),
        fieldErrors: ref({}),
      })

      handleTimeSlotClick(slot)
      expect(inspectorTimeSlot.value).toBeNull()
    })

    it('should select different slot', () => {
      const slot1 = createTimeSlot('2026-01-15T09:00:00', '2026-01-15T10:00:00')
      const slot2 = createTimeSlot('2026-01-15T11:00:00', '2026-01-15T12:00:00')
      const inspectorTimeSlot = ref<TimeSlot | null>(slot1)

      const { handleTimeSlotClick } = useAvailabilityUI({
        selectedDate: ref({ start: '2026-01-15', end: null }),
        inspectorTimeSlot,
        clientTimeSlot: ref(null),
        startTimeType: ref(null),
        isDifferentialService: computed(() => false),
        timeSlotsPerDay: ref([]),
        baseCurrentTimeSlots: computed(() => []),
        fieldErrors: ref({}),
      })

      handleTimeSlotClick(slot2)
      expect(inspectorTimeSlot.value).toEqual(slot2)
    })
  })

  describe('shouldMoveGridBelow', () => {
    it('should return false for wide viewport', () => {
      Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true })

      const { shouldMoveGridBelow } = useAvailabilityUI({
        selectedDate: ref({ start: null, end: null }),
        inspectorTimeSlot: ref(null),
        clientTimeSlot: ref(null),
        startTimeType: ref(null),
        isDifferentialService: computed(() => false),
        timeSlotsPerDay: ref([]),
        baseCurrentTimeSlots: computed(() => []),
        fieldErrors: ref({}),
      })

      expect(shouldMoveGridBelow.value).toBe(false)
    })

    it('should return true for narrow viewport', () => {
      Object.defineProperty(window, 'innerWidth', { value: 400, writable: true })

      const { shouldMoveGridBelow } = useAvailabilityUI({
        selectedDate: ref({ start: null, end: null }),
        inspectorTimeSlot: ref(null),
        clientTimeSlot: ref(null),
        startTimeType: ref(null),
        isDifferentialService: computed(() => false),
        timeSlotsPerDay: ref([]),
        baseCurrentTimeSlots: computed(() => []),
        fieldErrors: ref({}),
      })

      expect(shouldMoveGridBelow.value).toBe(true)
    })
  })

  describe('handleDateChange', () => {
    it('should clear error for valid date', () => {
      const fieldErrors = ref<Record<string, string>>({ selectedDate: 'Previous error' })

      const { handleDateChange } = useAvailabilityUI({
        selectedDate: ref({ start: null, end: null }),
        inspectorTimeSlot: ref(null),
        clientTimeSlot: ref(null),
        startTimeType: ref(null),
        isDifferentialService: computed(() => false),
        timeSlotsPerDay: ref([]),
        baseCurrentTimeSlots: computed(() => []),
        fieldErrors,
      })

      handleDateChange('2026-01-15')
      expect(fieldErrors.value.selectedDate).toBeUndefined()
    })

    it('should set error for invalid date', () => {
      const fieldErrors = ref<Record<string, string>>({})

      const { handleDateChange } = useAvailabilityUI({
        selectedDate: ref({ start: null, end: null }),
        inspectorTimeSlot: ref(null),
        clientTimeSlot: ref(null),
        startTimeType: ref(null),
        isDifferentialService: computed(() => false),
        timeSlotsPerDay: ref([]),
        baseCurrentTimeSlots: computed(() => []),
        fieldErrors,
      })

      handleDateChange('2025-01-15') // Past date (mocked)
      expect(fieldErrors.value.selectedDate).toBe('Date cannot be in the past')
    })

    it('should set required error for null date', () => {
      const fieldErrors = ref<Record<string, string>>({})

      const { handleDateChange } = useAvailabilityUI({
        selectedDate: ref({ start: null, end: null }),
        inspectorTimeSlot: ref(null),
        clientTimeSlot: ref(null),
        startTimeType: ref(null),
        isDifferentialService: computed(() => false),
        timeSlotsPerDay: ref([]),
        baseCurrentTimeSlots: computed(() => []),
        fieldErrors,
      })

      handleDateChange(null)
      expect(fieldErrors.value.selectedDate).toBe('Please select a date')
    })

    it('should handle Date object input', () => {
      const fieldErrors = ref<Record<string, string>>({})

      const { handleDateChange } = useAvailabilityUI({
        selectedDate: ref({ start: null, end: null }),
        inspectorTimeSlot: ref(null),
        clientTimeSlot: ref(null),
        startTimeType: ref(null),
        isDifferentialService: computed(() => false),
        timeSlotsPerDay: ref([]),
        baseCurrentTimeSlots: computed(() => []),
        fieldErrors,
      })

      handleDateChange(new Date('2026-01-15'))
      expect(fieldErrors.value.selectedDate).toBeUndefined()
    })

    it('should handle array input (take first date)', () => {
      const fieldErrors = ref<Record<string, string>>({})

      const { handleDateChange } = useAvailabilityUI({
        selectedDate: ref({ start: null, end: null }),
        inspectorTimeSlot: ref(null),
        clientTimeSlot: ref(null),
        startTimeType: ref(null),
        isDifferentialService: computed(() => false),
        timeSlotsPerDay: ref([]),
        baseCurrentTimeSlots: computed(() => []),
        fieldErrors,
      })

      handleDateChange(['2026-01-15', '2026-01-16'])
      expect(fieldErrors.value.selectedDate).toBeUndefined()
    })
  })
})
