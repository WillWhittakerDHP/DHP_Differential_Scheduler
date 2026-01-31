/**
 * USEAVAILABILITYLOGIC TESTS
 * 
 * Unit tests for useAvailabilityLogic.
 * Priority Score: 8.0 (Reliability: 10, ROI: 7, Independence: 8, Cognitive Load: 3)
 * 
 * Tests verify reactive computed properties for availability step logic,
 * date range calculations, property details extraction, and time slot grouping.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref, computed } from 'vue'
import { useAvailabilityLogic } from '../useAvailabilityLogic'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { TimeSlot } from '@/types/appointment'
import { isRFC3339DateTime } from '@/types/datetime'

/**
 * Helper to create a BookingBlockInstance for testing
 */
function createBookingBlockInstance(
  id: string,
  options: {
    name?: string
    differential?: 'true' | 'false' | 'override'
    partInstances?: Array<{
      id?: string
    }>
  } = {}
): BookingBlockInstance {
  return {
    id,
    entityKey: 'blockInstance',
    name: options.name || `Block ${id}`,
    baseSqFt: 1000,
    description: 'Test description',
    icon: 'icon-test',
    active: true,
    bookingMode: 'standalone',
    differential: (options.differential ?? 'false') as 'true' | 'false' | 'override',
    orderIndex: 0,
    blockShape: 'Test Shape',
    blockShapeRef: 'shape-1',
    activeBlockIds: [],
    partInstances: options.partInstances?.map((part, index) => ({
      id: part.id || `part-${index}`,
      entityKey: 'partInstance' as const,
      name: `Part ${index}`,
      partShape: 'test-shape',
      disabled: false,
      onSite: 'false',
      clientPresent: 'false',
      moveable: false,
      baseTime: 0,
      rateOverBaseTime: 0,
      baseFee: 0,
      rateOverBaseFee: 0,
      orderIndex: index,
      active: true,
      zeroOutPart: false,
    })) || [],
    allowMultiple: false,
    requiresUnitNumber: null,
  }
}

/**
 * Helper to create a TimeSlot for testing
 */
function createTimeSlot(
  slotStart: string,
  options: {
    slotEnd?: string
    duration?: number
  } = {}
): TimeSlot {
  const startTime = slotStart
  const endTime = options.slotEnd || new Date(new Date(slotStart).getTime() + (options.duration || 60) * 60000).toISOString()
  return {
    startTime,
    endTime,
    duration: options.duration || 60,
    onSite: false,
    clientPresent: false,
    moveable: false,
    isAvailable: true,
  }
}

