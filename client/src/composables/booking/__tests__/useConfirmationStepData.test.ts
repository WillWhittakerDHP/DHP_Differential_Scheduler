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

// Helper to create a mock block instance
function createBlockInstance(
  id: string,
  name: string,
  baseFee: number,
  allowMultiple = false,
  number?: number
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
      }
    ],
    blockShapeRef: 'shape-1',
    disabled: false,
  } as BookingBlockInstance
}

describe('useConfirmationStepData', () => {
  describe('priceData reactivity with ADU changes', () => {
    it('should update priceData when additionalUnits changes', async () => {
      // Create a service with allowMultiple: true
      const service = createBlockInstance('service-1', 'Test Service', 100, true)
      
      const wizard = {
        selectedServices: ref<BookingBlockInstance[]>([service]),
        selectedPropertyTypeBlocks: ref<BookingBlockInstance[]>([]),
        selectedOptionTypeBlocks: ref<BookingBlockInstance[]>([]),
        selectedUserTypeBlock: ref<BookingBlockInstance | null>(null),
      }
      
      // Initial property details with ADU = 1
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
      
      // Initial price should be baseFee * 1 = 100
      expect(priceData.value.totalFee).toBe(100)
      
      // Change ADU to 2
      propertyDetailsStepData.value.additionalUnits = 2
      await nextTick()
      
      // Price should update to baseFee * 2 = 200
      expect(priceData.value.totalFee).toBe(200)
      
      // Change ADU to 3
      propertyDetailsStepData.value.additionalUnits = 3
      await nextTick()
      
      // Price should update to baseFee * 3 = 300
      expect(priceData.value.totalFee).toBe(300)
    })
    
    it('should handle null additionalUnits', async () => {
      const service = createBlockInstance('service-1', 'Test Service', 100, true)
      
      const wizard = {
        selectedServices: ref<BookingBlockInstance[]>([service]),
        selectedPropertyTypeBlocks: ref<BookingBlockInstance[]>([]),
        selectedOptionTypeBlocks: ref<BookingBlockInstance[]>([]),
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
      
      // When additionalUnits is null, multiplier should default to 1
      expect(priceData.value.totalFee).toBe(100)
    })
    
    it('should update when propertyDetailsStepData ref changes', async () => {
      const service = createBlockInstance('service-1', 'Test Service', 100, true)
      
      const wizard = {
        selectedServices: ref<BookingBlockInstance[]>([service]),
        selectedPropertyTypeBlocks: ref<BookingBlockInstance[]>([]),
        selectedOptionTypeBlocks: ref<BookingBlockInstance[]>([]),
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
      
      // Replace entire ref
      propertyDetailsStepData.value = {
        ...propertyDetailsStepData.value,
        additionalUnits: 5,
      }
      await nextTick()
      
      // Price should update to baseFee * 5 = 500
      expect(priceData.value.totalFee).toBe(500)
    })
    
    it('should handle undefined propertyDetailsStepData', () => {
      const service = createBlockInstance('service-1', 'Test Service', 100, true)
      
      const wizard = {
        selectedServices: ref<BookingBlockInstance[]>([service]),
        selectedPropertyTypeBlocks: ref<BookingBlockInstance[]>([]),
        selectedOptionTypeBlocks: ref<BookingBlockInstance[]>([]),
        selectedUserTypeBlock: ref<BookingBlockInstance | null>(null),
      }
      
      const { priceData } = useConfirmationStepData({
        wizard,
        propertyDetailsStepData: null,
      })
      
      // Should default to multiplier of 1 when propertyDetailsStepData is null
      expect(priceData.value.totalFee).toBe(100)
    })
    
    it('should apply ADU multiplier to services with allowMultiple: true', async () => {
      const service1 = createBlockInstance('service-1', 'Service 1', 50, true)
      const service2 = createBlockInstance('service-2', 'Service 2', 75, false) // allowMultiple: false
      
      const wizard = {
        selectedServices: ref<BookingBlockInstance[]>([service1, service2]),
        selectedPropertyTypeBlocks: ref<BookingBlockInstance[]>([]),
        selectedOptionTypeBlocks: ref<BookingBlockInstance[]>([]),
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
      
      // Service 1: 50 * 2 = 100 (multiplied by ADU)
      // Service 2: 75 * 1 = 75 (not multiplied, allowMultiple: false)
      // Total: 175
      expect(priceData.value.totalFee).toBe(175)
    })
    
    it('should apply ADU multiplier to property type blocks with allowMultiple: true', async () => {
      const propertyTypeBlock = createBlockInstance('property-1', 'Property Adjustment', 50, true)
      
      const wizard = {
        selectedServices: ref<BookingBlockInstance[]>([]),
        selectedPropertyTypeBlocks: ref<BookingBlockInstance[]>([propertyTypeBlock]),
        selectedOptionTypeBlocks: ref<BookingBlockInstance[]>([]),
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
      
      // Property adjustment: 50 * 3 = 150
      expect(priceData.value.totalFee).toBe(150)
    })
    
    it('should track dependencies correctly when wizard selections change', async () => {
      const service = createBlockInstance('service-1', 'Test Service', 100, true)
      
      const wizard = {
        selectedServices: ref<BookingBlockInstance[]>([service]),
        selectedPropertyTypeBlocks: ref<BookingBlockInstance[]>([]),
        selectedOptionTypeBlocks: ref<BookingBlockInstance[]>([]),
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
      
      // Initial: 100 * 2 = 200
      expect(priceData.value.totalFee).toBe(200)
      
      // Change service selection
      const newService = createBlockInstance('service-2', 'New Service', 150, true)
      wizard.selectedServices.value = [newService]
      await nextTick()
      
      // Should update: 150 * 2 = 300
      expect(priceData.value.totalFee).toBe(300)
    })
  })
  
  describe('summaryData', () => {
    it('should aggregate summary data correctly', () => {
      const service = createBlockInstance('service-1', 'Test Service', 100, false)
      
      const wizard = {
        selectedServices: ref<BookingBlockInstance[]>([service]),
        selectedPropertyTypeBlocks: ref<BookingBlockInstance[]>([]),
        selectedOptionTypeBlocks: ref<BookingBlockInstance[]>([]),
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

