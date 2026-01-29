<script setup lang="ts">
/**
 * ServiceSelectionStep Component
 * 
 * LEARNING: First step with user type selection cards and service types
 * WHY: Allows users to identify themselves and select services
 * PATTERN: Radio button cards with icons and titles
 * COMPARISON: React uses CustomRadioIcons. Vue uses VRadioGroup with VLabel cards
 * 
 * NOTE: Additional services functionality was removed - will be merged into base services in future work
 * 
 * Session 6.2: Integrated with useBookingWizard for cascading selection logic
 */

import { computed, inject, type Ref } from 'vue'
import { useBookingWizard } from '@/composables/useBookingWizard'
import SelectionCardGroup from '@/components/booking/SelectionCardGroup.vue'
import { useInstanceDisplay } from '@/composables/booking/useInstanceDisplay'
import { useInstanceSelectionConfig } from '@/composables/booking/useInstanceSelectionConfig'
import { useInstanceSelectionState } from '@/composables/booking/useInstanceSelectionState'
import { useInstanceComponentsList } from '@/composables/booking/useInstanceComponentsList'
import { useDynamicGridConfig } from '@/composables/booking/useDynamicGridConfig'
import type { WizardStateData } from '@/utils/transformers/appointmentToWizardTransformer'
import { isDevModeEnabled } from '@/utils/env/devMode'

// LEARNING: Inject shared wizard instance from parent
// WHY: Ensures all step components share the same wizard state
// PATTERN: Use inject to get provided instance instead of creating new one
const wizard = inject<ReturnType<typeof useBookingWizard>>('wizard')
if (!wizard) {
  throw new Error('Wizard instance not provided. Make sure BookingWizard component provides the wizard instance.')
}

// LEARNING: Inject loaded wizard state for populating form fields
// WHY: Enables populating selections from loaded appointment
// PATTERN: Inject provided loadedWizardState and watch for changes
const loadedWizardState = inject<Ref<WizardStateData | null>>('loadedWizardState')

// LEARNING: Use instance selection state composable for v-model bridges
// WHY: Extracts v-model bridge logic from component to composable
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

// Use instance selection config composable
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

// LEARNING: Use instance display composable for display transformations
// WHY: Moves icon mapping and display transformation logic out of component into reusable composable
// PATTERN: Composable handles icon mapping and display transformations
const userTypeDisplay = useInstanceDisplay({
  instances: computed(() => wizard.availableUserTypeBlocks.value)
})
const wizardStateSelector = userTypeDisplay.instancesWithDisplay

// LEARNING: Use dynamic grid config composable
// WHY: Extracts grid column calculation logic from component to composable
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

// Use instance components list composable to enhance services with component data
const instanceComponents = useInstanceComponentsList({
  services: computed(() => baseServicesWithIconsFromComposable.value),
  selectedUserTypeBlock: computed(() => wizard.selectedUserTypeBlock.value)
})

// Base services with icons and components
const baseServicesWithIcons = computed(() => {
  return instanceComponents.servicesWithComponents.value
})

// LEARNING: Dev mode flag for template usage
// WHY: Centralized devMode check for consistent behavior across app
// PATTERN: Use shared devMode helper instead of direct env access
const isDevMode = isDevModeEnabled()

// LEARNING: Removed unused selectedOptionComponentIds ref
// WHY: This ref was not being used anywhere in the component
// PATTERN: Clean up unused state

// LEARNING: Removed watch on loadedWizardState - now handled in useInstanceSelectionState composable
// WHY: Watch logic moved to composable
// PATTERN: Composable handles all state synchronization
</script>

