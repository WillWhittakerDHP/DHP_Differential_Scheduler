/**
 * Injects and validates BookingWizard-provided keys for the availability step.
 * WHY: Removes long inject/guard blocks from the SFC (component-logic).
 */
import { inject, type Ref } from 'vue'
import {
  wizardKey,
  computedAvailabilityKey,
  propertyDetailsStepDataKey,
  displayedMonthKey,
  updateDisplayedMonthKey,
  appointmentDurationKey,
  loadedWizardStateKey,
  bookingFlowReadyKey,
} from '@/keys/bookingInjectionKeys'
import type { AvailabilityStepOrchestratorContext } from '@/types/booking/availabilityOrchestrator'

export interface UseAvailabilityStepInjectionsReturn extends AvailabilityStepOrchestratorContext {
  isBookingFlowReady: Ref<boolean>
}

export function useAvailabilityStepInjections(): UseAvailabilityStepInjectionsReturn {
  const wizard = inject(wizardKey)
  if (!wizard) {
    throw new Error('Wizard instance not provided. Make sure BookingWizard component provides the wizard instance.')
  }

  const loadedWizardState = inject(loadedWizardStateKey)
  if (!loadedWizardState) {
    throw new Error('loadedWizardState not provided. Make sure BookingWizard provides loadedWizardState.')
  }

  const computedAvailability = inject(computedAvailabilityKey)
  if (!computedAvailability) {
    throw new Error('computedAvailability must be provided by BookingWizard')
  }

  const propertyDetailsStepData = inject(propertyDetailsStepDataKey)
  if (!propertyDetailsStepData) {
    throw new Error('propertyDetailsStepData not provided. Make sure BookingWizard provides propertyDetailsStepData.')
  }

  const displayedMonth = inject(displayedMonthKey)
  const updateDisplayedMonth = inject(updateDisplayedMonthKey)
  if (!displayedMonth || !updateDisplayedMonth) {
    throw new Error('displayedMonth and updateDisplayedMonth must be provided by BookingWizard')
  }

  const appointmentDurationRef = inject(appointmentDurationKey)
  if (!appointmentDurationRef) {
    throw new Error('appointmentDuration must be provided by BookingWizard')
  }

  const isBookingFlowReady = inject(bookingFlowReadyKey)
  if (!isBookingFlowReady) {
    throw new Error('bookingFlowReadyKey must be provided by useBookingWizardSetup / BookingWizard')
  }

  return {
    wizard,
    loadedWizardState,
    computedAvailability,
    propertyDetailsStepData,
    displayedMonth,
    updateDisplayedMonth,
    appointmentDurationRef,
    isBookingFlowReady,
  }
}
