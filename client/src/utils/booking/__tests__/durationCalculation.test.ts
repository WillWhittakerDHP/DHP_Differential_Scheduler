
import { describe, it, expect } from 'vitest'
import { calculateDurationFromBlockInstances } from '../durationCalculation'
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
  partInstances: BookingBlockInstance['partInstances']
): BookingBlockInstance {
  return {
    id,
    entityKey: 'blockInstance',
    name: `Block ${id}`,
    blockShape: 'shape-1',
    partInstances,
    orderIndex: 0,
    disabled: false
  }
}

describe('durationCalculation', () => {
  describe('calculateDurationFromBlockInstances', () => {
    it('should return default 90 minutes for empty array', () => {
      const result = calculateDurationFromBlockInstances([])
      expect(result).toBe(90)
    })

    it('should calculate duration from single block instance with single part instance', () => {
      const partInstance = createPartInstance('part-1', 60)
      const blockInstance = createBlockInstance('block-1', [partInstance])
      
      const result = calculateDurationFromBlockInstances([blockInstance])
      expect(result).toBe(60)
    })

    it('should calculate duration from single block instance with multiple part instances', () => {
      const partInstances = [
        createPartInstance('part-1', 30),
        createPartInstance('part-2', 45),
        createPartInstance('part-3', 15)
      ]
      const blockInstance = createBlockInstance('block-1', partInstances)
      
      const result = calculateDurationFromBlockInstances([blockInstance])
      expect(result).toBe(90) // 30 + 45 + 15
    })

    it('should calculate duration from multiple block instances', () => {
      const serviceParts = [
        createPartInstance('service-part-1', 60),
        createPartInstance('service-part-2', 30)
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
      
      const result = calculateDurationFromBlockInstances([service, property, availability])
      expect(result).toBe(115) // 60 + 30 + 15 + 10
    })

    it('should return default 90 minutes if sum is 0', () => {
      const partInstance = createPartInstance('part-1', 0)
      const blockInstance = createBlockInstance('block-1', [partInstance])
      
      const result = calculateDurationFromBlockInstances([blockInstance])
      expect(result).toBe(90) // Default when sum is 0
    })

    it('should handle block instance with no part instances', () => {
      const blockInstance = createBlockInstance('block-1', [])
      
      const result = calculateDurationFromBlockInstances([blockInstance])
      expect(result).toBe(90) // Default when no parts
    })

    it('should handle part instances with zero baseTime', () => {
      const partInstances = [
        createPartInstance('part-1', 60),
        createPartInstance('part-2', 0),
        createPartInstance('part-3', 30)
      ]
      const blockInstance = createBlockInstance('block-1', partInstances)
      
      const result = calculateDurationFromBlockInstances([blockInstance])
      expect(result).toBe(90) // 60 + 0 + 30
    })

    it('should calculate duration from single block instance', () => {
      const partInstance = createPartInstance('part-1', 60)
      const blockInstance = createBlockInstance('block-1', [partInstance])
      
      const result = calculateDurationFromBlockInstances([blockInstance])
      expect(result).toBe(60)
    })

    it('should return default for empty array', () => {
      const result = calculateDurationFromBlockInstances([])
      expect(result).toBe(90)
    })
  })
})
