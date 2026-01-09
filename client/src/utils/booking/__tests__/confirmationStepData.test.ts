/**
 * CONFIRMATION STEP DATA TESTS
 * 
 * Unit tests for confirmationStepData utility functions.
 * Tests fee calculation, summary data building, and price data construction.
 * 
 * What it covers:
 * - calculateBlockInstanceFee: Fee calculation with ADU multipliers
 * - buildConfirmationSummaryData: Address and service type formatting
 * - buildConfirmationPriceData: Total fee calculation from wizard state
 * 
 * How it works:
 * - Pure function tests with mock BookingBlockInstance data
 * - Tests edge cases like empty selections, null values, multiple services
 * 
 * What it validates:
 * - Correct fee calculation with/without allowMultiple
 * - Proper address formatting with all/partial fields
 * - Accurate totals from services, property types, and options
 * 
 * Dependencies:
 * - vitest for testing
 * - BookingBlockInstance types
 */

import { describe, it, expect } from 'vitest'
import {
  calculateBlockInstanceFee,
  buildConfirmationSummaryData,
  buildConfirmationPriceData,
} from '../confirmationStepData'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'

// Helper to create mock BlockInstance
function createBlockInstance(
  id: string,
  name: string,
  baseFees: number[],
  allowMultiple = false
): BookingBlockInstance {
  return {
    id,
    name,
    allowMultiple,
    partInstances: baseFees.map((fee, i) => ({
      id: `part-${id}-${i}`,
      name: `Part ${i}`,
      baseFee: fee,
    })),
    blockShapeRef: 'shape-1',
    disabled: false,
  } as BookingBlockInstance
}

