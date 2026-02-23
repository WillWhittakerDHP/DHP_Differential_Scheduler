<script setup lang="ts">
/**
 * ContactsStep Component
 * 
 * 
 * Phase 1.2.3: Added support for loading contact data from appointments
 */

import { inject, computed, type Ref } from 'vue'
import { useWizardStepSync } from '@/composables/booking/useWizardStepSync'
import { useContactsStepData } from '@/composables/booking/useContactsStepData'
import { useContactsValidation } from '@/composables/booking/useContactsValidation'
import type { WizardStateData } from '@/utils/transformers/appointmentToWizardTransformer'
import type { UseBookingWizardReturn } from '@/types/wizard'

const loadedWizardState = inject<Ref<WizardStateData | null>>('loadedWizardState')

/**
 */
const wizard = inject<UseBookingWizardReturn>('wizard')

if (!wizard) {
  throw new Error('Wizard instance not found. Make sure BookingWizard provides wizard.')
}

/**
 */
const requiresAgent = computed(() => {
  return wizard.selectedServiceTypeBlocks.value.some(
    selected => selected.requiresAgent === true
  )
})

// LEARNING: Use contacts step data composable for contact form state management
// PATTERN: Composable handles all contact form data and optional section visibility
const contactsStepData = useContactsStepData({
  loadedWizardState
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
  stepDataKey: 'contactsStepData',
  stepValidKey: 'contactsStepValid',
  stepValidateKey: 'contactsStepValidate',
})
</script>