<template>
  <div class="service-selection-step">
    <!-- LEARNING: Loading/Empty State Guards -->
    <!-- WHY: Provides user feedback when data isn't loaded or no user types are available -->
    <!-- PATTERN: Conditional rendering with helpful messages -->
    <div v-if="!wizard.bookingData" class="text-body-1 text-medium-emphasis py-4">
      Loading booking data...
    </div>
    
    <div v-else-if="wizardStateSelector.length === 0" class="text-body-1 text-medium-emphasis py-4">
      <div class="mb-2">No user types available.</div>
      <div class="text-caption">Please ensure you have block shapes with <code>isStateControl: true</code> and active block instances.</div>
      <div v-if="isDevMode" class="text-caption mt-2">
        Debug: availableUserTypeBlocks count = {{ wizard.availableUserTypeBlocks.value.length }}
      </div>
    </div>
    
    <!-- LEARNING: User Type Selection Cards -->
    <!-- WHY: Prominent selection at top of step matching Jose's design -->
    <!-- PATTERN: SelectionCardGroup with row layout config, reusing shared rowSelectionConfig -->
    <!-- Session 6.2: Integrated with useBookingWizard for real data -->
    <!-- Session 6.3: Icons mapped with fallback handling -->
    <!-- Session 6.8: Responsive grid columns - stack on mobile, 3 columns on tablet+, single column on small mobile -->
    <!-- NOTE: Using default icon slot from SelectionCardGroup - icons are mapped in wizardStateSelector -->
    <SelectionCardGroup
      v-else
      v-model="selectedUserTypeBlockId"
      :items="wizardStateSelector"
      :config="rowSelectionConfig"
      class="mb-8 mb-sm-6"
    />
    
    <!-- LEARNING: Quote mode control moved to stepper area -->
    <!-- WHY: Better UX - quote mode is now a button in the stepper header -->
    <!-- PATTERN: Removed from ServiceSelectionStep, now in BookingWizard stepper -->
    
    <!-- LEARNING: Service Type Selection Section -->
    <!-- WHY: Allows users to select their desired service type -->
    <!-- PATTERN: VRadioGroup with VRadio components for each service type -->
    <!-- Session 6.2: Only shows when User Type is selected, uses wizard.availableBaseServices -->
    <!-- Session 6.8: Improved spacing and visual hierarchy -->
    <VRow v-if="wizard.selectedUserTypeBlock" class="service-type-section">
      <VCol cols="12">
        <h4 class="text-h4 mb-6 mb-sm-4">Service Type</h4>
        
        <!-- Cascade configuration error -->
        <VAlert
          v-if="wizard.servicesCascadeError?.value"
          type="error"
          variant="tonal"
          class="mb-6"
        >
          {{ wizard.servicesCascadeError.value }}
        </VAlert>
        
        <!-- LEARNING: Empty state when no services available -->
        <!-- WHY: Provides feedback when no services match selected user type -->
        <!-- PATTERN: Conditional rendering with helpful message -->
        <!-- Session 6.8: Improved spacing and typography -->
        <!-- Session 1.3.9.5: Updated to use availableServices -->
        <div v-else-if="wizard.availableServices.value.length === 0" class="text-body-1 text-medium-emphasis py-4">
          No services available for selected user type.
        </div>
        
        <!-- LEARNING: Service Type Selection Cards -->
        <!-- WHY: Card-based selection for better visual consistency -->
        <!-- PATTERN: SelectionCardGroup with stack layout and checkboxes on left -->
        <!-- Session 6.3: Icons mapped with fallback handling -->
        <!-- Session 6.8: Improved spacing between cards -->
        <!-- Session 1.3.9.5: Updated to use checkboxes for multi-select -->
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
/**
 * WHY: Ensures consistent spacing and proper responsive behavior
 * PATTERN: Mobile-first responsive design with Vuetify breakpoints
 */
.service-selection-step {
  // LEARNING: Consistent container padding
  // WHY: Ensures content doesn't touch edges on all screen sizes
  // PATTERN: Responsive padding using Vuetify spacing utilities
  padding: 0;
  
  @media (max-width: 599px) {
    padding: 0;
  }
}

// LEARNING: Service type section spacing
// WHY: Provides visual separation between user type selection and service selection
// PATTERN: Responsive margin-top for proper visual hierarchy
.service-type-section {
  margin-top: 2.5rem;
  
  @media (min-width: 600px) {
    margin-top: 3rem;
  }
  
  @media (min-width: 960px) {
    margin-top: 3.5rem;
  }
}

// LEARNING: Service cards spacing
// WHY: Ensures proper spacing between service selection cards
// PATTERN: Margin bottom on card group container
.service-cards {
  margin-bottom: 1rem;
}
</style>

