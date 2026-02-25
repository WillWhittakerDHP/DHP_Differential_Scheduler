/**
 * PATTERN: Composable for handling validation errors with user-friendly messages

U...
 */
import { nextTick } from 'vue'
import type {
  UseWizardValidationErrorsOptions,
  UseWizardValidationErrorsReturn,
} from '@/types/booking/wizardValidationErrors'

export type {
  UseWizardValidationErrorsOptions,
  UseWizardValidationErrorsReturn,
} from '@/types/booking/wizardValidationErrors'

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
      if (activeStep.value === 1) {
        if (propertyDetailsStepValidate.value) {
          propertyDetailsStepValidate.value()
          await nextTick()
        }
        
        const hasPropertyTypeBlock = selectedPropertyTypeBlocks.value.length > 0
        
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
          const missingFields: string[] = []
          if (!hasPropertyTypeBlock) missingFields.push('property type')
          
          if (propertyDetailsStepData.value) {
            const data = propertyDetailsStepData.value
            if (!data.address || data.address.trim().length < 3) missingFields.push('address')
            if (!data.city || data.city.trim().length < 2) missingFields.push('city')
            if (!data.state) missingFields.push('state')
            if (!data.zipCode || !/^\d{5}(-\d{4})?$/.test(data.zipCode)) missingFields.push('zip code')
            if (!data.propertySize || data.propertySize < 1) missingFields.push('property size')
            
            const isMultiFamily = selectedPropertyTypeBlocks.value.some(
              block => block.name?.toLowerCase().includes('multi') || block.name?.toLowerCase().includes('duplex')
            )
            if (isMultiFamily && (!data.numberOfUnits || data.numberOfUnits < 1)) {
              missingFields.push('number of units')
            }
          } else {
            missingFields.push('address', 'city', 'state', 'zip code', 'property size')
          }
          
          const missingMsg = missingFields.length > 0 
            ? `Please complete: ${missingFields.join(', ')}`
            : 'Please complete all required fields'
          showError(missingMsg)
        }
      } else if (activeStep.value === 2) {
        if (availabilityStepValidate.value) {
          availabilityStepValidate.value()
        }
        showError('Please complete all required fields before continuing')
      } else if (activeStep.value === 3) {
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
