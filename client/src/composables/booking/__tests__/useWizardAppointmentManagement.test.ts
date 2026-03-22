
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { useWizardAppointmentManagement } from '../useWizardAppointmentManagement'
import type { UseBookingWizardReturn } from '@/types/wizard'
import type { AppointmentResponse } from '@/types/appointment'
import type { AppointmentRequest } from '@/types/appointment'
import type { BookingData } from '@/utils/transformers/globalToBookingTransformer'

describe('useWizardAppointmentManagement', () => {
  let mockWizard: UseBookingWizardReturn
  let mockBookingData: ReturnType<typeof ref<BookingData | null>>
  let mockLoadAppointmentById: ReturnType<typeof vi.fn>
  let mockFetchRandom: ReturnType<typeof vi.fn>
  let mockCollectAppointmentData: ReturnType<typeof vi.fn>
  let mockUpdateAppointment: {
    mutateAsync: ReturnType<typeof vi.fn>
    isPending: ReturnType<typeof ref<boolean>>
  }
  let mockShowError: ReturnType<typeof vi.fn>
  let mockSuccess: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockWizard = {
      selectUserTypeBlock: vi.fn(),
      setWizardMode: vi.fn(),
      selectedServiceTypeBlocks: ref([]),
      selectedPropertyTypeBlocks: ref([]),
      selectedOptionTypeBlocks: ref([]),
      selectedLineItemBlocks: ref([]),
      selectedUserTypeBlock: ref(null),
      isQuoteMode: ref(false),
      wizardMode: ref('new'),
    } as unknown as UseBookingWizardReturn

    mockBookingData = ref<BookingData | null>({
      userTypeBlocks: [],
      services: [],
      propertyTypeBlocks: [],
      optionTypeBlocks: [],
    })

    mockLoadAppointmentById = vi.fn()
    mockFetchRandom = vi.fn()
    mockCollectAppointmentData = vi.fn()
    mockUpdateAppointment = {
      mutateAsync: vi.fn(),
      isPending: ref(false),
    }
    mockShowError = vi.fn()
    mockSuccess = vi.fn()
  })

  describe('handleLoadAppointment', () => {
    it('should load appointment by ID and populate wizard state', async () => {
      const mockAppointment: AppointmentResponse = {
        id: 'test-id',
        propertyDetails: { address: '123 Main St', city: 'Test City', state: 'CA', zipCode: '12345', propertySize: 1000 },
        contacts: { client: { firstName: 'John', lastName: 'Doe', email: 'john@test.com' }, agent: { firstName: 'Jane', lastName: 'Smith', email: 'jane@test.com' }, additionalContacts: [] },
        availability: { selectedTimeSlots: [] },
      } as AppointmentResponse

      mockLoadAppointmentById.mockResolvedValue(mockAppointment)

      const { handleLoadAppointment, loadedAppointmentId, selectedAppointmentId, isLoadingAppointment } =
        useWizardAppointmentManagement({
          wizard: mockWizard,
          bookingData: mockBookingData,
          loadAppointmentById: mockLoadAppointmentById,
          fetchRandom: mockFetchRandom,
          collectAppointmentData: mockCollectAppointmentData,
          updateAppointment: mockUpdateAppointment,
          activeStep: ref(0),
          completedSteps: ref(new Set()),
          propertyDetailsStepData: ref(null),
          contactsStepData: ref(null),
          availabilityStepData: ref(null),
          propertyDetailsStepValid: ref(false),
          propertyDetailsStepValidate: ref(null),
          propertyDetailsFieldErrors: ref({}),
          contactsStepValid: ref(false),
          contactsStepValidate: ref(null),
          availabilityStepValid: ref(false),
          availabilityStepValidate: ref(null),
          showError: mockShowError,
          success: mockSuccess,
        })

      await handleLoadAppointment('test-id')

      expect(mockLoadAppointmentById).toHaveBeenCalledWith('test-id')
      expect(loadedAppointmentId.value).toBe('test-id')
      expect(selectedAppointmentId.value).toBe('test-id')
      expect(isLoadingAppointment.value).toBe(false)
      expect(mockSuccess).toHaveBeenCalledWith('Appointment loaded successfully')
    })

    it('should handle loading random appointment', async () => {
      const mockAppointment: AppointmentResponse = {
        id: 'random-id',
        propertyDetails: { address: '123 Main St', city: 'Test City', state: 'CA', zipCode: '12345', propertySize: 1000 },
        contacts: { client: { firstName: 'John', lastName: 'Doe', email: 'john@test.com' }, agent: { firstName: 'Jane', lastName: 'Smith', email: 'jane@test.com' }, additionalContacts: [] },
        availability: { selectedTimeSlots: [] },
      } as AppointmentResponse

      mockFetchRandom.mockResolvedValue(mockAppointment)

      const { handleLoadAppointment, selectedAppointmentId } = useWizardAppointmentManagement({
        wizard: mockWizard,
        bookingData: mockBookingData,
        loadAppointmentById: mockLoadAppointmentById,
        fetchRandom: mockFetchRandom,
        collectAppointmentData: mockCollectAppointmentData,
        updateAppointment: mockUpdateAppointment,
        activeStep: ref(0),
        completedSteps: ref(new Set()),
        propertyDetailsStepData: ref(null),
        contactsStepData: ref(null),
        availabilityStepData: ref(null),
        propertyDetailsStepValid: ref(false),
        propertyDetailsStepValidate: ref(null),
        propertyDetailsFieldErrors: ref({}),
        contactsStepValid: ref(false),
        contactsStepValidate: ref(null),
        availabilityStepValid: ref(false),
        availabilityStepValidate: ref(null),
        showError: mockShowError,
        success: mockSuccess,
      })

      await handleLoadAppointment('random')

      expect(mockFetchRandom).toHaveBeenCalled()
      expect(selectedAppointmentId.value).toBe('random-id')
    })

    it('should handle errors when appointment not found', async () => {
      mockLoadAppointmentById.mockResolvedValue(null)

      const { handleLoadAppointment } = useWizardAppointmentManagement({
        wizard: mockWizard,
        bookingData: mockBookingData,
        loadAppointmentById: mockLoadAppointmentById,
        fetchRandom: mockFetchRandom,
        collectAppointmentData: mockCollectAppointmentData,
        updateAppointment: mockUpdateAppointment,
        activeStep: ref(0),
        completedSteps: ref(new Set()),
        propertyDetailsStepData: ref(null),
        contactsStepData: ref(null),
        availabilityStepData: ref(null),
        propertyDetailsStepValid: ref(false),
        propertyDetailsStepValidate: ref(null),
        propertyDetailsFieldErrors: ref({}),
        contactsStepValid: ref(false),
        contactsStepValidate: ref(null),
        availabilityStepValid: ref(false),
        availabilityStepValidate: ref(null),
        showError: mockShowError,
        success: mockSuccess,
      })

      await handleLoadAppointment('invalid-id')

      expect(mockShowError).toHaveBeenCalledWith('Appointment not found')
    })
  })

  describe('handleUpdateAppointment', () => {
    it('should update appointment with collected wizard data', async () => {
      const mockAppointmentData: AppointmentRequest = {
        propertyDetails: { address: '123 Main St', city: 'Test City', state: 'CA', zipCode: '12345', propertySize: 1000 },
        contacts: { client: { firstName: 'John', lastName: 'Doe', email: 'john@test.com' }, agent: { firstName: 'Jane', lastName: 'Smith', email: 'jane@test.com' }, additionalContacts: [] },
        availability: { selectedTimeSlots: [] },
      } as AppointmentRequest

      mockCollectAppointmentData.mockResolvedValue(mockAppointmentData)
      mockUpdateAppointment.mutateAsync.mockResolvedValue({})

      const { handleUpdateAppointment, loadedAppointmentId } = useWizardAppointmentManagement({
        wizard: mockWizard,
        bookingData: mockBookingData,
        loadAppointmentById: mockLoadAppointmentById,
        fetchRandom: mockFetchRandom,
        collectAppointmentData: mockCollectAppointmentData,
        updateAppointment: mockUpdateAppointment,
        activeStep: ref(0),
        completedSteps: ref(new Set()),
        propertyDetailsStepData: ref(null),
        contactsStepData: ref(null),
        availabilityStepData: ref(null),
        propertyDetailsStepValid: ref(false),
        propertyDetailsStepValidate: ref(null),
        propertyDetailsFieldErrors: ref({}),
        contactsStepValid: ref(false),
        contactsStepValidate: ref(null),
        availabilityStepValid: ref(false),
        availabilityStepValidate: ref(null),
        showError: mockShowError,
        success: mockSuccess,
      })

      loadedAppointmentId.value = 'test-id'
      await handleUpdateAppointment()

      expect(mockCollectAppointmentData).toHaveBeenCalled()
      expect(mockUpdateAppointment.mutateAsync).toHaveBeenCalledWith({
        id: 'test-id',
        data: mockAppointmentData,
      })
      expect(mockSuccess).toHaveBeenCalledWith('Appointment updated successfully')
    })

    it('should handle error when no appointment is loaded', async () => {
      const { handleUpdateAppointment } = useWizardAppointmentManagement({
        wizard: mockWizard,
        bookingData: mockBookingData,
        loadAppointmentById: mockLoadAppointmentById,
        fetchRandom: mockFetchRandom,
        collectAppointmentData: mockCollectAppointmentData,
        updateAppointment: mockUpdateAppointment,
        activeStep: ref(0),
        completedSteps: ref(new Set()),
        propertyDetailsStepData: ref(null),
        contactsStepData: ref(null),
        availabilityStepData: ref(null),
        propertyDetailsStepValid: ref(false),
        propertyDetailsStepValidate: ref(null),
        propertyDetailsFieldErrors: ref({}),
        contactsStepValid: ref(false),
        contactsStepValidate: ref(null),
        availabilityStepValid: ref(false),
        availabilityStepValidate: ref(null),
        showError: mockShowError,
        success: mockSuccess,
      })

      await handleUpdateAppointment()

      expect(mockShowError).toHaveBeenCalledWith('No appointment loaded')
    })
  })

  describe('handleResetWizard', () => {
    it('should reset all wizard state to initial values', () => {
      const { handleResetWizard, loadedWizardState, loadedAppointmentId, selectedAppointmentId } =
        useWizardAppointmentManagement({
          wizard: mockWizard,
          bookingData: mockBookingData,
          loadAppointmentById: mockLoadAppointmentById,
          fetchRandom: mockFetchRandom,
          collectAppointmentData: mockCollectAppointmentData,
          updateAppointment: mockUpdateAppointment,
          activeStep: ref(2),
          completedSteps: ref(new Set([1, 2])),
          propertyDetailsStepData: ref({ address: '123 Main St', city: 'Test City', state: 'CA', zipCode: '12345', propertySize: 1000 }),
          contactsStepData: ref({ clientInfo: { firstName: 'John', lastName: 'Doe', email: 'john@test.com' }, agentInfo: { firstName: 'Jane', lastName: 'Smith', email: 'jane@test.com' }, anotherClientInfo: { firstName: '', lastName: '', email: '' }, transactionManagerInfo: { firstName: '', lastName: '', email: '' }, sellerInfo: { firstName: '', lastName: '', email: '' }, showAnotherClient: false, showTransactionManager: false, showSeller: false }),
          availabilityStepData: ref({ selectedTimeSlots: [] }),
          propertyDetailsStepValid: ref(true),
          propertyDetailsStepValidate: ref(() => true),
          propertyDetailsFieldErrors: ref({}),
          contactsStepValid: ref(true),
          contactsStepValidate: ref(() => true),
          availabilityStepValid: ref(true),
          availabilityStepValidate: ref(() => true),
          showError: mockShowError,
          success: mockSuccess,
        })

      handleResetWizard()

      expect(loadedWizardState.value).toBeNull()
      expect(loadedAppointmentId.value).toBeNull()
      expect(selectedAppointmentId.value).toBeNull()
      expect(mockWizard.selectedServiceTypeBlocks.value).toEqual([])
      expect(mockWizard.selectedPropertyTypeBlocks.value).toEqual([])
      expect(mockWizard.selectedOptionTypeBlocks.value).toEqual([])
      expect(mockWizard.isQuoteMode.value).toBe(false)
      expect(mockWizard.setWizardMode).toHaveBeenCalledWith('new')
      expect(mockSuccess).toHaveBeenCalledWith('Wizard reset successfully')
    })
  })
})
