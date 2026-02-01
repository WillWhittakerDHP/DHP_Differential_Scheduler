/**
 * SERVICE DESCRIPTIONS TESTS
 * 
 * Unit tests for serviceDescriptions utility functions.
 * Tests description filtering based on user type blocks.
 * 
 * What it covers:
 * - getFilteredServiceDescription: Get appropriate description for user type
 * - mapServicesWithFilteredDescriptions: Map services with filtered descriptions
 * 
 * How it works:
 * - Tests description priority: user-type-specific > default > first available
 * - Tests fallback to service.description when no descriptions array
 * - Tests empty/null handling
 * 
 * What it validates:
 * - User type specific descriptions are preferred
 * - Default descriptions are used when no user type match
 * - First available description is used as last resort
 * - Empty description arrays fall back to service.description
 * 
 * Dependencies:
 * - vitest for testing
 * - BookingBlockInstance types
 */

import { describe, it, expect } from 'vitest'
import {
  getFilteredServiceDescription,
  mapServicesWithFilteredDescriptions,
} from '../serviceDescriptions'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'

function createService(
  id: string,
  options: {
    description?: string
    descriptions?: Array<{
      text: string
      userTypeBlock: string | null
      isDefault?: boolean
    }>
  } = {}
): BookingBlockInstance {
  return {
    id,
    entityKey: 'blockInstance',
    name: `Service ${id}`,
    description: options.description ?? 'Default description',
    descriptions: options.descriptions as BookingBlockInstance['descriptions'],
    baseSqFt: 1000,
    icon: 'icon-test',
    active: true,
    bookingMode: 'standalone',
    differential: false,
    orderIndex: 0,
    blockShape: 'Test Shape',
    blockShapeRef: 'shape-1',
    activeBlockIds: [],
    partInstances: [],
    allowMultiple: false,
    requiresUnitNumber: null,
  }
}

