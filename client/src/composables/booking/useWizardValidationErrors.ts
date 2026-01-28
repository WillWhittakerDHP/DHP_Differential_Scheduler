/**
 * LEARNING: Wizard Validation Error Handling
 * WHY: Encapsulates step-specific validation error message logic
 * PATTERN: Composable for handling validation errors with user-friendly messages
 * 
 * Used by:
 * - BookingWizard.vue
 */

import { nextTick, type Ref } from 'vue'
import type { PropertyDetailsStepData, ContactsStepData } from '@/types/wizard'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'

export interface UseWizardValidationErrorsOptions {
  activeStep: Ref<number>
  validateStep: (stepIndex: number) => boolean
  baseHandleNext: () => void
  showError: (message: string) => void
  propertyDetailsStepData: Ref<PropertyDetailsStepData | null>
  propertyDetailsStepValidate: Ref<(() => boolean) | null>
  propertyDetailsFieldErrors: Ref<Record<string, string>>
  contactsStepValidate: Ref<(() => boolean) | null>
  availabilityStepValidate: Ref<(() => boolean) | null>
  selectedPropertyTypeBlocks: Ref<BookingBlockInstance[]>
}

export interface UseWizardValidationErrorsReturn {
  handleNext: () => Promise<void>
}

/**
 * LEARNING: Enhanced handleNext with step-specific error handling
 * WHY: Provides user-friendly error messages for each step's validation failures
 * PATTERN: Wraps baseHandleNext with error message logic
 */
export function useWizardValidationErrors(
  options: UseWizardValidationErrorsOptions
): UseWizardValidationErrorsReturn {
  const {
    activeStep,
    validateStep,
    baseHandleNext,
    showError,
    propertyDetailsStepData,
    propertyDetailsStepValidate,
    propertyDetailsFieldErrors,
    contactsStepValidate,
    availabilityStepValidate,
    selectedPropertyTypeBlocks,
  } = options

  const handleNext = async (): Promise<void> => {
    const isValid = validateStep(activeStep.value)
    if (!isValid) {
      // Handle step 1 (Property Details) validation errors
      if (activeStep.value === 1) {
        // Trigger validation function if available to populate field errors
        if (propertyDetailsStepValidate.value) {
          propertyDetailsStepValidate.value()
          // Wait a tick for fieldErrors to update
          await nextTick()
        }
        
        // Check property type block selection
        const hasPropertyTypeBlock = selectedPropertyTypeBlocks.value.length > 0
        
        // Log specific field errors if available
        if (propertyDetailsFieldErrors.value && Object.keys(propertyDetailsFieldErrors.value).length > 0) {
          const errors = Object.entries(propertyDetailsFieldErrors.value)
          if (errors.length > 0) {
            const errorMessages = errors.map(([field, error]) => `${field}: ${error}`).join(', ')
            showError(`Please fix the following: ${errorMessages}`)
          } else if (!hasPropertyTypeBlock) {
            showError('Please select at least one property type')
          } else {
            showError('Please complete all required fields: address, city, state, zip code, and size')
          }
        } else {
          // Field errors not available, check form data directly from stepData
          const missingFields: string[] = []
          if (!hasPropertyTypeBlock) missingFields.push('property type')
          
          // Check form fields from propertyDetailsStepData
          if (propertyDetailsStepData.value) {
            const data = propertyDetailsStepData.value
            if (!data.address || data.address.trim().length < 3) missingFields.push('address')
            if (!data.city || data.city.trim().length < 2) missingFields.push('city')
            if (!data.state) missingFields.push('state')
            if (!data.zipCode || !/^\d{5}(-\d{4})?$/.test(data.zipCode)) missingFields.push('zip code')
            if (!data.propertySize || data.propertySize < 1) missingFields.push('property size')
            
            // Check numberOfUnits if multi-family
            const isMultiFamily = selectedPropertyTypeBlocks.value.some(
              block => block.name?.toLowerCase().includes('multi') || block.name?.toLowerCase().includes('duplex')
            )
            if (isMultiFamily && (!data.numberOfUnits || data.numberOfUnits < 1)) {
              missingFields.push('number of units')
            }
          } else {
            // Step data not available, all fields are missing
            missingFields.push('address', 'city', 'state', 'zip code', 'property size')
          }
          
          const missingMsg = missingFields.length > 0 
            ? `Please complete: ${missingFields.join(', ')}`
            : 'Please complete all required fields'
          showError(missingMsg)
        }
      } else if (activeStep.value === 2) {
        // Handle step 2 (Availability) validation errors
        if (availabilityStepValidate.value) {
          availabilityStepValidate.value()
        }
        showError('Please complete all required fields before continuing')
      } else if (activeStep.value === 3) {
        // Handle step 3 (Contacts) validation errors
        if (contactsStepValidate.value) {
          contactsStepValidate.value()
        }
        showError('Please complete all required fields before continuing')
      } else {
        showError('Please complete all required fields before continuing')
      }
      return
    }
    baseHandleNext()
  }

  return {
    handleNext,
  }
}
