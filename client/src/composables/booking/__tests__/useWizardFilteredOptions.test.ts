
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'
import { useWizardFilteredOptions } from '../useWizardFilteredOptions'
import type { BookingData, BookingBlockInstance, BookingBlockShape } from '@/utils/transformers/globalToBookingTransformer'
import { BLOCK_SHAPE_TYPES } from '@/constants/blockShapeTypes'

function createBookingBlockInstance(
  id: string,
  options: {
    name?: string
    blockShapeRef?: string
    activeBlockIds?: string[]
    active?: boolean
  } = {}
): BookingBlockInstance {
  return {
    id,
    entityKey: 'blockInstance',
    name: options.name || `Block ${id}`,
    baseSqFt: 1000,
    description: 'Test description',
    icon: 'icon-test',
    active: options.active !== undefined ? options.active : true,
    bookingMode: 'standalone',
    differential: false,
    orderIndex: 0,
    blockShape: 'Test Shape',
    blockShapeRef: options.blockShapeRef || 'shape-1',
    activeBlockIds: options.activeBlockIds || [],
    partInstances: [],
    allowMultiple: false,
    requiresUnitNumber: null,
  }
}

function createBookingBlockShape(
  id: string,
  options: {
    name?: string
    type?: string
  } = {}
): BookingBlockShape {
  return {
    id,
    name: options.name || `Shape ${id}`,
    type: options.type || 'service',
  }
}

function createBookingData(options: {
  blockInstances?: BookingBlockInstance[]
  blockShapes?: BookingBlockShape[]
} = {}): BookingData {
  return {
    blockInstances: options.blockInstances || [],
    blockShapes: options.blockShapes || [],
  }
}