describe('serviceDescriptions', () => {
  describe('getFilteredServiceDescription', () => {
    describe('no descriptions array', () => {
      it('should return service.description when descriptions is undefined', () => {
        const service = createService('s1', {
          description: 'Fallback description',
          descriptions: undefined,
        })
        
        const result = getFilteredServiceDescription(service, 'buyer')
        
        expect(result).toBe('Fallback description')
      })

      it('should return empty string when description is empty and no descriptions', () => {
        const service = createService('s1', {
          description: '',
          descriptions: undefined,
        })
        
        const result = getFilteredServiceDescription(service, 'buyer')
        
        expect(result).toBe('')
      })

      it('should return service.description when descriptions array is empty', () => {
        const service = createService('s1', {
          description: 'Fallback description',
          descriptions: [],
        })
        
        const result = getFilteredServiceDescription(service, 'buyer')
        
        expect(result).toBe('Fallback description')
      })
    })

    describe('user type specific descriptions', () => {
      it('should return user type specific description when available', () => {
        const service = createService('s1', {
          descriptions: [
            { text: 'Buyer specific', userTypeBlock: 'buyer', isDefault: false },
            { text: 'Seller specific', userTypeBlock: 'seller', isDefault: false },
            { text: 'General', userTypeBlock: null, isDefault: true },
          ],
        })
        
        const result = getFilteredServiceDescription(service, 'buyer')
        
        expect(result).toBe('Buyer specific')
      })

      it('should return seller description when seller user type', () => {
        const service = createService('s1', {
          descriptions: [
            { text: 'Buyer specific', userTypeBlock: 'buyer', isDefault: false },
            { text: 'Seller specific', userTypeBlock: 'seller', isDefault: false },
          ],
        })
        
        const result = getFilteredServiceDescription(service, 'seller')
        
        expect(result).toBe('Seller specific')
      })
    })

    describe('default description fallback', () => {
      it('should return default description when no user type match', () => {
        const service = createService('s1', {
          descriptions: [
            { text: 'Buyer specific', userTypeBlock: 'buyer', isDefault: false },
            { text: 'Default description', userTypeBlock: null, isDefault: true },
          ],
        })
        
        const result = getFilteredServiceDescription(service, 'seller')
        
        expect(result).toBe('Default description')
      })

      it('should prefer user type specific over default', () => {
        const service = createService('s1', {
          descriptions: [
            { text: 'Buyer specific', userTypeBlock: 'buyer', isDefault: false },
            { text: 'Default', userTypeBlock: null, isDefault: true },
          ],
        })
        
        const result = getFilteredServiceDescription(service, 'buyer')
        
        expect(result).toBe('Buyer specific')
      })
    })

    describe('first available fallback', () => {
      it('should return first matching description when no default', () => {
        const service = createService('s1', {
          descriptions: [
            { text: 'First description', userTypeBlock: null, isDefault: false },
            { text: 'Second description', userTypeBlock: null, isDefault: false },
          ],
        })
        
        const result = getFilteredServiceDescription(service, 'buyer')
        
        expect(result).toBe('First description')
      })
    })

    describe('null user type block', () => {
      it('should include null userTypeBlock descriptions in matching', () => {
        const service = createService('s1', {
          descriptions: [
            { text: 'Generic description', userTypeBlock: null, isDefault: false },
          ],
        })
        
        const result = getFilteredServiceDescription(service, 'buyer')
        
        expect(result).toBe('Generic description')
      })

      it('should handle null userTypeBlockName parameter', () => {
        const service = createService('s1', {
          descriptions: [
            { text: 'Buyer only', userTypeBlock: 'buyer', isDefault: false },
            { text: 'Generic', userTypeBlock: null, isDefault: true },
          ],
        })
        
        const result = getFilteredServiceDescription(service, null)
        
        expect(result).toBe('Generic')
      })
    })

    describe('service.description fallback', () => {
      it('should fall back to service.description when no matching descriptions', () => {
        const service = createService('s1', {
          description: 'Original service description',
          descriptions: [
            { text: 'Buyer only', userTypeBlock: 'buyer', isDefault: false },
          ],
        })
        
        const result = getFilteredServiceDescription(service, 'seller')
        
        expect(result).toBe('Original service description')
      })
    })
  })

  describe('mapServicesWithFilteredDescriptions', () => {
    it('should map services with filtered descriptions', () => {
      const services = [
        createService('s1', {
          description: 'Original 1',
          descriptions: [
            { text: 'Buyer S1', userTypeBlock: 'buyer', isDefault: false },
          ],
        }),
        createService('s2', {
          description: 'Original 2',
          descriptions: [
            { text: 'Buyer S2', userTypeBlock: 'buyer', isDefault: false },
          ],
        }),
      ]
      
      const result = mapServicesWithFilteredDescriptions(services, 'buyer')
      
      expect(result).toHaveLength(2)
      expect(result[0].description).toBe('Buyer S1')
      expect(result[1].description).toBe('Buyer S2')
    })

    it('should preserve other service properties', () => {
      const services = [
        createService('s1', {
          description: 'Original',
          descriptions: [
            { text: 'Filtered', userTypeBlock: 'buyer', isDefault: false },
          ],
        }),
      ]
      
      const result = mapServicesWithFilteredDescriptions(services, 'buyer')
      
      expect(result[0].id).toBe('s1')
      expect(result[0].name).toBe('Service s1')
      expect(result[0].baseSqFt).toBe(1000)
    })

    it('should not mutate original services array', () => {
      const originalService = createService('s1', {
        description: 'Original',
        descriptions: [
          { text: 'Filtered', userTypeBlock: 'buyer', isDefault: false },
        ],
      })
      const services = [originalService]
      
      mapServicesWithFilteredDescriptions(services, 'buyer')
      
      expect(originalService.description).toBe('Original')
    })

    it('should handle empty services array', () => {
      const result = mapServicesWithFilteredDescriptions([], 'buyer')
      
      expect(result).toEqual([])
    })

    it('should handle null user type block name', () => {
      const services = [
        createService('s1', {
          descriptions: [
            { text: 'Generic', userTypeBlock: null, isDefault: true },
          ],
        }),
      ]
      
      const result = mapServicesWithFilteredDescriptions(services, null)
      
      expect(result[0].description).toBe('Generic')
    })

    it('should handle mixed services with and without descriptions', () => {
      const services = [
        createService('s1', {
          description: 'Original S1',
          descriptions: [
            { text: 'Filtered S1', userTypeBlock: 'buyer', isDefault: false },
          ],
        }),
        createService('s2', {
          description: 'No descriptions S2',
          descriptions: undefined,
        }),
      ]
      
      const result = mapServicesWithFilteredDescriptions(services, 'buyer')
      
      expect(result[0].description).toBe('Filtered S1')
      expect(result[1].description).toBe('No descriptions S2')
    })
  })
})
