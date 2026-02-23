import type { Component } from 'vue'
import { defineAsyncComponent } from 'vue'

export function getBookingWizardStepContent(step: number): Component | null {
  switch (step) {
    case 0:
      return defineAsyncComponent(() => import('@/components/booking/steps/ServiceSelectionStep.vue'))
    case 1:
      return defineAsyncComponent(() => import('@/components/booking/steps/PropertyDetailsStep.vue'))
    case 2:
      return defineAsyncComponent(() => import('@/components/booking/steps/AvailabilityStep.vue'))
    case 3:
      return defineAsyncComponent(() => import('@/components/booking/steps/ContactsStep.vue'))
    case 4:
      return defineAsyncComponent(() => import('@/components/booking/steps/ConfirmationStep.vue'))
    default:
      return null
  }
}