describe('useWizardFilteredOptions', () => {
  let bookingData: ReturnType<typeof ref>
  let selectedUserType: ReturnType<typeof ref>
  let selectedServices: ReturnType<typeof ref>
  let selectedAvailabilityOptions: ReturnType<typeof ref>
  let selectedPropertyTypeBlocks: ReturnType<typeof ref>

  beforeEach(() => {
    bookingData = ref(null)
    selectedUserType = ref(null)
    selectedServices = ref([])
    selectedAvailabilityOptions = ref([])
    selectedPropertyTypeBlocks = ref([])
  })

  describe('availableUserTypeBlocks', () => {
    it('should return empty array when bookingData is null', () => {
      const { availableUserTypeBlocks } = useWizardFilteredOptions({
        bookingData,
        selectedUserType,
        selectedServices,
        selectedAvailabilityOptions,
        selectedPropertyTypeBlocks,
      })
      
      expect(availableUserTypeBlocks.value).toEqual([])
    })

    it('should return state control block instances', () => {
      const userTypeShape = createBookingBlockShape('user-shape-1', {
        type: BLOCK_SHAPE_TYPES.USER,
      })
      const userTypeBlock1 = createBookingBlockInstance('user-type-1', {
        blockShapeRef: 'user-shape-1',
      })
      const userTypeBlock2 = createBookingBlockInstance('user-type-2', {
        blockShapeRef: 'user-shape-1',
      })
      
      bookingData.value = createBookingData({
        blockInstances: [userTypeBlock1, userTypeBlock2],
        blockShapes: [userTypeShape],
      })
      
      const { availableUserTypeBlocks } = useWizardFilteredOptions({
        bookingData,
        selectedUserType,
        selectedServices,
        selectedAvailabilityOptions,
        selectedPropertyTypeBlocks,
      })
      
      expect(availableUserTypeBlocks.value).toHaveLength(2)
      expect(availableUserTypeBlocks.value.map(b => b.id)).toContain('user-type-1')
      expect(availableUserTypeBlocks.value.map(b => b.id)).toContain('user-type-2')
    })

    it('should filter out inactive instances', () => {
      const userTypeShape = createBookingBlockShape('user-shape-1', {
        type: BLOCK_SHAPE_TYPES.USER,
      })
      const activeBlock = createBookingBlockInstance('user-type-1', {
        blockShapeRef: 'user-shape-1',
        active: true,
      })
      const inactiveBlock = createBookingBlockInstance('user-type-2', {
        blockShapeRef: 'user-shape-1',
        active: false,
      })
      
      bookingData.value = createBookingData({
        blockInstances: [activeBlock, inactiveBlock],
        blockShapes: [userTypeShape],
      })
      
      const { availableUserTypeBlocks } = useWizardFilteredOptions({
        bookingData,
        selectedUserType,
        selectedServices,
        selectedAvailabilityOptions,
        selectedPropertyTypeBlocks,
      })
      
      expect(availableUserTypeBlocks.value).toHaveLength(1)
      expect(availableUserTypeBlocks.value[0].id).toBe('user-type-1')
    })
  })

  describe('availableServices', () => {
    it('should return empty array when bookingData is null', () => {
      const { availableServices } = useWizardFilteredOptions({
        bookingData,
        selectedUserType,
        selectedServices,
        selectedAvailabilityOptions,
        selectedPropertyTypeBlocks,
      })
      
      expect(availableServices.value).toEqual([])
    })

    it('should filter services by cascade from selected user type', () => {
      const userType = createBookingBlockInstance('user-type-1', {
        activeBlockIds: ['service-1', 'service-2'],
      })
      const service1 = createBookingBlockInstance('service-1')
      const service2 = createBookingBlockInstance('service-2')
      const service3 = createBookingBlockInstance('service-3')
      
      bookingData.value = createBookingData({
        blockInstances: [service1, service2, service3],
        blockShapes: [],
      })
      selectedUserType.value = userType
      
      const { availableServices } = useWizardFilteredOptions({
        bookingData,
        selectedUserType,
        selectedServices,
        selectedAvailabilityOptions,
        selectedPropertyTypeBlocks,
      })
      
      expect(availableServices.value).toHaveLength(2)
      expect(availableServices.value.map(b => b.id)).toContain('service-1')
      expect(availableServices.value.map(b => b.id)).toContain('service-2')
      expect(availableServices.value.map(b => b.id)).not.toContain('service-3')
    })

    it('should preserve currently selected services when filtering', () => {
      const userType = createBookingBlockInstance('user-type-1', {
        activeBlockIds: ['service-1'],
      })
      const service1 = createBookingBlockInstance('service-1')
      const service2 = createBookingBlockInstance('service-2')
      
      bookingData.value = createBookingData({
        blockInstances: [service1, service2],
        blockShapes: [],
      })
      selectedUserType.value = userType
      selectedServices.value = [service2] // Currently selected but not in cascade
      
      const { availableServices } = useWizardFilteredOptions({
        bookingData,
        selectedUserType,
        selectedServices,
        selectedAvailabilityOptions,
        selectedPropertyTypeBlocks,
      })
      
      expect(availableServices.value).toHaveLength(2)
      expect(availableServices.value.map(b => b.id)).toContain('service-1')
      expect(availableServices.value.map(b => b.id)).toContain('service-2')
    })
  })

  describe('servicesCascadeError', () => {
    it('should return null when cascade filtering succeeds', () => {
      const userType = createBookingBlockInstance('user-type-1', {
        activeBlockIds: ['service-1'],
      })
      const service1 = createBookingBlockInstance('service-1')
      
      bookingData.value = createBookingData({
        blockInstances: [service1],
        blockShapes: [],
      })
      selectedUserType.value = userType
      
      const { servicesCascadeError } = useWizardFilteredOptions({
        bookingData,
        selectedUserType,
        selectedServices,
        selectedAvailabilityOptions,
        selectedPropertyTypeBlocks,
      })
      
      expect(servicesCascadeError.value).toBeNull()
    })

    it('should return error when bookingData is null', () => {
      const { servicesCascadeError } = useWizardFilteredOptions({
        bookingData,
        selectedUserType,
        selectedServices,
        selectedAvailabilityOptions,
        selectedPropertyTypeBlocks,
      })
      
      expect(servicesCascadeError.value).toBe('Booking data not loaded')
    })

    it('should return error when no user type selected', () => {
      bookingData.value = createBookingData({
        blockInstances: [],
        blockShapes: [],
      })
      
      const { servicesCascadeError } = useWizardFilteredOptions({
        bookingData,
        selectedUserType,
        selectedServices,
        selectedAvailabilityOptions,
        selectedPropertyTypeBlocks,
      })
      
      expect(servicesCascadeError.value).toBe('Please select a parent option to view available services')
    })

    it('should return error when user type has no cascades', () => {
      const userType = createBookingBlockInstance('user-type-1', {
        activeBlockIds: [],
      })
      
      bookingData.value = createBookingData({
        blockInstances: [],
        blockShapes: [],
      })
      selectedUserType.value = userType
      
      const { servicesCascadeError } = useWizardFilteredOptions({
        bookingData,
        selectedUserType,
        selectedServices,
        selectedAvailabilityOptions,
        selectedPropertyTypeBlocks,
      })
      
      expect(servicesCascadeError.value).toContain('no services cascades configured')
    })
  })

  describe('availableOptionTypeBlocks (availableAvailabilityOptions)', () => {
    it('should filter availability options by cascade from selected services', () => {
      const optionShape = createBookingBlockShape('option-shape-1', {
        type: BLOCK_SHAPE_TYPES.OPTION,
      })
      const service1 = createBookingBlockInstance('service-1', {
        activeBlockIds: ['option-1', 'option-2'],
      })
      const option1 = createBookingBlockInstance('option-1', {
        blockShapeRef: 'option-shape-1',
      })
      const option2 = createBookingBlockInstance('option-2', {
        blockShapeRef: 'option-shape-1',
      })
      const option3 = createBookingBlockInstance('option-3', {
        blockShapeRef: 'option-shape-1',
      })
      
      bookingData.value = createBookingData({
        blockInstances: [service1, option1, option2, option3],
        blockShapes: [optionShape],
      })
      selectedServices.value = [service1]
      
      const { availableOptionTypeBlocks } = useWizardFilteredOptions({
        bookingData,
        selectedUserType,
        selectedServices,
        selectedAvailabilityOptions,
        selectedPropertyTypeBlocks,
      })
      
      expect(availableOptionTypeBlocks.value).toHaveLength(2)
      expect(availableOptionTypeBlocks.value.map(b => b.id)).toContain('option-1')
      expect(availableOptionTypeBlocks.value.map(b => b.id)).toContain('option-2')
      expect(availableOptionTypeBlocks.value.map(b => b.id)).not.toContain('option-3')
    })

    it('should filter by block shape type (only Option blocks)', () => {
      const optionShape = createBookingBlockShape('option-shape-1', {
        type: BLOCK_SHAPE_TYPES.OPTION,
      })
      const propertyShape = createBookingBlockShape('property-shape-1', {
        type: BLOCK_SHAPE_TYPES.PROPERTY,
      })
      const service1 = createBookingBlockInstance('service-1', {
        activeBlockIds: ['option-1', 'property-1'], // Cascade includes both types
      })
      const option1 = createBookingBlockInstance('option-1', {
        blockShapeRef: 'option-shape-1',
      })
      const property1 = createBookingBlockInstance('property-1', {
        blockShapeRef: 'property-shape-1',
      })
      
      bookingData.value = createBookingData({
        blockInstances: [service1, option1, property1],
        blockShapes: [optionShape, propertyShape],
      })
      selectedServices.value = [service1]
      
      const { availableOptionTypeBlocks } = useWizardFilteredOptions({
        bookingData,
        selectedUserType,
        selectedServices,
        selectedAvailabilityOptions,
        selectedPropertyTypeBlocks,
      })
      
      expect(availableOptionTypeBlocks.value).toHaveLength(1)
      expect(availableOptionTypeBlocks.value[0].id).toBe('option-1')
      expect(availableOptionTypeBlocks.value.map(b => b.id)).not.toContain('property-1')
    })

    it('should fallback to all Option blocks when no cascades configured', () => {
      const optionShape = createBookingBlockShape('option-shape-1', {
        type: BLOCK_SHAPE_TYPES.OPTION,
      })
      const service1 = createBookingBlockInstance('service-1', {
        activeBlockIds: [], // No cascades
      })
      const option1 = createBookingBlockInstance('option-1', {
        blockShapeRef: 'option-shape-1',
        active: true,
      })
      const option2 = createBookingBlockInstance('option-2', {
        blockShapeRef: 'option-shape-1',
        active: true,
      })
      
      bookingData.value = createBookingData({
        blockInstances: [service1, option1, option2],
        blockShapes: [optionShape],
      })
      selectedServices.value = [service1]
      
      const { availableOptionTypeBlocks } = useWizardFilteredOptions({
        bookingData,
        selectedUserType,
        selectedServices,
        selectedAvailabilityOptions,
        selectedPropertyTypeBlocks,
      })
      
      expect(availableOptionTypeBlocks.value).toHaveLength(2)
      expect(availableOptionTypeBlocks.value.map(b => b.id)).toContain('option-1')
      expect(availableOptionTypeBlocks.value.map(b => b.id)).toContain('option-2')
    })
  })

  describe('availablePropertyTypeBlocks', () => {
    it('should filter property type blocks by cascade from selected services', () => {
      const propertyShape = createBookingBlockShape('property-shape-1', {
        type: BLOCK_SHAPE_TYPES.PROPERTY,
      })
      const service1 = createBookingBlockInstance('service-1', {
        activeBlockIds: ['property-1', 'property-2'],
      })
      const property1 = createBookingBlockInstance('property-1', {
        blockShapeRef: 'property-shape-1',
      })
      const property2 = createBookingBlockInstance('property-2', {
        blockShapeRef: 'property-shape-1',
      })
      const property3 = createBookingBlockInstance('property-3', {
        blockShapeRef: 'property-shape-1',
      })
      
      bookingData.value = createBookingData({
        blockInstances: [service1, property1, property2, property3],
        blockShapes: [propertyShape],
      })
      selectedServices.value = [service1]
      
      const { availablePropertyTypeBlocks } = useWizardFilteredOptions({
        bookingData,
        selectedUserType,
        selectedServices,
        selectedAvailabilityOptions,
        selectedPropertyTypeBlocks,
      })
      
      expect(availablePropertyTypeBlocks.value).toHaveLength(2)
      expect(availablePropertyTypeBlocks.value.map(b => b.id)).toContain('property-1')
      expect(availablePropertyTypeBlocks.value.map(b => b.id)).toContain('property-2')
      expect(availablePropertyTypeBlocks.value.map(b => b.id)).not.toContain('property-3')
    })

    it('should filter by block shape type (only Property blocks)', () => {
      const propertyShape = createBookingBlockShape('property-shape-1', {
        type: BLOCK_SHAPE_TYPES.PROPERTY,
      })
      const optionShape = createBookingBlockShape('option-shape-1', {
        type: BLOCK_SHAPE_TYPES.OPTION,
      })
      const service1 = createBookingBlockInstance('service-1', {
        activeBlockIds: ['property-1', 'option-1'], // Cascade includes both types
      })
      const property1 = createBookingBlockInstance('property-1', {
        blockShapeRef: 'property-shape-1',
      })
      const option1 = createBookingBlockInstance('option-1', {
        blockShapeRef: 'option-shape-1',
      })
      
      bookingData.value = createBookingData({
        blockInstances: [service1, property1, option1],
        blockShapes: [propertyShape, optionShape],
      })
      selectedServices.value = [service1]
      
      const { availablePropertyTypeBlocks } = useWizardFilteredOptions({
        bookingData,
        selectedUserType,
        selectedServices,
        selectedAvailabilityOptions,
        selectedPropertyTypeBlocks,
      })
      
      expect(availablePropertyTypeBlocks.value).toHaveLength(1)
      expect(availablePropertyTypeBlocks.value[0].id).toBe('property-1')
      expect(availablePropertyTypeBlocks.value.map(b => b.id)).not.toContain('option-1')
    })
  })

  describe('accumulation aliases', () => {
    it('should provide accServices alias', () => {
      const service1 = createBookingBlockInstance('service-1')
      selectedServices.value = [service1]
      
      const { accServices } = useWizardFilteredOptions({
        bookingData,
        selectedUserType,
        selectedServices,
        selectedAvailabilityOptions,
        selectedPropertyTypeBlocks,
      })
      
      expect(accServices.value).toEqual([service1])
    })

    it('should provide accProperty alias', () => {
      const property1 = createBookingBlockInstance('property-1')
      selectedPropertyTypeBlocks.value = [property1]
      
      const { accProperty } = useWizardFilteredOptions({
        bookingData,
        selectedUserType,
        selectedServices,
        selectedAvailabilityOptions,
        selectedPropertyTypeBlocks,
      })
      
      expect(accProperty.value).toEqual([property1])
    })

    it('should provide accAvailability alias', () => {
      const option1 = createBookingBlockInstance('option-1')
      selectedAvailabilityOptions.value = [option1]
      
      const { accAvailability } = useWizardFilteredOptions({
        bookingData,
        selectedUserType,
        selectedServices,
        selectedAvailabilityOptions,
        selectedPropertyTypeBlocks,
      })
      
      expect(accAvailability.value).toEqual([option1])
    })
  })

  describe('multiple parent cascades', () => {
    it('should handle multiple services with cascades', () => {
      const optionShape = createBookingBlockShape('option-shape-1', {
        type: BLOCK_SHAPE_TYPES.OPTION,
      })
      const service1 = createBookingBlockInstance('service-1', {
        activeBlockIds: ['option-1'],
      })
      const service2 = createBookingBlockInstance('service-2', {
        activeBlockIds: ['option-2'],
      })
      const option1 = createBookingBlockInstance('option-1', {
        blockShapeRef: 'option-shape-1', // Must match option shape ID
      })
      const option2 = createBookingBlockInstance('option-2', {
        blockShapeRef: 'option-shape-1', // Must match option shape ID
      })
      
      bookingData.value = createBookingData({
        blockInstances: [service1, service2, option1, option2],
        blockShapes: [optionShape],
      })
      selectedServices.value = [service1, service2]
      
      const { availableOptionTypeBlocks } = useWizardFilteredOptions({
        bookingData,
        selectedUserType,
        selectedServices,
        selectedAvailabilityOptions,
        selectedPropertyTypeBlocks,
      })
      
      expect(availableOptionTypeBlocks.value.map(b => b.id)).toContain('option-1')
      expect(availableOptionTypeBlocks.value.map(b => b.id)).toContain('option-2')
    })
  })
})
