import type { Ref, ComputedRef } from 'vue'

import type { UseStepValidationReturn } from '@/types/booking/stepValidation'
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

export type UsePropertyValidationReturn = UseStepValidationReturn
