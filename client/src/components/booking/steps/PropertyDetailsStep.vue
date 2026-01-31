<script setup lang="ts">
/**
 * PropertyDetailsStep Component
 * 
 * LEARNING: Second step for property information collection
 * WHY: Collects property details including property type, location, and size
 * PATTERN: Property type cards, form fields with conditional rendering
 * COMPARISON: React uses CustomRadioIcons. Vue uses SelectionCardGroup component
 * 
 * Phase 1.2: Removed hardcoded data - all form values initialize empty, ready for API integration
 */

import { ref, inject, computed, watch, type Ref } from 'vue'
import { useBookingWizard } from '@/composables/useBookingWizard'
import { usePropertyDetailsLogic } from '@/composables/booking/usePropertyDetailsLogic'
import { usePropertyValidation } from '@/composables/booking/usePropertyValidation'
import { usePropertyTypeBlockSelection } from '@/composables/booking/usePropertyTypeBlockSelection'
import { usePropertyFormWatchers } from '@/composables/booking/usePropertyFormWatchers'
import { usePropertyFormState } from '@/composables/booking/usePropertyFormState'
import { usePropertyTypeBlockConfig } from '@/composables/booking/usePropertyTypeBlockConfig'
import SelectionCardGroup from '@/components/booking/SelectionCardGroup.vue'
import { createWizardStatePlugin } from '@/components/booking/plugins/wizardStatePlugin'
import PropertyConfirmationModal from '@/components/booking/modals/PropertyConfirmationModal.vue'
import type { WizardStateData } from '@/utils/transformers/appointmentToWizardTransformer'
import type { SelectionCardItem, SelectionCardConfig } from '@/components/booking/types/selectionCardTypes'
import type { PropertyDetailsStepData } from '@/types/wizard'

// LEARNING: Inject shared wizard instance from parent
// WHY: Ensures all step components share the same wizard state
// PATTERN: Use inject to get provided instance instead of creating new one
const wizard = inject<ReturnType<typeof useBookingWizard>>('wizard')
if (!wizard) {
  throw new Error('Wizard instance not provided. Make sure BookingWizard component provides the wizard instance.')
}

// LEARNING: Inject loaded wizard state for populating form fields
// WHY: Enables populating property details from loaded appointment
// PATTERN: Inject provided loadedWizardState and watch for changes
const loadedWizardState = inject<Ref<WizardStateData | null>>('loadedWizardState', ref(null))


// LEARNING: Use property type block selection composable
// WHY: Extracts selection logic from component to composable
// PATTERN: Composable provides reactive computed property for selection
const { selectedPropertyTypeBlockId } = usePropertyTypeBlockSelection({
  selectedPropertyTypeBlocks: wizard.selectedPropertyTypeBlocks,
  availablePropertyTypeBlocks: wizard.availablePropertyTypeBlocks,
  togglePropertyTypeBlock: wizard.togglePropertyTypeBlock
})

// LEARNING: Use property form state composable
// WHY: Consolidates all form field refs into single object
// PATTERN: Composable manages all form state refs
const { formData } = usePropertyFormState()

// LEARNING: Form watchers composable removed - now handled in usePropertyFormWatchers
// WHY: Watcher logic moved to usePropertyFormWatchers composable

// LEARNING: Use property details logic composable
// WHY: Extracts business logic from component to composable
// PATTERN: Composable provides reactive computed properties for property logic
const propertyDetailsLogic = usePropertyDetailsLogic({
  wizard: {
    selectedPropertyTypeBlocks: wizard.selectedPropertyTypeBlocks,
    availablePropertyTypeBlocks: wizard.availablePropertyTypeBlocks,
    selectedUserTypeBlock: wizard.selectedUserTypeBlock
  },
  loadedWizardState,
  formData: {
    address: formData.address,
    unit: formData.unit,
    city: formData.city,
    state: formData.state,
    zipCode: formData.zipCode,
    propertySize: formData.propertySize,
    numberOfUnits: formData.numberOfUnits,
    mlsNumber: formData.mlsNumber,
    squareFootage: formData.squareFootage,
    bedrooms: formData.bedrooms,
    bathrooms: formData.bathrooms,
    foundationAccess: formData.foundationAccess,
    additionalUnits: formData.additionalUnits
  }
})

