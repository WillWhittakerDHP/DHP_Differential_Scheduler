
import { describe, it, expect } from 'vitest'
import {
  calculateOnSiteTotal,
  calculateClientPresenceDuration,
  calculateInspectorStartTime,
  calculateClientStartTime,
  calculatePropertyAdjustments
} from '../differentialScheduling'
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
  partInstances: BookingBlockInstance['partInstances'] = []
): BookingBlockInstance {
  return {
    id,
    entityKey: 'blockInstance',
    name: `Block ${id}`,
    baseSqFt: 0,
    description: '',
    icon: '',
    disabled: false,
    differential: false,
    orderIndex: 0,
    active: true,
    blockShape: 'shape-1',
    activeBlockIds: [],
    partInstances
  }
}


describe('differentialScheduling', () => {
  describe('calculateOnSiteTotal', () => {
    it('should return 0 for null service', () => {
      const result = calculateOnSiteTotal(null)
      expect(result).toBe(0)
    })

    it('should return 0 for service with no part instances', () => {
      const service = createBlockInstance('service-1', [])
      const result = calculateOnSiteTotal(service)
      expect(result).toBe(0)
    })

    it('should sum baseTime from parts with onSite = true', () => {
      const partInstances = [
        createPartInstance('part-1', 30, { onSite: true }),
        createPartInstance('part-2', 45, { onSite: true }),
        createPartInstance('part-3', 15, { onSite: false }) // Should not be included
      ]
      const service = createBlockInstance('service-1', partInstances)
      
      const result = calculateOnSiteTotal(service)
      expect(result).toBe(75) // 30 + 45 (only onSite parts)
    })

    it('should fallback to sum all baseTime if no parts marked onSite', () => {
      const partInstances = [
        createPartInstance('part-1', 30, { onSite: false }),
        createPartInstance('part-2', 45, { onSite: false })
      ]
      const service = createBlockInstance('service-1', partInstances)
      
      const result = calculateOnSiteTotal(service)
      expect(result).toBe(75) // Fallback: sum all baseTime
    })

    it('should handle zero baseTime values', () => {
      const partInstances = [
        createPartInstance('part-1', 30, { onSite: true }),
        createPartInstance('part-2', 0, { onSite: true }),
        createPartInstance('part-3', 45, { onSite: true })
      ]
      const service = createBlockInstance('service-1', partInstances)
      
      const result = calculateOnSiteTotal(service)
      expect(result).toBe(75) // 30 + 0 + 45
    })

    it('should handle very large baseTime values', () => {
      const partInstances = [
        createPartInstance('part-1', 480, { onSite: true }), // 8 hours
        createPartInstance('part-2', 120, { onSite: true })  // 2 hours
      ]
      const service = createBlockInstance('service-1', partInstances)
      
      const result = calculateOnSiteTotal(service)
      expect(result).toBe(600) // 480 + 120
    })
  })

  describe('calculateClientPresenceDuration', () => {
    it('should return 0 for null service', () => {
      const result = calculateClientPresenceDuration(null)
      expect(result).toBe(0)
    })

    it('should return 0 for service with no part instances', () => {
      const service = createBlockInstance('service-1', [])
      const result = calculateClientPresenceDuration(service)
      expect(result).toBe(0)
    })

    it('should sum baseTime from parts with clientPresent = true', () => {
      const partInstances = [
        createPartInstance('part-1', 30, { clientPresent: true }),
        createPartInstance('part-2', 45, { clientPresent: true }),
        createPartInstance('part-3', 15, { clientPresent: false }) // Should not be included
      ]
      const service = createBlockInstance('service-1', partInstances)
      
      const result = calculateClientPresenceDuration(service)
      expect(result).toBe(75) // 30 + 45 (only clientPresent parts)
    })

    it('should return 0 if no parts marked clientPresent', () => {
      const partInstances = [
        createPartInstance('part-1', 30, { clientPresent: false }),
        createPartInstance('part-2', 45, { clientPresent: false })
      ]
      const service = createBlockInstance('service-1', partInstances)
      
      const result = calculateClientPresenceDuration(service)
      expect(result).toBe(0) // No clientPresent parts
    })

    it('should handle zero baseTime values', () => {
      const partInstances = [
        createPartInstance('part-1', 30, { clientPresent: true }),
        createPartInstance('part-2', 0, { clientPresent: true }),
        createPartInstance('part-3', 45, { clientPresent: true })
      ]
      const service = createBlockInstance('service-1', partInstances)
      
      const result = calculateClientPresenceDuration(service)
      expect(result).toBe(75) // 30 + 0 + 45
    })
  })

  describe('calculateInspectorStartTime', () => {
    it('should calculate inspector start time correctly', () => {
      const clientStartTime = '2026-01-06T10:00:00Z' // 10:00 AM
      const onSiteTotal = 60 // 1 hour
      
      const result = calculateInspectorStartTime(clientStartTime, onSiteTotal)
      const inspectorStart = new Date(result)
      const clientStart = new Date(clientStartTime)
      
      expect(inspectorStart.getTime()).toBe(clientStart.getTime() - (60 * 60 * 1000))
    })

    it('should handle midnight rollover (inspector starts previous day)', () => {
      const clientStartTime = '2026-01-06T01:00:00Z' // 1:00 AM UTC
      const onSiteTotal = 120 // 2 hours (would push inspector to 11:00 PM previous day)
      
      const result = calculateInspectorStartTime(clientStartTime, onSiteTotal)
      const inspectorStart = new Date(result)
      const clientStart = new Date(clientStartTime)
      
      expect(inspectorStart.getUTCDate()).toBe(clientStart.getUTCDate())
      expect(inspectorStart.getUTCHours()).toBe(9)
      expect(inspectorStart.getUTCMinutes()).toBe(0)
    })

    it('should handle very early morning times', () => {
      const clientStartTime = '2026-01-06T08:00:00Z' // 8:00 AM UTC
      const onSiteTotal = 30 // 30 minutes
      
      const result = calculateInspectorStartTime(clientStartTime, onSiteTotal)
      const inspectorStart = new Date(result)
      
      expect(inspectorStart.getUTCHours()).toBe(7)
      expect(inspectorStart.getUTCMinutes()).toBe(30)
    })

    it('should handle large onSiteTotal values', () => {
      const clientStartTime = '2026-01-06T14:00:00Z' // 2:00 PM
      const onSiteTotal = 240 // 4 hours
      
      const result = calculateInspectorStartTime(clientStartTime, onSiteTotal)
      const inspectorStart = new Date(result)
      const clientStart = new Date(clientStartTime)
      
      expect(inspectorStart.getTime()).toBe(clientStart.getTime() - (240 * 60 * 1000))
    })

    it('should handle zero onSiteTotal', () => {
      const clientStartTime = '2026-01-06T10:00:00Z'
      const onSiteTotal = 0
      
      const result = calculateInspectorStartTime(clientStartTime, onSiteTotal)
      const inspectorStart = new Date(result)
      const clientStart = new Date(clientStartTime)
      
      expect(inspectorStart.getTime()).toBe(clientStart.getTime())
    })

    it('should return valid ISO date string', () => {
      const clientStartTime = '2026-01-06T10:00:00Z'
      const onSiteTotal = 60
      
      const result = calculateInspectorStartTime(clientStartTime, onSiteTotal)
      
      expect(() => new Date(result)).not.toThrow()
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    })
  })

  describe('calculateClientStartTime', () => {
    it('should return selected slot time directly', () => {
      const selectedSlotTime = '2026-01-06T10:00:00Z'
      
      const result = calculateClientStartTime(selectedSlotTime)
      
      expect(result).toBe(selectedSlotTime)
    })

    it('should handle different time formats', () => {
      const selectedSlotTime = '2026-01-06T14:30:00Z'
      
      const result = calculateClientStartTime(selectedSlotTime)
      
      expect(result).toBe(selectedSlotTime)
      expect(() => new Date(result)).not.toThrow()
    })

    it('should return valid ISO date string', () => {
      const selectedSlotTime = '2026-01-06T09:15:00Z'
      
      const result = calculateClientStartTime(selectedSlotTime)
      
      expect(() => new Date(result)).not.toThrow()
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    })
  })

  describe('calculatePropertyAdjustments', () => {
    it('should return 0 (placeholder implementation)', () => {
      const result = calculatePropertyAdjustments()
      expect(result).toBe(0)
    })

    it('should return 0 with property details', () => {
      const propertyDetails = {
        squareFootage: 2000,
        bedrooms: 3,
        bathrooms: 2
      }
      
      const result = calculatePropertyAdjustments(propertyDetails)
      expect(result).toBe(0) // Placeholder returns 0
    })

    it('should return 0 with null property details', () => {
      const result = calculatePropertyAdjustments(null)
      expect(result).toBe(0)
    })

    it('should return 0 with empty property details', () => {
      const result = calculatePropertyAdjustments({})
      expect(result).toBe(0)
    })
  })
})

