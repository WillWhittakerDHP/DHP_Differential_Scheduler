<script setup lang="ts">
/**
 * ContactsStep Component
 * 
 * LEARNING: Fourth step for contact information collection
 * WHY: Collects contact details for all parties involved in the inspection
 * PATTERN: Always-visible forms for Client/Agent, optional sections with add/delete
 * COMPARISON: React uses FormControlLabel. Vue uses VTextField with VFormControl
 * 
 * Phase 1.2.3: Added support for loading contact data from appointments
 */

import { inject, watch, computed, type Ref } from 'vue'
import { useContactsStepData } from '@/composables/booking/useContactsStepData'
import { useContactsValidation } from '@/composables/booking/useContactsValidation'
import type { WizardStateData } from '@/utils/transformers/appointmentToWizardTransformer'
import type { ContactsStepData } from '@/types/wizard'
import { useWizard } from '@/composables/booking/useWizard'

// LEARNING: Inject loaded wizard state for populating form fields
// WHY: Enables populating contact information from loaded appointment
// PATTERN: Inject provided loadedWizardState and pass to composable
const loadedWizardState = inject<Ref<WizardStateData | null>>('loadedWizardState')

// LEARNING: Access wizard state to check if selected services require agent
// WHY: Some services require agent contact info (e.g., Buyers Inspection), others don't
// PATTERN: Check requires_agent flag on selected service blocks
// SESSION 1.5.3: Use database-driven requires_agent flag instead of hardcoded always-required
const wizard = useWizard()

/**
 * LEARNING: Check if any selected services require agent contact information
 * WHY: Replaces hardcoded "agent always required" with service-specific business rule
 * PATTERN: Database flag (requires_agent) on block_instances
 * SESSION 1.5.3: Database-driven agent requirement
 */
const requiresAgent = computed(() => {
  return wizard.selectedServiceBlocks.value.some(
    selected => selected.requires_agent === true
  )
})

// LEARNING: Use contacts step data composable for contact form state management
// WHY: Extracts contact form state and loaded wizard state handling from component
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

// LEARNING: Use contacts validation composable for validation logic
// WHY: Extracts validation logic from component to composable
// PATTERN: Composable handles all validation rules, error state, and validation functions
// SESSION 1.5.3: Now passes requiresAgent to conditionally require agent fields
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

// LEARNING: Inject parent-provided refs for step data and validation state
// WHY: Parent provides refs that children write to (provide/inject only works parent-to-child)
// PATTERN: Inject refs from parent, sync local state to them
const parentContactsStepData = inject<Ref<ContactsStepData | null>>('contactsStepData')
const parentContactsStepValid = inject<Ref<boolean>>('contactsStepValid')
const parentContactsStepValidate = inject<Ref<(() => boolean) | null>>('contactsStepValidate')

if (!parentContactsStepData || !parentContactsStepValid || !parentContactsStepValidate) {
  throw new Error('Parent-provided refs not found. Make sure BookingWizard provides contactsStepData, contactsStepValid, and contactsStepValidate.')
}

// LEARNING: Sync local stepData to parent-provided ref
// WHY: Enables BookingWizard to collect contact form data
// PATTERN: Watch local stepData and update parent ref
watch(stepData, (newData) => {
  if (parentContactsStepData) {
    parentContactsStepData.value = newData
  }
}, { immediate: true, deep: true })

// LEARNING: Sync local validation state to parent-provided refs
// WHY: Enables BookingWizard to check step validity before navigation
// PATTERN: Watch local validation state and update parent refs
watch(isFormValid, (newValid) => {
  if (parentContactsStepValid) {
    parentContactsStepValid.value = newValid
  }
}, { immediate: true })

// LEARNING: Assign validateForm function directly to parent ref
// WHY: validateForm is a function, not a ref, so we assign it directly
// PATTERN: Assign function to parent ref (no watch needed)
parentContactsStepValidate.value = validateForm
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
  // Component-specific styles if needed
}
</style>