// Extract computed properties from composable
const {
  requiresUnitNumber,
  isMultiFamily,
  propertyTypeBlocksWithComponents,
  stepData
} = propertyDetailsLogic

// LEARNING: State options for dropdown
// WHY: Provides state selection options
// PATTERN: Array of state objects
const states = [
  { value: 'FL', title: 'Florida' },
  { value: 'VA', title: 'Virginia' },
  { value: 'DC', title: 'District of Columbia' },
]

// LEARNING: Create wizard state plugin for property type blocks (multi-select)
// WHY: Allows SelectionCard to use wizard state directly
// PATTERN: Create plugin and use in config
// Session 1.3.9.5: Updated to use 'propertyTypeBlocks' field name
const propertyTypeBlocksStatePlugin = createWizardStatePlugin('propertyTypeBlocks')

// LEARNING: Use property type block config composable
// WHY: Extracts config construction logic from component to composable
// PATTERN: Composable provides reactive computed config
const { rowSelectionConfig } = usePropertyTypeBlockConfig({
  selectedPropertyTypeBlocks: wizard.selectedPropertyTypeBlocks,
  propertyTypeBlocksStatePlugin,
  availablePropertyTypeBlocks: wizard.availablePropertyTypeBlocks
})


// LEARNING: Removed unused selectedPropertyTypeBlockOptionComponentIds ref
// WHY: This ref was not being used anywhere in the component
// PATTERN: Clean up unused state

// LEARNING: Use property form watchers composable
// WHY: Extracts watcher logic from component to composable
// PATTERN: Composable sets up watchers for form data synchronization
usePropertyFormWatchers({
  formData: {
    address: formData.address,
    unit: formData.unit,
    city: formData.city,
    state: formData.state,
    zipCode: formData.zipCode,
    propertySize: formData.propertySize,
    numberOfUnits: formData.numberOfUnits,
    mlsNumber: formData.mlsNumber,
    squareFootage: formData.squareFootage,
    bedrooms: formData.bedrooms,
    bathrooms: formData.bathrooms,
    foundationAccess: formData.foundationAccess,
    additionalUnits: formData.additionalUnits
  },
  loadedWizardState
})

// LEARNING: Use property validation composable
// WHY: Extracts validation logic from component to composable
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

// LEARNING: Form ref for VForm component
// WHY: Enables programmatic form validation
// PATTERN: Ref to VForm component instance
const formRef = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null)

// LEARNING: Inject parent-provided refs for step data and validation state
// WHY: Parent provides refs that children write to (provide/inject only works parent-to-child)
// PATTERN: Inject refs from parent, sync local state to them
const parentPropertyDetailsStepData = inject<Ref<PropertyDetailsStepData | null>>('propertyDetailsStepData')
const parentPropertyDetailsStepValid = inject<Ref<boolean>>('propertyDetailsStepValid')
const parentPropertyDetailsStepValidate = inject<Ref<(() => boolean) | null>>('propertyDetailsStepValidate')
const parentPropertyDetailsFieldErrors = inject<Ref<Record<string, string>>>('propertyDetailsFieldErrors')

if (!parentPropertyDetailsStepData || !parentPropertyDetailsStepValid || !parentPropertyDetailsStepValidate || !parentPropertyDetailsFieldErrors) {
  throw new Error('Parent-provided refs not found. Make sure BookingWizard provides propertyDetailsStepData, propertyDetailsStepValid, propertyDetailsStepValidate, and propertyDetailsFieldErrors.')
}

