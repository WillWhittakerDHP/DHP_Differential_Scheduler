<script setup lang="ts">

import { inject, computed, provide } from 'vue'
import { useWizardStepSync } from '@/composables/booking/useWizardStepSync'
import {
  contactsStepDataKey,
  contactsStepValidKey,
  contactsStepValidateKey,
  contactsFormContextKey,
  wizardKey,
  loadedWizardStateKey,
} from '@/composables/booking/injectionKeys'
import { useContactsStepData } from '@/composables/booking/useContactsStepData'
import { useContactsValidation } from '@/composables/booking/useContactsValidation'
import ContactFormSection from './ContactFormSection.vue'

const loadedWizardState = inject(loadedWizardStateKey)
const parentContactsStepData = inject(contactsStepDataKey) ?? null

const wizard = inject(wizardKey)

if (!wizard) {
  throw new Error('Wizard instance not found. Make sure BookingWizard provides wizard.')
}

const requiresAgent = computed(() => {
  return wizard.selectedServiceTypeBlocks.value.some(
    selected => selected.requiresAgent === true
  )
})

// PATTERN: Composable handles all contact form data and optional section visibility
const contactsStepData = useContactsStepData({
  loadedWizardState,
  restoreFrom: parentContactsStepData ?? undefined
})

const {
  clientInfo,
  agentInfo,
  anotherClientInfo,
  transactionManagerInfo,
  sellerInfo,
  showAnotherClient,
  showTransactionManager,
  showSeller,
  stepData,
  toggleSection
} = contactsStepData

/**
 * PATTERN: Composable handles validation rules, error state, and validation functions
 */
const {
  validationRules,
  fieldErrors,
  isFormValid,
  validateForm
} = useContactsValidation({
  clientInfo,
  agentInfo,
  anotherClientInfo,
  transactionManagerInfo,
  sellerInfo,
  showAnotherClient,
  showTransactionManager,
  showSeller,
  requiresAgent
})

useWizardStepSync({
  stepData,
  isFormValid,
  validateForm,
  stepDataKey: contactsStepDataKey,
  stepValidKey: contactsStepValidKey,
  stepValidateKey: contactsStepValidateKey,
})

provide(contactsFormContextKey, {
  clientInfo,
  agentInfo,
  anotherClientInfo,
  transactionManagerInfo,
  sellerInfo,
  showAnotherClient,
  showTransactionManager,
  showSeller,
  validationRules,
  fieldErrors,
  toggleSection,
})
</script>

<template>
  <div class="contacts-step">
    <!-- WHY: Introduces the step purpose -->
    <!-- PATTERN: Heading with descriptive subtitle -->
    <VRow>
      <VCol cols="12">
        <h4 class="text-headline-large mb-2">Contact Information</h4>
        <p class="text-body-medium mb-4">
          Add contact info for all interested parties who will receive inspection correspondence
        </p>
      </VCol>
    </VRow>

    <ContactFormSection />
  </div>
</template>

<style scoped lang="scss">
.contacts-step {
}
</style>
