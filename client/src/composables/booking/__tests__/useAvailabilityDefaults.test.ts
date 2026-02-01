
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref, computed } from 'vue'
import { useAvailabilityDefaults } from '../useAvailabilityDefaults'
import type { TimeSlot } from '@/types/appointment'
import type { WizardStateData } from '@/utils/transformers/appointmentToWizardTransformer'

vi.mock('@/composables/useTimeFormatting', () => ({
  useTimeFormatting: () => ({
    getFirstAvailabilityDate: vi.fn((slots: TimeSlot[]) => {
      if (!slots || slots.length === 0) return null
      const firstSlot = slots[0]
      const date = new Date(firstSlot.slotStart)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }),
    getTodayDate: vi.fn(() => {
      const today = new Date()
      const year = today.getFullYear()
      const month = String(today.getMonth() + 1).padStart(2, '0')
      const day = String(today.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }),
  }),
}))

function createTimeSlot(
  slotStart: string,
  options: {
    slotEnd?: string
    duration?: number
  } = {}
): TimeSlot {
  return {
    slotStart,
    slotEnd: options.slotEnd || new Date(new Date(slotStart).getTime() + (options.duration || 60) * 60000).toISOString(),
    duration: options.duration || 60,
    available: true,
  }
}

describe('useAvailabilityDefaults', () => {
  let loadedWizardState: ReturnType<typeof ref>
  let timeSlots: ReturnType<typeof computed>

  beforeEach(() => {
    loadedWizardState = ref(null)
    timeSlots = computed(() => null)
  })

  describe('initialization', () => {
    it('should initialize selectedDate to today', () => {
      const { selectedDate } = useAvailabilityDefaults({
        loadedWizardState,
        timeSlots,
      })
      
      expect(selectedDate.value.start).toBeTruthy()
      expect(selectedDate.value.start).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(selectedDate.value.end).toBeNull()
    })

    it('should initialize startTimeType to null', () => {
      const { startTimeType } = useAvailabilityDefaults({
        loadedWizardState,
        timeSlots,
      })
      
      expect(startTimeType.value).toBeNull()
    })

    it('should initialize inspectorTimeSlot to null', () => {
      const { inspectorTimeSlot } = useAvailabilityDefaults({
        loadedWizardState,
        timeSlots,
      })
      
      expect(inspectorTimeSlot.value).toBeNull()
    })

    it('should initialize clientTimeSlot to null', () => {
      const { clientTimeSlot } = useAvailabilityDefaults({
        loadedWizardState,
        timeSlots,
      })
      
      expect(clientTimeSlot.value).toBeNull()
    })
  })

  describe('time slot matching', () => {
    it('should match loaded time slots to available slots', async () => {
      const availableSlots = [
        createTimeSlot('2024-01-15T09:00:00'),
        createTimeSlot('2024-01-15T10:00:00'),
        createTimeSlot('2024-01-15T11:00:00'),
      ]
      
      const loadedState: WizardStateData = {
        availability: {
          selectedTimeSlots: [
            { time: '2024-01-15T09:00:00' },
            { time: '2024-01-15T10:00:00' },
          ],
        },
      } as WizardStateData
      
      loadedWizardState.value = loadedState
      timeSlots = computed(() => availableSlots)
      
      const { inspectorTimeSlot, clientTimeSlot } = useAvailabilityDefaults({
        loadedWizardState,
        timeSlots,
      })
      
      await new Promise(resolve => setTimeout(resolve, 0))
      
      expect(inspectorTimeSlot.value).not.toBeNull()
      expect(inspectorTimeSlot.value?.slotStart).toBe('2024-01-15T09:00:00')
      expect(clientTimeSlot.value).not.toBeNull()
      expect(clientTimeSlot.value?.slotStart).toBe('2024-01-15T10:00:00')
    })

    it('should match by time string (HH:mm format)', async () => {
      const availableSlots = [
        createTimeSlot('2024-01-15T09:30:00'),
        createTimeSlot('2024-01-15T10:45:00'),
      ]
      
      const loadedState: WizardStateData = {
        availability: {
          selectedTimeSlots: [
            { time: '09:30' }, // HH:mm format
            { time: '10:45' },
          ],
        },
      } as WizardStateData
      
      loadedWizardState.value = loadedState
      timeSlots = computed(() => availableSlots)
      
      const { inspectorTimeSlot, clientTimeSlot } = useAvailabilityDefaults({
        loadedWizardState,
        timeSlots,
      })
      
      await new Promise(resolve => setTimeout(resolve, 0))
      
      expect(inspectorTimeSlot.value).not.toBeNull()
      expect(clientTimeSlot.value).not.toBeNull()
    })

    it('should handle empty loaded slots', async () => {
      const availableSlots = [createTimeSlot('2024-01-15T09:00:00')]
      
      const loadedState: WizardStateData = {
        availability: {
          selectedTimeSlots: [],
        },
      } as WizardStateData
      
      loadedWizardState.value = loadedState
      timeSlots = computed(() => availableSlots)
      
      const { inspectorTimeSlot, clientTimeSlot } = useAvailabilityDefaults({
        loadedWizardState,
        timeSlots,
      })
      
      await new Promise(resolve => setTimeout(resolve, 0))
      
      expect(inspectorTimeSlot.value).toBeNull()
      expect(clientTimeSlot.value).toBeNull()
    })

    it('should handle empty available slots', async () => {
      const loadedState: WizardStateData = {
        availability: {
          selectedTimeSlots: [{ time: '2024-01-15T09:00:00' }],
        },
      } as WizardStateData
      
      loadedWizardState.value = loadedState
      timeSlots = computed(() => [])
      
      const { inspectorTimeSlot, clientTimeSlot } = useAvailabilityDefaults({
        loadedWizardState,
        timeSlots,
      })
      
      await new Promise(resolve => setTimeout(resolve, 0))
      
      expect(inspectorTimeSlot.value).toBeNull()
      expect(clientTimeSlot.value).toBeNull()
    })

    it('should handle invalid time strings gracefully', async () => {
      const availableSlots = [createTimeSlot('2024-01-15T09:00:00')]
      
      const loadedState: WizardStateData = {
        availability: {
          selectedTimeSlots: [{ time: 'invalid-time' }],
        },
      } as WizardStateData
      
      loadedWizardState.value = loadedState
      timeSlots = computed(() => availableSlots)
      
      const { inspectorTimeSlot } = useAvailabilityDefaults({
        loadedWizardState,
        timeSlots,
      })
      
      await new Promise(resolve => setTimeout(resolve, 0))
      
      expect(inspectorTimeSlot.value).toBeNull()
    })
  })

  describe('auto-select first available date', () => {
    it('should not override existing date selection when time slots load', async () => {
      const slots = [
        createTimeSlot('2024-01-20T09:00:00'),
        createTimeSlot('2024-01-21T09:00:00'),
      ]
      
      const { selectedDate } = useAvailabilityDefaults({
        loadedWizardState,
        timeSlots,
      })
      
      selectedDate.value = { start: '2024-01-25', end: null }
      
      timeSlots = computed(() => slots)
      
      await new Promise(resolve => setTimeout(resolve, 0))
      
      expect(selectedDate.value.start).toBe('2024-01-25')
    })

    it('should initialize to today when no date selected', () => {
      timeSlots = computed(() => null)
      
      const { selectedDate } = useAvailabilityDefaults({
        loadedWizardState,
        timeSlots,
      })
      
      expect(selectedDate.value.start).toBeTruthy()
      expect(selectedDate.value.start).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })

    it('should not auto-select when no time slots available', async () => {
      timeSlots = computed(() => [])
      
      const { selectedDate } = useAvailabilityDefaults({
        loadedWizardState,
        timeSlots,
      })
      
      selectedDate.value = { start: null, end: null }
      
      await new Promise(resolve => setTimeout(resolve, 0))
      
      expect(selectedDate.value.start).toBeNull()
    })
  })

  describe('state management', () => {
    it('should allow setting selectedDate', () => {
      const { selectedDate } = useAvailabilityDefaults({
        loadedWizardState,
        timeSlots,
      })
      
      selectedDate.value = { start: '2024-01-15', end: '2024-01-20' }
      
      expect(selectedDate.value.start).toBe('2024-01-15')
      expect(selectedDate.value.end).toBe('2024-01-20')
    })

    it('should allow setting startTimeType', () => {
      const { startTimeType } = useAvailabilityDefaults({
        loadedWizardState,
        timeSlots,
      })
      
      startTimeType.value = 'inspector'
      expect(startTimeType.value).toBe('inspector')
      
      startTimeType.value = 'client'
      expect(startTimeType.value).toBe('client')
      
      startTimeType.value = null
      expect(startTimeType.value).toBeNull()
    })

    it('should allow setting inspectorTimeSlot', async () => {
      const { inspectorTimeSlot } = useAvailabilityDefaults({
        loadedWizardState,
        timeSlots,
      })
      
      const slot = createTimeSlot('2024-01-15T09:00:00')
      inspectorTimeSlot.value = slot
      
      await new Promise(resolve => setTimeout(resolve, 0))
      
      expect(inspectorTimeSlot.value).not.toBeNull()
      expect(inspectorTimeSlot.value?.slotStart).toBe(slot.slotStart)
    })

    it('should allow setting clientTimeSlot', async () => {
      const { clientTimeSlot } = useAvailabilityDefaults({
        loadedWizardState,
        timeSlots,
      })
      
      const slot = createTimeSlot('2024-01-15T10:00:00')
      clientTimeSlot.value = slot
      
      await new Promise(resolve => setTimeout(resolve, 0))
      
      expect(clientTimeSlot.value).not.toBeNull()
      expect(clientTimeSlot.value?.slotStart).toBe(slot.slotStart)
    })
  })

  describe('loaded wizard state handling', () => {
    it('should handle null loadedWizardState', () => {
      loadedWizardState.value = null
      
      const { selectedDate, inspectorTimeSlot, clientTimeSlot } = useAvailabilityDefaults({
        loadedWizardState,
        timeSlots,
      })
      
      expect(selectedDate.value.start).toBeTruthy() // Should still initialize to today
      expect(inspectorTimeSlot.value).toBeNull()
      expect(clientTimeSlot.value).toBeNull()
    })

    it('should handle loadedWizardState without availability data', async () => {
      const loadedState: WizardStateData = {
        availability: undefined,
      } as WizardStateData
      
      loadedWizardState.value = loadedState
      timeSlots = computed(() => [createTimeSlot('2024-01-15T09:00:00')])
      
      const { inspectorTimeSlot, clientTimeSlot } = useAvailabilityDefaults({
        loadedWizardState,
        timeSlots,
      })
      
      await new Promise(resolve => setTimeout(resolve, 0))
      
      expect(inspectorTimeSlot.value).toBeNull()
      expect(clientTimeSlot.value).toBeNull()
    })
  })
})
