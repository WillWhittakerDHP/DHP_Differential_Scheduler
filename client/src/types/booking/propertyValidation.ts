import type { Ref, ComputedRef } from 'vue'

import type { ValidationRule } from '@/types/formValidation'
import type { UseStepValidationReturn } from '@/types/booking/stepValidation'

/** Validation rules for the address section (PropertyAddressSection). */
export interface PropertyAddressValidationRules {
  address: ValidationRule[]
  city: ValidationRule[]
  state: ValidationRule[]
  zipCode: ValidationRule[]
}

/** Validation rules for the property size section (PropertyDetailsSection). */
export interface PropertySizeValidationRules {
  propertySize: ValidationRule[]
  numberOfUnits: ValidationRule[]
}

export interface PropertyValidationData {
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

export interface UsePropertyValidationReturn extends UseStepValidationReturn {
  /** Typed slice for PropertyAddressSection; avoids casting in consumers. */
  addressValidationRules: ComputedRef<PropertyAddressValidationRules>
  /** Typed slice for PropertyDetailsSection; avoids casting in consumers. */
  propertySizeValidationRules: ComputedRef<PropertySizeValidationRules>
}
