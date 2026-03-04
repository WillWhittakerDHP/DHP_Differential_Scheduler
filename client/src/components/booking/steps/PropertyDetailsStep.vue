<script setup lang="ts">

import { ref, inject, computed, onMounted } from 'vue'
import type { PlaceDetails } from '@shared/types/mapsTypes'
import type { PropertyTypeWithComponents } from './PropertyDetailsSection.vue'
import { useWizardStepSync } from '@/composables/booking/useWizardStepSync'
import {
  propertyDetailsStepDataKey,
  propertyDetailsStepValidKey,
  propertyDetailsStepValidateKey,
  propertyDetailsFieldErrorsKey,
  wizardKey,
  loadedWizardStateKey,
} from '@/composables/booking/injectionKeys'
import { usePropertyDetailsLogic } from '@/composables/booking/usePropertyDetailsLogic'
import { usePropertyValidation } from '@/composables/booking/usePropertyValidation'
import { usePropertyTypeBlockSelection } from '@/composables/booking/usePropertyTypeBlockSelection'
import { usePropertyFormWatchers } from '@/composables/booking/usePropertyFormWatchers'
import { usePropertyFormState } from '@/composables/booking/usePropertyFormState'
import { useMapsSessionToken } from '@/composables/useMapsSessionToken'
import PropertyConfirmationModal from '@/components/booking/modals/PropertyConfirmationModal.vue'
import PropertyAddressSection from './PropertyAddressSection.vue'
import PropertyDetailsSection from './PropertyDetailsSection.vue'
import { US_STATE_OPTIONS } from '@/configs/usStates'
import { createLogger } from '@/utils/logger'

const logger = createLogger('PropertyDetailsStep')

const { prefetchToken } = useMapsSessionToken()

onMounted(() => {
  prefetchToken().catch(error => {
    logger.warn('[onMounted] Failed to pre-fetch session token:', error)
  })
})

const wizard = inject(wizardKey)
if (!wizard) {
  throw new Error('Wizard instance not provided. Make sure BookingWizard component provides the wizard instance.')
}

const loadedWizardState = inject(loadedWizardStateKey) ?? null
const propertyDetailsStepData = inject(propertyDetailsStepDataKey) ?? null

// PATTERN: Composable provides reactive computed property for selection
const { selectedPropertyTypeBlockId } = usePropertyTypeBlockSelection({
  selectedPropertyTypeBlocks: wizard.selectedPropertyTypeBlocks,
  availablePropertyTypeBlocks: wizard.availablePropertyTypeBlocks,
  togglePropertyTypeBlock: wizard.togglePropertyTypeBlock
})

// PATTERN: Composable manages all form state refs
const { formData, isAddressExpanded } = usePropertyFormState()

// WHY: Watcher logic moved to usePropertyFormWatchers composable

// PATTERN: Composable provides reactive computed properties for property logic
const propertyDetailsLogic = usePropertyDetailsLogic({
  wizard: {
    selectedPropertyTypeBlocks: wizard.selectedPropertyTypeBlocks,
    availablePropertyTypeBlocks: wizard.availablePropertyTypeBlocks,
    availableLineItemBlocks: wizard.availableLineItemBlocks,
    selectedUserTypeBlock: wizard.selectedUserTypeBlock,
    togglePropertyTypeBlock: wizard.togglePropertyTypeBlock,
    toggleLineItemBlock: wizard.toggleLineItemBlock,
    batchUpdate: wizard.batchUpdate
  },
  loadedWizardState,
  formData: {
    address: formData.address,
    unit: formData.unit,
    city: formData.city,
    state: formData.state,
    zipCode: formData.zipCode,
    candidatePlaceId: formData.candidatePlaceId,
    candidateCoordinates: formData.candidateCoordinates,
    propertySize: formData.propertySize,
    numberOfUnits: formData.numberOfUnits,
    mlsNumber: formData.mlsNumber,
    squareFootage: formData.squareFootage,
    bedrooms: formData.bedrooms,
    bathrooms: formData.bathrooms,
    foundationAccess: formData.foundationAccess,
    additionalUnits: formData.additionalUnits,
    source: formData.source,
    suggestedBlockInstanceIds: formData.suggestedBlockInstanceIds
  },
  isAddressExpanded
})

const {
  requiresUnitNumber,
  isMultiFamily,
  propertyTypeBlocksWithComponents,
  stepData,
  isEnrichmentLoading,
  handlePlaceSelected,
  handleAutocompleteError,
  changeAddress
} = propertyDetailsLogic

const states = US_STATE_OPTIONS

