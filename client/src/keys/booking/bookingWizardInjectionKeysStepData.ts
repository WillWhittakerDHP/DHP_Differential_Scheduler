/**
 * Step Ref keys for booking wizard provide/inject.
 * @see bookingInjectionKeys barrel for stable import path.
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