describe('useAvailabilityLogic', () => {
  let selectedDate: ReturnType<typeof ref>
  let propertyDetailsStepData: ReturnType<typeof ref> | null
  let wizard: {
    selectedUserTypeBlock: ReturnType<typeof ref>
    selectedServiceTypeBlocks: ReturnType<typeof ref>
    selectedPropertyTypeBlocks: ReturnType<typeof ref>
    selectedOptionTypeBlocks: ReturnType<typeof ref>
  }
  let timeSlots: ReturnType<typeof computed>
  let loadedWizardState: ReturnType<typeof ref> | null

  beforeEach(() => {
    selectedDate = ref({ start: null, end: null })
    propertyDetailsStepData = ref(null)
    wizard = {
      selectedUserTypeBlock: ref<BookingBlockInstance | null>(null),
      selectedServiceTypeBlocks: ref<BookingBlockInstance[]>([]),
      selectedPropertyTypeBlocks: ref<BookingBlockInstance[]>([]),
      selectedOptionTypeBlocks: ref<BookingBlockInstance[]>([]),
    }
    timeSlots = computed(() => [])
    loadedWizardState = ref(null)
  })

  describe('dateRangeForApi', () => {
    it('should return null when no date is selected', () => {
      selectedDate.value = { start: null, end: null }
      
      const { dateRangeForApi } = useAvailabilityLogic({
        selectedDate,
        propertyDetailsStepData,
        wizard,
        timeSlots,
        loadedWizardState,
      })
      
      expect(dateRangeForApi.value).toBeNull()
    })

    it('should create date range with start date and end date (start + 1 day)', () => {
      selectedDate.value = { start: '2024-01-15', end: null }
      
      const { dateRangeForApi } = useAvailabilityLogic({
        selectedDate,
        propertyDetailsStepData,
        wizard,
        timeSlots,
        loadedWizardState,
      })
      
      expect(dateRangeForApi.value).not.toBeNull()
      expect(dateRangeForApi.value?.start).toBe('2024-01-15T00:00:00.000Z')
      expect(dateRangeForApi.value?.end).toBe('2024-01-16T00:00:00.000Z') // Start + 1 day
    })

    it('should format dates in YYYY-MM-DD format', () => {
      selectedDate.value = { start: '2024-12-25', end: null }
      
      const { dateRangeForApi } = useAvailabilityLogic({
        selectedDate,
        propertyDetailsStepData,
        wizard,
        timeSlots,
        loadedWizardState,
      })
      
      expect(isRFC3339DateTime(dateRangeForApi.value?.start ?? '')).toBe(true)
      expect(isRFC3339DateTime(dateRangeForApi.value?.end ?? '')).toBe(true)
    })

    it('should be reactive to date changes', () => {
      const { dateRangeForApi } = useAvailabilityLogic({
        selectedDate,
        propertyDetailsStepData,
        wizard,
        timeSlots,
        loadedWizardState,
      })
      
      expect(dateRangeForApi.value).toBeNull()
      
      selectedDate.value = { start: '2024-01-15', end: null }
      
      expect(dateRangeForApi.value).not.toBeNull()
      expect(dateRangeForApi.value?.start).toBe('2024-01-15T00:00:00.000Z')
    })
  })

  describe('propertyDetails', () => {
    it('should return null when propertyDetailsStepData is null', () => {
      propertyDetailsStepData = null
      
      const { propertyDetails } = useAvailabilityLogic({
        selectedDate,
        propertyDetailsStepData,
        wizard,
        timeSlots,
        loadedWizardState,
      })
      
      expect(propertyDetails.value).toBeNull()
    })

    it('should return null when propertyDetailsStepData.value is null', () => {
      propertyDetailsStepData = ref(null)
      
      const { propertyDetails } = useAvailabilityLogic({
        selectedDate,
        propertyDetailsStepData,
        wizard,
        timeSlots,
        loadedWizardState,
      })
      
      expect(propertyDetails.value).toBeNull()
    })

    it('should extract property details from step data', () => {
      propertyDetailsStepData = ref({
        squareFootage: 2000,
        bedrooms: 3,
        bathrooms: 2,
        foundationAccess: 'basement' as const,
        additionalUnits: 1,
      })
      
      const { propertyDetails } = useAvailabilityLogic({
        selectedDate,
        propertyDetailsStepData,
        wizard,
        timeSlots,
        loadedWizardState,
      })
      
      expect(propertyDetails.value).toEqual({
        squareFootage: 2000,
        bedrooms: 3,
        bathrooms: 2,
        foundationAccess: 'basement',
        additionalUnits: 1,
      })
    })

    it('should handle partial property details', () => {
      propertyDetailsStepData = ref({
        squareFootage: 1500,
        bedrooms: null,
        bathrooms: null,
        foundationAccess: null,
        additionalUnits: null,
      })
      
      const { propertyDetails } = useAvailabilityLogic({
        selectedDate,
        propertyDetailsStepData,
        wizard,
        timeSlots,
        loadedWizardState,
      })
      
      expect(propertyDetails.value?.squareFootage).toBe(1500)
      expect(propertyDetails.value?.bedrooms).toBeNull()
    })
  })

  describe('accumulatedBlockInstances', () => {
    it('should accumulate all selected block instances', () => {
      const service1 = createBookingBlockInstance('service-1')
      const service2 = createBookingBlockInstance('service-2')
      const propertyTypeBlock = createBookingBlockInstance('property-type-1')
      const optionTypeBlock = createBookingBlockInstance('option-type-1')
      
      wizard.selectedServices.value = [service1, service2]
      wizard.selectedPropertyTypeBlocks.value = [propertyTypeBlock]
      wizard.selectedOptionTypeBlocks.value = [optionTypeBlock]
      
      const { accumulatedBlockInstances } = useAvailabilityLogic({
        selectedDate,
        propertyDetailsStepData,
        wizard,
        timeSlots,
        loadedWizardState,
      })
      
      expect(accumulatedBlockInstances.value).toHaveLength(4)
      expect(accumulatedBlockInstances.value.map(b => b.id)).toContain('service-1')
      expect(accumulatedBlockInstances.value.map(b => b.id)).toContain('service-2')
      expect(accumulatedBlockInstances.value.map(b => b.id)).toContain('property-type-1')
      expect(accumulatedBlockInstances.value.map(b => b.id)).toContain('option-type-1')
    })

    it('should return empty array when no blocks are selected', () => {
      const { accumulatedBlockInstances } = useAvailabilityLogic({
        selectedDate,
        propertyDetailsStepData,
        wizard,
        timeSlots,
        loadedWizardState,
      })
      
      expect(accumulatedBlockInstances.value).toEqual([])
    })

    it('should be reactive to wizard selections', () => {
      const { accumulatedBlockInstances } = useAvailabilityLogic({
        selectedDate,
        propertyDetailsStepData,
        wizard,
        timeSlots,
        loadedWizardState,
      })
      
      expect(accumulatedBlockInstances.value).toHaveLength(0)
      
      wizard.selectedServices.value = [createBookingBlockInstance('service-1')]
      
      expect(accumulatedBlockInstances.value).toHaveLength(1)
    })
  })

  describe('timeSlotsPerDay', () => {
    it('should group time slots by date', async () => {
      const slots = [
        createTimeSlot('2024-01-15T09:00:00'),
        createTimeSlot('2024-01-15T10:00:00'),
        createTimeSlot('2024-01-16T09:00:00'),
      ]
      
      timeSlots = computed(() => slots)
      selectedDate.value = { start: '2024-01-15', end: null }
      
      const { timeSlotsPerDay } = useAvailabilityLogic({
        selectedDate,
        propertyDetailsStepData,
        wizard,
        timeSlots,
        loadedWizardState,
      })
      
      // Wait for watch to execute
      await new Promise(resolve => setTimeout(resolve, 0))
      
      expect(timeSlotsPerDay.value).toHaveLength(2)
      expect(timeSlotsPerDay.value[0].date).toBe('2024-01-15')
      expect(timeSlotsPerDay.value[0].inspectorTimeSlots).toHaveLength(2)
      expect(timeSlotsPerDay.value[1].date).toBe('2024-01-16')
      expect(timeSlotsPerDay.value[1].inspectorTimeSlots).toHaveLength(1)
    })

    it('should return empty array when no time slots', async () => {
      timeSlots = computed(() => [])
      selectedDate.value = { start: null, end: null }
      
      const { timeSlotsPerDay } = useAvailabilityLogic({
        selectedDate,
        propertyDetailsStepData,
        wizard,
        timeSlots,
        loadedWizardState,
      })
      
      await new Promise(resolve => setTimeout(resolve, 0))
      
      expect(timeSlotsPerDay.value).toEqual([])
    })

    it('should return empty array when no date selected', async () => {
      const slots = [createTimeSlot('2024-01-15T09:00:00')]
      timeSlots = computed(() => slots)
      selectedDate.value = { start: null, end: null }
      
      const { timeSlotsPerDay } = useAvailabilityLogic({
        selectedDate,
        propertyDetailsStepData,
        wizard,
        timeSlots,
        loadedWizardState,
      })
      
      await new Promise(resolve => setTimeout(resolve, 0))
      
      expect(timeSlotsPerDay.value).toEqual([])
    })

    it('should set both inspectorTimeSlots and clientTimeSlots to same slots', async () => {
      const slots = [createTimeSlot('2024-01-15T09:00:00')]
      timeSlots = computed(() => slots)
      selectedDate.value = { start: '2024-01-15', end: null }
      
      const { timeSlotsPerDay } = useAvailabilityLogic({
        selectedDate,
        propertyDetailsStepData,
        wizard,
        timeSlots,
        loadedWizardState,
      })
      
      await new Promise(resolve => setTimeout(resolve, 0))
      
      expect(timeSlotsPerDay.value[0].inspectorTimeSlots).toEqual(timeSlotsPerDay.value[0].clientTimeSlots)
    })
  })

  describe('selectedDateSingle', () => {
    it('should get start date from date range', () => {
      selectedDate.value = { start: '2024-01-15', end: null }
      
      const { selectedDateSingle } = useAvailabilityLogic({
        selectedDate,
        propertyDetailsStepData,
        wizard,
        timeSlots,
        loadedWizardState,
      })
      
      expect(selectedDateSingle.value).toBe('2024-01-15')
    })

    it('should set date range when value is set', () => {
      const { selectedDateSingle } = useAvailabilityLogic({
        selectedDate,
        propertyDetailsStepData,
        wizard,
        timeSlots,
        loadedWizardState,
      })
      
      selectedDateSingle.value = '2024-01-20'
      
      expect(selectedDate.value.start).toBe('2024-01-20')
      expect(selectedDate.value.end).toBeNull()
    })

    it('should handle null value', () => {
      const { selectedDateSingle } = useAvailabilityLogic({
        selectedDate,
        propertyDetailsStepData,
        wizard,
        timeSlots,
        loadedWizardState,
      })
      
      selectedDateSingle.value = null
      
      expect(selectedDate.value.start).toBeNull()
      expect(selectedDate.value.end).toBeNull()
    })
  })

  describe('currentTimeSlots', () => {
    it('should return empty array when no date selected', async () => {
      const slots = [createTimeSlot('2024-01-15T09:00:00')]
      timeSlots = computed(() => slots)
      selectedDate.value = { start: null, end: null }
      
      const { currentTimeSlots } = useAvailabilityLogic({
        selectedDate,
        propertyDetailsStepData,
        wizard,
        timeSlots,
        loadedWizardState,
      })
      
      await new Promise(resolve => setTimeout(resolve, 0))
      
      expect(currentTimeSlots.value).toEqual([])
    })

    it('should return time slots for selected date', async () => {
      const slots = [
        createTimeSlot('2024-01-15T09:00:00'),
        createTimeSlot('2024-01-15T10:00:00'),
        createTimeSlot('2024-01-16T09:00:00'),
      ]
      timeSlots = computed(() => slots)
      selectedDate.value = { start: '2024-01-15', end: null }
      
      const { currentTimeSlots } = useAvailabilityLogic({
        selectedDate,
        propertyDetailsStepData,
        wizard,
        timeSlots,
        loadedWizardState,
      })
      
      await new Promise(resolve => setTimeout(resolve, 0))
      
      expect(currentTimeSlots.value).toHaveLength(2)
      expect(currentTimeSlots.value[0].slotStart).toContain('2024-01-15')
    })

    it('should return empty array when no slots for selected date', async () => {
      const slots = [createTimeSlot('2024-01-16T09:00:00')]
      timeSlots = computed(() => slots)
      selectedDate.value = { start: '2024-01-15', end: null }
      
      const { currentTimeSlots } = useAvailabilityLogic({
        selectedDate,
        propertyDetailsStepData,
        wizard,
        timeSlots,
        loadedWizardState,
      })
      
      await new Promise(resolve => setTimeout(resolve, 0))
      
      expect(currentTimeSlots.value).toEqual([])
    })
  })

  describe('isDifferentialService', () => {
    it('should return false when no services selected', () => {
      const { isDifferentialService } = useAvailabilityLogic({
        selectedDate,
        propertyDetailsStepData,
        wizard,
        timeSlots,
        loadedWizardState,
      })
      
      expect(isDifferentialService.value).toBe(false)
    })

    it('should return false when no service has differential', () => {
      wizard.selectedServiceTypeBlocks.value = [
        createBookingBlockInstance('service-1', { differential: 'false' }),
        createBookingBlockInstance('service-2', { differential: 'false' }),
      ]
      
      const { isDifferentialService } = useAvailabilityLogic({
        selectedDate,
        propertyDetailsStepData,
        wizard,
        timeSlots,
        loadedWizardState,
      })
      
      expect(isDifferentialService.value).toBe(false)
    })

    it('should return true when any service has differential', () => {
      wizard.selectedServiceTypeBlocks.value = [
        createBookingBlockInstance('service-1', { differential: 'false' }),
        createBookingBlockInstance('service-2', { differential: 'true' }),
      ]
      
      const { isDifferentialService } = useAvailabilityLogic({
        selectedDate,
        propertyDetailsStepData,
        wizard,
        timeSlots,
        loadedWizardState,
      })
      
      expect(isDifferentialService.value).toBe(true)
    })

    it('should be reactive to service changes', () => {
      const { isDifferentialService } = useAvailabilityLogic({
        selectedDate,
        propertyDetailsStepData,
        wizard,
        timeSlots,
        loadedWizardState,
      })
      
      expect(isDifferentialService.value).toBe(false)
      
      wizard.selectedServices.value = [
        createBookingBlockInstance('service-1', { differential: 'true' }),
      ]
      
      expect(isDifferentialService.value).toBe(true)
    })
  })

  describe('isEffectivelyDifferential', () => {
    it('should return false when service is not differential', () => {
      wizard.selectedServiceTypeBlocks.value = [
        createBookingBlockInstance('service-1', { differential: 'false' }),
      ]

      const { isEffectivelyDifferential } = useAvailabilityLogic({
        selectedDate,
        propertyDetailsStepData,
        wizard,
        timeSlots,
        loadedWizardState,
      })

      expect(isEffectivelyDifferential.value).toBe(false)
    })

    it('should return true when service is differential and no override', () => {
      wizard.selectedServices.value = [
        createBookingBlockInstance('service-1', { differential: 'true' }),
      ]

      const { isEffectivelyDifferential } = useAvailabilityLogic({
        selectedDate,
        propertyDetailsStepData,
        wizard,
        timeSlots,
        loadedWizardState,
      })

      expect(isEffectivelyDifferential.value).toBe(true)
    })

    it('should return false when service is differential but has override in service part', () => {
      wizard.selectedServiceTypeBlocks.value = [
        createBookingBlockInstance('service-1', {
          differential: 'override',
        }),
      ]

      const { isEffectivelyDifferential } = useAvailabilityLogic({
        selectedDate,
        propertyDetailsStepData,
        wizard,
        timeSlots,
        loadedWizardState,
      })

      expect(isEffectivelyDifferential.value).toBe(false)
    })

    it('should return false when service is differential but has override in option', () => {
      wizard.selectedServiceTypeBlocks.value = [
        createBookingBlockInstance('service-1', { differential: 'true' }),
      ]
      wizard.selectedOptionTypeBlocks.value = [
        createBookingBlockInstance('option-1', {
          differential: 'override',
        }),
      ]

      const { isEffectivelyDifferential } = useAvailabilityLogic({
        selectedDate,
        propertyDetailsStepData,
        wizard,
        timeSlots,
        loadedWizardState,
      })

      expect(isEffectivelyDifferential.value).toBe(false)
    })

    it('should return true when service is differential and override is false', () => {
      wizard.selectedServiceTypeBlocks.value = [
        createBookingBlockInstance('service-1', {
          differential: 'true',
        }),
      ]

      const { isEffectivelyDifferential } = useAvailabilityLogic({
        selectedDate,
        propertyDetailsStepData,
        wizard,
        timeSlots,
        loadedWizardState,
      })

      expect(isEffectivelyDifferential.value).toBe(true)
    })

    it('should be reactive to service and option changes', () => {
      const { isEffectivelyDifferential } = useAvailabilityLogic({
        selectedDate,
        propertyDetailsStepData,
        wizard,
        timeSlots,
        loadedWizardState,
      })

      expect(isEffectivelyDifferential.value).toBe(false)

      wizard.selectedServiceTypeBlocks.value = [
        createBookingBlockInstance('service-1', { differential: 'true' }),
      ]
      expect(isEffectivelyDifferential.value).toBe(true)

      wizard.selectedOptionTypeBlocks.value = [
        createBookingBlockInstance('option-1', {
          differential: 'override',
        }),
      ]
      expect(isEffectivelyDifferential.value).toBe(false)
    })
  })

  describe('matchLoadedTimeSlots', () => {
    it('should match loaded slots to available slots', () => {
      const availableSlots = [
        createTimeSlot('2024-01-15T09:00:00'),
        createTimeSlot('2024-01-15T10:00:00'),
        createTimeSlot('2024-01-15T11:00:00'),
      ]
      
      const loadedSlots = [
        { time: '2024-01-15T09:00:00' },
        { time: '2024-01-15T10:00:00' },
      ]
      
      const inspectorTimeSlotRef = ref(null)
      const clientTimeSlotRef = ref(null)
      
      const { matchLoadedTimeSlots } = useAvailabilityLogic({
        selectedDate,
        propertyDetailsStepData,
        wizard,
        timeSlots,
        loadedWizardState,
      })
      
      matchLoadedTimeSlots(loadedSlots, availableSlots, inspectorTimeSlotRef, clientTimeSlotRef)
      
      expect(inspectorTimeSlotRef.value).not.toBeNull()
      expect(inspectorTimeSlotRef.value?.slotStart).toBe('2024-01-15T09:00:00')
      expect(clientTimeSlotRef.value).not.toBeNull()
      expect(clientTimeSlotRef.value?.slotStart).toBe('2024-01-15T10:00:00')
    })

    it('should handle empty loaded slots', () => {
      const availableSlots = [createTimeSlot('2024-01-15T09:00:00')]
      const loadedSlots: Array<{ startTime: string; endTime?: string }> = []
      
      const inspectorTimeSlotRef = ref(null)
      const clientTimeSlotRef = ref(null)
      
      const { matchLoadedTimeSlots } = useAvailabilityLogic({
        selectedDate,
        propertyDetailsStepData,
        wizard,
        timeSlots,
        loadedWizardState,
      })
      
      matchLoadedTimeSlots(loadedSlots, availableSlots, inspectorTimeSlotRef, clientTimeSlotRef)
      
      expect(inspectorTimeSlotRef.value).toBeNull()
      expect(clientTimeSlotRef.value).toBeNull()
    })

    it('should handle empty available slots', () => {
      const availableSlots: TimeSlot[] = []
      const loadedSlots = [{ startTime: '2024-01-15T09:00:00Z' }]
      
      const inspectorTimeSlotRef = ref(null)
      const clientTimeSlotRef = ref(null)
      
      const { matchLoadedTimeSlots } = useAvailabilityLogic({
        selectedDate,
        propertyDetailsStepData,
        wizard,
        timeSlots,
        loadedWizardState,
      })
      
      matchLoadedTimeSlots(loadedSlots, availableSlots, inspectorTimeSlotRef, clientTimeSlotRef)
      
      expect(inspectorTimeSlotRef.value).toBeNull()
    })

    it('should match by time string (RFC3339 format)', () => {
      const availableSlots = [
        createTimeSlot('2024-01-15T09:30:00'),
        createTimeSlot('2024-01-15T10:45:00'),
      ]
      
      const loadedSlots = [
        { startTime: '2024-01-15T09:30:00Z' }, // RFC3339 format
        { startTime: '2024-01-15T10:45:00Z' },
      ]
      
      const inspectorTimeSlotRef = ref(null)
      const clientTimeSlotRef = ref(null)
      
      const { matchLoadedTimeSlots } = useAvailabilityLogic({
        selectedDate,
        propertyDetailsStepData,
        wizard,
        timeSlots,
        loadedWizardState,
      })
      
      matchLoadedTimeSlots(loadedSlots, availableSlots, inspectorTimeSlotRef, clientTimeSlotRef)
      
      expect(inspectorTimeSlotRef.value).not.toBeNull()
      expect(clientTimeSlotRef.value).not.toBeNull()
    })

    it('should handle invalid time strings gracefully', () => {
      const availableSlots = [createTimeSlot('2024-01-15T09:00:00')]
      const loadedSlots = [{ startTime: 'invalid-time' }]
      
      const inspectorTimeSlotRef = ref(null)
      const clientTimeSlotRef = ref(null)
      
      const { matchLoadedTimeSlots } = useAvailabilityLogic({
        selectedDate,
        propertyDetailsStepData,
        wizard,
        timeSlots,
        loadedWizardState,
      })
      
      matchLoadedTimeSlots(loadedSlots, availableSlots, inspectorTimeSlotRef, clientTimeSlotRef)
      
      expect(inspectorTimeSlotRef.value).toBeNull()
    })
  })

  describe('selectedTimeSlots', () => {
    it('should return null placeholder', () => {
      const { selectedTimeSlots } = useAvailabilityLogic({
        selectedDate,
        propertyDetailsStepData,
        wizard,
        timeSlots,
        loadedWizardState,
      })
      
      expect(selectedTimeSlots.value).toBeNull()
    })
  })
})
