import { computed, type Ref } from 'vue'
import { useFormValidation } from '@/composables/useFormValidation'
import { useStepValidation } from './useStepValidation'
import { CONTACTS_VALIDATION_STRINGS } from '@/configs/contactsValidationStrings'
import type { UseContactsValidationParams, UseContactsValidationReturn } from '@/types/booking/contactsValidation'


import type { ValidationRule } from '@/types/formValidation'
export function useContactsValidation(params: UseContactsValidationParams): UseContactsValidationReturn {
  const {
    clientInfo,
    agentInfo,
    anotherClientInfo,
    transactionManagerInfo,
    ownerInfo,
    showAnotherClient,
    showTransactionManager,
    showOwner,
    requiresAgent
  } = params

  const { required, email } = useFormValidation()

  const validationRules: Record<string, ValidationRule[]> = {
    clientFirstName: [required(CONTACTS_VALIDATION_STRINGS.firstName.required)],
    clientLastName: [required(CONTACTS_VALIDATION_STRINGS.lastName.required)],
    clientEmail: [required(CONTACTS_VALIDATION_STRINGS.email.required), email()],
    agentFirstName: requiresAgent?.value ? [required(CONTACTS_VALIDATION_STRINGS.firstName.required)] : [],
    agentLastName: requiresAgent?.value ? [required(CONTACTS_VALIDATION_STRINGS.lastName.required)] : [],
    agentEmail: requiresAgent?.value ? [required(CONTACTS_VALIDATION_STRINGS.email.required), email()] : [email()],
    anotherClientFirstName: [required(CONTACTS_VALIDATION_STRINGS.firstName.required)],
    anotherClientLastName: [required(CONTACTS_VALIDATION_STRINGS.lastName.required)],
    anotherClientEmail: [required(CONTACTS_VALIDATION_STRINGS.email.required), email()],
    transactionManagerFirstName: [required(CONTACTS_VALIDATION_STRINGS.firstName.required)],
    transactionManagerLastName: [required(CONTACTS_VALIDATION_STRINGS.lastName.required)],
    transactionManagerEmail: [required(CONTACTS_VALIDATION_STRINGS.email.required), email()],
    ownerFirstName: [required(CONTACTS_VALIDATION_STRINGS.firstName.required)],
    ownerLastName: [required(CONTACTS_VALIDATION_STRINGS.lastName.required)],
    ownerEmail: [required(CONTACTS_VALIDATION_STRINGS.email.required), email()]
  }


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
    ownerFirstName: computed(() => ownerInfo.value.firstName),
    ownerLastName: computed(() => ownerInfo.value.lastName),
    ownerEmail: computed(() => ownerInfo.value.email)
  }

  const reactiveRules = computed(() => {
    const rules: Record<string, ValidationRule[]> = {
      clientFirstName: validationRules.clientFirstName,
      clientLastName: validationRules.clientLastName,
      clientEmail: validationRules.clientEmail
    }
    
    if (requiresAgent?.value) {
      rules.agentFirstName = validationRules.agentFirstName
      rules.agentLastName = validationRules.agentLastName
      rules.agentEmail = validationRules.agentEmail
    }

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

    if (showOwner.value) {
      rules.ownerFirstName = validationRules.ownerFirstName
      rules.ownerLastName = validationRules.ownerLastName
      rules.ownerEmail = validationRules.ownerEmail
    }

    return rules
  })

  return useStepValidation({
    formData,
    validationRules: reactiveRules
  })
}


