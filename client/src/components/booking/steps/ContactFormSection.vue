<!--
  Extracted form fields from ContactsStep for component-health (allowlist repair).
  Consumes contacts form context via provide/inject.
-->
<template>
  <div class="contact-form-section">
    <VRow class="mt-5">
      <VCol cols="12">
        <h6 class="text-headline-small mb-4">Client Information</h6>
      </VCol>
      <VCol cols="12" md="4">
        <WizardTextField
          v-model="ctx.clientInfo.firstName"
          label="First Name"
          placeholder="Joe"
          :rules="ctx.validationRules.clientFirstName"
          :field-errors="ctx.fieldErrors"
          error-key="clientFirstName"
          required
        />
      </VCol>
      <VCol cols="12" md="4">
        <WizardTextField
          v-model="ctx.clientInfo.lastName"
          label="Last Name"
          placeholder="Smith"
          :rules="ctx.validationRules.clientLastName"
          :field-errors="ctx.fieldErrors"
          error-key="clientLastName"
          required
        />
      </VCol>
      <VCol cols="12" md="4">
        <WizardTextField
          v-model="ctx.clientInfo.email"
          type="email"
          label="Email"
          placeholder="joe.smith@xyz.com"
          :rules="ctx.validationRules.clientEmail"
          :field-errors="ctx.fieldErrors"
          error-key="clientEmail"
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
          v-model="ctx.agentInfo.firstName"
          label="First Name"
          placeholder="Jane"
          :rules="ctx.validationRules.agentFirstName"
          :field-errors="ctx.fieldErrors"
          error-key="agentFirstName"
          required
        />
      </VCol>
      <VCol cols="12" md="4">
        <WizardTextField
          v-model="ctx.agentInfo.lastName"
          label="Last Name"
          placeholder="Doe"
          :rules="ctx.validationRules.agentLastName"
          :field-errors="ctx.fieldErrors"
          error-key="agentLastName"
          required
        />
      </VCol>
      <VCol cols="12" md="4">
        <WizardTextField
          v-model="ctx.agentInfo.email"
          type="email"
          label="Email"
          placeholder="jane.doe@realty.com"
          :rules="ctx.validationRules.agentEmail"
          :field-errors="ctx.fieldErrors"
          error-key="agentEmail"
          required
        />
      </VCol>
    </VRow>

    <VRow v-if="ctx.showAnotherClient.value" class="mt-5">
      <VCol cols="12">
        <div class="d-flex align-center mb-4">
          <h6 class="text-headline-small mb-0">Another Client Information</h6>
          <VBtn
            icon
            color="inherit"
            size="small"
            variant="text"
            class="ml-2"
            @click="ctx.toggleSection('anotherClient', false)"
          >
            <VIcon icon="tabler-trash" />
          </VBtn>
        </div>
      </VCol>
      <VCol cols="12" md="4">
        <WizardTextField
          v-model="ctx.anotherClientInfo.firstName"
          label="First Name"
          placeholder="Joe"
          :rules="ctx.validationRules.anotherClientFirstName"
          :field-errors="ctx.fieldErrors"
          error-key="anotherClientFirstName"
          required
        />
      </VCol>
      <VCol cols="12" md="4">
        <WizardTextField
          v-model="ctx.anotherClientInfo.lastName"
          label="Last Name"
          placeholder="Smith"
          :rules="ctx.validationRules.anotherClientLastName"
          :field-errors="ctx.fieldErrors"
          error-key="anotherClientLastName"
          required
        />
      </VCol>
      <VCol cols="12" md="4">
        <WizardTextField
          v-model="ctx.anotherClientInfo.email"
          type="email"
          label="Email"
          placeholder="joe.smith@xyz.com"
          :rules="ctx.validationRules.anotherClientEmail"
          :field-errors="ctx.fieldErrors"
          error-key="anotherClientEmail"
          required
        />
      </VCol>
    </VRow>

    <VRow v-if="ctx.showTransactionManager.value" class="mt-5">
      <VCol cols="12">
        <div class="d-flex align-center mb-4">
          <h6 class="text-headline-small mb-0">Transaction Manager Information</h6>
          <VBtn
            icon
            color="inherit"
            size="small"
            variant="text"
            class="ml-2"
            @click="ctx.toggleSection('transactionManager', false)"
          >
            <VIcon icon="tabler-trash" />
          </VBtn>
        </div>
      </VCol>
      <VCol cols="12" md="4">
        <WizardTextField
          v-model="ctx.transactionManagerInfo.firstName"
          label="First Name"
          placeholder="Bob"
          :rules="ctx.validationRules.transactionManagerFirstName"
          :field-errors="ctx.fieldErrors"
          error-key="transactionManagerFirstName"
          required
        />
      </VCol>
      <VCol cols="12" md="4">
        <WizardTextField
          v-model="ctx.transactionManagerInfo.lastName"
          label="Last Name"
          placeholder="Johnson"
          :rules="ctx.validationRules.transactionManagerLastName"
          :field-errors="ctx.fieldErrors"
          error-key="transactionManagerLastName"
          required
        />
      </VCol>
      <VCol cols="12" md="4">
        <WizardTextField
          v-model="ctx.transactionManagerInfo.email"
          type="email"
          label="Email"
          placeholder="bob.johnson@title.com"
          :rules="ctx.validationRules.transactionManagerEmail"
          :field-errors="ctx.fieldErrors"
          error-key="transactionManagerEmail"
          required
        />
      </VCol>
    </VRow>

    <VRow v-if="ctx.showSeller.value" class="mt-5">
      <VCol cols="12">
        <div class="d-flex align-center mb-4">
          <h6 class="text-headline-small mb-0">Seller Information</h6>
          <VBtn
            icon
            color="inherit"
            size="small"
            variant="text"
            class="ml-2"
            @click="ctx.toggleSection('seller', false)"
          >
            <VIcon icon="tabler-trash" />
          </VBtn>
        </div>
      </VCol>
      <VCol cols="12" md="4">
        <WizardTextField
          v-model="ctx.sellerInfo.firstName"
          label="First Name"
          placeholder="Alice"
          :rules="ctx.validationRules.sellerFirstName"
          :field-errors="ctx.fieldErrors"
          error-key="sellerFirstName"
          required
        />
      </VCol>
      <VCol cols="12" md="4">
        <WizardTextField
          v-model="ctx.sellerInfo.lastName"
          label="Last Name"
          placeholder="Williams"
          :rules="ctx.validationRules.sellerLastName"
          :field-errors="ctx.fieldErrors"
          error-key="sellerLastName"
          required
        />
      </VCol>
      <VCol cols="12" md="4">
        <WizardTextField
          v-model="ctx.sellerInfo.email"
          type="email"
          label="Email"
          placeholder="alice.williams@example.com"
          :rules="ctx.validationRules.sellerEmail"
          :field-errors="ctx.fieldErrors"
          error-key="sellerEmail"
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
          :disabled="ctx.showAnotherClient.value"
          @click="ctx.toggleSection('anotherClient', true)"
        >
          Add Another Client
        </VBtn>
        <VBtn
          variant="outlined"
          size="small"
          class="mr-2"
          :disabled="ctx.showTransactionManager.value"
          @click="ctx.toggleSection('transactionManager', true)"
        >
          Add Transaction Manager
        </VBtn>
        <VBtn
          variant="outlined"
          size="small"
          :disabled="ctx.showSeller.value"
          @click="ctx.toggleSection('seller', true)"
        >
          Add Seller
        </VBtn>
      </VCol>
    </VRow>
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import WizardTextField from '@/components/booking/fields/WizardTextField.vue'
import { contactsFormContextKey } from '@/composables/booking/injectionKeys'

const ctx = inject(contactsFormContextKey)
if (!ctx) {
  throw new Error('ContactFormSection must be used within ContactsStep (contactsFormContextKey provided).')
}
</script>
