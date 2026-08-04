import { computed, type Ref } from 'vue'
import { useFormValidation } from '@/composables/useFormValidation'
import { useStepValidation } from './useStepValidation'
import { CONTACTS_VALIDATION_STRINGS } from '@/configs/contactsValidationStrings'
import type { UseContactsValidationParams, UseContactsValidationReturn } from '@/types/booking/contactsValidation'

import type { ValidationRule } from '@/types/formValidation'
export function useContactsValidation(params: UseContactsValidationParams): UseContactsValidationReturn {
  const {
    buyerInfo,
    agentInfo,
    anotherBuyerInfo,
    ownerInfo,
    showAnotherBuyer,
    showOwner,
    requiresAgent
  } = params

  const { required, email } = useFormValidation()

  const validationRules: Record<string, ValidationRule[]> = {
    buyerFirstName: [required(CONTACTS_VALIDATION_STRINGS.firstName.required)],
    buyerLastName: [required(CONTACTS_VALIDATION_STRINGS.lastName.required)],
    buyerEmail: [required(CONTACTS_VALIDATION_STRINGS.email.required), email()],
    agentFirstName: requiresAgent?.value ? [required(CONTACTS_VALIDATION_STRINGS.firstName.required)] : [],
    agentLastName: requiresAgent?.value ? [required(CONTACTS_VALIDATION_STRINGS.lastName.required)] : [],
    agentEmail: requiresAgent?.value ? [required(CONTACTS_VALIDATION_STRINGS.email.required), email()] : [email()],
    anotherBuyerFirstName: [required(CONTACTS_VALIDATION_STRINGS.firstName.required)],
    anotherBuyerLastName: [required(CONTACTS_VALIDATION_STRINGS.lastName.required)],
    anotherBuyerEmail: [required(CONTACTS_VALIDATION_STRINGS.email.required), email()],
    ownerFirstName: [required(CONTACTS_VALIDATION_STRINGS.firstName.required)],
    ownerLastName: [required(CONTACTS_VALIDATION_STRINGS.lastName.required)],
    ownerEmail: [required(CONTACTS_VALIDATION_STRINGS.email.required), email()]
  }


  const formData: Record<string, Ref<unknown>> = {
    buyerFirstName: computed(() => buyerInfo.value.firstName),
    buyerLastName: computed(() => buyerInfo.value.lastName),
    buyerEmail: computed(() => buyerInfo.value.email),
    agentFirstName: computed(() => agentInfo.value.firstName),
    agentLastName: computed(() => agentInfo.value.lastName),
    agentEmail: computed(() => agentInfo.value.email),
    anotherBuyerFirstName: computed(() => anotherBuyerInfo.value.firstName),
    anotherBuyerLastName: computed(() => anotherBuyerInfo.value.lastName),
    anotherBuyerEmail: computed(() => anotherBuyerInfo.value.email),
    ownerFirstName: computed(() => ownerInfo.value.firstName),
    ownerLastName: computed(() => ownerInfo.value.lastName),
    ownerEmail: computed(() => ownerInfo.value.email)
  }

  const reactiveRules = computed(() => {
    const rules: Record<string, ValidationRule[]> = {
      buyerFirstName: validationRules.buyerFirstName,
      buyerLastName: validationRules.buyerLastName,
      buyerEmail: validationRules.buyerEmail
    }
    
    if (requiresAgent?.value) {
      rules.agentFirstName = validationRules.agentFirstName
      rules.agentLastName = validationRules.agentLastName
      rules.agentEmail = validationRules.agentEmail
    }

    if (showAnotherBuyer.value) {
      rules.anotherBuyerFirstName = validationRules.anotherBuyerFirstName
      rules.anotherBuyerLastName = validationRules.anotherBuyerLastName
      rules.anotherBuyerEmail = validationRules.anotherBuyerEmail
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
