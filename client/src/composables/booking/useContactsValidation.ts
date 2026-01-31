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
    showSeller
  } = params

  const { required, email } = useFormValidation()

  /**
   * LEARNING: Form validation rules
   * WHY: Defines validation rules for each contact form field
   * PATTERN: Object with field names as keys and arrays of ValidationRule as values
   * LEARNING: Use centralized validation strings from config
   * WHY: Reduces hardcoding audit findings, centralizes all validation text for consistency
   * PATTERN: Import validation strings from config file instead of defining inline
   */
  const validationRules: Record<string, ValidationRule[]> = {
    clientFirstName: [required(CONTACTS_VALIDATION_STRINGS.firstName.required)],
    clientLastName: [required(CONTACTS_VALIDATION_STRINGS.lastName.required)],
    clientEmail: [required(CONTACTS_VALIDATION_STRINGS.email.required), email()],
    agentFirstName: [required(CONTACTS_VALIDATION_STRINGS.firstName.required)],
    agentLastName: [required(CONTACTS_VALIDATION_STRINGS.lastName.required)],
    agentEmail: [required(CONTACTS_VALIDATION_STRINGS.email.required), email()],
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

  // Create reactive rules that exclude optional fields when not visible
  const reactiveRules = computed(() => {
    const rules: Record<string, ValidationRule[]> = {
      clientFirstName: validationRules.clientFirstName,
      clientLastName: validationRules.clientLastName,
      clientEmail: validationRules.clientEmail,
      agentFirstName: validationRules.agentFirstName,
      agentLastName: validationRules.agentLastName,
      agentEmail: validationRules.agentEmail
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



