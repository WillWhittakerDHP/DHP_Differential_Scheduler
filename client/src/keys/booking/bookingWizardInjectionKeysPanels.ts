/**
 * Sub-step / panel form contexts for booking wizard.
 * @see bookingInjectionKeys barrel for stable import path.
 */
import type { InjectionKey } from 'vue'
import type {
  AvailabilitySubStepContext,
  ContactsFormContext,
  InstancesPanelContext,
} from '@/types/booking/injectionContexts'

export const instancesPanelContextKey: InjectionKey<InstancesPanelContext> =
  Symbol('instancesPanelContext')

export const contactsFormContextKey: InjectionKey<ContactsFormContext> =
  Symbol('contactsFormContext')

export const availabilitySubStepContextKey: InjectionKey<AvailabilitySubStepContext> =
  Symbol('availabilitySubStepContext')
