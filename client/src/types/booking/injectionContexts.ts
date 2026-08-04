/**
 * Booking wizard provide/inject context shapes (keys live in keys/bookingInjectionKeys.ts).
 */
import type { Ref, ComputedRef } from 'vue'
import type { ValidationRule } from '@/types/formValidation'
import type { AppointmentShape } from '@/types/appointment'
import type { PartFinal } from '@/types/booking/partFinal'
import type { EventShape } from '@/types/events'
import type { ServiceSummary, TimeSlotResults } from '@/types/booking/devPanelsComputed'
import type { ContactRefs } from '@/types/booking/contactsStepData'
import type { UseAvailabilityOrchestratorReturn } from '@/types/booking/availabilityOrchestrator'

/** Flattened orchestrator state + actions + wizard for AvailabilitySubStepContent. */
export type AvailabilitySubStepOrchestratorState = UseAvailabilityOrchestratorReturn['data'] &
  UseAvailabilityOrchestratorReturn['actions'] & { wizard: UseAvailabilityOrchestratorReturn['wizard'] }

/** Context provided by DevPanelsContainer and consumed by InstancesPanel (replaces prop-drilling). */
export interface InstancesPanelContext {
  activeInstancesSubTab: Ref<'parts' | 'blocks'>
  setActiveInstancesSubTab: (value: 'parts' | 'blocks') => void
  appointmentShape: ComputedRef<AppointmentShape | null>
  finalizedParts: ComputedRef<PartFinal[]>
  eventShapes: ComputedRef<EventShape[]>
  hasEventForPart: (partLineageKey: string, eventShape: EventShape) => boolean
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

/** Context for ContactsStep form section (injected by ContactsStep, consumed by ContactFormSection). */
export interface ContactsFormContext extends ContactRefs {
  validationRules: ComputedRef<Record<string, ValidationRule[]>>
  fieldErrors: Ref<Record<string, string>>
  toggleSection: (section: 'anotherBuyer' | 'owner', show: boolean) => void
}

/** Context for AvailabilitySubStepContent (orchestrator + handlers). Provider: AvailabilityStep. */
export interface AvailabilitySubStepContext {
  o: AvailabilitySubStepOrchestratorState
  handleDateChangeWithConfirm: (v: string | Date | string[] | Date[] | null) => void
  onOptionIdUpdate: (id: string | null) => void
  handleTimeBasisChangeWithConfirm: (type: 'major' | 'minor') => void
  handleSlotClickWithConfirm: (buttonIndex: number) => void
  /** Task 6.9.4.1: For step 4 (minimizer details) — confirm advances confirmation state. */
  handleMinimizerConfirmWithConfirm: () => void
  showSlotsOverlay: boolean
  slotGridOverlayLabel: string | null
  slotGridOverlayError: string | null
  emptyStateMessage: string
  firstAvailableNotice: string | null
  clearFirstAvailableNotice: () => void
  /** Yes+deadline minimizer path: slots loaded and empty (blocks Next until user adjusts). */
  minimizerInfeasible: boolean
  minimizerInfeasibleMessage: string
  /** Multiple cascade option blocks — Tailor step shows options section when true. */
  hasOptions: ComputedRef<boolean>
}
