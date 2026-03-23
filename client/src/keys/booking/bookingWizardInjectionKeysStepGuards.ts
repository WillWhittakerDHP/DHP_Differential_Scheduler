/**
 * Validation / field-error keys for booking wizard steps.
 * @see bookingInjectionKeys barrel for stable import path.
 */
import type { InjectionKey } from 'vue'
import type { Ref } from 'vue'

export const propertyDetailsStepValidKey: InjectionKey<Ref<boolean>> =
  Symbol('propertyDetailsStepValid')
export const propertyDetailsStepValidateKey: InjectionKey<Ref<(() => boolean) | null>> =
  Symbol('propertyDetailsStepValidate')
export const propertyDetailsFieldErrorsKey: InjectionKey<Ref<Record<string, string>>> =
  Symbol('propertyDetailsFieldErrors')
export const contactsStepValidKey: InjectionKey<Ref<boolean>> = Symbol('contactsStepValid')
export const contactsStepValidateKey: InjectionKey<Ref<(() => boolean) | null>> =
  Symbol('contactsStepValidate')
export const availabilityStepValidKey: InjectionKey<Ref<boolean>> =
  Symbol('availabilityStepValid')
export const availabilityStepValidateKey: InjectionKey<Ref<(() => boolean) | null>> =
  Symbol('availabilityStepValidate')
export const confirmationStepValidKey: InjectionKey<Ref<boolean>> =
  Symbol('confirmationStepValid')
export const confirmationStepValidateKey: InjectionKey<Ref<(() => boolean) | null>> =
  Symbol('confirmationStepValidate')
