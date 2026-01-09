/**
 * usePropertyValidation Composable
 * 
 * LEARNING: Thin wrapper around generic useStepValidation
 * WHY: Provides step-specific validation rules using generic pattern
 */

import { computed, type Ref, type ComputedRef } from 'vue'
import { useFormValidation } from '@/composables/useFormValidation'
import type { ValidationRule } from '@/composables/useFormValidation'
import { useStepValidation, type UseStepValidationReturn } from './useStepValidation'

/**
 * Property form data structure
 */
export interface PropertyFormData {
  address: string
  city: string
  state: string
  zipCode: string
  propertySize: number | null
  numberOfUnits: number | null
}

/**
 * usePropertyValidation composable parameters
 */
export interface UsePropertyValidationParams {
  formData: {
    address: Ref<string>
    city: Ref<string>
    state: Ref<string>
    zipCode: Ref<string>
    propertySize: Ref<number | null>
    numberOfUnits: Ref<number | null>
  }
  isMultiFamily: ComputedRef<boolean>
  hasPropertyTypeBlock: ComputedRef<boolean>
}

/**
 * usePropertyValidation composable return type
 */
export type UsePropertyValidationReturn = UseStepValidationReturn

/**
 * usePropertyValidation composable
 * 
 * LEARNING: Thin wrapper around generic useStepValidation
 * WHY: Provides step-specific validation rules using generic pattern
 */
export function usePropertyValidation(params: UsePropertyValidationParams): UsePropertyValidationReturn {
  const {
    formData,
    isMultiFamily,
    hasPropertyTypeBlock
  } = params

  const { required, zipCode: zipCodeValidator, min, max, minLength } = useFormValidation()

  /**
   * LEARNING: Form validation rules
   * WHY: Defines validation rules for each form field
   * PATTERN: Computed object with field names as keys and arrays of ValidationRule as values
   * NOTE: Using computed to make rules reactive to isMultiFamily changes
   */
  const validationRules = computed<Record<string, ValidationRule[]>>(() => {
    const baseRules: Record<string, ValidationRule[]> = {
      address: [required('Address is required'), minLength(3, 'Address must be at least 3 characters')],
      city: [required('City is required'), minLength(2, 'City must be at least 2 characters')],
      state: [required('State is required')],
      zipCode: [required('Zip code is required'), zipCodeValidator()],
      propertySize: [
        required('Size is required'),
        min(1, 'Size must be at least 1 sq-ft'),
        max(100000, 'Size must be no more than 100,000 sq-ft')
      ]
    }
    
    // Add numberOfUnits validation only if multi-family property
    if (isMultiFamily.value) {
      baseRules.numberOfUnits = [
        required('Number of units is required'),
        min(1, 'Number of units must be at least 1'),
        max(1000, 'Number of units must be no more than 1000')
      ]
    }
    
    return baseRules
  })

  // Custom validator for property type block selection
  const customValidators = {
    propertyTypeBlock: () => {
      if (!hasPropertyTypeBlock.value) {
        return 'Please select at least one property type'
      }
      return true
    }
  }

  return useStepValidation({
    formData: {
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zipCode: formData.zipCode,
      propertySize: formData.propertySize,
      numberOfUnits: formData.numberOfUnits
    },
    validationRules,
    customValidators
  })
}





