/**
 * Typed InjectionKey constants for booking wizard step data and step validation.
 * PATTERN: Use these keys in provide() and inject() for type-safe dependency injection.
 */
import type { InjectionKey } from 'vue'
import type { Ref } from 'vue'
import type {
  PropertyDetailsStepData,
  ContactsStepData,
  ConfirmationStepData,
  AvailabilityStepData,
} from '@/types/wizard'

export const propertyDetailsStepDataKey: InjectionKey<Ref<PropertyDetailsStepData | null>> =
  Symbol('propertyDetailsStepData')
export const contactsStepDataKey: InjectionKey<Ref<ContactsStepData | null>> =
  Symbol('contactsStepData')
export const availabilityStepDataKey: InjectionKey<Ref<AvailabilityStepData | null>> =
  Symbol('availabilityStepData')
export const confirmationStepDataKey: InjectionKey<Ref<ConfirmationStepData | null>> =
  Symbol('confirmationStepData')

export const propertyDetailsStepValidKey: InjectionKey<Ref<boolean>> =
  Symbol('propertyDetailsStepValid')
export const propertyDetailsStepValidateKey: InjectionKey<Ref<(() => boolean) | null>> =
  Symbol('propertyDetailsStepValidate')
export const propertyDetailsFieldErrorsKey: InjectionKey<Ref<Record<string, string>>> =
  Symbol('propertyDetailsFieldErrors')
export const contactsStepValidKey: InjectionKey<Ref<boolean>> =
  Symbol('contactsStepValid')
export const contactsStepValidateKey: InjectionKey<Ref<(() => boolean) | null>> =
  Symbol('contactsStepValidate')
export const availabilityStepValidKey: InjectionKey<Ref<boolean>> =
  Symbol('availabilityStepValid')
