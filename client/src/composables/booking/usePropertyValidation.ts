/**
 * usePropertyValidation Composable
 * 
 */

import { computed, type Ref, type ComputedRef } from 'vue'
import { useFormValidation } from '@/composables/useFormValidation'
import type { ValidationRule } from '@/composables/useFormValidation'
import { useStepValidation, type UseStepValidationReturn } from './useStepValidation'
import { PROPERTY_VALIDATION_STRINGS } from '@/configs/propertyValidationStrings'

export interface PropertyFormData {
  address: string
  city: string
  state: string
  zipCode: string
  propertySize: number | null
  numberOfUnits: number | null
}

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

export type UsePropertyValidationReturn = UseStepValidationReturn

/**
 * usePropertyValidation composable
 * 
 */
export function usePropertyValidation(params: UsePropertyValidationParams): UsePropertyValidationReturn {
  const {
    formData,
    isMultiFamily,
    hasPropertyTypeBlock
  } = params

  const { required, zipCode: zipCodeValidator, min, max, minLength } = useFormValidation()

  /**
   * PATTERN: /**
PATTERN: Computed object with field names as keys and arrays of Vali...
   */
  const validationRules = computed<Record<string, ValidationRule[]>>(() => {
    const baseRules: Record<string, ValidationRule[]> = {
      address: [required(PROPERTY_VALIDATION_STRINGS.address.required), minLength(3, PROPERTY_VALIDATION_STRINGS.address.minLength)],
      city: [required(PROPERTY_VALIDATION_STRINGS.city.required), minLength(2, PROPERTY_VALIDATION_STRINGS.city.minLength)],
      state: [required(PROPERTY_VALIDATION_STRINGS.state.required)],
      zipCode: [required(PROPERTY_VALIDATION_STRINGS.zipCode.required), zipCodeValidator()],
      propertySize: [
        required(PROPERTY_VALIDATION_STRINGS.propertySize.required),
        min(1, PROPERTY_VALIDATION_STRINGS.propertySize.min),
        max(100000, PROPERTY_VALIDATION_STRINGS.propertySize.max)
      ]
    }
    
    if (isMultiFamily.value) {
      baseRules.numberOfUnits = [
        required(PROPERTY_VALIDATION_STRINGS.numberOfUnits.required),
        min(1, PROPERTY_VALIDATION_STRINGS.numberOfUnits.min),
        max(1000, PROPERTY_VALIDATION_STRINGS.numberOfUnits.max)
      ]
    }
    
    return baseRules
  })

  const customValidators = {
    propertyTypeBlock: () => {
      if (!hasPropertyTypeBlock.value) {
        return PROPERTY_VALIDATION_STRINGS.propertyTypeBlock.required
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





