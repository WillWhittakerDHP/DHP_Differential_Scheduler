import type { Component } from 'vue'
import ConfirmationStep from '@/components/booking/steps/ConfirmationStep.vue'
import ServiceSelectionStep from '@/components/booking/steps/ServiceSelectionStep.vue'
import PropertyDetailsStep from '@/components/booking/steps/PropertyDetailsStep.vue'
import AvailabilityStep from '@/components/booking/steps/AvailabilityStep.vue'
import ContactsStep from '@/components/booking/steps/ContactsStep.vue'

export function getBookingWizardStepContent(step: number): Component | null {
  switch (step) {
    case 0:
      return ServiceSelectionStep
    case 1:
      return PropertyDetailsStep
    case 2:
      return AvailabilityStep
    case 3:
      return ContactsStep
    case 4:
      return ConfirmationStep
    default:
      return null
  }
}


