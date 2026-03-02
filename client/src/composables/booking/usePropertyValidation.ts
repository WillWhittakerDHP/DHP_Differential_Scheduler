/**
 * usePropertyValidation Composable
 *
 * Returns step validation plus typed slices for address and property-size sections
 * so consumers need no type assertions (per TYPE_AUTHORING_PLAYBOOK).
 */
import { computed } from 'vue'
import { useFormValidation } from '@/composables/useFormValidation'
import type { ValidationRule } from '@/types/formValidation'
import { useStepValidation } from './useStepValidation'
import { PROPERTY_VALIDATION_STRINGS } from '@/configs/propertyValidationStrings'
import type {
  UsePropertyValidationParams,
  UsePropertyValidationReturn,
  PropertyAddressValidationRules,
  PropertySizeValidationRules,
} from '@/types/booking/propertyValidation'

export function usePropertyValidation(params: UsePropertyValidationParams): UsePropertyValidationReturn {
  const { formData, isMultiFamily, hasPropertyTypeBlock } = params

  const { required, zipCode: zipCodeValidator, min, max, minLength } = useFormValidation()

  const validationRules = computed<Record<string, ValidationRule[]>>(() => {
    const baseRules: Record<string, ValidationRule[]> = {
      address: [required(PROPERTY_VALIDATION_STRINGS.address.required), minLength(3, PROPERTY_VALIDATION_STRINGS.address.minLength)],
      city: [required(PROPERTY_VALIDATION_STRINGS.city.required), minLength(2, PROPERTY_VALIDATION_STRINGS.city.minLength)],
      state: [required(PROPERTY_VALIDATION_STRINGS.state.required)],
      zipCode: [required(PROPERTY_VALIDATION_STRINGS.zipCode.required), zipCodeValidator()],
      propertySize: [
        required(PROPERTY_VALIDATION_STRINGS.propertySize.required),
        min(1, PROPERTY_VALIDATION_STRINGS.propertySize.min),
        max(100000, PROPERTY_VALIDATION_STRINGS.propertySize.max),
      ],
    }

    if (isMultiFamily.value) {
      baseRules.numberOfUnits = [
        required(PROPERTY_VALIDATION_STRINGS.numberOfUnits.required),
        min(1, PROPERTY_VALIDATION_STRINGS.numberOfUnits.min),
        max(1000, PROPERTY_VALIDATION_STRINGS.numberOfUnits.max),
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
    },
  }

  const stepReturn = useStepValidation({
    formData: {
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zipCode: formData.zipCode,
      propertySize: formData.propertySize,
      numberOfUnits: formData.numberOfUnits,
    },
    validationRules,
    customValidators,
  })

  const addressValidationRules = computed<PropertyAddressValidationRules>(() => ({
    address: stepReturn.validationRules.value.address,
    city: stepReturn.validationRules.value.city,
    state: stepReturn.validationRules.value.state,
    zipCode: stepReturn.validationRules.value.zipCode,
  }))

  const propertySizeValidationRules = computed<PropertySizeValidationRules>(() => ({
    propertySize: stepReturn.validationRules.value.propertySize,
    numberOfUnits: stepReturn.validationRules.value.numberOfUnits ?? [],
  }))

  return {
    ...stepReturn,
    addressValidationRules,
    propertySizeValidationRules,
  }
}





