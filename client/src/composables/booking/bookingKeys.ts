/**
 * Typed InjectionKey constants for booking wizard context, availability, and date.
 * PATTERN: Use these keys in provide() and inject() for type-safe dependency injection.
 */
import type { InjectionKey } from 'vue'
import type { Ref } from 'vue'
import type { UseBookingWizardReturn } from '@/types/wizard'
import type { DisplayedMonth } from '@/types/booking/dateRangeDecider'
import type { UseComputedAvailabilityReturn } from '@/types/booking/computedAvailability'
import type { WizardStateData } from '@/utils/transformers/appointmentToWizardTransformer'

export const availabilityStepValidateKey: InjectionKey<Ref<(() => boolean) | null>> =
  Symbol('availabilityStepValidate')
export const confirmationStepValidKey: InjectionKey<Ref<boolean>> =
  Symbol('confirmationStepValid')
export const confirmationStepValidateKey: InjectionKey<Ref<(() => boolean) | null>> =
  Symbol('confirmationStepValidate')

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