/**
 * PATTERN: Composable sets up watchers for form data synchronization
 */
usePropertyFormWatchers({
  formData: {
    address: formData.address,
    unit: formData.unit,
    city: formData.city,
    state: formData.state,
    zipCode: formData.zipCode,
    candidatePlaceId: formData.candidatePlaceId,
    candidateCoordinates: formData.candidateCoordinates,
    propertySize: formData.propertySize,
    numberOfUnits: formData.numberOfUnits,
    mlsNumber: formData.mlsNumber,
    squareFootage: formData.squareFootage,
    bedrooms: formData.bedrooms,
    bathrooms: formData.bathrooms,
    foundationAccess: formData.foundationAccess,
    additionalUnits: formData.additionalUnits,
    source: formData.source,
    suggestedBlockInstanceIds: formData.suggestedBlockInstanceIds
  },
  loadedWizardState,
  isAddressExpanded,
  restoreFrom: propertyDetailsStepData
})

// PATTERN: Composable provides validation functions and computed properties
const {
  fieldErrors,
  isFormValid,
  validateForm,
  addressValidationRules,
  propertySizeValidationRules,
} = usePropertyValidation({
  formData: {
    address: formData.address,
    city: formData.city,
    state: formData.state,
    zipCode: formData.zipCode,
    propertySize: formData.propertySize,
    numberOfUnits: formData.numberOfUnits
  },
  isMultiFamily,
  hasPropertyTypeBlock: computed(() => wizard.selectedPropertyTypeBlocks.value.length > 0)
})

useWizardStepSync({
  stepData,
  isFormValid,
  validateForm,
  stepDataKey: propertyDetailsStepDataKey,
  stepValidKey: propertyDetailsStepValidKey,
  stepValidateKey: propertyDetailsStepValidateKey,
  fieldErrors,
  fieldErrorsKey: propertyDetailsFieldErrorsKey,
})

const squareFootageHint = computed(() =>
  formData.squareFootage.value ? `MLS: ${formData.squareFootage.value} sq-ft` : undefined
)
const foundationAccessDisplayValue = computed(() => {
  const v = formData.foundationAccess.value
  return v ? v.charAt(0).toUpperCase() + v.slice(1) : ''
})

const formRef = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null)
void formRef.value // ref used by template

const showPropertyConfirmationModal = ref(false)

function handlePropertyConfirm(): void {
}

function handlePropertyEdit(): void {
}
</script>

<template>
  <VForm ref="formRef" class="property-details-step">
    <PropertyAddressSection
      :form-data="formData"
      :validation-rules="addressValidationRules"
      :field-errors="fieldErrors"
      :is-address-expanded="isAddressExpanded"
      :requires-unit-number="requiresUnitNumber"
      :handle-place-selected="(d: unknown) => handlePlaceSelected(d as PlaceDetails)"
      :handle-autocomplete-error="(e: unknown) => handleAutocompleteError(e as Error)"
      :change-address="changeAddress"
      :states="[...states]"
    />

    <PropertyDetailsSection
      v-if="isAddressExpanded"
      v-model:selected-property-type-id="selectedPropertyTypeBlockId"
      :available-property-types="(propertyTypeBlocksWithComponents as PropertyTypeWithComponents[])"
      :property-types-cascade-error="wizard.propertyTypesCascadeError?.value ?? null"
      :form-data="formData"
      :validation-rules="propertySizeValidationRules"
      :field-errors="fieldErrors"
      :is-multi-family="isMultiFamily"
      :is-enrichment-loading="isEnrichmentLoading"
      :square-footage-hint="squareFootageHint"
      :foundation-access-display-value="foundationAccessDisplayValue"
    />

    <!-- WHY: Allows users to review property details before proceeding -->
    <!-- PATTERN: VDialog modal with property details summary -->
    <PropertyConfirmationModal
      v-model="showPropertyConfirmationModal"
      :property-details="stepData"
      :selected-property-types="wizard.selectedPropertyTypeBlocks.value"
      @confirm="handlePropertyConfirm"
      @edit="handlePropertyEdit"
    />

    <!-- WHY: Triggers property confirmation modal when form is valid -->
    <!-- PATTERN: Button that shows modal when clicked -->
    <VRow v-if="isFormValid" class="mt-6">
      <VCol cols="12" class="d-flex justify-end">
        <VBtn
          color="primary"
          variant="elevated"
          @click="showPropertyConfirmationModal = true"
        >
          Review & Continue
        </VBtn>
      </VCol>
    </VRow>
  </VForm>
</template>

<style scoped lang="scss">
</style>
