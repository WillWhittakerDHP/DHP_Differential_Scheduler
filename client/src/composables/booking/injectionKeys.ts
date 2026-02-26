/**
import type { ValidationRule } from '@/types/formValidation'
 * Typed InjectionKey constants for booking wizard and dev panels provide/inject.
 * PATTERN: Use these keys in provide() and inject() for type-safe dependency injection.
 */
import type { InjectionKey } from 'vue'
import type { Ref, ComputedRef } from 'vue'
import type { PropertyDetailsStepData, ContactsStepData, ConfirmationStepData } from '@/types/wizard'
import type { AvailabilityStepData } from '@/types/wizard'
import type { DisplayedMonth } from '@/types/booking/dateRangeDecider'
import type { UseComputedAvailabilityReturn } from '@/types/booking/computedAvailability'
import type { AppointmentShape } from '@/types/appointment'
import type { PartFinal } from '@/types/booking/partFinal'
import type { EventShape } from '@/types/events'
import type { ServiceSummary, TimeSlotResults } from '@/types/booking/devPanelsComputed'
import type { ContactInfo } from '@/types/booking/contactsStepData'

// Step data refs (useWizardStepDataRefs)
export const propertyDetailsStepDataKey: InjectionKey<Ref<PropertyDetailsStepData | null>> =
  Symbol('propertyDetailsStepData')
export const contactsStepDataKey: InjectionKey<Ref<ContactsStepData | null>> =
  Symbol('contactsStepData')
export const availabilityStepDataKey: InjectionKey<Ref<AvailabilityStepData | null>> =
  Symbol('availabilityStepData')
export const confirmationStepDataKey: InjectionKey<Ref<ConfirmationStepData | null>> =
  Symbol('confirmationStepData')

// Step validation refs (useWizardStepDataRefs)
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
export const availabilityStepValidateKey: InjectionKey<Ref<(() => boolean) | null>> =
  Symbol('availabilityStepValidate')
export const confirmationStepValidKey: InjectionKey<Ref<boolean>> =
  Symbol('confirmationStepValid')
export const confirmationStepValidateKey: InjectionKey<Ref<(() => boolean) | null>> =
  Symbol('confirmationStepValidate')

// Date/availability (useWizardDateAvailability)
export const displayedMonthKey: InjectionKey<Ref<DisplayedMonth>> =
  Symbol('displayedMonth')
export const updateDisplayedMonthKey: InjectionKey<(month: DisplayedMonth) => void> =
  Symbol('updateDisplayedMonth')
export const appointmentDurationKey: InjectionKey<Ref<number | null>> =
  Symbol('appointmentDuration')
export const computedAvailabilityKey: InjectionKey<UseComputedAvailabilityReturn> =
  Symbol('computedAvailability')

// Dev mode (useWizardDevMode)
export const resetMocksSignalKey: InjectionKey<Ref<number>> =
  Symbol('resetMocksSignal')

/** Context provided by DevPanelsContainer and consumed by InstancesPanel (replaces prop-drilling). */
export interface InstancesPanelContext {
  activeInstancesSubTab: Ref<'parts' | 'blocks'>
  setActiveInstancesSubTab: (value: 'parts' | 'blocks') => void
  appointmentShape: Ref<AppointmentShape | null> | ComputedRef<AppointmentShape | null>
  finalizedParts: Ref<PartFinal[]> | ComputedRef<PartFinal[]>
  eventShapes: Ref<EventShape[]> | ComputedRef<EventShape[]>
  hasEventForPart: (partShapeName: string, eventShape: EventShape) => boolean
  formatDuration: (ms: number) => string
  formatTime: (value: string | null) => string
  selectedServiceTypeId: Ref<string | null> | ComputedRef<string | null>
  serviceTypeOptions: Ref<Array<{ title: string; value: string }>> | ComputedRef<Array<{ title: string; value: string }>>
  handleServiceTypeChange: (serviceId: string | null) => void
  hasWizard: boolean
  isSelectedServiceDifferential: Ref<boolean> | ComputedRef<boolean>
  servicesSummary: Ref<ServiceSummary[]> | ComputedRef<ServiceSummary[]>
  timeSlotResults: Ref<TimeSlotResults> | ComputedRef<TimeSlotResults>
  hasSelectedTime: Ref<boolean> | ComputedRef<boolean>
}

export const instancesPanelContextKey: InjectionKey<InstancesPanelContext> =
  Symbol('instancesPanelContext')

/** Context for ContactsStep form section (injected by ContactsStep, consumed by ContactFormSection). */
export interface ContactsFormContext {
  clientInfo: Ref<ContactInfo>
  agentInfo: Ref<ContactInfo>
  anotherClientInfo: Ref<ContactInfo>
  transactionManagerInfo: Ref<ContactInfo>
  sellerInfo: Ref<ContactInfo>
  showAnotherClient: Ref<boolean>
  showTransactionManager: Ref<boolean>
  showSeller: Ref<boolean>
  validationRules: Record<string, ValidationRule[]>
  fieldErrors: Record<string, string>
  toggleSection: (section: 'anotherClient' | 'transactionManager' | 'seller', show: boolean) => void
}

export const contactsFormContextKey: InjectionKey<ContactsFormContext> =
  Symbol('contactsFormContext')
