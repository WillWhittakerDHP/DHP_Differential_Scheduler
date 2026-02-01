/**
 * useContactsValidation Composable
 * 
 * LEARNING: Thin wrapper around generic useStepValidation
 * WHY: Provides step-specific validation rules using generic pattern
 */

import { computed, type Ref } from 'vue'
import { useFormValidation } from '@/composables/useFormValidation'
import type { ValidationRule } from '@/composables/useFormValidation'
import { useStepValidation, type UseStepValidationReturn } from './useStepValidation'
import type { ContactInfo } from './useContactsStepData'
import type { ReadonlyVueRef } from '@/types/vueRefTypes'
import { CONTACTS_VALIDATION_STRINGS } from '@/configs/contactsValidationStrings'

/**
 * useContactsValidation composable parameters
 */
export interface UseContactsValidationParams {
  clientInfo: Ref<ContactInfo>
  agentInfo: Ref<ContactInfo>
  anotherClientInfo: Ref<ContactInfo>
  transactionManagerInfo: Ref<ContactInfo>
  sellerInfo: Ref<ContactInfo>
  showAnotherClient: ReadonlyVueRef<boolean>
  showTransactionManager: ReadonlyVueRef<boolean>
  showSeller: ReadonlyVueRef<boolean>
  requiresAgent?: ReadonlyVueRef<boolean> // Optional: if true, agent fields are required (Session 1.5.3)
}

/**
 * useContactsValidation composable return type
 */
export type UseContactsValidationReturn = UseStepValidationReturn

/**
 * useContactsValidation composable
 * 
 * LEARNING: Thin wrapper around generic useStepValidation
 * WHY: Provides step-specific validation rules using generic pattern
 */
export function useContactsValidation(params: UseContactsValidationParams): UseContactsValidationReturn {
  const {
    clientInfo,
    agentInfo,
    anotherClientInfo,
    transactionManagerInfo,
    sellerInfo,
    showAnotherClient,
    showTransactionManager,
    showSeller,
    requiresAgent
  } = params

  const { required, email } = useFormValidation()

  /**
   * WHY: Agent fields conditionally required based on selected services (some require agent, others don't)
   * PATTERN: requiresAgent parameter determines if agent validation rules apply
   * LEARNING: Centralized validation strings from config reduce hardcoding
   */
  const validationRules: Record<string, ValidationRule[]> = {
    clientFirstName: [required(CONTACTS_VALIDATION_STRINGS.firstName.required)],
    clientLastName: [required(CONTACTS_VALIDATION_STRINGS.lastName.required)],
    clientEmail: [required(CONTACTS_VALIDATION_STRINGS.email.required), email()],
    // Agent fields: conditionally required based on selected services (Session 1.5.3)
    agentFirstName: requiresAgent?.value ? [required(CONTACTS_VALIDATION_STRINGS.firstName.required)] : [],
    agentLastName: requiresAgent?.value ? [required(CONTACTS_VALIDATION_STRINGS.lastName.required)] : [],
    agentEmail: requiresAgent?.value ? [required(CONTACTS_VALIDATION_STRINGS.email.required), email()] : [email()],
    anotherClientFirstName: [required(CONTACTS_VALIDATION_STRINGS.firstName.required)],
    anotherClientLastName: [required(CONTACTS_VALIDATION_STRINGS.lastName.required)],
    anotherClientEmail: [required(CONTACTS_VALIDATION_STRINGS.email.required), email()],
    transactionManagerFirstName: [required(CONTACTS_VALIDATION_STRINGS.firstName.required)],
    transactionManagerLastName: [required(CONTACTS_VALIDATION_STRINGS.lastName.required)],
    transactionManagerEmail: [required(CONTACTS_VALIDATION_STRINGS.email.required), email()],
    sellerFirstName: [required(CONTACTS_VALIDATION_STRINGS.firstName.required)],
    sellerLastName: [required(CONTACTS_VALIDATION_STRINGS.lastName.required)],
    sellerEmail: [required(CONTACTS_VALIDATION_STRINGS.email.required), email()]
  }

  // No custom validators needed - conditional rules handle optional contacts

  // Flatten formData structure for generic validation
  const formData: Record<string, Ref<unknown>> = {
    clientFirstName: computed(() => clientInfo.value.firstName),
    clientLastName: computed(() => clientInfo.value.lastName),
    clientEmail: computed(() => clientInfo.value.email),
    agentFirstName: computed(() => agentInfo.value.firstName),
    agentLastName: computed(() => agentInfo.value.lastName),
    agentEmail: computed(() => agentInfo.value.email),
    anotherClientFirstName: computed(() => anotherClientInfo.value.firstName),
    anotherClientLastName: computed(() => anotherClientInfo.value.lastName),
    anotherClientEmail: computed(() => anotherClientInfo.value.email),
    transactionManagerFirstName: computed(() => transactionManagerInfo.value.firstName),
    transactionManagerLastName: computed(() => transactionManagerInfo.value.lastName),
    transactionManagerEmail: computed(() => transactionManagerInfo.value.email),
    sellerFirstName: computed(() => sellerInfo.value.firstName),
    sellerLastName: computed(() => sellerInfo.value.lastName),
    sellerEmail: computed(() => sellerInfo.value.email)
  }

  /**
   * WHY: Validation rules only apply to visible/required fields (reactive rules based on flags)
   * PATTERN: Computed property dynamically builds rules object based on requiresAgent
   */
  const reactiveRules = computed(() => {
    const rules: Record<string, ValidationRule[]> = {
      clientFirstName: validationRules.clientFirstName,
      clientLastName: validationRules.clientLastName,
      clientEmail: validationRules.clientEmail
    }
    
    // Add agent rules only if agent is required (Session 1.5.3)
    if (requiresAgent?.value) {
      rules.agentFirstName = validationRules.agentFirstName
      rules.agentLastName = validationRules.agentLastName
      rules.agentEmail = validationRules.agentEmail
    }

    // Add optional contact rules only if visible
    if (showAnotherClient.value) {
      rules.anotherClientFirstName = validationRules.anotherClientFirstName
      rules.anotherClientLastName = validationRules.anotherClientLastName
      rules.anotherClientEmail = validationRules.anotherClientEmail
    }

    if (showTransactionManager.value) {
      rules.transactionManagerFirstName = validationRules.transactionManagerFirstName
      rules.transactionManagerLastName = validationRules.transactionManagerLastName
      rules.transactionManagerEmail = validationRules.transactionManagerEmail
    }

    if (showSeller.value) {
      rules.sellerFirstName = validationRules.sellerFirstName
      rules.sellerLastName = validationRules.sellerLastName
      rules.sellerEmail = validationRules.sellerEmail
    }

    return rules
  })

  return useStepValidation({
    formData,
    validationRules: reactiveRules
  })
}