<template>
  <div class="contacts-step">
    <!-- LEARNING: Header Section -->
    <!-- WHY: Introduces the step purpose -->
    <!-- PATTERN: Heading with descriptive subtitle -->
    <VRow>
      <VCol cols="12">
        <h4 class="text-h4 mb-2">Contact Information</h4>
        <p class="text-body-2 mb-4">
          Add contact info for all interested parties who will receive inspection correspondence
        </p>
      </VCol>
    </VRow>
    
    <!-- LEARNING: Client Information Form (Always Visible) -->
    <!-- WHY: Client contact is required for all appointments -->
    <!-- PATTERN: VRow/VCol grid with VTextField components -->
    <VRow class="mt-5">
      <VCol cols="12">
        <h6 class="text-h6 mb-4">Client Information</h6>
      </VCol>
      <VCol cols="12" md="4">
        <VTextField
          v-model="clientInfo.firstName"
          label="First Name"
          placeholder="Joe"
          :rules="validationRules.clientFirstName"
          :error-messages="fieldErrors.clientFirstName ? [fieldErrors.clientFirstName] : []"
          full-width
          required
        />
      </VCol>
      <VCol cols="12" md="4">
        <VTextField
          v-model="clientInfo.lastName"
          label="Last Name"
          placeholder="Smith"
          :rules="validationRules.clientLastName"
          :error-messages="fieldErrors.clientLastName ? [fieldErrors.clientLastName] : []"
          full-width
          required
        />
      </VCol>
      <VCol cols="12" md="4">
        <VTextField
          v-model="clientInfo.email"
          type="email"
          label="Email"
          placeholder="joe.smith@xyz.com"
          :rules="validationRules.clientEmail"
          :error-messages="fieldErrors.clientEmail ? [fieldErrors.clientEmail] : []"
          full-width
          required
        />
      </VCol>
    </VRow>
    
    <!-- LEARNING: Agent Information Form (Always Visible) -->
    <!-- WHY: Agent contact is required for all appointments -->
    <!-- PATTERN: VRow/VCol grid with VTextField components -->
    <VRow class="mt-5">
      <VCol cols="12">
        <h6 class="text-h6 mb-4">Agent Information</h6>
      </VCol>
      <VCol cols="12" md="4">
        <VTextField
          v-model="agentInfo.firstName"
          label="First Name"
          placeholder="Jane"
          :rules="validationRules.agentFirstName"
          :error-messages="fieldErrors.agentFirstName ? [fieldErrors.agentFirstName] : []"
          full-width
          required
        />
      </VCol>
      <VCol cols="12" md="4">
        <VTextField
          v-model="agentInfo.lastName"
          label="Last Name"
          placeholder="Doe"
          :rules="validationRules.agentLastName"
          :error-messages="fieldErrors.agentLastName ? [fieldErrors.agentLastName] : []"
          full-width
          required
        />
      </VCol>
      <VCol cols="12" md="4">
        <VTextField
          v-model="agentInfo.email"
          type="email"
          label="Email"
          placeholder="jane.doe@realty.com"
          :rules="validationRules.agentEmail"
          :error-messages="fieldErrors.agentEmail ? [fieldErrors.agentEmail] : []"
          full-width
          required
        />
      </VCol>
    </VRow>
    
    <!-- LEARNING: Another Client Section (Optional) -->
    <!-- WHY: Allows adding additional client contacts -->
    <!-- PATTERN: Conditional rendering with delete button -->
    <VRow v-if="showAnotherClient" class="mt-5">
      <VCol cols="12">
        <div class="d-flex align-center mb-4">
          <h6 class="text-h6 mb-0">Another Client Information</h6>
          <VBtn
            icon
            color="inherit"
            size="small"
            variant="text"
            class="ml-2"
            @click="toggleSection('anotherClient', false)"
          >
            <VIcon icon="tabler-trash" />
          </VBtn>
        </div>
      </VCol>
      <VCol cols="12" md="4">
        <VTextField
          v-model="anotherClientInfo.firstName"
          label="First Name"
          placeholder="Joe"
          :rules="validationRules.anotherClientFirstName"
          :error-messages="fieldErrors.anotherClientFirstName ? [fieldErrors.anotherClientFirstName] : []"
          full-width
          required
        />
      </VCol>
      <VCol cols="12" md="4">
        <VTextField
          v-model="anotherClientInfo.lastName"
          label="Last Name"
          placeholder="Smith"
          :rules="validationRules.anotherClientLastName"
          :error-messages="fieldErrors.anotherClientLastName ? [fieldErrors.anotherClientLastName] : []"
          full-width
          required
        />
      </VCol>
      <VCol cols="12" md="4">
        <VTextField
          v-model="anotherClientInfo.email"
          type="email"
          label="Email"
          placeholder="joe.smith@xyz.com"
          :rules="validationRules.anotherClientEmail"
          :error-messages="fieldErrors.anotherClientEmail ? [fieldErrors.anotherClientEmail] : []"
          full-width
          required
        />
      </VCol>
    </VRow>
    
    <!-- LEARNING: Transaction Manager Section (Optional) -->
    <!-- WHY: Allows adding transaction manager contact -->
    <!-- PATTERN: Conditional rendering with delete button -->
    <VRow v-if="showTransactionManager" class="mt-5">
      <VCol cols="12">
        <div class="d-flex align-center mb-4">
          <h6 class="text-h6 mb-0">Transaction Manager Information</h6>
          <VBtn
            icon
            color="inherit"
            size="small"
            variant="text"
            class="ml-2"
            @click="toggleSection('transactionManager', false)"
          >
            <VIcon icon="tabler-trash" />
          </VBtn>
        </div>
      </VCol>
      <VCol cols="12" md="4">
        <VTextField
          v-model="transactionManagerInfo.firstName"
          label="First Name"
          placeholder="Bob"
          :rules="validationRules.transactionManagerFirstName"
          :error-messages="fieldErrors.transactionManagerFirstName ? [fieldErrors.transactionManagerFirstName] : []"
          full-width
          required
        />
      </VCol>
      <VCol cols="12" md="4">
        <VTextField
          v-model="transactionManagerInfo.lastName"
          label="Last Name"
          placeholder="Johnson"
          :rules="validationRules.transactionManagerLastName"
          :error-messages="fieldErrors.transactionManagerLastName ? [fieldErrors.transactionManagerLastName] : []"
          full-width
          required
        />
      </VCol>
      <VCol cols="12" md="4">
        <VTextField
          v-model="transactionManagerInfo.email"
          type="email"
          label="Email"
          placeholder="bob.johnson@title.com"
          :rules="validationRules.transactionManagerEmail"
          :error-messages="fieldErrors.transactionManagerEmail ? [fieldErrors.transactionManagerEmail] : []"
          full-width
          required
        />
      </VCol>
    </VRow>
    
    <!-- LEARNING: Seller Section (Optional) -->
    <!-- WHY: Allows adding seller contact -->
    <!-- PATTERN: Conditional rendering with delete button -->
    <VRow v-if="showSeller" class="mt-5">
      <VCol cols="12">
        <div class="d-flex align-center mb-4">
          <h6 class="text-h6 mb-0">Seller Information</h6>
          <VBtn
            icon
            color="inherit"
            size="small"
            variant="text"
            class="ml-2"
            @click="toggleSection('seller', false)"
          >
            <VIcon icon="tabler-trash" />
          </VBtn>
        </div>
      </VCol>
      <VCol cols="12" md="4">
        <VTextField
          v-model="sellerInfo.firstName"
          label="First Name"
          placeholder="Alice"
          :rules="validationRules.sellerFirstName"
          :error-messages="fieldErrors.sellerFirstName ? [fieldErrors.sellerFirstName] : []"
          full-width
          required
        />
      </VCol>
      <VCol cols="12" md="4">
        <VTextField
          v-model="sellerInfo.lastName"
          label="Last Name"
          placeholder="Williams"
          :rules="validationRules.sellerLastName"
          :error-messages="fieldErrors.sellerLastName ? [fieldErrors.sellerLastName] : []"
          full-width
          required
        />
      </VCol>
      <VCol cols="12" md="4">
        <VTextField
          v-model="sellerInfo.email"
          type="email"
          label="Email"
          placeholder="alice.williams@example.com"
          :rules="validationRules.sellerEmail"
          :error-messages="fieldErrors.sellerEmail ? [fieldErrors.sellerEmail] : []"
          full-width
          required
        />
      </VCol>
    </VRow>
    
    <!-- LEARNING: Add Section Buttons -->
    <!-- WHY: Allows users to add optional contact sections -->
    <!-- PATTERN: VBtn components with disabled state when section already visible -->
    <VRow class="mt-5">
      <VCol cols="12" md="9">
        <VBtn
          variant="outlined"
          size="small"
          class="mr-2"
          :disabled="showAnotherClient"
          @click="toggleSection('anotherClient', true)"
        >
          Add Another Client
        </VBtn>
        <VBtn
          variant="outlined"
          size="small"
          class="mr-2"
          :disabled="showTransactionManager"
          @click="toggleSection('transactionManager', true)"
        >
          Add Transaction Manager
        </VBtn>
        <VBtn
          variant="outlined"
          size="small"
          :disabled="showSeller"
          @click="toggleSection('seller', true)"
        >
          Add Seller
        </VBtn>
      </VCol>
    </VRow>
  </div>
</template>

<style scoped lang="scss">
.contacts-step {
}
</style>

