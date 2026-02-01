/**
 * USE CONFIRMATION STEP DATA TESTS
 * 
 * Unit tests for useConfirmationStepData composable.
 * Tests ADU (Additional Units) calculation reactivity and price data updates.
 * 
 * WHAT: Tests that price calculations update reactively when ADU count changes
 * HOW: Uses refs and computed properties to simulate wizard state and property details
 * VALIDATES: Computed property reactivity, ADU multiplier effect, dependency tracking
 * DEPENDENCIES: useConfirmationStepData, buildConfirmationPriceData, BookingBlockInstance types
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { ref, computed, nextTick } from 'vue'
import { useConfirmationStepData } from '../useConfirmationStepData'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'

function createBlockInstance(
  id: string,
  name: string,
  baseFee: number,
  allowMultiple = false,
  number?: number,
  rateOverBaseFee = 0
): BookingBlockInstance {
  return {
    id,
    name,
    allowMultiple,
    number,
    partInstances: [
      {
        id: `part-${id}`,
        name: `Part ${id}`,
        baseFee,
        rateOverBaseFee,
        baseTime: 0,
        rateOverBaseTime: 0,
        onSite: false,
        clientPresent: false,
        moveable: false,
        orderIndex: 0,
        active: true,
        zeroOutPart: false,
      }
    ],
    blockShapeRef: 'shape-1',
    disabled: false,
  } as BookingBlockInstance
}

describe('useConfirmationStepData', () => {
  describe('priceData reactivity with ADU changes', () => {
    it('should update priceData when additionalUnits changes', async () => {
      const service = createBlockInstance('service-1', 'Test Service', 100, true)
      
      const wizard = {
        selectedServices: ref<BookingBlockInstance[]>([service]),
        selectedPropertyTypeBlocks: ref<BookingBlockInstance[]>([]),
        selectedOptionTypeBlocks: ref<BookingBlockInstance[]>([]),
        selectedLineItemBlocks: ref<BookingBlockInstance[]>([]),
        selectedUserTypeBlock: ref<BookingBlockInstance | null>(null),
      }
      
      const propertyDetailsStepData = ref({
        address: '123 Main St',
        unit: '',
        city: 'City',
        state: 'ST',
        zipCode: '12345',
        propertySize: 1000,
        numberOfUnits: null,
        mlsNumber: '',
        squareFootage: 1000,
        bedrooms: 2,
        bathrooms: 1,
        foundationAccess: null as const,
        additionalUnits: 1,
      })
      
      const { priceData } = useConfirmationStepData({
        wizard,
        propertyDetailsStepData,
      })
      
      expect(priceData.value.totalFee).toBe(100)
      expect(priceData.value.baseFeeTotal).toBe(100)
      expect(priceData.value.overageFeeTotal).toBe(0) // No rateOverBaseFee
      
      propertyDetailsStepData.value.additionalUnits = 2
      await nextTick()
      
      expect(priceData.value.totalFee).toBe(200)
      expect(priceData.value.baseFeeTotal).toBe(200)
      expect(priceData.value.overageFeeTotal).toBe(0)
      
      propertyDetailsStepData.value.additionalUnits = 3
      await nextTick()
      
      expect(priceData.value.totalFee).toBe(300)
      expect(priceData.value.baseFeeTotal).toBe(300)
      expect(priceData.value.overageFeeTotal).toBe(0)
    })
    
    it('should handle null additionalUnits', async () => {
      const service = createBlockInstance('service-1', 'Test Service', 100, true)
      
      const wizard = {
        selectedServices: ref<BookingBlockInstance[]>([service]),
        selectedPropertyTypeBlocks: ref<BookingBlockInstance[]>([]),
        selectedOptionTypeBlocks: ref<BookingBlockInstance[]>([]),
        selectedLineItemBlocks: ref<BookingBlockInstance[]>([]),
        selectedUserTypeBlock: ref<BookingBlockInstance | null>(null),
      }
      
      const propertyDetailsStepData = ref({
        address: '123 Main St',
        unit: '',
        city: 'City',
        state: 'ST',
        zipCode: '12345',
        propertySize: 1000,
        numberOfUnits: null,
        mlsNumber: '',
        squareFootage: 1000,
        bedrooms: 2,
        bathrooms: 1,
        foundationAccess: null as const,
        additionalUnits: null,
      })
      
      const { priceData } = useConfirmationStepData({
        wizard,
        propertyDetailsStepData,
      })
      
      expect(priceData.value.totalFee).toBe(100)
    })
    
    it('should update when propertyDetailsStepData ref changes', async () => {
      const service = createBlockInstance('service-1', 'Test Service', 100, true)
      
      const wizard = {
        selectedServices: ref<BookingBlockInstance[]>([service]),
        selectedPropertyTypeBlocks: ref<BookingBlockInstance[]>([]),
        selectedOptionTypeBlocks: ref<BookingBlockInstance[]>([]),
        selectedLineItemBlocks: ref<BookingBlockInstance[]>([]),
        selectedUserTypeBlock: ref<BookingBlockInstance | null>(null),
      }
      
      const propertyDetailsStepData = ref({
        address: '123 Main St',
        unit: '',
        city: 'City',
        state: 'ST',
        zipCode: '12345',
        propertySize: 1000,
        numberOfUnits: null,
        mlsNumber: '',
        squareFootage: 1000,
        bedrooms: 2,
        bathrooms: 1,
        foundationAccess: null as const,
        additionalUnits: 1,
      })
      
      const { priceData } = useConfirmationStepData({
        wizard,
        propertyDetailsStepData,
      })
      
      propertyDetailsStepData.value = {
        ...propertyDetailsStepData.value,
        additionalUnits: 5,
      }
      await nextTick()
      
      expect(priceData.value.totalFee).toBe(500)
      expect(priceData.value.baseFeeTotal).toBe(500)
      expect(priceData.value.overageFeeTotal).toBe(0)
    })
    
    it('should handle undefined propertyDetailsStepData', () => {
      const service = createBlockInstance('service-1', 'Test Service', 100, true)
      
      const wizard = {
        selectedServices: ref<BookingBlockInstance[]>([service]),
        selectedPropertyTypeBlocks: ref<BookingBlockInstance[]>([]),
        selectedOptionTypeBlocks: ref<BookingBlockInstance[]>([]),
        selectedLineItemBlocks: ref<BookingBlockInstance[]>([]),
        selectedUserTypeBlock: ref<BookingBlockInstance | null>(null),
      }
      
      const { priceData } = useConfirmationStepData({
        wizard,
        propertyDetailsStepData: null,
      })
      
      expect(priceData.value.totalFee).toBe(100)
      expect(priceData.value.baseFeeTotal).toBe(100)
      expect(priceData.value.overageFeeTotal).toBe(0)
    })
    
    it('should apply ADU multiplier to services with allowMultiple: true', async () => {
      const service1 = createBlockInstance('service-1', 'Service 1', 50, true)
      const service2 = createBlockInstance('service-2', 'Service 2', 75, false) // allowMultiple: false
      
      const wizard = {
        selectedServices: ref<BookingBlockInstance[]>([service1, service2]),
        selectedPropertyTypeBlocks: ref<BookingBlockInstance[]>([]),
        selectedOptionTypeBlocks: ref<BookingBlockInstance[]>([]),
        selectedLineItemBlocks: ref<BookingBlockInstance[]>([]),
        selectedUserTypeBlock: ref<BookingBlockInstance | null>(null),
      }
      
      const propertyDetailsStepData = ref({
        address: '123 Main St',
        unit: '',
        city: 'City',
        state: 'ST',
        zipCode: '12345',
        propertySize: 1000,
        numberOfUnits: null,
        mlsNumber: '',
        squareFootage: 1000,
        bedrooms: 2,
        bathrooms: 1,
        foundationAccess: null as const,
        additionalUnits: 2,
      })
      
      const { priceData } = useConfirmationStepData({
        wizard,
        propertyDetailsStepData,
      })
      
      expect(priceData.value.totalFee).toBe(175)
    })
    
    it('should apply ADU multiplier to property type blocks with allowMultiple: true', async () => {
      const propertyTypeBlock = createBlockInstance('property-1', 'Property Adjustment', 50, true)
      
      const wizard = {
        selectedServices: ref<BookingBlockInstance[]>([]),
        selectedPropertyTypeBlocks: ref<BookingBlockInstance[]>([propertyTypeBlock]),
        selectedOptionTypeBlocks: ref<BookingBlockInstance[]>([]),
        selectedLineItemBlocks: ref<BookingBlockInstance[]>([]),
        selectedUserTypeBlock: ref<BookingBlockInstance | null>(null),
      }
      
      const propertyDetailsStepData = ref({
        address: '123 Main St',
        unit: '',
        city: 'City',
        state: 'ST',
        zipCode: '12345',
        propertySize: 1000,
        numberOfUnits: null,
        mlsNumber: '',
        squareFootage: 1000,
        bedrooms: 2,
        bathrooms: 1,
        foundationAccess: null as const,
        additionalUnits: 3,
      })
      
      const { priceData } = useConfirmationStepData({
        wizard,
        propertyDetailsStepData,
      })
      
      expect(priceData.value.totalFee).toBe(150)
      expect(priceData.value.baseFeeTotal).toBe(150)
      expect(priceData.value.overageFeeTotal).toBe(0)
    })
    
    it('should track dependencies correctly when wizard selections change', async () => {
      const service = createBlockInstance('service-1', 'Test Service', 100, true)
      
      const wizard = {
        selectedServices: ref<BookingBlockInstance[]>([service]),
        selectedPropertyTypeBlocks: ref<BookingBlockInstance[]>([]),
        selectedOptionTypeBlocks: ref<BookingBlockInstance[]>([]),
        selectedLineItemBlocks: ref<BookingBlockInstance[]>([]),
        selectedUserTypeBlock: ref<BookingBlockInstance | null>(null),
      }
      
      const propertyDetailsStepData = ref({
        address: '123 Main St',
        unit: '',
        city: 'City',
        state: 'ST',
        zipCode: '12345',
        propertySize: 1000,
        numberOfUnits: null,
        mlsNumber: '',
        squareFootage: 1000,
        bedrooms: 2,
        bathrooms: 1,
        foundationAccess: null as const,
        additionalUnits: 2,
      })
      
      const { priceData } = useConfirmationStepData({
        wizard,
        propertyDetailsStepData,
      })
      
      expect(priceData.value.totalFee).toBe(200)
      expect(priceData.value.baseFeeTotal).toBe(200)
      expect(priceData.value.overageFeeTotal).toBe(0)
      
      const newService = createBlockInstance('service-2', 'New Service', 150, true)
      wizard.selectedServices.value = [newService]
      await nextTick()
      
      expect(priceData.value.totalFee).toBe(300)
      expect(priceData.value.baseFeeTotal).toBe(300)
      expect(priceData.value.overageFeeTotal).toBe(0)
    })
    
    it('should calculate overage fees when square footage is provided', async () => {
      const service = createBlockInstance('service-1', 'Test Service', 100, false, undefined, 0.5)
      
      const wizard = {
        selectedServices: ref<BookingBlockInstance[]>([service]),
        selectedPropertyTypeBlocks: ref<BookingBlockInstance[]>([]),
        selectedOptionTypeBlocks: ref<BookingBlockInstance[]>([]),
        selectedLineItemBlocks: ref<BookingBlockInstance[]>([]),
        selectedUserTypeBlock: ref<BookingBlockInstance | null>(null),
      }
      
      const propertyDetailsStepData = ref({
        address: '123 Main St',
        unit: '',
        city: 'City',
        state: 'ST',
        zipCode: '12345',
        propertySize: 2000,
        numberOfUnits: null,
        mlsNumber: '',
        squareFootage: 2000,
        bedrooms: 2,
        bathrooms: 1,
        foundationAccess: null as const,
        additionalUnits: null,
      })
      
      const { priceData } = useConfirmationStepData({
        wizard,
        propertyDetailsStepData,
      })
      
      expect(priceData.value.baseFeeTotal).toBe(100)
      expect(priceData.value.overageFeeTotal).toBe(1000)
      expect(priceData.value.totalFee).toBe(1100) // 100 + 1000
    })
    
    it('should use propertySize as fallback when squareFootage is null', async () => {
      const service = createBlockInstance('service-1', 'Test Service', 100, false, undefined, 0.5)
      
      const wizard = {
        selectedServices: ref<BookingBlockInstance[]>([service]),
        selectedPropertyTypeBlocks: ref<BookingBlockInstance[]>([]),
        selectedOptionTypeBlocks: ref<BookingBlockInstance[]>([]),
        selectedLineItemBlocks: ref<BookingBlockInstance[]>([]),
        selectedUserTypeBlock: ref<BookingBlockInstance | null>(null),
      }
      
      const propertyDetailsStepData = ref({
        address: '123 Main St',
        unit: '',
        city: 'City',
        state: 'ST',
        zipCode: '12345',
        propertySize: 2000,
        numberOfUnits: null,
        mlsNumber: '',
        squareFootage: null, // null, should use propertySize
        bedrooms: 2,
        bathrooms: 1,
        foundationAccess: null as const,
        additionalUnits: null,
      })
      
      const { priceData } = useConfirmationStepData({
        wizard,
        propertyDetailsStepData,
      })
      
      expect(priceData.value.baseFeeTotal).toBe(100)
      expect(priceData.value.overageFeeTotal).toBe(1000)
      expect(priceData.value.totalFee).toBe(1100)
    })
    
    it('should return 0 overage fee when both squareFootage and propertySize are null', async () => {
      const service = createBlockInstance('service-1', 'Test Service', 100, false, undefined, 0.5)
      
      const wizard = {
        selectedServices: ref<BookingBlockInstance[]>([service]),
        selectedPropertyTypeBlocks: ref<BookingBlockInstance[]>([]),
        selectedOptionTypeBlocks: ref<BookingBlockInstance[]>([]),
        selectedLineItemBlocks: ref<BookingBlockInstance[]>([]),
        selectedUserTypeBlock: ref<BookingBlockInstance | null>(null),
      }
      
      const propertyDetailsStepData = ref({
        address: '123 Main St',
        unit: '',
        city: 'City',
        state: 'ST',
        zipCode: '12345',
        propertySize: null,
        numberOfUnits: null,
        mlsNumber: '',
        squareFootage: null,
        bedrooms: 2,
        bathrooms: 1,
        foundationAccess: null as const,
        additionalUnits: null,
      })
      
      const { priceData } = useConfirmationStepData({
        wizard,
        propertyDetailsStepData,
      })
      
      expect(priceData.value.baseFeeTotal).toBe(100)
      expect(priceData.value.overageFeeTotal).toBe(0)
      expect(priceData.value.totalFee).toBe(100)
    })
    
    it('should update overage fees reactively when square footage changes', async () => {
      const service = createBlockInstance('service-1', 'Test Service', 100, false, undefined, 0.5)
      
      const wizard = {
        selectedServices: ref<BookingBlockInstance[]>([service]),
        selectedPropertyTypeBlocks: ref<BookingBlockInstance[]>([]),
        selectedOptionTypeBlocks: ref<BookingBlockInstance[]>([]),
        selectedLineItemBlocks: ref<BookingBlockInstance[]>([]),
        selectedUserTypeBlock: ref<BookingBlockInstance | null>(null),
      }
      
      const propertyDetailsStepData = ref({
        address: '123 Main St',
        unit: '',
        city: 'City',
        state: 'ST',
        zipCode: '12345',
        propertySize: 1000,
        numberOfUnits: null,
        mlsNumber: '',
        squareFootage: 1000,
        bedrooms: 2,
        bathrooms: 1,
        foundationAccess: null as const,
        additionalUnits: null,
      })
      
      const { priceData } = useConfirmationStepData({
        wizard,
        propertyDetailsStepData,
      })
      
      expect(priceData.value.baseFeeTotal).toBe(100)
      expect(priceData.value.overageFeeTotal).toBe(500)
      expect(priceData.value.totalFee).toBe(600)
      
      propertyDetailsStepData.value.squareFootage = 2000
      await nextTick()
      
      expect(priceData.value.baseFeeTotal).toBe(100)
      expect(priceData.value.overageFeeTotal).toBe(1000)
      expect(priceData.value.totalFee).toBe(1100)
    })
    
    it('should apply ADU multiplier to both base and overage fees', async () => {
      const service = createBlockInstance('service-1', 'Test Service', 100, true, undefined, 0.5)
      
      const wizard = {
        selectedServices: ref<BookingBlockInstance[]>([service]),
        selectedPropertyTypeBlocks: ref<BookingBlockInstance[]>([]),
        selectedOptionTypeBlocks: ref<BookingBlockInstance[]>([]),
        selectedLineItemBlocks: ref<BookingBlockInstance[]>([]),
        selectedUserTypeBlock: ref<BookingBlockInstance | null>(null),
      }
      
      const propertyDetailsStepData = ref({
        address: '123 Main St',
        unit: '',
        city: 'City',
        state: 'ST',
        zipCode: '12345',
        propertySize: 2000,
        numberOfUnits: null,
        mlsNumber: '',
        squareFootage: 2000,
        bedrooms: 2,
        bathrooms: 1,
        foundationAccess: null as const,
        additionalUnits: 3,
      })
      
      const { priceData } = useConfirmationStepData({
        wizard,
        propertyDetailsStepData,
      })
      
      expect(priceData.value.baseFeeTotal).toBe(300)
      expect(priceData.value.overageFeeTotal).toBe(3000)
      expect(priceData.value.totalFee).toBe(3300) // 300 + 3000
    })
    
    it('should calculate line item fees reactively', async () => {
      const service = createBlockInstance('service-1', 'Test Service', 100)
      const lineItem1 = createBlockInstance('li1', 'Delivery', 25)
      const lineItem2 = createBlockInstance('li2', 'Setup', 15)
      
      const wizard = {
        selectedServices: ref<BookingBlockInstance[]>([service]),
        selectedPropertyTypeBlocks: ref<BookingBlockInstance[]>([]),
        selectedOptionTypeBlocks: ref<BookingBlockInstance[]>([]),
        selectedLineItemBlocks: ref<BookingBlockInstance[]>([lineItem1]),
        selectedUserTypeBlock: ref<BookingBlockInstance | null>(null),
      }
      
      const propertyDetailsStepData = ref({
        address: '123 Main St',
        unit: '',
        city: 'City',
        state: 'ST',
        zipCode: '12345',
        propertySize: 1000,
        numberOfUnits: null,
        mlsNumber: '',
        squareFootage: null,
        bedrooms: 2,
        bathrooms: 1,
        foundationAccess: null as const,
        additionalUnits: null,
      })
      
      const { priceData } = useConfirmationStepData({
        wizard,
        propertyDetailsStepData,
      })
      
      expect(priceData.value.totalFee).toBe(125)
      expect(priceData.value.lineItemFees?.totalFee).toBe(25)
      expect(priceData.value.lineItems).toHaveLength(1)
      
      wizard.selectedLineItemBlocks.value = [lineItem1, lineItem2]
      await nextTick()
      
      expect(priceData.value.totalFee).toBe(140)
      expect(priceData.value.lineItemFees?.totalFee).toBe(40)
      expect(priceData.value.lineItems).toHaveLength(2)
    })
    
    it('should apply ADU multiplier to line items with allowMultiple', async () => {
      const lineItem = createBlockInstance('li1', 'Delivery', 25, true) // allowMultiple: true
      
      const wizard = {
        selectedServices: ref<BookingBlockInstance[]>([]),
        selectedPropertyTypeBlocks: ref<BookingBlockInstance[]>([]),
        selectedOptionTypeBlocks: ref<BookingBlockInstance[]>([]),
        selectedLineItemBlocks: ref<BookingBlockInstance[]>([lineItem]),
        selectedUserTypeBlock: ref<BookingBlockInstance | null>(null),
      }
      
      const propertyDetailsStepData = ref({
        address: '123 Main St',
        unit: '',
        city: 'City',
        state: 'ST',
        zipCode: '12345',
        propertySize: 1000,
        numberOfUnits: null,
        mlsNumber: '',
        squareFootage: null,
        bedrooms: 2,
        bathrooms: 1,
        foundationAccess: null as const,
        additionalUnits: 3,
      })
      
      const { priceData } = useConfirmationStepData({
        wizard,
        propertyDetailsStepData,
      })
      
      expect(priceData.value.totalFee).toBe(75)
      expect(priceData.value.lineItemFees?.totalFee).toBe(75)
    })
  })
  
  describe('summaryData', () => {
    it('should aggregate summary data correctly', () => {
      const service = createBlockInstance('service-1', 'Test Service', 100, false)
      
      const wizard = {
        selectedServices: ref<BookingBlockInstance[]>([service]),
        selectedPropertyTypeBlocks: ref<BookingBlockInstance[]>([]),
        selectedOptionTypeBlocks: ref<BookingBlockInstance[]>([]),
        selectedLineItemBlocks: ref<BookingBlockInstance[]>([]),
        selectedUserTypeBlock: ref<BookingBlockInstance | null>(null),
      }
      
      const propertyDetailsStepData = ref({
        address: '123 Main St',
        unit: 'Apt 4',
        city: 'City',
        state: 'ST',
        zipCode: '12345',
        propertySize: 1000,
        numberOfUnits: null,
        mlsNumber: '',
        squareFootage: 1000,
        bedrooms: 2,
        bathrooms: 1,
        foundationAccess: null as const,
        additionalUnits: null,
      })
      
      const { summaryData } = useConfirmationStepData({
        wizard,
        propertyDetailsStepData,
      })
      
      expect(summaryData.value.serviceType).toBe('Test Service')
      expect(summaryData.value.address).toContain('123 Main St')
      expect(summaryData.value.address).toContain('Apt 4')
    })
  })
})

