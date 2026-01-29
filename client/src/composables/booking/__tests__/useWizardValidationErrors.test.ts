/**
 * USEWIZARDVALIDATIONERRORS TESTS
 * 
 * Unit tests for useWizardValidationErrors composable.
 * Tests wizard step validation error handling logic.
 * 
 * What it covers:
 * - handleNext: Enhanced handleNext with step-specific error messages
 * - Step 1 (Property Details): Field validation and error messages
 * - Step 2 (Availability): Validation error handling
 * - Step 3 (Contacts): Validation error handling
 * - Other steps: Generic error messages
 * 
 * How it works:
 * - Tests validation error handling for each step
 * - Tests field error message generation
 * - Tests missing field detection
 * 
 * Dependencies:
 * - vitest for testing
 * - vue ref/computed for reactive state
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref, nextTick } from 'vue'
import { useWizardValidationErrors } from '../useWizardValidationErrors'
import type { PropertyDetailsStepData } from '@/types/wizard'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'

describe('useWizardValidationErrors', () => {
  let showError: ReturnType<typeof vi.fn>
  let baseHandleNext: ReturnType<typeof vi.fn>
  let validateStep: ReturnType<typeof vi.fn>
  let activeStep: ReturnType<typeof ref<number>>
  let propertyDetailsStepData: ReturnType<typeof ref<PropertyDetailsStepData | null>>
  let propertyDetailsStepValidate: ReturnType<typeof ref<(() => boolean) | null>>
  let propertyDetailsFieldErrors: ReturnType<typeof ref<Record<string, string>>>
  let contactsStepValidate: ReturnType<typeof ref<(() => boolean) | null>>
  let availabilityStepValidate: ReturnType<typeof ref<(() => boolean) | null>>
  let selectedPropertyTypeBlocks: ReturnType<typeof ref<BookingBlockInstance[]>>

  beforeEach(() => {
    showError = vi.fn()
    baseHandleNext = vi.fn()
    validateStep = vi.fn(() => true)
    activeStep = ref(0)
    propertyDetailsStepData = ref(null)
    propertyDetailsStepValidate = ref(null)
    propertyDetailsFieldErrors = ref({})
    contactsStepValidate = ref(null)
    availabilityStepValidate = ref(null)
    selectedPropertyTypeBlocks = ref([])
  })

  describe('handleNext', () => {
    it('should call baseHandleNext when validation passes', async () => {
      validateStep.mockReturnValue(true)
      
      const { handleNext } = useWizardValidationErrors({
        activeStep,
        validateStep,
        baseHandleNext,
        showError,
        propertyDetailsStepData,
        propertyDetailsStepValidate,
        propertyDetailsFieldErrors,
        contactsStepValidate,
        availabilityStepValidate,
        selectedPropertyTypeBlocks
      })

      await handleNext()

      expect(baseHandleNext).toHaveBeenCalled()
      expect(showError).not.toHaveBeenCalled()
    })

    it('should show error when validation fails', async () => {
      validateStep.mockReturnValue(false)
      activeStep.value = 0

      const { handleNext } = useWizardValidationErrors({
        activeStep,
        validateStep,
        baseHandleNext,
        showError,
        propertyDetailsStepData,
        propertyDetailsStepValidate,
        propertyDetailsFieldErrors,
        contactsStepValidate,
        availabilityStepValidate,
        selectedPropertyTypeBlocks
      })

      await handleNext()

      expect(baseHandleNext).not.toHaveBeenCalled()
      expect(showError).toHaveBeenCalledWith('Please complete all required fields before continuing')
    })

    describe('Step 1 (Property Details)', () => {
      beforeEach(() => {
        activeStep.value = 1
        validateStep.mockReturnValue(false)
      })

      it('should show field errors when available', async () => {
        propertyDetailsFieldErrors.value = {
          address: 'Address is required',
          city: 'City is required'
        }

        const { handleNext } = useWizardValidationErrors({
          activeStep,
          validateStep,
          baseHandleNext,
          showError,
          propertyDetailsStepData,
          propertyDetailsStepValidate,
          propertyDetailsFieldErrors,
          contactsStepValidate,
          availabilityStepValidate,
          selectedPropertyTypeBlocks
        })

        await handleNext()

        expect(showError).toHaveBeenCalledWith('Please fix the following: address: Address is required, city: City is required')
      })

      it('should show property type error when no blocks selected and field errors empty', async () => {
        // When fieldErrors is empty object, it goes to else branch
        // Since propertyDetailsStepData is null, it adds all fields to missingFields
        propertyDetailsFieldErrors.value = {}
        selectedPropertyTypeBlocks.value = []
        propertyDetailsStepData.value = null

        const { handleNext } = useWizardValidationErrors({
          activeStep,
          validateStep,
          baseHandleNext,
          showError,
          propertyDetailsStepData,
          propertyDetailsStepValidate,
          propertyDetailsFieldErrors,
          contactsStepValidate,
          availabilityStepValidate,
          selectedPropertyTypeBlocks
        })

        await handleNext()

        // Should include property type in missing fields
        expect(showError).toHaveBeenCalledWith(expect.stringContaining('property type'))
      })

      it('should show property type error when no blocks selected and all fields present', async () => {
        // When fieldErrors has entries but length is 0 after filtering, it checks property type
        // Actually, looking at the code, if fieldErrors has entries, it shows those
        // If fieldErrors is empty object, it goes to else branch
        // To test the property type check in the if branch, we need fieldErrors with entries but empty after map
        propertyDetailsFieldErrors.value = {}
        selectedPropertyTypeBlocks.value = []
        propertyDetailsStepData.value = {
          address: '123 Main St',
          city: 'City',
          state: 'ST',
          zipCode: '12345',
          propertySize: 1000
        }

        const { handleNext } = useWizardValidationErrors({
          activeStep,
          validateStep,
          baseHandleNext,
          showError,
          propertyDetailsStepData,
          propertyDetailsStepValidate,
          propertyDetailsFieldErrors,
          contactsStepValidate,
          availabilityStepValidate,
          selectedPropertyTypeBlocks
        })

        await handleNext()

        // When all fields are present but no property type selected, it should show property type error
        // But the code goes to else branch when fieldErrors is empty, so it checks all fields
        // The property type is included in missingFields
        expect(showError).toHaveBeenCalledWith(expect.stringContaining('property type'))
      })

      it('should check form fields when field errors not available', async () => {
        propertyDetailsFieldErrors.value = {}
        selectedPropertyTypeBlocks.value = [{ id: '1', name: 'Block 1' } as BookingBlockInstance]
        propertyDetailsStepData.value = {
          address: '123 Main St',
          city: 'City',
          state: 'ST',
          zipCode: '12345',
          propertySize: 1000
        }

        const { handleNext } = useWizardValidationErrors({
          activeStep,
          validateStep,
          baseHandleNext,
          showError,
          propertyDetailsStepData,
          propertyDetailsStepValidate,
          propertyDetailsFieldErrors,
          contactsStepValidate,
          availabilityStepValidate,
          selectedPropertyTypeBlocks
        })

        await handleNext()

        // Should show generic message when all fields are present
        expect(showError).toHaveBeenCalled()
      })

      it('should detect missing address', async () => {
        propertyDetailsFieldErrors.value = {}
        selectedPropertyTypeBlocks.value = [{ id: '1', name: 'Block 1' } as BookingBlockInstance]
        propertyDetailsStepData.value = {
          address: '12', // Too short
          city: 'City',
          state: 'ST',
          zipCode: '12345',
          propertySize: 1000
        }

        const { handleNext } = useWizardValidationErrors({
          activeStep,
          validateStep,
          baseHandleNext,
          showError,
          propertyDetailsStepData,
          propertyDetailsStepValidate,
          propertyDetailsFieldErrors,
          contactsStepValidate,
          availabilityStepValidate,
          selectedPropertyTypeBlocks
        })

        await handleNext()

        expect(showError).toHaveBeenCalledWith(expect.stringContaining('address'))
      })

      it('should detect missing zipCode', async () => {
        propertyDetailsFieldErrors.value = {}
        selectedPropertyTypeBlocks.value = [{ id: '1', name: 'Block 1' } as BookingBlockInstance]
        propertyDetailsStepData.value = {
          address: '123 Main St',
          city: 'City',
          state: 'ST',
          zipCode: '123', // Invalid format
          propertySize: 1000
        }

        const { handleNext } = useWizardValidationErrors({
          activeStep,
          validateStep,
          baseHandleNext,
          showError,
          propertyDetailsStepData,
          propertyDetailsStepValidate,
          propertyDetailsFieldErrors,
          contactsStepValidate,
          availabilityStepValidate,
          selectedPropertyTypeBlocks
        })

        await handleNext()

        expect(showError).toHaveBeenCalledWith(expect.stringContaining('zip code'))
      })

      it('should detect missing numberOfUnits for multi-family', async () => {
        propertyDetailsFieldErrors.value = {}
        selectedPropertyTypeBlocks.value = [
          { id: '1', name: 'Multi-Family Block' } as BookingBlockInstance
        ]
        propertyDetailsStepData.value = {
          address: '123 Main St',
          city: 'City',
          state: 'ST',
          zipCode: '12345',
          propertySize: 1000,
          numberOfUnits: undefined
        }

        const { handleNext } = useWizardValidationErrors({
          activeStep,
          validateStep,
          baseHandleNext,
          showError,
          propertyDetailsStepData,
          propertyDetailsStepValidate,
          propertyDetailsFieldErrors,
          contactsStepValidate,
          availabilityStepValidate,
          selectedPropertyTypeBlocks
        })

        await handleNext()

        expect(showError).toHaveBeenCalledWith(expect.stringContaining('number of units'))
      })

      it('should call propertyDetailsStepValidate when available', async () => {
        const validateFn = vi.fn(() => true)
        propertyDetailsStepValidate.value = validateFn

        const { handleNext } = useWizardValidationErrors({
          activeStep,
          validateStep,
          baseHandleNext,
          showError,
          propertyDetailsStepData,
          propertyDetailsStepValidate,
          propertyDetailsFieldErrors,
          contactsStepValidate,
          availabilityStepValidate,
          selectedPropertyTypeBlocks
        })

        await handleNext()

        expect(validateFn).toHaveBeenCalled()
      })
    })

    describe('Step 2 (Availability)', () => {
      beforeEach(() => {
        activeStep.value = 2
        validateStep.mockReturnValue(false)
      })

      it('should show error and call availabilityStepValidate', async () => {
        const validateFn = vi.fn(() => true)
        availabilityStepValidate.value = validateFn

        const { handleNext } = useWizardValidationErrors({
          activeStep,
          validateStep,
          baseHandleNext,
          showError,
          propertyDetailsStepData,
          propertyDetailsStepValidate,
          propertyDetailsFieldErrors,
          contactsStepValidate,
          availabilityStepValidate,
          selectedPropertyTypeBlocks
        })

        await handleNext()

        expect(validateFn).toHaveBeenCalled()
        expect(showError).toHaveBeenCalledWith('Please complete all required fields before continuing')
      })
    })

    describe('Step 3 (Contacts)', () => {
      beforeEach(() => {
        activeStep.value = 3
        validateStep.mockReturnValue(false)
      })

      it('should show error and call contactsStepValidate', async () => {
        const validateFn = vi.fn(() => true)
        contactsStepValidate.value = validateFn

        const { handleNext } = useWizardValidationErrors({
          activeStep,
          validateStep,
          baseHandleNext,
          showError,
          propertyDetailsStepData,
          propertyDetailsStepValidate,
          propertyDetailsFieldErrors,
          contactsStepValidate,
          availabilityStepValidate,
          selectedPropertyTypeBlocks
        })

        await handleNext()

        expect(validateFn).toHaveBeenCalled()
        expect(showError).toHaveBeenCalledWith('Please complete all required fields before continuing')
      })
    })
  })
})
