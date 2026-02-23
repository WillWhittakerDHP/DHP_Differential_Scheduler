<script setup lang="ts">
/**
 * PropertyDetailsStep Component
 * 
 * 
 * Phase 1.2: Removed hardcoded data - all form values initialize empty, ready for API integration
 */

import { ref, inject, computed, onMounted, type Ref } from 'vue'
import { useWizardStepSync } from '@/composables/booking/useWizardStepSync'
import { useBookingWizard } from '@/composables/booking/useBookingWizard'
import { usePropertyDetailsLogic } from '@/composables/booking/usePropertyDetailsLogic'
import { usePropertyValidation } from '@/composables/booking/usePropertyValidation'
import { usePropertyTypeBlockSelection } from '@/composables/booking/usePropertyTypeBlockSelection'
import { usePropertyFormWatchers } from '@/composables/booking/usePropertyFormWatchers'
import { usePropertyFormState } from '@/composables/booking/usePropertyFormState'
import { usePropertyTypeBlockConfig } from '@/composables/booking/usePropertyTypeBlockConfig'
import { useMapsSessionToken } from '@/composables/useMapsSessionToken'
import SelectionCardGroup from '@/components/booking/SelectionCardGroup.vue'
import { createWizardStatePlugin } from '@/components/booking/plugins/wizardStatePlugin'
import PropertyConfirmationModal from '@/components/booking/modals/PropertyConfirmationModal.vue'
import AddressAutocomplete from '@/components/common/AddressAutocomplete.vue'
import type { WizardStateData } from '@/utils/transformers/appointmentToWizardTransformer'
import type { SelectionCardConfig } from '@/components/booking/types/selectionCardTypes'
import { US_STATE_OPTIONS } from '@/configs/usStates'
import { createLogger } from '@/utils/logger'

const logger = createLogger('PropertyDetailsStep')

const { prefetchToken } = useMapsSessionToken()

/**
 * Pre-fetch session token when component mounts (Step 2 becomes active)
 */
onMounted(() => {
  prefetchToken().catch(error => {
    logger.warn('[onMounted] Failed to pre-fetch session token:', error)
  })
})

const wizard = inject<ReturnType<typeof useBookingWizard>>('wizard')
if (!wizard) {
  throw new Error('Wizard instance not provided. Make sure BookingWizard component provides the wizard instance.')
}

const loadedWizardState = inject<Ref<WizardStateData | null>>('loadedWizardState', ref(null))


// LEARNING: Use property type block selection composable
// PATTERN: Composable provides reactive computed property for selection
const { selectedPropertyTypeBlockId } = usePropertyTypeBlockSelection({
  selectedPropertyTypeBlocks: wizard.selectedPropertyTypeBlocks,
  availablePropertyTypeBlocks: wizard.availablePropertyTypeBlocks,
  togglePropertyTypeBlock: wizard.togglePropertyTypeBlock
})

// LEARNING: Use property form state composable
// PATTERN: Composable manages all form state refs
const { formData, isAddressExpanded } = usePropertyFormState()

// WHY: Watcher logic moved to usePropertyFormWatchers composable

// LEARNING: Use property details logic composable
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

// LEARNING: State options from shared config (reusable across wizard and admin address forms)
const states = US_STATE_OPTIONS

// WHY: Allows SelectionCard to use wizard state directly
const propertyTypeBlocksStatePlugin = createWizardStatePlugin('propertyTypeBlocks')

// LEARNING: Use property type block config composable
// PATTERN: Composable provides reactive computed config
const { rowSelectionConfig } = usePropertyTypeBlockConfig({
  selectedPropertyTypeBlocks: wizard.selectedPropertyTypeBlocks,
  propertyTypeBlocksStatePlugin,
  availablePropertyTypeBlocks: wizard.availablePropertyTypeBlocks
})


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
  isAddressExpanded
})

