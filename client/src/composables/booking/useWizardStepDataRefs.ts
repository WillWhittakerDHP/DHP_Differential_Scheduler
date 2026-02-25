/**
 * WHY: Encapsulates step data and validation state refs creation and provide/in...
 */
import { ref, provide } from 'vue'
import type { PropertyDetailsStepData, ContactsStepData, AvailabilityStepData, ConfirmationStepData } from '@/types/wizard'
import type { UseWizardStepDataRefsReturn } from '@/types/booking/wizardStepDataRefs'

export type { UseWizardStepDataRefsReturn } from '@/types/booking/wizardStepDataRefs'

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
