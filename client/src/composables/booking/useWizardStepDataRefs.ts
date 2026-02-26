/**
 * WHY: Encapsulates step data and validation state refs creation and provide/in...
 */
import { ref, provide } from 'vue'
import type { PropertyDetailsStepData, ContactsStepData, AvailabilityStepData, ConfirmationStepData } from '@/types/wizard'
import type { UseWizardStepDataRefsReturn } from '@/types/booking/wizardStepDataRefs'
import {
  propertyDetailsStepDataKey,
  contactsStepDataKey,
  availabilityStepDataKey,
  confirmationStepDataKey,
  propertyDetailsStepValidKey,
  propertyDetailsStepValidateKey,
  propertyDetailsFieldErrorsKey,
  contactsStepValidKey,
  contactsStepValidateKey,
  availabilityStepValidKey,
  availabilityStepValidateKey,
  confirmationStepValidKey,
  confirmationStepValidateKey,
} from '@/composables/booking/injectionKeys'


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

  provide(propertyDetailsStepDataKey, propertyDetailsStepData)
  provide(contactsStepDataKey, contactsStepData)
  provide(availabilityStepDataKey, availabilityStepData)
  provide(confirmationStepDataKey, confirmationStepData)

  provide(propertyDetailsStepValidKey, propertyDetailsStepValid)
  provide(propertyDetailsStepValidateKey, propertyDetailsStepValidate)
  provide(propertyDetailsFieldErrorsKey, propertyDetailsFieldErrors)
  provide(contactsStepValidKey, contactsStepValid)
  provide(contactsStepValidateKey, contactsStepValidate)
  provide(availabilityStepValidKey, availabilityStepValid)
  provide(availabilityStepValidateKey, availabilityStepValidate)
  provide(confirmationStepValidKey, confirmationStepValid)
  provide(confirmationStepValidateKey, confirmationStepValidate)

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
