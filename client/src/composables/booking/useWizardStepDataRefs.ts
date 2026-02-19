/**
 * LEARNING: Wizard Step Data Refs Management
 * WHY: Encapsulates step data and validation state refs creation and provide/inject setup
 * PATTERN: Composable for managing step data refs and validation state refs
 * 
 * Used by:
 * - BookingWizard.vue
 */

import { ref, provide } from 'vue'
import type { PropertyDetailsStepData, ContactsStepData, AvailabilityStepData, ConfirmationStepData, WizardStepDataAndValidationRefs } from '@/types/wizard'

export type UseWizardStepDataRefsReturn = WizardStepDataAndValidationRefs

export function useWizardStepDataRefs(): UseWizardStepDataRefsReturn {
  const propertyDetailsStepData = ref<PropertyDetailsStepData | null>(null)
  const contactsStepData = ref<ContactsStepData | null>(null)
  const availabilityStepData = ref<AvailabilityStepData | null>(null)
  const confirmationStepData = ref<ConfirmationStepData | null>(null)

  const propertyDetailsStepValid = ref<boolean>(false)
  const propertyDetailsStepValidate = ref<(() => boolean) | null>(null)
  const propertyDetailsFieldErrors = ref<Record<string, string>>({})
  const contactsStepValid = ref<boolean>(false)
  const contactsStepValidate = ref<(() => boolean) | null>(null)
  const availabilityStepValid = ref<boolean>(false)
  const availabilityStepValidate = ref<(() => boolean) | null>(null)
  const confirmationStepValid = ref<boolean>(true)
  const confirmationStepValidate = ref<(() => boolean) | null>(() => true)

  provide('propertyDetailsStepData', propertyDetailsStepData)
  provide('contactsStepData', contactsStepData)
  provide('availabilityStepData', availabilityStepData)
  provide('confirmationStepData', confirmationStepData)

  provide('propertyDetailsStepValid', propertyDetailsStepValid)
  provide('propertyDetailsStepValidate', propertyDetailsStepValidate)
  provide('propertyDetailsFieldErrors', propertyDetailsFieldErrors)
  provide('contactsStepValid', contactsStepValid)
  provide('contactsStepValidate', contactsStepValidate)
  provide('availabilityStepValid', availabilityStepValid)
  provide('availabilityStepValidate', availabilityStepValidate)
  provide('confirmationStepValid', confirmationStepValid)
  provide('confirmationStepValidate', confirmationStepValidate)

  return {
    propertyDetailsStepData,
    contactsStepData,
    availabilityStepData,
    confirmationStepData,
    propertyDetailsStepValid,
    propertyDetailsStepValidate,
    propertyDetailsFieldErrors,
    contactsStepValid,
    contactsStepValidate,
    availabilityStepValid,
    availabilityStepValidate,
    confirmationStepValid,
    confirmationStepValidate,
  }
}
