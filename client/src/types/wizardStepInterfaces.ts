import type { Ref } from 'vue'
import type { PropertyDetailsData } from '@/types/propertyForm'
import type { AvailabilityStepData } from '@/types/wizardStepData'

// FIX: Use shared AvailabilityStepData type from wizardStepData.ts
export type { AvailabilityStepData }

/**
 * Property Details Step Data Interface
 * FIX: Use shared PropertyDetailsData type from propertyForm.ts
 */
export type PropertyDetailsStepData = PropertyDetailsData

export interface ContactsStepData {
  clientInfo: { firstName: string; lastName: string; email: string }
  agentInfo: { firstName: string; lastName: string; email: string }
  anotherClientInfo: { firstName: string; lastName: string; email: string }
  transactionManagerInfo: { firstName: string; lastName: string; email: string }
  ownerInfo: { firstName: string; lastName: string; email: string }
  showAnotherClient: boolean
  showTransactionManager: boolean
  showOwner: boolean
}

/**
WHY: Enables useWizardStepSync pattern ...
 */
export interface ConfirmationStepData {
  acknowledged?: boolean
}

export interface WizardStepDataAndValidationRefs {
  propertyDetailsStepData: Ref<PropertyDetailsStepData | null>
  contactsStepData: Ref<ContactsStepData | null>
  availabilityStepData: Ref<AvailabilityStepData | null>
  confirmationStepData: Ref<ConfirmationStepData | null>
  propertyDetailsStepValid: Ref<boolean>
  propertyDetailsStepValidate: Ref<(() => boolean) | null>
  propertyDetailsFieldErrors: Ref<Record<string, string>>
  contactsStepValid: Ref<boolean>
  contactsStepValidate: Ref<(() => boolean) | null>
  availabilityStepValid: Ref<boolean>
  availabilityStepValidate: Ref<(() => boolean) | null>
  confirmationStepValid: Ref<boolean>
  confirmationStepValidate: Ref<(() => boolean) | null>
}