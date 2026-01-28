/**
 * LEARNING: Wizard Step Data Refs Management
 * WHY: Encapsulates step data and validation state refs creation and provide/inject setup
 * PATTERN: Composable for managing step data refs and validation state refs
 * 
 * Used by:
 * - BookingWizard.vue
 */

import { ref, provide, type Ref } from 'vue'
import type { PropertyDetailsStepData, ContactsStepData, AvailabilityStepData } from '@/types/wizard'

export interface UseWizardStepDataRefsReturn {
  // Step data refs
  propertyDetailsStepData: Ref<PropertyDetailsStepData | null>
  contactsStepData: Ref<ContactsStepData | null>
  availabilityStepData: Ref<AvailabilityStepData | null>
  
  // Step validation state refs
  propertyDetailsStepValid: Ref<boolean>
  propertyDetailsStepValidate: Ref<(() => boolean) | null>
  propertyDetailsFieldErrors: Ref<Record<string, string>>
  contactsStepValid: Ref<boolean>
  contactsStepValidate: Ref<(() => boolean) | null>
  availabilityStepValid: Ref<boolean>
  availabilityStepValidate: Ref<(() => boolean) | null>
}

/**
 * LEARNING: Create and provide step data refs and validation state refs
 * WHY: Parent provides refs that children write to (provide/inject only works parent-to-child)
 * PATTERN: Create refs in composable, provide to children, return refs for parent access
 */
export function useWizardStepDataRefs(): UseWizardStepDataRefsReturn {
  // Step data refs
  const propertyDetailsStepData = ref<PropertyDetailsStepData | null>(null)
  const contactsStepData = ref<ContactsStepData | null>(null)
  const availabilityStepData = ref<AvailabilityStepData | null>(null)

  // Step validation state refs
  const propertyDetailsStepValid = ref<boolean>(false)
  const propertyDetailsStepValidate = ref<(() => boolean) | null>(null)
  const propertyDetailsFieldErrors = ref<Record<string, string>>({})
  const contactsStepValid = ref<boolean>(false)
  const contactsStepValidate = ref<(() => boolean) | null>(null)
  const availabilityStepValid = ref<boolean>(false)
  const availabilityStepValidate = ref<(() => boolean) | null>(null)

  // Provide step data refs to children
  provide('propertyDetailsStepData', propertyDetailsStepData)
  provide('contactsStepData', contactsStepData)
  provide('availabilityStepData', availabilityStepData)

  // Provide validation state refs to children
  provide('propertyDetailsStepValid', propertyDetailsStepValid)
  provide('propertyDetailsStepValidate', propertyDetailsStepValidate)
  provide('propertyDetailsFieldErrors', propertyDetailsFieldErrors)
  provide('contactsStepValid', contactsStepValid)
  provide('contactsStepValidate', contactsStepValidate)
  provide('availabilityStepValid', availabilityStepValid)
  provide('availabilityStepValidate', availabilityStepValidate)

  return {
    propertyDetailsStepData,
    contactsStepData,
    availabilityStepData,
    propertyDetailsStepValid,
    propertyDetailsStepValidate,
    propertyDetailsFieldErrors,
    contactsStepValid,
    contactsStepValidate,
    availabilityStepValid,
    availabilityStepValidate,
  }
}
