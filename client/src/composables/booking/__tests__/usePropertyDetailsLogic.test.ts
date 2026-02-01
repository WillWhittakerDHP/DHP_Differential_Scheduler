/**
 * USEPROPERTYDETAILSLOGIC TESTS
 * 
 * Unit tests for usePropertyDetailsLogic composable.
 * Tests property details step business logic.
 * 
 * What it covers:
 * - requiresUnitNumber: Check if selected property types require unit number
 * - isMultiFamily: Check if selected property types are multi-family
 * - stepData: Computed property form data
 * 
 * How it works:
 * - Tests computed properties based on selected property blocks
 * - Tests step data aggregation from form refs
 * 
 * What it validates:
 * - requiresUnitNumber returns true when property block has requiresUnitNumber
 * - isMultiFamily returns true when property name contains 'multi'
 * - stepData correctly aggregates form field values
 * 
 * NOTE: propertyTypeBlocksWithComponents is not tested because it requires
 * useGlobal() and useComponentEntity() which need Vue provide/inject context.
 * 
 * Dependencies:
 * - vitest for testing
 * - vue ref for reactive state
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref, nextTick } from 'vue'
import { usePropertyDetailsLogic } from '../usePropertyDetailsLogic'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'

vi.mock('@/composables/useGlobal', () => ({
  useGlobal: () => ({
    getGlobalEntityById: vi.fn(() => null),
    getGlobalData: vi.fn(() => null),
  }),
}))

vi.mock('@/composables/useComponentEntity', () => ({
  useComponentEntity: () => ({
    getComponents: vi.fn(() => []),
  }),
}))

function createPropertyBlock(
  id: string,
  options: {
    name?: string
    requiresUnitNumber?: boolean | null
  } = {}
): BookingBlockInstance {
  return {
    id,
    entityKey: 'blockInstance',
    name: options.name || `Property ${id}`,
    description: 'Test property',
    icon: 'home',
    baseSqFt: 0,
    active: true,
    bookingMode: 'standalone',
    differential: false,
    orderIndex: 0,
    blockShape: 'Property Type',
    blockShapeRef: 'shape-1',
    activeBlockIds: [],
    partInstances: [],
    allowMultiple: false,
    requiresUnitNumber: options.requiresUnitNumber ?? null,
  }
}

function createFormData() {
  return {
    address: ref(''),
    unit: ref(''),
    city: ref(''),
    state: ref(''),
    zipCode: ref(''),
    propertySize: ref<number | null>(null),
    numberOfUnits: ref<number | null>(null),
    mlsNumber: ref(''),
    squareFootage: ref<number | null>(null),
    bedrooms: ref<number | null>(null),
    bathrooms: ref<number | null>(null),
    foundationAccess: ref<'basement' | 'crawlspace' | 'slab' | null>(null),
    additionalUnits: ref<number | null>(null),
  }
}

describe('usePropertyDetailsLogic', () => {
  let mockWizard: {
    selectedPropertyTypeBlocks: ReturnType<typeof ref<BookingBlockInstance[]>>
    availablePropertyTypeBlocks: ReturnType<typeof ref<BookingBlockInstance[]>>
    selectedUserTypeBlock: ReturnType<typeof ref<{ id: string } | null>>
  }

  beforeEach(() => {
    mockWizard = {
      selectedPropertyTypeBlocks: ref<BookingBlockInstance[]>([]),
      availablePropertyTypeBlocks: ref<BookingBlockInstance[]>([]),
      selectedUserTypeBlock: ref<{ id: string } | null>(null),
    }
  })

  describe('requiresUnitNumber', () => {
    it('should return false when no property blocks selected', () => {
      const formData = createFormData()
      
      const { requiresUnitNumber } = usePropertyDetailsLogic({
        wizard: mockWizard,
        loadedWizardState: null,
        formData,
      })
      
      expect(requiresUnitNumber.value).toBe(false)
    })

    it('should return true when selected block has requiresUnitNumber true', () => {
      mockWizard.selectedPropertyTypeBlocks.value = [
        createPropertyBlock('p1', { requiresUnitNumber: true }),
      ]
      const formData = createFormData()
      
      const { requiresUnitNumber } = usePropertyDetailsLogic({
        wizard: mockWizard,
        loadedWizardState: null,
        formData,
      })
      
      expect(requiresUnitNumber.value).toBe(true)
    })

    it('should return false when selected block has requiresUnitNumber false', () => {
      mockWizard.selectedPropertyTypeBlocks.value = [
        createPropertyBlock('p1', { requiresUnitNumber: false }),
      ]
      const formData = createFormData()
      
      const { requiresUnitNumber } = usePropertyDetailsLogic({
        wizard: mockWizard,
        loadedWizardState: null,
        formData,
      })
      
      expect(requiresUnitNumber.value).toBe(false)
    })

    it('should return true if any block requires unit number', () => {
      mockWizard.selectedPropertyTypeBlocks.value = [
        createPropertyBlock('p1', { requiresUnitNumber: false }),
        createPropertyBlock('p2', { requiresUnitNumber: true }),
      ]
      const formData = createFormData()
      
      const { requiresUnitNumber } = usePropertyDetailsLogic({
        wizard: mockWizard,
        loadedWizardState: null,
        formData,
      })
      
      expect(requiresUnitNumber.value).toBe(true)
    })

    it('should be reactive to selection changes', async () => {
      const formData = createFormData()
      
      const { requiresUnitNumber } = usePropertyDetailsLogic({
        wizard: mockWizard,
        loadedWizardState: null,
        formData,
      })
      
      expect(requiresUnitNumber.value).toBe(false)
      
      mockWizard.selectedPropertyTypeBlocks.value = [
        createPropertyBlock('p1', { requiresUnitNumber: true }),
      ]
      await nextTick()
      
      expect(requiresUnitNumber.value).toBe(true)
    })
  })

  describe('isMultiFamily', () => {
    it('should return false when no property blocks selected', () => {
      const formData = createFormData()
      
      const { isMultiFamily } = usePropertyDetailsLogic({
        wizard: mockWizard,
        loadedWizardState: null,
        formData,
      })
      
      expect(isMultiFamily.value).toBe(false)
    })

    it('should return true when property name contains multi', () => {
      mockWizard.selectedPropertyTypeBlocks.value = [
        createPropertyBlock('p1', { name: 'Multi-Family' }),
      ]
      const formData = createFormData()
      
      const { isMultiFamily } = usePropertyDetailsLogic({
        wizard: mockWizard,
        loadedWizardState: null,
        formData,
      })
      
      expect(isMultiFamily.value).toBe(true)
    })

    it('should be case insensitive', () => {
      mockWizard.selectedPropertyTypeBlocks.value = [
        createPropertyBlock('p1', { name: 'MULTI-UNIT' }),
      ]
      const formData = createFormData()
      
      const { isMultiFamily } = usePropertyDetailsLogic({
        wizard: mockWizard,
        loadedWizardState: null,
        formData,
      })
      
      expect(isMultiFamily.value).toBe(true)
    })

    it('should return false for single family', () => {
      mockWizard.selectedPropertyTypeBlocks.value = [
        createPropertyBlock('p1', { name: 'Single Family' }),
      ]
      const formData = createFormData()
      
      const { isMultiFamily } = usePropertyDetailsLogic({
        wizard: mockWizard,
        loadedWizardState: null,
        formData,
      })
      
      expect(isMultiFamily.value).toBe(false)
    })
  })

  describe('stepData', () => {
    it('should aggregate all form field values', () => {
      const formData = createFormData()
      formData.address.value = '123 Main St'
      formData.unit.value = '4B'
      formData.city.value = 'Chicago'
      formData.state.value = 'IL'
      formData.zipCode.value = '60601'
      formData.squareFootage.value = 2500
      formData.bedrooms.value = 3
      formData.bathrooms.value = 2
      
      const { stepData } = usePropertyDetailsLogic({
        wizard: mockWizard,
        loadedWizardState: null,
        formData,
      })
      
      expect(stepData.value.address).toBe('123 Main St')
      expect(stepData.value.unit).toBe('4B')
      expect(stepData.value.city).toBe('Chicago')
      expect(stepData.value.state).toBe('IL')
      expect(stepData.value.zipCode).toBe('60601')
      expect(stepData.value.squareFootage).toBe(2500)
      expect(stepData.value.bedrooms).toBe(3)
      expect(stepData.value.bathrooms).toBe(2)
    })

    it('should be reactive to form changes', async () => {
      const formData = createFormData()
      
      const { stepData } = usePropertyDetailsLogic({
        wizard: mockWizard,
        loadedWizardState: null,
        formData,
      })
      
      expect(stepData.value.address).toBe('')
      
      formData.address.value = 'New Address'
      await nextTick()
      
      expect(stepData.value.address).toBe('New Address')
    })

    it('should include all form fields', () => {
      const formData = createFormData()
      
      const { stepData } = usePropertyDetailsLogic({
        wizard: mockWizard,
        loadedWizardState: null,
        formData,
      })
      
      expect(stepData.value).toHaveProperty('address')
      expect(stepData.value).toHaveProperty('unit')
      expect(stepData.value).toHaveProperty('city')
      expect(stepData.value).toHaveProperty('state')
      expect(stepData.value).toHaveProperty('zipCode')
      expect(stepData.value).toHaveProperty('propertySize')
      expect(stepData.value).toHaveProperty('numberOfUnits')
      expect(stepData.value).toHaveProperty('mlsNumber')
      expect(stepData.value).toHaveProperty('squareFootage')
      expect(stepData.value).toHaveProperty('bedrooms')
      expect(stepData.value).toHaveProperty('bathrooms')
      expect(stepData.value).toHaveProperty('foundationAccess')
      expect(stepData.value).toHaveProperty('additionalUnits')
    })
  })

  describe('syncMLSData', () => {
    it('should be a function', () => {
      const formData = createFormData()
      
      const { syncMLSData } = usePropertyDetailsLogic({
        wizard: mockWizard,
        loadedWizardState: null,
        formData,
      })
      
      expect(typeof syncMLSData).toBe('function')
    })

    it('should not throw when called', () => {
      const formData = createFormData()
      
      const { syncMLSData } = usePropertyDetailsLogic({
        wizard: mockWizard,
        loadedWizardState: null,
        formData,
      })
      
      expect(() => syncMLSData()).not.toThrow()
    })
  })
})
