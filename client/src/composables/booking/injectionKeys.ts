import type { ValidationRule } from '@/types/formValidation'
/**
 * Typed InjectionKey constants for booking wizard and dev panels provide/inject.
 * PATTERN: Use these keys in provide() and inject() for type-safe dependency injection.
 */
import type { InjectionKey } from 'vue'
import type { Ref, ComputedRef } from 'vue'
import type {
  PropertyDetailsStepData,
  ContactsStepData,
  ConfirmationStepData,
  AvailabilityStepData,
  UseBookingWizardReturn,
} from '@/types/wizard'
import type { DisplayedMonth } from '@/types/booking/dateRangeDecider'
import type { UseComputedAvailabilityReturn } from '@/types/booking/computedAvailability'
import type { AppointmentShape } from '@/types/appointment'
import type { PartFinal } from '@/types/booking/partFinal'
import type { EventShape } from '@/types/events'
import type { ServiceSummary, TimeSlotResults } from '@/types/booking/devPanelsComputed'
import type { ContactInfo } from '@/types/booking/contactsStepData'
import type { WizardStateData } from '@/utils/transformers/appointmentToWizardTransformer'
import type { UseAvailabilityOrchestratorReturn } from '@/types/booking/availabilityOrchestrator'

/** Flattened orchestrator state + actions + wizard for AvailabilitySubStepContent. */
export type AvailabilitySubStepOrchestratorState = UseAvailabilityOrchestratorReturn['data'] &
  UseAvailabilityOrchestratorReturn['actions'] & { wizard: UseAvailabilityOrchestratorReturn['wizard'] }

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

export const resetMocksSignalKey: InjectionKey<Ref<number>> =
  Symbol('resetMocksSignal')

/** Typed key for booking wizard context (flat contract). Provider: BookingWizard.vue. */
export const wizardKey: InjectionKey<UseBookingWizardReturn> = Symbol('wizard')

/** Ref to loaded wizard state (from appointment load). Provider: useBookingWizardSetup. */
export const loadedWizardStateKey: InjectionKey<Ref<WizardStateData | null>> =
  Symbol('loadedWizardState')

/** Context provided by DevPanelsContainer and consumed by InstancesPanel (replaces prop-drilling). */
export interface InstancesPanelContext {
  activeInstancesSubTab: Ref<'parts' | 'blocks'>
  setActiveInstancesSubTab: (value: 'parts' | 'blocks') => void
  appointmentShape: ComputedRef<AppointmentShape | null>
  finalizedParts: ComputedRef<PartFinal[]>
  eventShapes: ComputedRef<EventShape[]>
  hasEventForPart: (partShapeName: string, eventShape: EventShape) => boolean
  formatDuration: (ms: number) => string
  formatTime: (value: string | null) => string
  selectedServiceTypeId: ComputedRef<string | null>
  serviceTypeOptions: ComputedRef<Array<{ title: string; value: string }>>
  handleServiceTypeChange: (serviceId: string | null) => void
  hasWizard: boolean
  isSelectedServiceDifferential: ComputedRef<boolean>
  servicesSummary: ComputedRef<ServiceSummary[]>
  timeSlotResults: ComputedRef<TimeSlotResults>
  hasSelectedTime: ComputedRef<boolean>
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
  validationRules: ComputedRef<Record<string, ValidationRule[]>>
  fieldErrors: Ref<Record<string, string>>
  toggleSection: (section: 'anotherClient' | 'transactionManager' | 'seller', show: boolean) => void
}

export const contactsFormContextKey: InjectionKey<ContactsFormContext> =
  Symbol('contactsFormContext')

/** Context for AvailabilitySubStepContent (orchestrator + handlers). Provider: AvailabilityStep. */
export interface AvailabilitySubStepContext {
  o: AvailabilitySubStepOrchestratorState
  handleDateChangeWithConfirm: (v: string | Date | string[] | Date[] | null) => void
  onOptionIdUpdate: (id: string | null) => void
  handleTimeBasisChangeWithConfirm: (type: 'major' | 'minor') => void
  handleSlotClickWithConfirm: (buttonIndex: number) => void
  showSlotsOverlay: boolean
  slotGridOverlayLabel: string | null
  slotGridOverlayError: string | null
  emptyStateMessage: string
  firstAvailableNotice: string | null
  clearFirstAvailableNotice: () => void
}
export const availabilitySubStepContextKey: InjectionKey<AvailabilitySubStepContext> =
  Symbol('availabilitySubStepContext')
