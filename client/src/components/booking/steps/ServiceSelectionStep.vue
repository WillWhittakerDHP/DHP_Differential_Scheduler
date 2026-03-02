<script setup lang="ts">

import { computed, inject, type Ref } from 'vue'
import { wizardKey } from '@/composables/booking/injectionKeys'
import SelectionCardGroup from '@/components/booking/SelectionCardGroup.vue'
import { useInstanceDisplay } from '@/composables/booking/useInstanceDisplay'
import { useInstanceSelectionConfig } from '@/composables/booking/useInstanceSelectionConfig'
import { useInstanceSelectionState } from '@/composables/booking/useInstanceSelectionState'
import { useInstanceComponentsList } from '@/composables/booking/useInstanceComponentsList'
import { useDynamicGridConfig } from '@/composables/booking/useDynamicGridConfig'
import type { WizardStateData } from '@/utils/transformers/appointmentToWizardTransformer'
import { isDevModeEnabled } from '@/utils/env/devMode'

const wizard = inject(wizardKey)
if (!wizard) {
  throw new Error('Wizard instance not provided. Make sure BookingWizard component provides the wizard instance.')
}

const loadedWizardState = inject<Ref<WizardStateData | null>>('loadedWizardState')

// PATTERN: Composable provides computed properties with getter/setter
const { selectedId: selectedUserTypeBlockId } = useInstanceSelectionState({
  availableInstances: computed(() => wizard.availableUserTypeBlocks.value),
  selectedInstances: computed(() => wizard.selectedUserTypeBlock.value ? [wizard.selectedUserTypeBlock.value] : []),
  toggleSelection: (ut) => wizard.selectUserTypeBlock(ut),
  loadedWizardState
})

const { selectedIds: selectedServiceIds } = useInstanceSelectionState({
  availableInstances: computed(() => wizard.availableServices.value),
  selectedInstances: computed(() => wizard.selectedServiceTypeBlocks.value),
  toggleSelection: (s) => wizard.toggleServiceTypeBlock(s),
  loadedWizardState
})

const rowSelectionConfigComposable = useInstanceSelectionConfig({
  selectionType: 'row',
  stateField: 'userTypeBlock',
  selectedValue: computed(() => wizard.selectedUserTypeBlock.value)
})

const stackSelectionConfigComposable = useInstanceSelectionConfig({
  selectionType: 'stack',
  stateField: 'services',
  selectedValue: computed(() => wizard.selectedServiceTypeBlocks.value)
})

const baseRowSelectionConfig = rowSelectionConfigComposable.selectionConfig
const stackSelectionConfig = stackSelectionConfigComposable.selectionConfig

// WHY: Moves icon mapping and display transformation logic out of component into reusable composable
// PATTERN: Composable handles icon mapping and display transformations
const userTypeDisplay = useInstanceDisplay({
  instances: computed(() => wizard.availableUserTypeBlocks.value)
})
const wizardStateSelector = userTypeDisplay.instancesWithDisplay

// PATTERN: Composable provides config with dynamic grid columns
const { dynamicConfig: rowSelectionConfig } = useDynamicGridConfig({
  baseConfig: baseRowSelectionConfig,
  itemCount: computed(() => wizardStateSelector.value.length)
})

const serviceDisplay = useInstanceDisplay({
  instances: computed(() => wizard.availableServices.value),
  selectedUserTypeBlock: computed(() => wizard.selectedUserTypeBlock.value)
})
const baseServicesWithIconsFromComposable = serviceDisplay.instancesWithDisplay

const instanceComponents = useInstanceComponentsList({
  services: computed(() => baseServicesWithIconsFromComposable.value),
  selectedUserTypeBlock: computed(() => wizard.selectedUserTypeBlock.value)
})

const baseServicesWithIcons = computed(() => {
  return instanceComponents.servicesWithComponents.value
})

const isDevMode = isDevModeEnabled()

/**
 * WHY: Watch logic moved to composable
 * PATTERN: Composable handles all state synchronization
 */
</script>

<template>
  <div class="service-selection-step">
    <!-- WHY: Provides user feedback when data isn't loaded or no user types are available -->
    <!-- PATTERN: Conditional rendering with helpful messages -->
    <div v-if="!wizard.bookingData" class="text-body-large text-medium-emphasis py-4">
      Loading booking data...
    </div>
    
    <div v-else-if="wizardStateSelector.length === 0" class="text-body-large text-medium-emphasis py-4">
      <div class="mb-2">No user types available.</div>
      <div class="text-body-small">Please ensure you have block shapes with <code>isStateControl: true</code> and active block instances.</div>
      <div v-if="isDevMode" class="text-body-small mt-2">
        Debug: availableUserTypeBlocks count = {{ wizard.availableUserTypeBlocks.value.length }}
      </div>
    </div>
    
    <!-- WHY: Prominent selection at top of step matching Jose's design -->
    <SelectionCardGroup
      v-else
      v-model="selectedUserTypeBlockId"
      :items="wizardStateSelector"
      :config="rowSelectionConfig"
      class="mb-8 mb-sm-6"
    />
    
    <!-- WHY: Better UX - quote mode is now a button in the stepper header -->
    <VRow v-if="wizard.selectedUserTypeBlock.value" class="service-type-section">
      <VCol cols="12">
        <h4 class="text-headline-large mb-6 mb-sm-4">Service Type</h4>
        
        <!-- Cascade configuration error -->
        <VAlert
          v-if="wizard.servicesCascadeError?.value"
          type="error"
          variant="tonal"
          class="mb-6"
        >
          {{ wizard.servicesCascadeError.value }}
        </VAlert>
        
        <!-- WHY: Provides feedback when no services match selected user type -->
        <div v-else-if="wizard.availableServices.value.length === 0" class="text-body-large text-medium-emphasis py-4">
          No services available for selected user type.
        </div>
        
        <!-- WHY: Card-based selection for better visual consistency -->
        <SelectionCardGroup
          v-else
          v-model="selectedServiceIds"
          :items="baseServicesWithIcons"
          :config="stackSelectionConfig"
          class="service-cards"
        />
      </VCol>
    </VRow>
  </div>
</template>

<style scoped lang="scss">
.service-selection-step {
  // PATTERN: Responsive padding using Vuetify spacing utilities
  padding: 0;
  
  @media (max-width: 599px) {
    padding: 0;
  }
}

.service-type-section {
  margin-top: 2.5rem;
  
  @media (min-width: 600px) {
    margin-top: 3rem;
  }
  
  @media (min-width: 960px) {
    margin-top: 3.5rem;
  }
}

.service-cards {
  margin-bottom: 1rem;
}
</style>
