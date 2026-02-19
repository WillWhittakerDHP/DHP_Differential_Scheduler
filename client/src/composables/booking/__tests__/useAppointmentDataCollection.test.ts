
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'
import { useAppointmentDataCollection } from '../useAppointmentDataCollection'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { PropertyDetailsStepData, ContactsStepData, AvailabilityStepData } from '../useAppointmentDataCollection'

function createBookingBlockInstance(
  id: string,
  options: {
    name?: string
    number?: number | null
  } = {}
): BookingBlockInstance {
  const instance: BookingBlockInstance & { number?: number | null } = {
    id,
    entityKey: 'blockInstance',
    name: options.name || `Block ${id}`,
    baseSqFt: 1000,
    description: 'Test description',
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
  
  if (options.number !== undefined) {
    instance.number = options.number
  }
  
  return instance
}

describe('useAppointmentDataCollection', () => {
  let wizard: {
    selectedServiceTypeBlocks: ReturnType<typeof ref>
    selectedPropertyTypeBlocks: ReturnType<typeof ref>
    selectedOptionTypeBlocks: ReturnType<typeof ref>
    selectedLineItemBlocks: ReturnType<typeof ref>
    selectedUserTypeBlock: ReturnType<typeof ref>
    isQuoteMode: ReturnType<typeof ref>
  }
  let propertyDetailsStepData: ReturnType<typeof ref> | null
  let contactsStepData: ReturnType<typeof ref> | null
  let availabilityStepData: ReturnType<typeof ref> | null
  let createProperty: { mutateAsync: ReturnType<typeof vi.fn> }
  let createUser: { mutateAsync: ReturnType<typeof vi.fn> }
  let showError: ReturnType<typeof vi.fn>

  beforeEach(() => {
    wizard = {
      selectedServiceTypeBlocks: ref([]),
      selectedPropertyTypeBlocks: ref([]),
      selectedOptionTypeBlocks: ref([]),
      selectedLineItemBlocks: ref([]),
      selectedUserTypeBlock: ref(null),
      isQuoteMode: ref(false),
    }
    propertyDetailsStepData = ref(null)
    contactsStepData = ref(null)
    availabilityStepData = ref(null)
    createProperty = {
      mutateAsync: vi.fn().mockResolvedValue({ propertyVersionId: 'property-version-1', id: 'property-1' }),
    }
    createUser = {
      mutateAsync: vi.fn().mockImplementation((data) => {
        return Promise.resolve({ id: `user-${data.firstName.toLowerCase()}` })
      }),
    }
    showError = vi.fn()
  })

  describe('collectAppointmentData', () => {
    it('should return null and show error when no services selected', async () => {
      const { collectAppointmentData } = useAppointmentDataCollection({
        wizard,
        propertyDetailsStepData,
        contactsStepData,
        availabilityStepData,
        createProperty,
        createUser,
        showError,
      })
      
      const result = await collectAppointmentData()
      
      expect(result).toBeNull()
      expect(showError).toHaveBeenCalledWith('Please select at least one service type')
    })

    it('should return null and show error when property details missing', async () => {
      wizard.selectedServiceTypeBlocks.value = [createBookingBlockInstance('service-1')]
      
      const { collectAppointmentData } = useAppointmentDataCollection({
        wizard,
        propertyDetailsStepData,
        contactsStepData,
        availabilityStepData,
        createProperty,
        createUser,
        showError,
      })
      
      const result = await collectAppointmentData()
      
      expect(result).toBeNull()
      expect(showError).toHaveBeenCalledWith('Property details are required')
    })

    it('should return null and show error when contacts missing', async () => {
      wizard.selectedServiceTypeBlocks.value = [createBookingBlockInstance('service-1')]
      propertyDetailsStepData = ref({
        address: '123 Main St',
        unit: '',
        city: 'City',
        state: 'State',
        zipCode: '12345',
        propertySize: null,
        numberOfUnits: null,
        mlsNumber: '',
        squareFootage: null,
        bedrooms: null,
        bathrooms: null,
        foundationAccess: null,
        additionalUnits: null,
      })
      
      const { collectAppointmentData } = useAppointmentDataCollection({
        wizard,
        propertyDetailsStepData,
        contactsStepData,
        availabilityStepData,
        createProperty,
        createUser,
        showError,
      })
      
      const result = await collectAppointmentData()
      
      expect(result).toBeNull()
      expect(showError).toHaveBeenCalledWith('Contact information is required')
    })

    it('should return null and show error when availability missing', async () => {
      wizard.selectedServiceTypeBlocks.value = [createBookingBlockInstance('service-1')]
      propertyDetailsStepData = ref({
        address: '123 Main St',
        unit: '',
        city: 'City',
        state: 'State',
        zipCode: '12345',
        propertySize: null,
        numberOfUnits: null,
        mlsNumber: '',
        squareFootage: null,
        bedrooms: null,
        bathrooms: null,
        foundationAccess: null,
        additionalUnits: null,
      })
      contactsStepData = ref({
        clientInfo: { firstName: 'Client', lastName: 'Name', email: 'client@test.com' },
        agentInfo: { firstName: 'Agent', lastName: 'Name', email: 'agent@test.com' },
        anotherClientInfo: { firstName: '', lastName: '', email: '' },
        transactionManagerInfo: { firstName: '', lastName: '', email: '' },
        sellerInfo: { firstName: '', lastName: '', email: '' },
        showAnotherClient: false,
        showTransactionManager: false,
        showSeller: false,
      })
      
      const { collectAppointmentData } = useAppointmentDataCollection({
        wizard,
        propertyDetailsStepData,
        contactsStepData,
        availabilityStepData,
        createProperty,
        createUser,
        showError,
      })
      
      const result = await collectAppointmentData()
      
      expect(result).toBeNull()
      expect(showError).toHaveBeenCalledWith('Availability selection is required')
    })

    it('should collect appointment data successfully', async () => {
      wizard.selectedServiceTypeBlocks.value = [createBookingBlockInstance('service-1')]
      wizard.selectedUserTypeBlock.value = { id: 'user-type-1' }
      wizard.isQuoteMode.value = false
      
      propertyDetailsStepData = ref({
        address: '123 Main St',
        unit: 'Apt 1',
        city: 'City',
        state: 'State',
        zipCode: '12345',
        propertySize: 2000,
        numberOfUnits: 2,
        mlsNumber: 'MLS123',
        squareFootage: 1500,
        bedrooms: 3,
        bathrooms: 2,
        foundationAccess: 'basement' as const,
        additionalUnits: 1,
      })
      
      contactsStepData = ref({
        clientInfo: { firstName: 'Client', lastName: 'Name', email: 'client@test.com' },
        agentInfo: { firstName: 'Agent', lastName: 'Name', email: 'agent@test.com' },
        anotherClientInfo: { firstName: '', lastName: '', email: '' },
        transactionManagerInfo: { firstName: '', lastName: '', email: '' },
        sellerInfo: { firstName: '', lastName: '', email: '' },
        showAnotherClient: false,
        showTransactionManager: false,
        showSeller: false,
      })
      
      availabilityStepData = ref({
        selectedDate: { start: '2024-01-15', end: null },
        selectedTimeSlots: [{ time: '2024-01-15T09:00:00', duration: 60 }],
      })
      
      const { collectAppointmentData } = useAppointmentDataCollection({
        wizard,
        propertyDetailsStepData,
        contactsStepData,
        availabilityStepData,
        createProperty,
        createUser,
        showError,
      })
      
      const result = await collectAppointmentData()
      
      expect(result).not.toBeNull()
      expect(result?.propertyVersionId).toBe('property-version-1')
      expect(result?.userTypeBlockId).toBe('user-type-1')
      expect(result?.selectedServiceIds).toEqual(['service-1'])
      expect(result?.selectedDate).toBe('2024-01-15')
      expect(result?.isQuoteMode).toBe(false)
      expect(result?.status).toBe('started')
      expect(result?.clientId).toBe('user-client')
      expect(result?.agentId).toBe('user-agent')
      expect(createProperty.mutateAsync).toHaveBeenCalled()
      expect(createUser.mutateAsync).toHaveBeenCalledTimes(2) // Client and agent
    })

    it('should create property with correct data', async () => {
      wizard.selectedServiceTypeBlocks.value = [createBookingBlockInstance('service-1')]
      propertyDetailsStepData = ref({
        address: '123 Main St',
        unit: 'Apt 1',
        city: 'City',
        state: 'State',
        zipCode: '12345',
        propertySize: 2000,
        numberOfUnits: 2,
        mlsNumber: 'MLS123',
        squareFootage: 1500,
        bedrooms: 3,
        bathrooms: 2,
        foundationAccess: 'basement' as const,
        additionalUnits: 1,
      })
      contactsStepData = ref({
        clientInfo: { firstName: 'Client', lastName: 'Name', email: 'client@test.com' },
        agentInfo: { firstName: 'Agent', lastName: 'Name', email: 'agent@test.com' },
        anotherClientInfo: { firstName: '', lastName: '', email: '' },
        transactionManagerInfo: { firstName: '', lastName: '', email: '' },
        sellerInfo: { firstName: '', lastName: '', email: '' },
        showAnotherClient: false,
        showTransactionManager: false,
        showSeller: false,
      })
      availabilityStepData = ref({
        selectedDate: { start: '2024-01-15', end: null },
        selectedTimeSlots: null,
      })
      
      const { collectAppointmentData } = useAppointmentDataCollection({
        wizard,
        propertyDetailsStepData,
        contactsStepData,
        availabilityStepData,
        createProperty,
        createUser,
        showError,
      })
      
      await collectAppointmentData()
      
      expect(createProperty.mutateAsync).toHaveBeenCalledWith({
        address: '123 Main St',
        unit: 'Apt 1',
        city: 'City',
        state: 'State',
        zipCode: '12345',
        mlsNumber: 'MLS123',
        squareFootage: 1500,
        bedrooms: 3,
        bathrooms: 2,
        foundationAccess: 'basement',
        additionalUnits: 1,
      })
    })

    it('should create additional contacts when sections are visible', async () => {
      wizard.selectedServiceTypeBlocks.value = [createBookingBlockInstance('service-1')]
      propertyDetailsStepData = ref({
        address: '123 Main St',
        unit: '',
        city: 'City',
        state: 'State',
        zipCode: '12345',
        propertySize: null,
        numberOfUnits: null,
        mlsNumber: '',
        squareFootage: null,
        bedrooms: null,
        bathrooms: null,
        foundationAccess: null,
        additionalUnits: null,
      })
      contactsStepData = ref({
        clientInfo: { firstName: 'Client', lastName: 'Name', email: 'client@test.com' },
        agentInfo: { firstName: 'Agent', lastName: 'Name', email: 'agent@test.com' },
        anotherClientInfo: { firstName: 'Another', lastName: 'Client', email: 'another@test.com' },
        transactionManagerInfo: { firstName: 'Transaction', lastName: 'Manager', email: 'tm@test.com' },
        sellerInfo: { firstName: 'Seller', lastName: 'Name', email: 'seller@test.com' },
        showAnotherClient: true,
        showTransactionManager: true,
        showSeller: true,
      })
      availabilityStepData = ref({
        selectedDate: { start: '2024-01-15', end: null },
        selectedTimeSlots: null,
      })
      
      const { collectAppointmentData } = useAppointmentDataCollection({
        wizard,
        propertyDetailsStepData,
        contactsStepData,
        availabilityStepData,
        createProperty,
        createUser,
        showError,
      })
      
      await collectAppointmentData()
      
      expect(createUser.mutateAsync).toHaveBeenCalledTimes(5)
    })

    it('should extract quantity multipliers from selected items', async () => {
      const service1 = createBookingBlockInstance('service-1', { number: 2 })
      const service2 = createBookingBlockInstance('service-2', { number: null })
      const property1 = createBookingBlockInstance('property-1', { number: 3 })
      const option1 = createBookingBlockInstance('option-1', { number: 1 })
      
      wizard.selectedServiceTypeBlocks.value = [service1, service2]
      wizard.selectedPropertyTypeBlocks.value = [property1]
      wizard.selectedOptionTypeBlocks.value = [option1]
      
      propertyDetailsStepData = ref({
        address: '123 Main St',
        unit: '',
        city: 'City',
        state: 'State',
        zipCode: '12345',
        propertySize: null,
        numberOfUnits: null,
        mlsNumber: '',
        squareFootage: null,
        bedrooms: null,
        bathrooms: null,
        foundationAccess: null,
        additionalUnits: null,
      })
      contactsStepData = ref({
        clientInfo: { firstName: 'Client', lastName: 'Name', email: 'client@test.com' },
        agentInfo: { firstName: 'Agent', lastName: 'Name', email: 'agent@test.com' },
        anotherClientInfo: { firstName: '', lastName: '', email: '' },
        transactionManagerInfo: { firstName: '', lastName: '', email: '' },
        sellerInfo: { firstName: '', lastName: '', email: '' },
        showAnotherClient: false,
        showTransactionManager: false,
        showSeller: false,
      })
      availabilityStepData = ref({
        selectedDate: { start: '2024-01-15', end: null },
        selectedTimeSlots: null,
      })
      
      const { collectAppointmentData } = useAppointmentDataCollection({
        wizard,
        propertyDetailsStepData,
        contactsStepData,
        availabilityStepData,
        createProperty,
        createUser,
        showError,
      })
      
      const result = await collectAppointmentData()
      
      expect(result?.serviceQuantities).toEqual({ 'service-1': 2 })
      expect(result?.propertyQuantities).toEqual({ 'property-1': 3 })
      expect(result?.optionQuantities).toEqual({ 'option-1': 1 })
    })

    it('should create snapshots of selected block instances', async () => {
      const service1 = createBookingBlockInstance('service-1')
      const property1 = createBookingBlockInstance('property-1')
      const option1 = createBookingBlockInstance('option-1')
      
      wizard.selectedServiceTypeBlocks.value = [service1]
      wizard.selectedPropertyTypeBlocks.value = [property1]
      wizard.selectedOptionTypeBlocks.value = [option1]
      
      propertyDetailsStepData = ref({
        address: '123 Main St',
        unit: '',
        city: 'City',
        state: 'State',
        zipCode: '12345',
        propertySize: null,
        numberOfUnits: null,
        mlsNumber: '',
        squareFootage: null,
        bedrooms: null,
        bathrooms: null,
        foundationAccess: null,
        additionalUnits: null,
      })
      contactsStepData = ref({
        clientInfo: { firstName: 'Client', lastName: 'Name', email: 'client@test.com' },
        agentInfo: { firstName: 'Agent', lastName: 'Name', email: 'agent@test.com' },
        anotherClientInfo: { firstName: '', lastName: '', email: '' },
        transactionManagerInfo: { firstName: '', lastName: '', email: '' },
        sellerInfo: { firstName: '', lastName: '', email: '' },
        showAnotherClient: false,
        showTransactionManager: false,
        showSeller: false,
      })
      availabilityStepData = ref({
        selectedDate: { start: '2024-01-15', end: null },
        selectedTimeSlots: null,
      })
      
      const { collectAppointmentData } = useAppointmentDataCollection({
        wizard,
        propertyDetailsStepData,
        contactsStepData,
        availabilityStepData,
        createProperty,
        createUser,
        showError,
      })
      
      const result = await collectAppointmentData()
      
      expect(result?.serviceSnapshots).not.toBeNull()
      expect(result?.serviceSnapshots?.['service-1']).toBeDefined()
      expect(result?.serviceSnapshots?.['service-1'].id).toBe('service-1')
      
      expect(result?.propertySnapshots).not.toBeNull()
      expect(result?.propertySnapshots?.['property-1']).toBeDefined()
      
      expect(result?.optionSnapshots).not.toBeNull()
      expect(result?.optionSnapshots?.['option-1']).toBeDefined()
    })

    it('should set status to quoted when in quote mode', async () => {
      wizard.selectedServiceTypeBlocks.value = [createBookingBlockInstance('service-1')]
      wizard.isQuoteMode.value = true
      
      propertyDetailsStepData = ref({
        address: '123 Main St',
        unit: '',
        city: 'City',
        state: 'State',
        zipCode: '12345',
        propertySize: null,
        numberOfUnits: null,
        mlsNumber: '',
        squareFootage: null,
        bedrooms: null,
        bathrooms: null,
        foundationAccess: null,
        additionalUnits: null,
      })
      contactsStepData = ref({
        clientInfo: { firstName: 'Client', lastName: 'Name', email: 'client@test.com' },
        agentInfo: { firstName: 'Agent', lastName: 'Name', email: 'agent@test.com' },
        anotherClientInfo: { firstName: '', lastName: '', email: '' },
        transactionManagerInfo: { firstName: '', lastName: '', email: '' },
        sellerInfo: { firstName: '', lastName: '', email: '' },
        showAnotherClient: false,
        showTransactionManager: false,
        showSeller: false,
      })
      availabilityStepData = ref({
        selectedDate: { start: '2024-01-15', end: null },
        selectedTimeSlots: null,
      })
      
      const { collectAppointmentData } = useAppointmentDataCollection({
        wizard,
        propertyDetailsStepData,
        contactsStepData,
        availabilityStepData,
        createProperty,
        createUser,
        showError,
      })
      
      const result = await collectAppointmentData()
      
      expect(result?.isQuoteMode).toBe(true)
      expect(result?.status).toBe('quoted')
    })

    it('should handle errors during property creation', async () => {
      wizard.selectedServiceTypeBlocks.value = [createBookingBlockInstance('service-1')]
      propertyDetailsStepData = ref({
        address: '123 Main St',
        unit: '',
        city: 'City',
        state: 'State',
        zipCode: '12345',
        propertySize: null,
        numberOfUnits: null,
        mlsNumber: '',
        squareFootage: null,
        bedrooms: null,
        bathrooms: null,
        foundationAccess: null,
        additionalUnits: null,
      })
      contactsStepData = ref({
        clientInfo: { firstName: 'Client', lastName: 'Name', email: 'client@test.com' },
        agentInfo: { firstName: 'Agent', lastName: 'Name', email: 'agent@test.com' },
        anotherClientInfo: { firstName: '', lastName: '', email: '' },
        transactionManagerInfo: { firstName: '', lastName: '', email: '' },
        sellerInfo: { firstName: '', lastName: '', email: '' },
        showAnotherClient: false,
        showTransactionManager: false,
        showSeller: false,
      })
      availabilityStepData = ref({
        selectedDate: { start: '2024-01-15', end: null },
        selectedTimeSlots: null,
      })
      
      createProperty.mutateAsync.mockRejectedValueOnce(new Error('Property creation failed'))
      
      const { collectAppointmentData } = useAppointmentDataCollection({
        wizard,
        propertyDetailsStepData,
        contactsStepData,
        availabilityStepData,
        createProperty,
        createUser,
        showError,
      })
      
      const result = await collectAppointmentData()
      
      expect(result).toBeNull()
      expect(showError).toHaveBeenCalledWith('Property creation failed')
    })

    it('should use propertyVersionId when available, fallback to id', async () => {
      wizard.selectedServiceTypeBlocks.value = [createBookingBlockInstance('service-1')]
      propertyDetailsStepData = ref({
        address: '123 Main St',
        unit: '',
        city: 'City',
        state: 'State',
        zipCode: '12345',
        propertySize: null,
        numberOfUnits: null,
        mlsNumber: '',
        squareFootage: null,
        bedrooms: null,
        bathrooms: null,
        foundationAccess: null,
        additionalUnits: null,
      })
      contactsStepData = ref({
        clientInfo: { firstName: 'Client', lastName: 'Name', email: 'client@test.com' },
        agentInfo: { firstName: 'Agent', lastName: 'Name', email: 'agent@test.com' },
        anotherClientInfo: { firstName: '', lastName: '', email: '' },
        transactionManagerInfo: { firstName: '', lastName: '', email: '' },
        sellerInfo: { firstName: '', lastName: '', email: '' },
        showAnotherClient: false,
        showTransactionManager: false,
        showSeller: false,
      })
      availabilityStepData = ref({
        selectedDate: { start: '2024-01-15', end: null },
        selectedTimeSlots: null,
      })
      
      createProperty.mutateAsync.mockResolvedValueOnce({ propertyVersionId: 'version-1', id: 'property-1' })
      
      const { collectAppointmentData } = useAppointmentDataCollection({
        wizard,
        propertyDetailsStepData,
        contactsStepData,
        availabilityStepData,
        createProperty,
        createUser,
        showError,
      })
      
      const result1 = await collectAppointmentData()
      expect(result1?.propertyVersionId).toBe('version-1')
      
      createProperty.mutateAsync.mockResolvedValueOnce({ id: 'property-2' })
      
      const result2 = await collectAppointmentData()
      expect(result2?.propertyVersionId).toBe('property-2')
    })

    it('should include date range end when available', async () => {
      wizard.selectedServiceTypeBlocks.value = [createBookingBlockInstance('service-1')]
      propertyDetailsStepData = ref({
        address: '123 Main St',
        unit: '',
        city: 'City',
        state: 'State',
        zipCode: '12345',
        propertySize: null,
        numberOfUnits: null,
        mlsNumber: '',
        squareFootage: null,
        bedrooms: null,
        bathrooms: null,
        foundationAccess: null,
        additionalUnits: null,
      })
      contactsStepData = ref({
        clientInfo: { firstName: 'Client', lastName: 'Name', email: 'client@test.com' },
        agentInfo: { firstName: 'Agent', lastName: 'Name', email: 'agent@test.com' },
        anotherClientInfo: { firstName: '', lastName: '', email: '' },
        transactionManagerInfo: { firstName: '', lastName: '', email: '' },
        sellerInfo: { firstName: '', lastName: '', email: '' },
        showAnotherClient: false,
        showTransactionManager: false,
        showSeller: false,
      })
      availabilityStepData = ref({
        selectedDate: { start: '2024-01-15', end: '2024-01-20' },
        selectedTimeSlots: null,
      })
      
      const { collectAppointmentData } = useAppointmentDataCollection({
        wizard,
        propertyDetailsStepData,
        contactsStepData,
        availabilityStepData,
        createProperty,
        createUser,
        showError,
      })
      
      const result = await collectAppointmentData()
      
      expect(result?.selectedDate).toBe('2024-01-15')
      expect(result?.selectedDateRangeEnd).toBe('2024-01-20')
    })
  })
})