// LEARNING: Use property validation composable
// PATTERN: Composable provides validation functions and computed properties
const {
  validationRules,
  fieldErrors,
  isFormValid,
  validateForm
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
  stepDataKey: 'propertyDetailsStepData',
  stepValidKey: 'propertyDetailsStepValid',
  stepValidateKey: 'propertyDetailsStepValidate',
  fieldErrors,
  fieldErrorsKey: 'propertyDetailsFieldErrors',
})

const formRef = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null)
void formRef.value // ref used by template

// LEARNING: Modal state for property confirmation
const showPropertyConfirmationModal = ref(false)

function handlePropertyConfirm(): void {
}

function handlePropertyEdit(): void {
}
</script>

<template>
  <VForm ref="formRef" class="property-details-step">
    /**
     * <!-- WHY: Prominent selection at top matching Jose's design
     */
    <div class="mb-6">
      <!-- Cascade configuration error -->
      <VAlert
        v-if="wizard.propertyTypesCascadeError?.value"
        type="error"
        variant="tonal"
        class="mb-6"
      >
        {{ wizard.propertyTypesCascadeError.value }}
      </VAlert>
      
      <!-- LEARNING: Empty state when no property type blocks available -->
      <!-- WHY: Provides feedback when no property type blocks are available -->
      <!-- PATTERN: Conditional rendering with helpful message -->
      <div v-else-if="wizard.availablePropertyTypeBlocks.value.length === 0" class="text-body-2 text-medium-emphasis mb-6">
        No property type blocks available.
      </div>
      
      <!-- LEARNING: Property Adjustment Selection Cards -->
      <!-- WHY: Card-based selection using same component and config as user types -->
      <!-- PATTERN: SelectionCardGroup with row layout config, reusing shared rowSelectionConfig -->
      <div>
        <!-- Session 1.3.9.5: Updated to use checkboxes for multi-select -->
        <SelectionCardGroup
          v-if="wizard.availablePropertyTypeBlocks.value.length > 0"
          v-model="selectedPropertyTypeBlockId"
          :items="propertyTypeBlocksWithComponents"
          :config="rowSelectionConfig as SelectionCardConfig"
        />
        <div v-if="fieldErrors.propertyTypeBlock" class="text-error text-caption mt-2">
          {{ fieldErrors.propertyTypeBlock }}
        </div>
      </div>
    </div>
    
    <!-- LEARNING: Location Section with Progressive Disclosure -->
    <!-- WHY: Start with autocomplete-only for clean UI, expand to editable fields after selection -->
    <!-- PATTERN: Conditional rendering based on isAddressExpanded state -->
    <VRow>
      <VCol cols="12">
        <h5 class="text-h5 mb-4">Location</h5>
      </VCol>
      
      <!-- Autocomplete-only mode (initial state) -->
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
      
      <!-- Expanded mode (after selection or fallback) -->
      <template v-else>
        <!-- Editable address fields -->
        <VCol cols="12" :sm="requiresUnitNumber ? 9 : 12" :md="requiresUnitNumber ? 9 : 12">
          <VTextField
            v-model="formData.address.value"
            label="Street Address"
            placeholder="123 Pleasant St."
            :rules="validationRules.address"
            :error-messages="fieldErrors.address ? [fieldErrors.address] : []"
            full-width
            required
          />
        </VCol>
        
        <VCol v-if="requiresUnitNumber" cols="12" sm="3" md="3">
          <VTextField
            v-model="formData.unit.value"
            label="Unit"
            placeholder="10"
            full-width
          />
        </VCol>
        
        <VCol cols="12" sm="5" md="5">
          <VTextField
            v-model="formData.city.value"
            label="City"
            placeholder="Los Angeles"
            :rules="validationRules.city"
            :error-messages="fieldErrors.city ? [fieldErrors.city] : []"
            full-width
            required
          />
        </VCol>
        
        <VCol cols="12" sm="3" md="3">
          <VSelect
            v-model="formData.state.value"
            :items="states"
            item-title="title"
            item-value="value"
            label="State"
            :rules="validationRules.state"
            :error-messages="fieldErrors.state ? [fieldErrors.state] : []"
            full-width
            required
          />
        </VCol>
        
        <VCol cols="12" sm="4" md="4">
          <VTextField
            v-model="formData.zipCode.value"
            label="Zip Code"
            type="text"
            placeholder="12345"
            :rules="validationRules.zipCode"
            :error-messages="fieldErrors.zipCode ? [fieldErrors.zipCode] : []"
            full-width
            required
          />
        </VCol>
        
        <!-- Change Address button -->
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
    
    <!-- LEARNING: Details Section -->
    <!-- WHY: Collects property size and unit count -->
    <!-- PATTERN: VRow/VCol grid layout with conditional Number of Units field -->
    <VRow class="mt-5">
      <VCol cols="12">
        <h5 class="text-h5 mb-4">Details</h5>
        <VProgressLinear
          v-if="isEnrichmentLoading"
          indeterminate
          color="primary"
          class="mb-4"
        />
      </VCol>
      
      <VCol cols="12" md="6">
        <VTextField
          v-model.number="formData.propertySize.value"
          label="Size"
          type="number"
          placeholder="800"
          :rules="validationRules.propertySize"
          :error-messages="fieldErrors.propertySize ? [fieldErrors.propertySize] : []"
          full-width
          :hint="formData.squareFootage.value ? `MLS: ${formData.squareFootage.value} sq-ft` : undefined"
          persistent-hint
          required
        >
          <template #append-inner>
            <span class="text-body-2 text-medium-emphasis">sq-ft</span>
          </template>
        </VTextField>
      </VCol>
      
      <!-- LEARNING: MLS Data Fields (when available) -->
      <!-- WHY: Display MLS property details when MLS data is populated -->
      <!-- PATTERN: Conditional rendering of MLS fields -->
      <VCol
        v-if="formData.mlsNumber.value || formData.squareFootage.value || formData.bedrooms.value !== null || formData.bathrooms.value !== null || formData.foundationAccess.value"
        cols="12"
        class="mt-4"
      >
        <VDivider class="mb-4" />
        <h6 class="text-h6 mb-3">MLS Information</h6>
        <VRow>
          <VCol v-if="formData.mlsNumber.value" cols="12" md="6">
            <VTextField
              v-model="formData.mlsNumber.value"
              label="MLS Number"
              readonly
              full-width
            />
          </VCol>
          <VCol v-if="formData.bedrooms.value !== null" cols="12" md="3">
            <VTextField
              v-model.number="formData.bedrooms.value"
              label="Bedrooms"
              type="number"
              readonly
              full-width
            />
          </VCol>
          <VCol v-if="formData.bathrooms.value !== null" cols="12" md="3">
            <VTextField
              v-model.number="formData.bathrooms.value"
              label="Bathrooms"
              type="number"
              readonly
              full-width
            />
          </VCol>
          <VCol v-if="formData.foundationAccess.value" cols="12" md="6">
            <VTextField
              :model-value="formData.foundationAccess.value ? formData.foundationAccess.value.charAt(0).toUpperCase() + formData.foundationAccess.value.slice(1) : ''"
              label="Foundation Access"
              readonly
              full-width
            />
          </VCol>
        </VRow>
      </VCol>
      
      <VCol v-if="isMultiFamily" cols="12" md="6">
        <VTextField
          v-model.number="formData.numberOfUnits.value"
          label="Number of Units"
          type="number"
          placeholder="0"
          :rules="validationRules.numberOfUnits"
          :error-messages="fieldErrors.numberOfUnits ? [fieldErrors.numberOfUnits] : []"
          full-width
          required
        />
      </VCol>
    </VRow>

    <!-- LEARNING: Property Confirmation Modal -->
    <!-- WHY: Allows users to review property details before proceeding -->
    <!-- PATTERN: VDialog modal with property details summary -->
    <PropertyConfirmationModal
      v-model="showPropertyConfirmationModal"
      :property-details="stepData"
      :selected-property-types="wizard.selectedPropertyTypeBlocks.value"
      @confirm="handlePropertyConfirm"
      @edit="handlePropertyEdit"
    />

    <!-- LEARNING: Review & Continue Button -->
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

