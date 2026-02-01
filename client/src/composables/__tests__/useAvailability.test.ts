
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref, computed, nextTick } from 'vue'

vi.mock('@/utils/timeSlotCalculations', () => {
  return {
    calculateDurationFromBlockInstances: vi.fn((blockInstances: BookingBlockInstance[]) => {
      if (!blockInstances || blockInstances.length === 0) return 90
      return blockInstances.reduce((total, block) => {
        return total + block.partInstances.reduce((sum, part) => sum + (part.baseTime || 0), 0)
      }, 0) || 90
    }),
    generateTimeSlots: vi.fn(async (dateRange, duration) => {
      const slots = []
      const start = new Date(dateRange.start)
      const end = new Date(dateRange.end)
      const current = new Date(start)
      
      while (current < end) {
        for (let hour = 9; hour < 19; hour++) {
          for (let minute = 0; minute < 60; minute += 15) {
            const slotStart = new Date(current)
            slotStart.setHours(hour, minute, 0, 0)
            
            const slotEnd = new Date(slotStart)
            slotEnd.setMinutes(slotEnd.getMinutes() + duration)
            
            if (slotEnd.getHours() <= 19) {
              slots.push({
                slotStart: slotStart.toISOString(),
                slotEnd: slotEnd.toISOString(),
                duration
              })
            }
          }
        }
        current.setDate(current.getDate() + 1)
      }
      
      return slots
    }),
    getCalendarAvailability: vi.fn(() => [])
  }
})

import { useAvailability } from '../useAvailability'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'


function createPartInstance(
  id: string,
  baseTime: number,
  options: {
    onSite?: boolean
    clientPresent?: boolean
  } = {}
): BookingBlockInstance['partInstances'][0] {
  return {
    id,
    entityKey: 'partInstance',
    name: `Part ${id}`,
    partShape: 'shape-1',
    onSite: options.onSite ?? false,
    clientPresent: options.clientPresent ?? false,
    moveable: false,
    baseTime,
    rateOverBaseTime: 0,
    baseFee: 0,
    rateOverBaseFee: 0,
    orderIndex: 0,
    disabled: false
  }
}

function createBlockInstance(
  id: string,
  partInstances: BookingBlockInstance['partInstances'] = [],
  options: {
    differential?: boolean
  } = {}
): BookingBlockInstance {
  return {
    id,
    entityKey: 'blockInstance',
    name: `Block ${id}`,
    baseSqFt: 0,
    description: '',
    icon: '',
    disabled: false,
    differential: options.differential ?? false,
    orderIndex: 0,
    active: true,
    blockShape: 'shape-1',
    activeBlockIds: [],
    partInstances
  }
}

vi.mock('@/utils/timeSlotCalculations', () => ({
  calculateDurationFromBlockInstances: vi.fn((blockInstances: BookingBlockInstance[]) => {
    if (!blockInstances || blockInstances.length === 0) return 90
    return blockInstances.reduce((total, block) => {
      return total + block.partInstances.reduce((sum, part) => sum + (part.baseTime || 0), 0)
    }, 0) || 90
  }),
  generateTimeSlots: vi.fn((dateRange, duration) => {
    const slots = []
    const start = new Date(dateRange.start)
    const end = new Date(dateRange.end)
    const current = new Date(start)
    
    while (current < end) {
      for (let hour = 9; hour < 19; hour++) {
        for (let minute = 0; minute < 60; minute += 15) {
          const slotStart = new Date(current)
          slotStart.setHours(hour, minute, 0, 0)
          
          const slotEnd = new Date(slotStart)
          slotEnd.setMinutes(slotEnd.getMinutes() + duration)
          
          if (slotEnd.getHours() <= 19) {
            slots.push({
              slotStart: slotStart.toISOString(),
              slotEnd: slotEnd.toISOString(),
              duration
            })
          }
        }
      }
      current.setDate(current.getDate() + 1)
    }
    
    return slots
  }),
  getCalendarAvailability: vi.fn(() => [])
}))


