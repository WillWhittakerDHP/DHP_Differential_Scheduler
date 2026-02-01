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

function createBlockInstance(
  id: string,
  name: string,
  baseFees: number[],
  allowMultiple = false,
  rateOverBaseFees: number[] = []
): BookingBlockInstance {
  return {
    id,
    name,
    allowMultiple,
    partInstances: baseFees.map((fee, i) => ({
      id: `part-${id}-${i}`,
      name: `Part ${i}`,
      baseFee: fee,
      rateOverBaseFee: rateOverBaseFees[i] ?? 0,
      baseTime: 0,
      rateOverBaseTime: 0,
      onSite: false,
      clientPresent: false,
      moveable: false,
      orderIndex: i,
      active: true,
      zeroOutPart: false,
    })),
    blockShapeRef: 'shape-1',
    disabled: false,
  } as BookingBlockInstance
}

describe('confirmationStepData', () => {
  describe('calculateBlockInstanceFee', () => {
    it('should sum baseFee from all partInstances', () => {
      const block = createBlockInstance('block-1', 'Block 1', [50, 25, 25])
      
      const fee = calculateBlockInstanceFee(block, null)
      
      expect(fee.baseFee).toBe(100) // 50 + 25 + 25
      expect(fee.overageFee).toBe(0) // No square footage
      expect(fee.totalFee).toBe(100)
    })

    it('should return 0 for block with no partInstances', () => {
      const block = createBlockInstance('block-1', 'Block 1', [])
      
      const fee = calculateBlockInstanceFee(block, null)
      
      expect(fee.baseFee).toBe(0)
      expect(fee.overageFee).toBe(0)
      expect(fee.totalFee).toBe(0)
    })

    it('should handle single partInstance', () => {
      const block = createBlockInstance('block-1', 'Block 1', [150])
      
      const fee = calculateBlockInstanceFee(block, null)
      
      expect(fee.baseFee).toBe(150)
      expect(fee.overageFee).toBe(0)
      expect(fee.totalFee).toBe(150)
    })

    it('should handle null/undefined baseFee in partInstances', () => {
      const block = {
        ...createBlockInstance('block-1', 'Block 1', []),
        partInstances: [
          { 
            id: 'p1', 
            name: 'Part 1', 
            baseFee: 50,
            rateOverBaseFee: 0,
            baseTime: 0,
            rateOverBaseTime: 0,
            onSite: false,
            clientPresent: false,
            moveable: false,
            orderIndex: 0,
            active: true,
            zeroOutPart: false,
          },
          { 
            id: 'p2', 
            name: 'Part 2', 
            baseFee: null as unknown as number,
            rateOverBaseFee: 0,
            baseTime: 0,
            rateOverBaseTime: 0,
            onSite: false,
            clientPresent: false,
            moveable: false,
            orderIndex: 1,
            active: true,
            zeroOutPart: false,
          },
          { 
            id: 'p3', 
            name: 'Part 3', 
            baseFee: undefined as unknown as number,
            rateOverBaseFee: 0,
            baseTime: 0,
            rateOverBaseTime: 0,
            onSite: false,
            clientPresent: false,
            moveable: false,
            orderIndex: 2,
            active: true,
            zeroOutPart: false,
          },
        ],
      } as BookingBlockInstance
      
      const fee = calculateBlockInstanceFee(block, null)
      
      expect(fee.baseFee).toBe(50) // Only counts the valid baseFee
      expect(fee.overageFee).toBe(0)
      expect(fee.totalFee).toBe(50)
    })

    it('should calculate overage fee with square footage', () => {
      const block = createBlockInstance('block-1', 'Block 1', [100], false, [0.5, 0.25])
      
      const fee = calculateBlockInstanceFee(block, 2000)
      
      expect(fee.baseFee).toBe(100)
      expect(fee.overageFee).toBe(1500) // (0.5 + 0.25) * 2000
      expect(fee.totalFee).toBe(1600) // 100 + 1500
    })

    it('should return 0 overage fee when square footage is null', () => {
      const block = createBlockInstance('block-1', 'Block 1', [100], false, [0.5])
      
      const fee = calculateBlockInstanceFee(block, null)
      
      expect(fee.baseFee).toBe(100)
      expect(fee.overageFee).toBe(0) // null square footage = 0 overage
      expect(fee.totalFee).toBe(100)
    })

    it('should return 0 overage fee when square footage is 0', () => {
      const block = createBlockInstance('block-1', 'Block 1', [100], false, [0.5])
      
      const fee = calculateBlockInstanceFee(block, 0)
      
      expect(fee.baseFee).toBe(100)
      expect(fee.overageFee).toBe(0) // 0 square footage = 0 overage
      expect(fee.totalFee).toBe(100)
    })

    it('should handle null/undefined rateOverBaseFee in partInstances', () => {
      const block = {
        ...createBlockInstance('block-1', 'Block 1', [100]),
        partInstances: [
          { 
            id: 'p1', 
            name: 'Part 1', 
            baseFee: 100,
            rateOverBaseFee: 0.5,
            baseTime: 0,
            rateOverBaseTime: 0,
            onSite: false,
            clientPresent: false,
            moveable: false,
            orderIndex: 0,
            active: true,
            zeroOutPart: false,
          },
          { 
            id: 'p2', 
            name: 'Part 2', 
            baseFee: 50,
            rateOverBaseFee: null as unknown as number,
            baseTime: 0,
            rateOverBaseTime: 0,
            onSite: false,
            clientPresent: false,
            moveable: false,
            orderIndex: 1,
            active: true,
            zeroOutPart: false,
          },
          { 
            id: 'p3', 
            name: 'Part 3', 
            baseFee: 25,
            rateOverBaseFee: undefined as unknown as number,
            baseTime: 0,
            rateOverBaseTime: 0,
            onSite: false,
            clientPresent: false,
            moveable: false,
            orderIndex: 2,
            active: true,
            zeroOutPart: false,
          },
        ],
      } as BookingBlockInstance
      
      const fee = calculateBlockInstanceFee(block, 1000)
      
      expect(fee.baseFee).toBe(175) // 100 + 50 + 25
      expect(fee.overageFee).toBe(500) // Only 0.5 * 1000 (null/undefined treated as 0)
      expect(fee.totalFee).toBe(675)
    })

    describe('with allowMultiple', () => {
      it('should multiply both base and overage fees by aduCount when allowMultiple is true', () => {
        const block = createBlockInstance('block-1', 'Block 1', [100], true, [0.5])
        
        const fee = calculateBlockInstanceFee(block, 2000, 3)
        
        expect(fee.baseFee).toBe(300) // 100 * 3
        expect(fee.overageFee).toBe(3000) // (0.5 * 2000) * 3
        expect(fee.totalFee).toBe(3300) // (100 + 1000) * 3
      })

      it('should default to multiplier of 1 when aduCount is null', () => {
        const block = createBlockInstance('block-1', 'Block 1', [100], true, [0.5])
        
        const fee = calculateBlockInstanceFee(block, 2000, null)
        
        expect(fee.baseFee).toBe(100) // 100 * 1
        expect(fee.overageFee).toBe(1000) // (0.5 * 2000) * 1
        expect(fee.totalFee).toBe(1100)
      })

      it('should default to multiplier of 1 when aduCount is undefined', () => {
        const block = createBlockInstance('block-1', 'Block 1', [100], true, [0.5])
        
        const fee = calculateBlockInstanceFee(block, 2000)
        
        expect(fee.baseFee).toBe(100) // 100 * 1
        expect(fee.overageFee).toBe(1000) // (0.5 * 2000) * 1
        expect(fee.totalFee).toBe(1100)
      })

      it('should not multiply when allowMultiple is false', () => {
        const block = createBlockInstance('block-1', 'Block 1', [100], false, [0.5])
        
        const fee = calculateBlockInstanceFee(block, 2000, 5)
        
        expect(fee.baseFee).toBe(100) // Not multiplied
        expect(fee.overageFee).toBe(1000) // Not multiplied
        expect(fee.totalFee).toBe(1100) // Not multiplied
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
          selectedLineItemBlocks: [],
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
          selectedLineItemBlocks: [],
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
        selectedLineItemBlocks: [],
      }
      
      const priceData = buildConfirmationPriceData(wizard, null)
      
      expect(priceData.totalFee).toBe(250) // 100 + 150
      expect(priceData.baseFeeTotal).toBe(250)
      expect(priceData.overageFeeTotal).toBe(0)
    })

    it('should add property type block fees', () => {
      const wizard = {
        selectedServices: [createBlockInstance('s1', 'Service', [100])],
        selectedPropertyTypeBlocks: [createBlockInstance('p1', 'Pool', [50])],
        selectedOptionTypeBlocks: [],
        selectedLineItemBlocks: [],
      }
      
      const priceData = buildConfirmationPriceData(wizard, null)
      
      expect(priceData.totalFee).toBe(150) // 100 + 50
      expect(priceData.baseFeeTotal).toBe(150)
      expect(priceData.overageFeeTotal).toBe(0)
    })

    it('should add option type block fees', () => {
      const wizard = {
        selectedServices: [createBlockInstance('s1', 'Service', [100])],
        selectedPropertyTypeBlocks: [],
        selectedOptionTypeBlocks: [createBlockInstance('o1', 'Option', [25])],
        selectedLineItemBlocks: [],
      }
      
      const priceData = buildConfirmationPriceData(wizard, null)
      
      expect(priceData.totalFee).toBe(125) // 100 + 25
      expect(priceData.baseFeeTotal).toBe(125)
      expect(priceData.overageFeeTotal).toBe(0)
    })

    it('should calculate combined total from all sources', () => {
      const wizard = {
        selectedServices: [createBlockInstance('s1', 'Service', [100])],
        selectedPropertyTypeBlocks: [createBlockInstance('p1', 'Pool', [50])],
        selectedOptionTypeBlocks: [createBlockInstance('o1', 'Rush', [30])],
        selectedLineItemBlocks: [],
      }
      
      const priceData = buildConfirmationPriceData(wizard, null)
      
      expect(priceData.totalFee).toBe(180) // 100 + 50 + 30
      expect(priceData.baseFeeTotal).toBe(180)
      expect(priceData.overageFeeTotal).toBe(0)
    })

    it('should handle empty selections', () => {
      const wizard = {
        selectedServices: [],
        selectedPropertyTypeBlocks: [],
        selectedOptionTypeBlocks: [],
        selectedLineItemBlocks: [],
      }
      
      const priceData = buildConfirmationPriceData(wizard, null)
      
      expect(priceData.totalFee).toBe(0)
      expect(priceData.baseFeeTotal).toBe(0)
      expect(priceData.overageFeeTotal).toBe(0)
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
      
      const priceData = buildConfirmationPriceData(wizard, null, 2)
      
      expect(priceData.totalFee).toBe(250) // (100 * 2) + 50
      expect(priceData.baseFeeTotal).toBe(250)
      expect(priceData.overageFeeTotal).toBe(0)
    })

    it('should calculate overage fees with square footage', () => {
      const wizard = {
        selectedServices: [
          createBlockInstance('s1', 'Service 1', [100], false, [0.5]),
          createBlockInstance('s2', 'Service 2', [150], false, [0.25]),
        ],
        selectedPropertyTypeBlocks: [],
        selectedOptionTypeBlocks: [],
      }
      
      const priceData = buildConfirmationPriceData(wizard, 2000)
      
      expect(priceData.baseFeeTotal).toBe(250)
      expect(priceData.overageFeeTotal).toBe(1500)
      expect(priceData.totalFee).toBe(1750) // 250 + 1500
    })

    it('should calculate overage fees across all block types', () => {
      const wizard = {
        selectedServices: [createBlockInstance('s1', 'Service', [100], false, [0.5])],
        selectedPropertyTypeBlocks: [createBlockInstance('p1', 'Pool', [50], false, [0.1])],
        selectedOptionTypeBlocks: [createBlockInstance('o1', 'Rush', [30], false, [0.05])],
      }
      
      const priceData = buildConfirmationPriceData(wizard, 2000)
      
      expect(priceData.baseFeeTotal).toBe(180)
      expect(priceData.overageFeeTotal).toBe(1300)
      expect(priceData.totalFee).toBe(1480) // 180 + 1300
    })

    it('should return 0 overage fee when square footage is null', () => {
      const wizard = {
        selectedServices: [createBlockInstance('s1', 'Service', [100], false, [0.5])],
        selectedPropertyTypeBlocks: [],
        selectedOptionTypeBlocks: [],
      }
      
      const priceData = buildConfirmationPriceData(wizard, null)
      
      expect(priceData.baseFeeTotal).toBe(100)
      expect(priceData.overageFeeTotal).toBe(0)
      expect(priceData.totalFee).toBe(100)
    })

    it('should apply ADU multiplier to both base and overage fees', () => {
      const wizard = {
        selectedServices: [
          createBlockInstance('s1', 'ADU Service', [100], true, [0.5]), // allowMultiple
        ],
        selectedPropertyTypeBlocks: [],
        selectedOptionTypeBlocks: [],
      }
      
      const priceData = buildConfirmationPriceData(wizard, 2000, 3)
      
      expect(priceData.baseFeeTotal).toBe(300)
      expect(priceData.overageFeeTotal).toBe(3000)
      expect(priceData.totalFee).toBe(3300) // 300 + 3000
    })

    it('should include all price data fields', () => {
      const wizard = {
        selectedServices: [createBlockInstance('s1', 'Service', [100])],
        selectedPropertyTypeBlocks: [],
        selectedOptionTypeBlocks: [],
      }
      
      const priceData = buildConfirmationPriceData(wizard, null)
      
      expect(priceData.currency).toBe('USD')
      expect(priceData.bagTotal).toBe(100)
      expect(priceData.couponDiscount).toBe(0)
      expect(priceData.orderTotal).toBe(100)
      expect(priceData.deliveryCharges).toBe(5.0)
      expect(priceData.deliveryFree).toBe(true)
      expect(priceData.finalTotal).toBe(100) // deliveryFree, so no charges
      expect(priceData.baseFeeTotal).toBe(100)
      expect(priceData.overageFeeTotal).toBe(0)
    })

    it('should calculate line item fees separately', () => {
      const wizard = {
        selectedServices: [createBlockInstance('s1', 'Service', [100])],
        selectedPropertyTypeBlocks: [],
        selectedOptionTypeBlocks: [],
        selectedLineItemBlocks: [
          createBlockInstance('li1', 'Delivery', [25]),
          createBlockInstance('li2', 'Setup Fee', [15]),
        ],
      }
      
      const priceData = buildConfirmationPriceData(wizard, null)
      
      expect(priceData.totalFee).toBe(140) // 100 + 25 + 15
      expect(priceData.baseFeeTotal).toBe(140)
      expect(priceData.overageFeeTotal).toBe(0)
      expect(priceData.lineItemFees?.baseFee).toBe(40) // 25 + 15
      expect(priceData.lineItemFees?.overageFee).toBe(0)
      expect(priceData.lineItemFees?.totalFee).toBe(40)
      expect(priceData.lineItems).toHaveLength(2)
      expect(priceData.lineItems?.[0].label).toBe('Delivery')
      expect(priceData.lineItems?.[0].amount).toBe(25)
      expect(priceData.lineItems?.[1].label).toBe('Setup Fee')
      expect(priceData.lineItems?.[1].amount).toBe(15)
    })

    it('should include line items in totals', () => {
      const wizard = {
        selectedServices: [createBlockInstance('s1', 'Service', [100])],
        selectedPropertyTypeBlocks: [createBlockInstance('p1', 'Pool', [50])],
        selectedOptionTypeBlocks: [],
        selectedLineItemBlocks: [createBlockInstance('li1', 'Delivery', [25])],
      }
      
      const priceData = buildConfirmationPriceData(wizard, null)
      
      expect(priceData.totalFee).toBe(175) // 100 + 50 + 25
      expect(priceData.baseFeeTotal).toBe(175)
      expect(priceData.lineItemFees?.totalFee).toBe(25)
    })

    it('should calculate line item overage fees with square footage', () => {
      const wizard = {
        selectedServices: [createBlockInstance('s1', 'Service', [100])],
        selectedPropertyTypeBlocks: [],
        selectedOptionTypeBlocks: [],
        selectedLineItemBlocks: [
          createBlockInstance('li1', 'Delivery', [25], false, [0.1]),
        ],
      }
      
      const priceData = buildConfirmationPriceData(wizard, 2000)
      
      expect(priceData.baseFeeTotal).toBe(125)
      expect(priceData.overageFeeTotal).toBe(200)
      expect(priceData.totalFee).toBe(325) // 125 + 200
      expect(priceData.lineItemFees?.baseFee).toBe(25)
      expect(priceData.lineItemFees?.overageFee).toBe(200)
      expect(priceData.lineItemFees?.totalFee).toBe(225)
    })

    it('should mark free line items correctly', () => {
      const wizard = {
        selectedServices: [createBlockInstance('s1', 'Service', [100])],
        selectedPropertyTypeBlocks: [],
        selectedOptionTypeBlocks: [],
        selectedLineItemBlocks: [
          createBlockInstance('li1', 'Free Delivery', [0]),
          createBlockInstance('li2', 'Paid Setup', [15]),
        ],
      }
      
      const priceData = buildConfirmationPriceData(wizard, null)
      
      expect(priceData.lineItems).toHaveLength(2)
      expect(priceData.lineItems?.[0].isFree).toBe(true)
      expect(priceData.lineItems?.[0].amount).toBe(0)
      expect(priceData.lineItems?.[1].isFree).toBe(false)
      expect(priceData.lineItems?.[1].amount).toBe(15)
    })
  })
})
