<!-- Extracted Location section from PropertyDetailsStep for component-health (allowlist repair). -->
<template>
  <!-- eslint-disable vue/no-mutating-props -->
  <VRow>
    <VCol cols="12">
      <h5 class="text-headline-medium mb-4">Location</h5>
    </VCol>

    <VCol v-if="!isAddressExpanded" cols="12">
      <AddressAutocomplete
        v-model="formData.address.value"
        :coordinates="formData.candidateCoordinates.value"
        :place-id="formData.candidatePlaceId.value"
        label="Property Address"
        placeholder="Start typing the property address..."
        :rules="validationRules.address"
        :error-messages="fieldErrors.address ? [fieldErrors.address] : []"
        @place-selected="handlePlaceSelected"
        @update:coordinates="formData.candidateCoordinates.value = $event"
        @update:place-id="formData.candidatePlaceId.value = $event"
        @error="handleAutocompleteError"
      />
    </VCol>

    <template v-else>
      <VCol cols="12" :sm="requiresUnitNumber ? 9 : 12" :md="requiresUnitNumber ? 9 : 12">
        <WizardTextField
          v-model="formData.address.value"
          label="Street Address"
          placeholder="123 Pleasant St."
          :rules="validationRules.address"
          :field-errors="fieldErrors"
          error-key="address"
          required
        />
      </VCol>

      <VCol v-if="requiresUnitNumber" cols="12" sm="3" md="3">
        <WizardTextField
          v-model="formData.unit.value"
          label="Unit"
          placeholder="10"
          :field-errors="fieldErrors"
          error-key="unit"
        />
      </VCol>

      <VCol cols="12" sm="5" md="5">
        <WizardTextField
          v-model="formData.city.value"
          label="City"
          placeholder="Los Angeles"
          :rules="validationRules.city"
          :field-errors="fieldErrors"
          error-key="city"
          required
        />
      </VCol>

      <VCol cols="12" sm="3" md="3">
        <WizardSelect
          v-model="formData.state.value"
          :items="states"
          item-title="title"
          item-value="value"
          label="State"
          :rules="validationRules.state"
          :field-errors="fieldErrors"
          error-key="state"
          required
        />
      </VCol>

      <VCol cols="12" sm="4" md="4">
        <WizardTextField
          v-model="formData.zipCode.value"
          label="Zip Code"
          type="text"
          placeholder="12345"
          :rules="validationRules.zipCode"
          :field-errors="fieldErrors"
          error-key="zipCode"
          required
        />
      </VCol>

      <VCol cols="12">
        <VBtn
          variant="text"
          size="small"
          prepend-icon="mdi-pencil"
          @click="changeAddress"
        >
          Change Address
        </VBtn>
      </VCol>
    </template>
  </VRow>
</template>

<script setup lang="ts">
import AddressAutocomplete from '@/components/common/AddressAutocomplete.vue'
import WizardSelect from '@/components/booking/fields/WizardSelect.vue'
import WizardTextField from '@/components/booking/fields/WizardTextField.vue'
import type { PropertyFormData } from '@/types/propertyForm'
import type { ValidationRule } from '@/types/formValidation'

defineProps<{
  formData: PropertyFormData
  validationRules: { address: ValidationRule[]; city: ValidationRule[]; state: ValidationRule[]; zipCode: ValidationRule[] }
  fieldErrors: Record<string, string>
  isAddressExpanded: boolean
  requiresUnitNumber: boolean
  handlePlaceSelected: (details: unknown) => void
  handleAutocompleteError: (error: unknown) => void
  changeAddress: () => void
  states: Array<{ title: string; value: string }>
}>()
</script>