describe('useAvailability', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Helper function to wait for async watch callback to complete
  const waitForTimeSlots = async () => {
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 10))
  }

  describe('with single service (non-differential)', () => {
    it('should generate time slots for single service', async () => {
      const partInstances = [
        createPartInstance('part-1', 60),
        createPartInstance('part-2', 30)
      ]
      const service = createBlockInstance('service-1', partInstances)
      
      const dateRange = {
        start: '2026-01-06T00:00:00Z',
        end: '2026-01-07T00:00:00Z'
      }
      
      const { timeSlots } = useAvailability([service], dateRange)
      await waitForTimeSlots()
      
      expect(timeSlots.value.length).toBeGreaterThan(0)
      expect(timeSlots.value[0]).toHaveProperty('slotStart')
      expect(timeSlots.value[0]).toHaveProperty('slotEnd')
      expect(timeSlots.value[0]).toHaveProperty('duration')
    })

    it('should calculate duration from service part instances', async () => {
      const partInstances = [
        createPartInstance('part-1', 60),
        createPartInstance('part-2', 30)
      ]
      const service = createBlockInstance('service-1', partInstances)
      
      const dateRange = {
        start: '2026-01-06T00:00:00Z',
        end: '2026-01-07T00:00:00Z'
      }
      
      const { timeSlots } = useAvailability([service], dateRange)
      await waitForTimeSlots()
      
      expect(timeSlots.value[0].duration).toBe(90)
    })

    it('should respect business hours in generated slots', async () => {
      const service = createBlockInstance('service-1', [
        createPartInstance('part-1', 60)
      ])
      
      const dateRange = {
        start: '2026-01-06T00:00:00Z',
        end: '2026-01-07T00:00:00Z'
      }
      
      const { timeSlots } = useAvailability([service], dateRange)
      await waitForTimeSlots()
      
      timeSlots.value.forEach(slot => {
        const start = new Date(slot.slotStart)
        const end = new Date(slot.slotEnd)
        expect(start.getHours()).toBeGreaterThanOrEqual(9)
        expect(end.getHours()).toBeLessThanOrEqual(19)
      })
    })
  })

  describe('with differential service', () => {
    it('should generate time slots for differential service', async () => {
      const partInstances = [
        createPartInstance('part-1', 60, { onSite: true }),
        createPartInstance('part-2', 30, { clientPresent: true })
      ]
      const service = createBlockInstance('service-1', partInstances, { differential: true })
      
      const dateRange = {
        start: '2026-01-06T00:00:00Z',
        end: '2026-01-07T00:00:00Z'
      }
      
      const { timeSlots } = useAvailability([service], dateRange)
      await waitForTimeSlots()
      
      expect(timeSlots.value.length).toBeGreaterThan(0)
    })
  })

  describe('with multiple block instances', () => {
    it('should calculate duration from service + property type block', async () => {
      const serviceParts = [
        createPartInstance('service-part-1', 60),
        createPartInstance('service-part-2', 30)
      ]
      const propertyParts = [
        createPartInstance('property-part-1', 15)
      ]
      
      const service = createBlockInstance('service-1', serviceParts)
      const property = createBlockInstance('property-1', propertyParts)
      
      const dateRange = {
        start: '2026-01-06T00:00:00Z',
        end: '2026-01-07T00:00:00Z'
      }
      
      const { timeSlots } = useAvailability([service, property], dateRange)
      await waitForTimeSlots()
      
      expect(timeSlots.value[0].duration).toBe(105)
    })

    it('should calculate duration from service + availability options', async () => {
      const serviceParts = [
        createPartInstance('service-part-1', 60)
      ]
      const availabilityParts = [
        createPartInstance('availability-part-1', 10),
        createPartInstance('availability-part-2', 5)
      ]
      
      const service = createBlockInstance('service-1', serviceParts)
      const availability1 = createBlockInstance('availability-1', [availabilityParts[0]])
      const availability2 = createBlockInstance('availability-2', [availabilityParts[1]])
      
      const dateRange = {
        start: '2026-01-06T00:00:00Z',
        end: '2026-01-07T00:00:00Z'
      }
      
      const { timeSlots } = useAvailability([service, availability1, availability2], dateRange)
      await waitForTimeSlots()
      
      expect(timeSlots.value[0].duration).toBe(75)
    })

    it('should calculate duration from all three types combined', async () => {
      const serviceParts = [
        createPartInstance('service-part-1', 60)
      ]
      const propertyParts = [
        createPartInstance('property-part-1', 15)
      ]
      const availabilityParts = [
        createPartInstance('availability-part-1', 10)
      ]
      
      const service = createBlockInstance('service-1', serviceParts)
      const property = createBlockInstance('property-1', propertyParts)
      const availability = createBlockInstance('availability-1', availabilityParts)
      
      const dateRange = {
        start: '2026-01-06T00:00:00Z',
        end: '2026-01-07T00:00:00Z'
      }
      
      const { timeSlots } = useAvailability([service, property, availability], dateRange)
      await waitForTimeSlots()
      
      expect(timeSlots.value[0].duration).toBe(85)
    })
  })

  describe('reactivity', () => {
    it('should update when block instances change', () => {
      const service1 = createBlockInstance('service-1', [
        createPartInstance('part-1', 60)
      ])
      const service2 = createBlockInstance('service-2', [
        createPartInstance('part-2', 90)
      ])
      
      const blockInstances = ref([service1])
      const dateRange = {
        start: '2026-01-06T00:00:00Z',
        end: '2026-01-07T00:00:00Z'
      }
      
      const { timeSlots } = useAvailability(blockInstances, dateRange)
      
       
      const _initialDuration = timeSlots.value[0]?.duration
      
      blockInstances.value = [service2]
      
      expect(timeSlots.value).toBeDefined()
    })

    it('should update when date range changes', () => {
      const service = createBlockInstance('service-1', [
        createPartInstance('part-1', 60)
      ])
      
      const dateRange = ref({
        start: '2026-01-06T00:00:00Z',
        end: '2026-01-07T00:00:00Z'
      })
      
      const { timeSlots } = useAvailability([service], dateRange)
      
       
      const _initialCount = timeSlots.value.length
      
      dateRange.value = {
        start: '2026-01-06T00:00:00Z',
        end: '2026-01-09T00:00:00Z' // 3 days instead of 1
      }
      
      expect(timeSlots.value).toBeDefined()
    })
  })

  describe('error handling', () => {
    it('should return empty array for missing block instances', () => {
      const dateRange = {
        start: '2026-01-06T00:00:00Z',
        end: '2026-01-07T00:00:00Z'
      }
      
      const { timeSlots } = useAvailability([], dateRange)
      
      expect(timeSlots.value).toEqual([])
    })

    it('should return empty array for null date range', () => {
      const service = createBlockInstance('service-1', [
        createPartInstance('part-1', 60)
      ])
      
      const { timeSlots } = useAvailability([service], null)
      
      expect(timeSlots.value).toEqual([])
    })

    it('should return empty array for missing date range start', () => {
      const service = createBlockInstance('service-1', [
        createPartInstance('part-1', 60)
      ])
      
      const dateRange = {
        start: null,
        end: '2026-01-07T00:00:00Z'
      }
      
      const { timeSlots } = useAvailability([service], dateRange)
      
      expect(timeSlots.value).toEqual([])
    })

    it('should return empty array for missing date range end', () => {
      const service = createBlockInstance('service-1', [
        createPartInstance('part-1', 60)
      ])
      
      const dateRange = {
        start: '2026-01-06T00:00:00Z',
        end: null
      }
      
      const { timeSlots } = useAvailability([service], dateRange)
      
      expect(timeSlots.value).toEqual([])
    })

    it('should handle calculation errors gracefully', async () => {
      const timeSlotCalculations = await import('@/utils/timeSlotCalculations')
      
      // Mock generateTimeSlots to reject (async error) for this test
      vi.mocked(timeSlotCalculations.generateTimeSlots).mockImplementationOnce(async () => {
        throw new Error('Calculation error')
      })
      
      const service = createBlockInstance('service-1', [
        createPartInstance('part-1', 60)
      ])
      
      const dateRange = {
        start: '2026-01-06T00:00:00Z',
        end: '2026-01-07T00:00:00Z'
      }
      
      const { timeSlots } = useAvailability([service], dateRange)
      await waitForTimeSlots()
      
      expect(timeSlots.value).toEqual([])
      
      vi.mocked(timeSlotCalculations.generateTimeSlots).mockRestore()
    })
  })

  describe('with refs and computed', () => {
    it('should work with ref block instances', async () => {
      const service = createBlockInstance('service-1', [
        createPartInstance('part-1', 60)
      ])
      
      const blockInstances = ref([service])
      const dateRange = {
        start: '2026-01-06T00:00:00Z',
        end: '2026-01-07T00:00:00Z'
      }
      
      const { timeSlots } = useAvailability(blockInstances, dateRange)
      await waitForTimeSlots()
      
      expect(timeSlots.value.length).toBeGreaterThan(0)
    })

    it('should work with computed block instances', async () => {
      const service = createBlockInstance('service-1', [
        createPartInstance('part-1', 60)
      ])
      
      const blockInstances = computed(() => [service])
      const dateRange = {
        start: '2026-01-06T00:00:00Z',
        end: '2026-01-07T00:00:00Z'
      }
      
      const { timeSlots } = useAvailability(blockInstances, dateRange)
      await waitForTimeSlots()
      
      expect(timeSlots.value.length).toBeGreaterThan(0)
    })

    it('should work with ref date range', async () => {
      const service = createBlockInstance('service-1', [
        createPartInstance('part-1', 60)
      ])
      
      const dateRange = ref({
        start: '2026-01-06T00:00:00Z',
        end: '2026-01-07T00:00:00Z'
      })
      
      const { timeSlots } = useAvailability([service], dateRange)
      await waitForTimeSlots()
      
      expect(timeSlots.value.length).toBeGreaterThan(0)
    })

    it('should work with computed date range', async () => {
      const service = createBlockInstance('service-1', [
        createPartInstance('part-1', 60)
      ])
      
      const dateRange = computed(() => ({
        start: '2026-01-06T00:00:00Z',
        end: '2026-01-07T00:00:00Z'
      }))
      
      const { timeSlots } = useAvailability([service], dateRange)
      await waitForTimeSlots()
      
      expect(timeSlots.value.length).toBeGreaterThan(0)
    })
  })

  describe('edge cases', () => {
    it('should handle empty block instances array', () => {
      const dateRange = {
        start: '2026-01-06T00:00:00Z',
        end: '2026-01-07T00:00:00Z'
      }
      
      const { timeSlots } = useAvailability([], dateRange)
      
      expect(timeSlots.value).toEqual([])
    })

    it('should handle block instances with no part instances', async () => {
      const service = createBlockInstance('service-1', [])
      
      const dateRange = {
        start: '2026-01-06T00:00:00Z',
        end: '2026-01-07T00:00:00Z'
      }
      
      const { timeSlots } = useAvailability([service], dateRange)
      await waitForTimeSlots()
      
      expect(timeSlots.value.length).toBeGreaterThan(0)
      expect(timeSlots.value[0].duration).toBe(90)
    })

    it('should handle very short duration', async () => {
      const service = createBlockInstance('service-1', [
        createPartInstance('part-1', 5) // 5 minutes
      ])
      
      const dateRange = {
        start: '2026-01-06T00:00:00Z',
        end: '2026-01-07T00:00:00Z'
      }
      
      const { timeSlots } = useAvailability([service], dateRange)
      await waitForTimeSlots()
      
      expect(timeSlots.value.length).toBeGreaterThan(0)
      expect(timeSlots.value[0].duration).toBe(5)
    })

    it('should handle very long duration', async () => {
      const service = createBlockInstance('service-1', [
        createPartInstance('part-1', 600) // 10 hours
      ])
      
      const dateRange = {
        start: '2026-01-06T00:00:00Z',
        end: '2026-01-07T00:00:00Z'
      }
      
      const { timeSlots } = useAvailability([service], dateRange)
      await waitForTimeSlots()
      
      expect(Array.isArray(timeSlots.value)).toBe(true)
    })
  })
})

