<!--
  Extracted form fields from ContactsStep for component-health (allowlist repair).
  Consumes contacts form context via provide/inject.
-->
<template>
  <div class="contact-form-section">
    <VRow class="mt-5">
      <VCol cols="12">
        <h6 class="text-headline-small mb-4">Buyer Information</h6>
      </VCol>
      <VCol cols="12" md="4">
        <WizardTextField
          v-model="buyerInfo.firstName"
          label="First Name"
          placeholder="Joe"
          :rules="validationRules.buyerFirstName"
          :field-errors="fieldErrors"
          error-key="buyerFirstName"
          required
        />
      </VCol>
      <VCol cols="12" md="4">
        <WizardTextField
          v-model="buyerInfo.lastName"
          label="Last Name"
          placeholder="Smith"
          :rules="validationRules.buyerLastName"
          :field-errors="fieldErrors"
          error-key="buyerLastName"
          required
        />
      </VCol>
      <VCol cols="12" md="4">
        <WizardTextField
          v-model="buyerInfo.email"
          type="email"
          label="Email"
          placeholder="joe.smith@xyz.com"
          :rules="validationRules.buyerEmail"
          :field-errors="fieldErrors"
          error-key="buyerEmail"
          required
        />
      </VCol>
    </VRow>

    <VRow class="mt-5">
      <VCol cols="12">
        <h6 class="text-headline-small mb-4">Agent Information</h6>
      </VCol>
      <VCol cols="12" md="4">
        <WizardTextField
          v-model="agentInfo.firstName"
          label="First Name"
          placeholder="Jane"
          :rules="validationRules.agentFirstName"
          :field-errors="fieldErrors"
          error-key="agentFirstName"
          required
        />
      </VCol>
      <VCol cols="12" md="4">
        <WizardTextField
          v-model="agentInfo.lastName"
          label="Last Name"
          placeholder="Doe"
          :rules="validationRules.agentLastName"
          :field-errors="fieldErrors"
          error-key="agentLastName"
          required
        />
      </VCol>
      <VCol cols="12" md="4">
        <WizardTextField
          v-model="agentInfo.email"
          type="email"
          label="Email"
          placeholder="jane.doe@realty.com"
          :rules="validationRules.agentEmail"
          :field-errors="fieldErrors"
          error-key="agentEmail"
          required
        />
      </VCol>
    </VRow>

    <VRow v-if="showAnotherBuyer" class="mt-5">
      <VCol cols="12">
        <div class="d-flex align-center mb-4">
          <h6 class="text-headline-small mb-0">Another Buyer Information</h6>
          <VBtn
            icon
            color="inherit"
            size="small"
            variant="text"
            class="ml-2"
            @click="toggleSection('anotherBuyer', false)"
          >
            <VIcon icon="tabler-trash" />
          </VBtn>
        </div>
      </VCol>
      <VCol cols="12" md="4">
        <WizardTextField
          v-model="anotherBuyerInfo.firstName"
          label="First Name"
          placeholder="Joe"
          :rules="validationRules.anotherBuyerFirstName"
          :field-errors="fieldErrors"
          error-key="anotherBuyerFirstName"
          required
        />
      </VCol>
      <VCol cols="12" md="4">
        <WizardTextField
          v-model="anotherBuyerInfo.lastName"
          label="Last Name"
          placeholder="Smith"
          :rules="validationRules.anotherBuyerLastName"
          :field-errors="fieldErrors"
          error-key="anotherBuyerLastName"
          required
        />
      </VCol>
      <VCol cols="12" md="4">
        <WizardTextField
          v-model="anotherBuyerInfo.email"
          type="email"
          label="Email"
          placeholder="joe.smith@xyz.com"
          :rules="validationRules.anotherBuyerEmail"
          :field-errors="fieldErrors"
          error-key="anotherBuyerEmail"
          required
        />
      </VCol>
    </VRow>

    <VRow v-if="showOwner" class="mt-5">
      <VCol cols="12">
        <div class="d-flex align-center mb-4">
          <h6 class="text-headline-small mb-0">Owner Information</h6>
          <VBtn
            icon
            color="inherit"
            size="small"
            variant="text"
            class="ml-2"
            @click="toggleSection('owner', false)"
          >
            <VIcon icon="tabler-trash" />
          </VBtn>
        </div>
      </VCol>
      <VCol cols="12" md="4">
        <WizardTextField
          v-model="ownerInfo.firstName"
          label="First Name"
          placeholder="Alice"
          :rules="validationRules.ownerFirstName"
          :field-errors="fieldErrors"
          error-key="ownerFirstName"
          required
        />
      </VCol>
      <VCol cols="12" md="4">
        <WizardTextField
          v-model="ownerInfo.lastName"
          label="Last Name"
          placeholder="Williams"
          :rules="validationRules.ownerLastName"
          :field-errors="fieldErrors"
          error-key="ownerLastName"
          required
        />
      </VCol>
      <VCol cols="12" md="4">
        <WizardTextField
          v-model="ownerInfo.email"
          type="email"
          label="Email"
          placeholder="alice.williams@example.com"
          :rules="validationRules.ownerEmail"
          :field-errors="fieldErrors"
          error-key="ownerEmail"
          required
        />
      </VCol>
    </VRow>

    <VRow class="mt-5">
      <VCol cols="12" md="9">
        <VBtn
          variant="outlined"
          size="small"
          class="mr-2"
          :disabled="ctx.showAnotherBuyer.value"
          @click="toggleSection('anotherBuyer', true)"
        >
          Add Another Buyer
        </VBtn>
        <VBtn
          variant="outlined"
          size="small"
          :disabled="showOwner"
          @click="toggleSection('owner', true)"
        >
          Add Seller
        </VBtn>
      </VCol>
    </VRow>
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import WizardTextField from '@/components/booking/fields/WizardTextField.vue'
import { contactsFormContextKey } from '@/keys/bookingInjectionKeys'

const ctx = inject(contactsFormContextKey)
if (!ctx) {
  throw new Error('ContactFormSection must be used within ContactsStep (contactsFormContextKey provided).')
}
const buyerInfo = ctx.buyerInfo
const agentInfo = ctx.agentInfo
const anotherBuyerInfo = ctx.anotherBuyerInfo
const ownerInfo = ctx.ownerInfo
const showAnotherBuyer = ctx.showAnotherBuyer
const showOwner = ctx.showOwner
const validationRules = computed(() => ctx.validationRules.value)
const fieldErrors = computed(() => ctx.fieldErrors.value)
const toggleSection = ctx.toggleSection
</script>