describe('confirmationStepData', () => {
  describe('calculateBlockInstanceFee', () => {
    it('should sum baseFee from all partInstances', () => {
      const block = createBlockInstance('block-1', 'Block 1', [50, 25, 25])
      
      const fee = calculateBlockInstanceFee(block)
      
      expect(fee).toBe(100) // 50 + 25 + 25
    })

    it('should return 0 for block with no partInstances', () => {
      const block = createBlockInstance('block-1', 'Block 1', [])
      
      const fee = calculateBlockInstanceFee(block)
      
      expect(fee).toBe(0)
    })

    it('should handle single partInstance', () => {
      const block = createBlockInstance('block-1', 'Block 1', [150])
      
      const fee = calculateBlockInstanceFee(block)
      
      expect(fee).toBe(150)
    })

    it('should handle null/undefined baseFee in partInstances', () => {
      const block = {
        ...createBlockInstance('block-1', 'Block 1', []),
        partInstances: [
          { id: 'p1', name: 'Part 1', baseFee: 50 },
          { id: 'p2', name: 'Part 2', baseFee: null as unknown as number },
          { id: 'p3', name: 'Part 3', baseFee: undefined as unknown as number },
        ],
      } as BookingBlockInstance
      
      const fee = calculateBlockInstanceFee(block)
      
      expect(fee).toBe(50) // Only counts the valid baseFee
    })

    describe('with allowMultiple', () => {
      it('should multiply fee by aduCount when allowMultiple is true', () => {
        const block = createBlockInstance('block-1', 'Block 1', [100], true)
        
        const fee = calculateBlockInstanceFee(block, 3)
        
        expect(fee).toBe(300) // 100 * 3
      })

      it('should default to multiplier of 1 when aduCount is null', () => {
        const block = createBlockInstance('block-1', 'Block 1', [100], true)
        
        const fee = calculateBlockInstanceFee(block, null)
        
        expect(fee).toBe(100) // 100 * 1
      })

      it('should default to multiplier of 1 when aduCount is undefined', () => {
        const block = createBlockInstance('block-1', 'Block 1', [100], true)
        
        const fee = calculateBlockInstanceFee(block)
        
        expect(fee).toBe(100) // 100 * 1
      })

      it('should not multiply when allowMultiple is false', () => {
        const block = createBlockInstance('block-1', 'Block 1', [100], false)
        
        const fee = calculateBlockInstanceFee(block, 5)
        
        expect(fee).toBe(100) // Not multiplied
      })
    })
  })

  describe('buildConfirmationSummaryData', () => {
    describe('serviceType', () => {
      it('should return single service name', () => {
        const wizard = {
          selectedServices: [createBlockInstance('s1', 'Home Inspection', [100])],
          selectedPropertyTypeBlocks: [],
          selectedOptionTypeBlocks: [],
        }
        
        const summary = buildConfirmationSummaryData(wizard)
        
        expect(summary.serviceType).toBe('Home Inspection')
      })

      it('should return count for multiple services', () => {
        const wizard = {
          selectedServices: [
            createBlockInstance('s1', 'Service 1', [100]),
            createBlockInstance('s2', 'Service 2', [100]),
            createBlockInstance('s3', 'Service 3', [100]),
          ],
          selectedPropertyTypeBlocks: [],
          selectedOptionTypeBlocks: [],
        }
        
        const summary = buildConfirmationSummaryData(wizard)
        
        expect(summary.serviceType).toBe('3 Services')
      })

      it('should handle no services selected', () => {
        const wizard = {
          selectedServices: [],
          selectedPropertyTypeBlocks: [],
          selectedOptionTypeBlocks: [],
        }
        
        const summary = buildConfirmationSummaryData(wizard)
        
        expect(summary.serviceType).toBe('No service selected')
      })
    })

    describe('propertyType', () => {
      it('should return single property type name', () => {
        const wizard = {
          selectedServices: [],
          selectedPropertyTypeBlocks: [createBlockInstance('p1', 'Single Family', [50])],
          selectedOptionTypeBlocks: [],
        }
        
        const summary = buildConfirmationSummaryData(wizard)
        
        expect(summary.propertyType).toBe('Single Family')
      })

      it('should join multiple property types with comma', () => {
        const wizard = {
          selectedServices: [],
          selectedPropertyTypeBlocks: [
            createBlockInstance('p1', 'Pool', [50]),
            createBlockInstance('p2', 'Garage', [25]),
          ],
          selectedOptionTypeBlocks: [],
        }
        
        const summary = buildConfirmationSummaryData(wizard)
        
        expect(summary.propertyType).toBe('Pool, Garage')
      })

      it('should handle no property types selected', () => {
        const wizard = {
          selectedServices: [],
          selectedPropertyTypeBlocks: [],
          selectedOptionTypeBlocks: [],
        }
        
        const summary = buildConfirmationSummaryData(wizard)
        
        expect(summary.propertyType).toBe('No property type selected')
      })
    })

    describe('address', () => {
      it('should format full address with all fields', () => {
        const wizard = {
          selectedServices: [],
          selectedPropertyTypeBlocks: [],
          selectedOptionTypeBlocks: [],
        }
        const propertyDetails = {
          address: '123 Main St',
          unit: '4B',
          city: 'Springfield',
          state: 'IL',
          zipCode: '62701',
          propertySize: null,
          squareFootage: null,
        }
        
        const summary = buildConfirmationSummaryData(wizard, propertyDetails)
        
        expect(summary.address).toBe('123 Main St, #4B, Springfield, IL, 62701')
      })

      it('should skip unit when empty', () => {
        const wizard = {
          selectedServices: [],
          selectedPropertyTypeBlocks: [],
          selectedOptionTypeBlocks: [],
        }
        const propertyDetails = {
          address: '123 Main St',
          unit: '',
          city: 'Springfield',
          state: 'IL',
          zipCode: '62701',
          propertySize: null,
          squareFootage: null,
        }
        
        const summary = buildConfirmationSummaryData(wizard, propertyDetails)
        
        expect(summary.address).toBe('123 Main St, Springfield, IL, 62701')
      })

      it('should handle partial address', () => {
        const wizard = {
          selectedServices: [],
          selectedPropertyTypeBlocks: [],
          selectedOptionTypeBlocks: [],
        }
        const propertyDetails = {
          address: '123 Main St',
          unit: '',
          city: '',
          state: 'CA',
          zipCode: '',
          propertySize: null,
          squareFootage: null,
        }
        
        const summary = buildConfirmationSummaryData(wizard, propertyDetails)
        
        expect(summary.address).toBe('123 Main St, CA')
      })

      it('should handle no property details', () => {
        const wizard = {
          selectedServices: [],
          selectedPropertyTypeBlocks: [],
          selectedOptionTypeBlocks: [],
        }
        
        const summary = buildConfirmationSummaryData(wizard, null)
        
        expect(summary.address).toBe('No address provided')
      })
    })

    describe('squareFootage', () => {
      it('should format squareFootage with sqft suffix', () => {
        const wizard = {
          selectedServices: [],
          selectedPropertyTypeBlocks: [],
          selectedOptionTypeBlocks: [],
        }
        const propertyDetails = {
          address: '',
          unit: '',
          city: '',
          state: '',
          zipCode: '',
          propertySize: null,
          squareFootage: 2500,
        }
        
        const summary = buildConfirmationSummaryData(wizard, propertyDetails)
        
        expect(summary.squareFootage).toBe('2500sqft')
      })

      it('should fallback to propertySize when squareFootage is null', () => {
        const wizard = {
          selectedServices: [],
          selectedPropertyTypeBlocks: [],
          selectedOptionTypeBlocks: [],
        }
        const propertyDetails = {
          address: '',
          unit: '',
          city: '',
          state: '',
          zipCode: '',
          propertySize: 1800,
          squareFootage: null,
        }
        
        const summary = buildConfirmationSummaryData(wizard, propertyDetails)
        
        expect(summary.squareFootage).toBe('1800sqft')
      })

      it('should return "Not specified" when both are null', () => {
        const wizard = {
          selectedServices: [],
          selectedPropertyTypeBlocks: [],
          selectedOptionTypeBlocks: [],
        }
        const propertyDetails = {
          address: '',
          unit: '',
          city: '',
          state: '',
          zipCode: '',
          propertySize: null,
          squareFootage: null,
        }
        
        const summary = buildConfirmationSummaryData(wizard, propertyDetails)
        
        expect(summary.squareFootage).toBe('Not specified')
      })
    })
  })

  describe('buildConfirmationPriceData', () => {
    it('should calculate total from services', () => {
      const wizard = {
        selectedServices: [
          createBlockInstance('s1', 'Service 1', [100]),
          createBlockInstance('s2', 'Service 2', [150]),
        ],
        selectedPropertyTypeBlocks: [],
        selectedOptionTypeBlocks: [],
      }
      
      const priceData = buildConfirmationPriceData(wizard)
      
      expect(priceData.totalFee).toBe(250) // 100 + 150
    })

    it('should add property type block fees', () => {
      const wizard = {
        selectedServices: [createBlockInstance('s1', 'Service', [100])],
        selectedPropertyTypeBlocks: [createBlockInstance('p1', 'Pool', [50])],
        selectedOptionTypeBlocks: [],
      }
      
      const priceData = buildConfirmationPriceData(wizard)
      
      expect(priceData.totalFee).toBe(150) // 100 + 50
    })

    it('should add option type block fees', () => {
      const wizard = {
        selectedServices: [createBlockInstance('s1', 'Service', [100])],
        selectedPropertyTypeBlocks: [],
        selectedOptionTypeBlocks: [createBlockInstance('o1', 'Option', [25])],
      }
      
      const priceData = buildConfirmationPriceData(wizard)
      
      expect(priceData.totalFee).toBe(125) // 100 + 25
    })

    it('should calculate combined total from all sources', () => {
      const wizard = {
        selectedServices: [createBlockInstance('s1', 'Service', [100])],
        selectedPropertyTypeBlocks: [createBlockInstance('p1', 'Pool', [50])],
        selectedOptionTypeBlocks: [createBlockInstance('o1', 'Rush', [30])],
      }
      
      const priceData = buildConfirmationPriceData(wizard)
      
      expect(priceData.totalFee).toBe(180) // 100 + 50 + 30
    })

    it('should handle empty selections', () => {
      const wizard = {
        selectedServices: [],
        selectedPropertyTypeBlocks: [],
        selectedOptionTypeBlocks: [],
      }
      
      const priceData = buildConfirmationPriceData(wizard)
      
      expect(priceData.totalFee).toBe(0)
    })

    it('should apply ADU multiplier to allowMultiple services', () => {
      const wizard = {
        selectedServices: [
          createBlockInstance('s1', 'ADU Service', [100], true), // allowMultiple
          createBlockInstance('s2', 'Regular Service', [50], false),
        ],
        selectedPropertyTypeBlocks: [],
        selectedOptionTypeBlocks: [],
      }
      
      const priceData = buildConfirmationPriceData(wizard, 2)
      
      expect(priceData.totalFee).toBe(250) // (100 * 2) + 50
    })

    it('should include all price data fields', () => {
      const wizard = {
        selectedServices: [createBlockInstance('s1', 'Service', [100])],
        selectedPropertyTypeBlocks: [],
        selectedOptionTypeBlocks: [],
      }
      
      const priceData = buildConfirmationPriceData(wizard)
      
      expect(priceData.currency).toBe('USD')
      expect(priceData.bagTotal).toBe(100)
      expect(priceData.couponDiscount).toBe(0)
      expect(priceData.orderTotal).toBe(100)
      expect(priceData.deliveryCharges).toBe(5.0)
      expect(priceData.deliveryFree).toBe(true)
      expect(priceData.finalTotal).toBe(100) // deliveryFree, so no charges
    })
  })
})
