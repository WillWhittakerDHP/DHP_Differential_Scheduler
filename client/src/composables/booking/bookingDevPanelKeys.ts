/**
 * Typed InjectionKey constants and context types for booking dev panels (Instances, Contacts form).
 * PATTERN: Use these keys in provide() and inject() for type-safe dependency injection.
 */
import type { InjectionKey } from 'vue'
import type { Ref, ComputedRef } from 'vue'
import type { ValidationRule } from '@/types/formValidation'
import type { AppointmentShape } from '@/types/appointment'
import type { PartFinal } from '@/types/booking/partFinal'
import type { EventShape } from '@/types/events'
import type { ServiceSummary, TimeSlotResults } from '@/types/booking/devPanelsComputed'
import type { ContactInfo } from '@/types/booking/contactsStepData'

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