// LEARNING: Sync local stepData to parent-provided ref
// WHY: Enables BookingWizard to collect property form data
// PATTERN: Watch local stepData and update parent ref
watch(stepData, (newData) => {
  if (parentPropertyDetailsStepData) {
    parentPropertyDetailsStepData.value = newData
  }
}, { immediate: true, deep: true })

// LEARNING: Sync local validation state to parent-provided refs
// WHY: Enables BookingWizard to check step validity before navigation
// PATTERN: Watch local validation state and update parent refs
watch(isFormValid, (newValid) => {
  if (parentPropertyDetailsStepValid) {
    parentPropertyDetailsStepValid.value = newValid
  }
}, { immediate: true })

// LEARNING: Assign validateForm function directly to parent ref
// WHY: validateForm is a function, not a ref, so we assign it directly
// PATTERN: Assign function to parent ref (no watch needed)
parentPropertyDetailsStepValidate.value = validateForm

watch(fieldErrors, (newErrors) => {
  if (parentPropertyDetailsFieldErrors) {
    parentPropertyDetailsFieldErrors.value = newErrors
  }
}, { immediate: true, deep: true })

// LEARNING: Modal state for property confirmation
// WHY: Controls visibility of property confirmation modal
// PATTERN: Ref for modal visibility
const showPropertyConfirmationModal = ref(false)

/**
 * LEARNING: Handle property confirmation modal confirm
 * WHY: User confirmed property details, modal can close
 * PATTERN: Close modal - user can proceed with Next button
 */
function handlePropertyConfirm(): void {
  // Modal closes automatically, user can proceed with Next button
}

/**
 * LEARNING: Handle property confirmation modal edit
 * WHY: User wants to edit, modal closes and they can make changes
 * PATTERN: Close modal - user can edit form
 */
function handlePropertyEdit(): void {
  // Modal closes automatically, user can edit form
}
</script>

<template>
  <VForm ref="formRef" class="property-details-step">
    <!-- LEARNING: Property Adjustment Selection Cards -->
    <!-- WHY: Prominent selection at top matching Jose's design -->
    <!-- PATTERN: SelectionCardGroup with row layout config, reusing shared rowSelectionConfig (same as user types) -->
    <!-- NOTE: Property adjustments are universally available (no longer require base service selection) -->
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
          :items="propertyTypeBlocksWithComponents as unknown as SelectionCardItem[]"
          :config="rowSelectionConfig as unknown as SelectionCardConfig"
        />
        <div v-if="fieldErrors.propertyTypeBlock" class="text-error text-caption mt-2">
          {{ fieldErrors.propertyTypeBlock }}
        </div>
      </div>
    </div>
    
    <!-- LEARNING: Location Section -->
    <!-- WHY: Collects property address information -->
    <!-- PATTERN: VRow/VCol grid layout with conditional Unit field -->
    <!-- Address format: Street address + Unit on one line, City/State/Zip on one line -->
    <VRow>
      <VCol cols="12">
        <h5 class="text-h5 mb-4">Location</h5>
      </VCol>
      
      <!-- Street Address Row: Address + Unit (when required) -->
      <VCol cols="12" :sm="requiresUnitNumber ? 9 : 12" :md="requiresUnitNumber ? 9 : 12">
        <VTextField
          v-model="formData.address.value"
          label="Address"
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
      
      <!-- City/State/Zip Row: All three fields on one line -->
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
    </VRow>
    
    <!-- LEARNING: Details Section -->
    <!-- WHY: Collects property size and unit count -->
    <!-- PATTERN: VRow/VCol grid layout with conditional Number of Units field -->
    <VRow class="mt-5">
      <VCol cols="12">
        <h5 class="text-h5 mb-4">Details</h5>
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
// LEARNING: Styles moved to SelectionCardGroup component
// WHY: Card styling is now centralized in the generic component
// PATTERN: No component-specific styles needed - SelectionCardGroup handles all card styling
</style>

