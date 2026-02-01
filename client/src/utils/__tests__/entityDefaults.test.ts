
import { describe, it, expect } from 'vitest'
import { getEntityDisplayName, mergeEntityDefaults, getDefaultEntityValues } from '../entityDefaults'
import type { GlobalEntityKey } from '@/constants/entities'

describe('entityDefaults', () => {
  describe('getEntityDisplayName', () => {
    it('should return display name for blockInstance', () => {
      expect(getEntityDisplayName('blockInstance')).toBe('Block Profile')
    })

    it('should return display name for blockShape', () => {
      expect(getEntityDisplayName('blockShape')).toBe('Block Shape')
    })

    it('should return display name for partInstance', () => {
      expect(getEntityDisplayName('partInstance')).toBe('Part Profile')
    })

    it('should return display name for partShape', () => {
      expect(getEntityDisplayName('partShape')).toBe('Part Shape')
    })

    it('should return entity key as fallback for unknown types', () => {
      expect(getEntityDisplayName('unknownType' as GlobalEntityKey)).toBe('unknownType')
    })
  })

  describe('mergeEntityDefaults', () => {
    it('should merge defaults with provided data for blockShape', () => {
      const provided = {
        name: 'Custom Block Shape',
        active: false,
      }
      
      const result = mergeEntityDefaults('blockShape', provided)
      
      expect(result.orderIndex).toBe(0)
      expect(result.active).toBe(false) // Provided value overrides default
      expect(result.dependent).toBe(false)
      expect(result.name).toBe('Custom Block Shape')
    })

    it('should merge defaults with provided data for blockInstance', () => {
      const provided = {
        name: 'Custom Block',
        baseSqFt: 1500,
      }
      
      const result = mergeEntityDefaults('blockInstance', provided)
      
      expect(result.orderIndex).toBe(0)
      expect(result.active).toBe(true)
      expect(result.active).toBe(true)
      expect(result.dependent).toBe(false)
      expect(result.description).toBe('')
      expect(result.baseSqFt).toBe(1500)
      expect(result.name).toBe('Custom Block')
    })

    it('should merge defaults with provided data for partInstance', () => {
      const provided = {
        name: 'Custom Part',
        baseFee: 200,
        baseTime: 90,
      }
      
      const result = mergeEntityDefaults('partInstance', provided)
      
      expect(result.orderIndex).toBe(0)
      expect(result.onSite).toBe(false)
      expect(result.clientPresent).toBe(false)
      expect(result.moveable).toBe(false)
      expect(result.baseFee).toBe(200)
      expect(result.rateOverBaseFee).toBe(0)
      expect(result.baseTime).toBe(90)
      expect(result.rateOverBaseTime).toBe(0)
      expect(result.active).toBe(true)
      expect(result.dependent).toBe(false)
      expect(result.active).toBe(true)
      expect(result.name).toBe('Custom Part')
    })

    it('should merge defaults with provided data for partShape', () => {
      const provided = {
        name: 'Custom Part Shape',
      }
      
      const result = mergeEntityDefaults('partShape', provided)
      
      expect(result.orderIndex).toBe(0)
      expect(result.active).toBe(true)
      expect(result.dependent).toBe(false)
      expect(result.active).toBe(true)
      expect(result.name).toBe('Custom Part Shape')
    })

    it('should ensure orderIndex is always a number', () => {
      const result1 = mergeEntityDefaults('blockInstance', { orderIndex: null as any })
      expect(result1.orderIndex).toBe(0)
      
      const result2 = mergeEntityDefaults('blockInstance', { orderIndex: undefined as any })
      expect(result2.orderIndex).toBe(0)
      
      const result3 = mergeEntityDefaults('blockInstance', { orderIndex: 5 })
      expect(result3.orderIndex).toBe(5)
    })

    it('should allow provided values to override defaults', () => {
      const provided = {
        orderIndex: 10,
        active: false,
        active: false,
      }
      
      const result = mergeEntityDefaults('blockInstance', provided)
      
      expect(result.orderIndex).toBe(10)
      expect(result.active).toBe(false)
      expect(result.active).toBe(false)
    })

    it('should handle empty provided data', () => {
      const result = mergeEntityDefaults('blockInstance', {})
      
      expect(result.orderIndex).toBe(0)
      expect(result.active).toBe(true)
      expect(result.active).toBe(true)
    })
  })

  describe('getDefaultEntityValues', () => {
    it('should return default values for blockInstance', () => {
      const defaults = getDefaultEntityValues('blockInstance')
      
      expect(defaults.orderIndex).toBe(0)
      expect(defaults.active).toBe(true)
      expect(defaults.active).toBe(true)
      expect(defaults.dependent).toBe(false)
      expect(defaults.description).toBe('')
      expect(defaults.baseSqFt).toBe(0)
      expect(defaults.name).toBe('')
    })

    it('should return default values for blockShape', () => {
      const defaults = getDefaultEntityValues('blockShape')
      
      expect(defaults.orderIndex).toBe(0)
      expect(defaults.active).toBe(true)
      expect(defaults.dependent).toBe(false)
      expect(defaults.active).toBe(true)
      expect(defaults.name).toBe('')
    })

    it('should return default values for partInstance', () => {
      const defaults = getDefaultEntityValues('partInstance')
      
      expect(defaults.orderIndex).toBe(0)
      expect(defaults.onSite).toBe(false)
      expect(defaults.clientPresent).toBe(false)
      expect(defaults.moveable).toBe(false)
      expect(defaults.baseFee).toBe(0)
      expect(defaults.rateOverBaseFee).toBe(0)
      expect(defaults.baseTime).toBe(0)
      expect(defaults.rateOverBaseTime).toBe(0)
      expect(defaults.active).toBe(true)
      expect(defaults.dependent).toBe(false)
      expect(defaults.active).toBe(true)
      expect(defaults.name).toBe('')
    })

    it('should return default values for partShape', () => {
      const defaults = getDefaultEntityValues('partShape')
      
      expect(defaults.orderIndex).toBe(0)
      expect(defaults.active).toBe(true)
      expect(defaults.dependent).toBe(false)
      expect(defaults.active).toBe(true)
      expect(defaults.name).toBe('')
    })

    it('should set empty name to show placeholder', () => {
      const blockDefaults = getDefaultEntityValues('blockInstance')
      expect(blockDefaults.name).toBe('')
      
      const partDefaults = getDefaultEntityValues('partInstance')
      expect(partDefaults.name).toBe('')
    })

    it('should ensure orderIndex is always set', () => {
      const defaults = getDefaultEntityValues('blockInstance')
      expect(defaults.orderIndex).toBeDefined()
      expect(typeof defaults.orderIndex).toBe('number')
    })

    it('should preserve provided name if set in defaults', () => {
      const merged = mergeEntityDefaults('blockInstance', { name: 'Custom Name' })
      expect(merged.name).toBe('Custom Name')
    })
  })
})

