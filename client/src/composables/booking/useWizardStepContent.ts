/**
 * WHY: useWizardStepContent Composable - step-to-component mapping for booking wizard.
 */
import type { Component } from 'vue'
import { defineAsyncComponent } from 'vue'
import type { UseWizardStepContentReturn } from '@/types/booking/wizardStepContent'


function getBookingWizardStepContent(step: number): Component | null {
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

export function useWizardStepContent(): UseWizardStepContentReturn {
  const getStepContent = (step: number): Component | null => {
    return getBookingWizardStepContent(step)
  }

  return {
    getStepContent
  }
}

