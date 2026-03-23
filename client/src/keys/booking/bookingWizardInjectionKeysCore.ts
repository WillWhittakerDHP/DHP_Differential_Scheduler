/**
 * Wizard root / flow readiness / dev signals.
 * @see bookingInjectionKeys barrel for stable import path.
 */
import type { InjectionKey } from 'vue'
import type { Ref, ComputedRef } from 'vue'
import type { UseBookingWizardReturn } from '@/types/wizard'
import type { WizardStateData } from '@/utils/transformers/appointmentToWizardTransformer'
import type { DevPanelButtonsContext } from '@/types/booking/devPanelButtonsContext'

export const resetMocksSignalKey: InjectionKey<Ref<number>> = Symbol('resetMocksSignal')

/** App root ref for wizard dev panel actions; provider: App.vue. */
export const devPanelButtonsKey: InjectionKey<Ref<DevPanelButtonsContext | null>> =
  Symbol('devPanelButtons')

/** True when global data, booking transform, wizard settings, and flow availability load have settled. Provider: useBookingWizardSetup. */
export const bookingFlowReadyKey: InjectionKey<ComputedRef<boolean>> = Symbol('bookingFlowReady')

/** Typed key for booking wizard context (flat contract). Provider: BookingWizard.vue. */
export const wizardKey: InjectionKey<UseBookingWizardReturn> = Symbol('wizard')

/** Ref to loaded wizard state (from appointment load). Provider: useBookingWizardSetup. */
export const loadedWizardStateKey: InjectionKey<Ref<WizardStateData | null>> =
  Symbol('loadedWizardState')
