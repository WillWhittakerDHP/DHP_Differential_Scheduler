<script setup lang="ts">
/**
 * BookingWizard Component
 * 
 * LEARNING: Multi-step wizard component with horizontal stepper
 * WHY: Provides guided step-by-step booking flow matching Jose's design
 * PATTERN: Horizontal stepper at top, step content below, navigation buttons at bottom
 * COMPARISON: React uses MUI Stepper. Vue uses custom VList-based horizontal stepper
 */

import { computed, provide } from 'vue'
import { useBookingWizard } from '@/composables/useBookingWizard'
import { useAppointment } from '@/composables/useAppointment'
import { useProperty } from '@/composables/useProperty'
import { useUser } from '@/composables/useUser'
import { useNotification } from '@/composables/useNotification'
import { useWizardNavigation } from '@/composables/booking/useWizardNavigation'
import { useWizardValidation } from '@/composables/booking/useWizardValidation'
import { useBookingWizardStepValidators } from '@/composables/booking/useBookingWizardStepValidators'
import { useAppointmentDataCollection } from '@/composables/booking/useAppointmentDataCollection'
import { useWizardDisplay } from '@/composables/booking/useWizardDisplay'
import { useWizardStepContent } from '@/composables/booking/useWizardStepContent'
import { useWizardSubmission } from '@/composables/booking/useWizardSubmission'
import { useThemeMode } from '@/composables/useThemeMode'
import { WIZARD_STEPS } from '@/configs/wizardSteps'
import { useBooking } from '@/composables/useBooking'
import { useAppointmentLoader } from '@/composables/booking/useAppointmentLoader'
import { useWizardStepDataRefs } from '@/composables/booking/useWizardStepDataRefs'
import { useWizardValidationErrors } from '@/composables/booking/useWizardValidationErrors'
import { useWizardAppointmentManagement } from '@/composables/booking/useWizardAppointmentManagement'
import { useAppointmentDropdown } from '@/composables/booking/useAppointmentDropdown'
import { useWizardDevMode } from '@/composables/booking/useWizardDevMode'
import { isDevModeEnabled } from '@/utils/env/devMode'

const wizard = useBookingWizard()
provide('wizard', wizard)

const steps = WIZARD_STEPS

// WHY: Encapsulates step data and validation state refs creation and provide/inject setup
const {
  propertyDetailsStepData,
  contactsStepData,
  availabilityStepData,
  propertyDetailsStepValid,
  propertyDetailsStepValidate,
  propertyDetailsFieldErrors,
  contactsStepValid,
  contactsStepValidate,
  availabilityStepValid,
  availabilityStepValidate,
} = useWizardStepDataRefs()


// LEARNING: Use wizard validation composable
// PATTERN: Composable provides validation function
const { stepValidators } = useBookingWizardStepValidators({
  selectedUserTypeBlock: wizard.selectedUserTypeBlock,
  selectedServices: wizard.selectedServiceTypeBlocks,
  propertyDetailsStepValid: propertyDetailsStepValid,
  propertyDetailsStepValidate: propertyDetailsStepValidate,
  availabilityStepValid: availabilityStepValid,
  availabilityStepValidate: availabilityStepValidate,
  contactsStepValid: contactsStepValid,
  contactsStepValidate: contactsStepValidate,
})

const { validateStep } = useWizardValidation({
  stepValidators: stepValidators, // Pass computed ref directly so validation uses current values
})

// NOTE: Define showError explicitly to avoid temporal dead zone issues
const notificationComposable = useNotification()
const showError = notificationComposable.error
const success = notificationComposable.success

// LEARNING: Use wizard navigation composable
// PATTERN: Composable provides navigation functions and state
const {
  activeStep,
  completedSteps,
  isLastStep,
  handleNext: baseHandleNext,
  handlePrev,
  handleStepClick: baseHandleStepClick,
  getStepState,
  isStepAccessible
} = useWizardNavigation({
  steps,
  validateStep,
  showError
})

const { handleNext } = useWizardValidationErrors({
  activeStep,
  validateStep,
  baseHandleNext,
  showError,
  propertyDetailsStepData,
  propertyDetailsStepValidate,
  propertyDetailsFieldErrors,
  contactsStepValidate,
  availabilityStepValidate,
  selectedPropertyTypeBlocks: wizard.selectedPropertyTypeBlocks,
})

// WHY: Navigation composable handles validation, just pass through
const handleStepClick = baseHandleStepClick

// PATTERN: useMutation from useAppointment composable
const { create, update, fetchAll, fetchRandom } = useAppointment()
const { loadAppointmentById } = useAppointmentLoader()
const { create: createProperty } = useProperty()
const { create: createUser } = useUser()

// WHY: Needed to transform appointment to wizard state
// PATTERN: Use useBooking composable to get scheduler data
const { bookingData } = useBooking()

// WHY: Encapsulates appointment dropdown formatting logic
const { appointmentDropdownItems } = useAppointmentDropdown({
  fetchAll,
})

// LEARNING: Use appointment data collection composable
// PATTERN: Composable provides data collection function
const { collectAppointmentData } = useAppointmentDataCollection({
  wizard: {
    selectedServices: wizard.selectedServiceTypeBlocks,
    selectedPropertyTypeBlocks: wizard.selectedPropertyTypeBlocks,
    selectedOptionTypeBlocks: wizard.selectedOptionTypeBlocks,
    selectedUserTypeBlock: wizard.selectedUserTypeBlock,
    isQuoteMode: wizard.isQuoteMode
  },
  propertyDetailsStepData: propertyDetailsStepData,
  contactsStepData: contactsStepData,
  availabilityStepData: availabilityStepData,
  createProperty,
  createUser,
  showError
})

// NOTE: Must be called before useWizardDisplay since it provides loadedWizardState
const {
  loadedWizardState,
  loadedAppointmentId,
  selectedAppointmentId,
  isLoadingAppointment,
  handleLoadAppointment,
  handleUpdateAppointment,
  handleResetWizard,
} = useWizardAppointmentManagement({
  wizard,
  bookingData,
  loadAppointmentById,
  fetchRandom,
  collectAppointmentData,
  updateAppointment: {
    mutateAsync: update.mutateAsync,
    isPending: update.isPending,
  },
  activeStep,
  completedSteps,
  propertyDetailsStepData,
  contactsStepData,
  availabilityStepData,
  propertyDetailsStepValid,
  propertyDetailsStepValidate,
  propertyDetailsFieldErrors,
  contactsStepValid,
  contactsStepValidate,
  availabilityStepValid,
  availabilityStepValidate,
  showError,
  success,
})

// LEARNING: Use wizard display composable
// PATTERN: Composable provides reactive computed properties for display
const {
  stepSubtitles,
} = useWizardDisplay({
  steps,
  selectedServices: wizard.selectedServiceTypeBlocks,
  loadedWizardState
})

// LEARNING: Use wizard step content composable
// PATTERN: Composable provides step content component mapping
const { getStepContent } = useWizardStepContent()

// LEARNING: Use theme mode composable for quote mode theme switching
// PATTERN: Composable watches isQuoteMode and updates theme colors automatically
// NOTE: Pass wizard instance directly since we have it in scope
useThemeMode(wizard)

// LEARNING: Computed property for quote mode state
// PATTERN: Computed property that reads from wizard state
const isQuoteMode = computed(() => wizard.isQuoteMode.value)

const toggleQuoteMode = (): void => {
  wizard.isQuoteMode.value = !wizard.isQuoteMode.value
}

// LEARNING: Use wizard submission composable
// PATTERN: Composable provides submission function
const { handleSubmit } = useWizardSubmission({
  collectAppointmentData,
  createAppointment: create,
  activeStep,
  completedSteps,
  showError,
  success
})

provide('loadedWizardState', loadedWizardState)

// WHY: Encapsulates dev mode state and handlers, provides reset mocks signal
const isDevMode = isDevModeEnabled()
// LEARNING: Dev mode composable called for side effects, handleResetMocks not currently used
// WHY: Composable may set up watchers or other side effects
// PATTERN: Call composable without destructuring unused return values
useWizardDevMode({
  wizard,
  isDevMode,
  selectedAppointmentId,
  appointmentDropdownItems,
  loadedAppointmentId,
  isLoadingAppointment,
  fetchAll,
  handleLoadAppointment,
  handleResetWizard,
})
</script>

<template>
  <VCard class="booking-wizard" :class="{ 'quote-mode-active': isQuoteMode }">
    
    <VContainer fluid class="pa-0">
      <VRow no-gutters class="wizard-layout">
        <!-- Stepper Header (Top) -->
        <VCol cols="12" class="stepper-column">
          <VCardText class="stepper-header" :class="{ 'quote-mode-active': isQuoteMode }">
            <VList class="horizontal-stepper" density="compact">
              <VListItem
                v-for="(step, index) in steps"
                :key="index"
                :class="['stepper-item', getStepState(index), { 'step-disabled': !isStepAccessible(index) }]"
                :style="{ cursor: isStepAccessible(index) ? 'pointer' : 'not-allowed', opacity: isStepAccessible(index) ? 1 : 0.5 }"
                @click="isStepAccessible(index) ? handleStepClick(index) : null"
              >
                <template #prepend>
                  <VAvatar
                    :color="index <= activeStep ? 'primary' : 'default'"
                    :variant="index === activeStep ? 'flat' : 'tonal'"
                    size="48"
                    rounded
                    class="stepper-avatar"
                  >
                    <span class="step-number">{{ index + 1 }}</span>
                  </VAvatar>
                </template>
                
                <!-- LEARNING: Hide step titles/subtitles in devMode -->
                <!-- WHY: Shows only avatars during development for cleaner UI -->
                <!-- PATTERN: Conditional rendering based on devMode flag -->
                <VListItemTitle v-if="!isDevMode" class="stepper-title">
                  {{ step.title }}
                </VListItemTitle>
                <VListItemSubtitle v-if="!isDevMode" class="stepper-subtitle">
                  {{ stepSubtitles[index] }}
                </VListItemSubtitle>
              </VListItem>
            </VList>
            
            <!-- LEARNING: Quote Mode Button and DevMode Controls -->
            <!-- WHY: Allows users to toggle quote mode and update appointments in dev mode -->
            <!-- PATTERN: VBtn with toggle state, devMode controls in same row -->
            <VRow class="mt-4 align-center justify-center" no-gutters>
              <!-- Update Appointment Button (only in development) -->
              <VCol v-if="isDevMode" cols="auto" class="mr-2">
                <VBtn
                  color="success"
                  variant="outlined"
                  size="small"
                  prepend-icon="tabler-device-floppy"
                  @click="handleUpdateAppointment"
                  :loading="update.isPending.value"
                  :disabled="update.isPending.value || !loadedAppointmentId"
                >
                  UPDATE APPOINTMENT
                </VBtn>
              </VCol>
              <!-- Quote Mode Button -->
              <VCol cols="auto">
                <VBtn
                  color="primary"
                  :variant="isQuoteMode ? 'flat' : 'outlined'"
                  prepend-icon="tabler-currency-dollar"
                  size="small"
                  @click="toggleQuoteMode"
                  class="quote-mode-button"
                >
                  {{ isQuoteMode ? 'I want to book' : 'I only want a quote' }}
                </VBtn>
              </VCol>
            </VRow>
          </VCardText>
        </VCol>

        <!-- Step Content (Below Stepper) -->
        <VCol cols="12" class="content-column">
          <VCardText class="step-content">
            <component :is="getStepContent(activeStep)" v-if="getStepContent(activeStep)" />
            
            <!-- Navigation Footer -->
            <div class="d-flex justify-space-between mt-6">
              <VBtn
                variant="tonal"
                color="secondary"
                :disabled="activeStep === 0"
                prepend-icon="tabler-arrow-left"
                @click="handlePrev"
              >
                Previous
              </VBtn>
              
              <VBtn
                :color="isLastStep ? 'success' : 'primary'"
                :prepend-icon="isLastStep ? 'tabler-check' : undefined"
                :append-icon="!isLastStep ? 'tabler-arrow-right' : undefined"
                :loading="isLastStep && create.isPending.value"
                :disabled="isLastStep && create.isPending.value"
                @click="isLastStep ? handleSubmit() : handleNext()"
              >
                {{ isLastStep ? (create.isPending.value ? 'Creating...' : 'Submit') : 'Next' }}
              </VBtn>
            </div>
          </VCardText>
        </VCol>
      </VRow>
    </VContainer>
  </VCard>
</template>

<style scoped lang="scss">
.booking-wizard {
  height: 100%;
  
  // WHY: Defines quote mode color palette as CSS custom properties
  // PATTERN: CSS variables that override Vuetify theme variables when quote mode is active
  --quote-mode-primary: 51, 191, 120; // #33BF78 (green, 20% less vibrant)
  --quote-mode-primary-darken-1: 45, 168, 102; // #2DA866 (darker green)
  --quote-mode-secondary: 189, 120, 50; // #BD7832 (orange-brown, green - 120°, 20% less vibrant)
  --quote-mode-secondary-darken-1: 168, 104, 42; // #A8682A (darker orange-brown)
  --quote-mode-warning: 230, 70, 90; // #E6465A (different red, 20% less vibrant)
  --quote-mode-warning-darken-1: 207, 62, 80; // #CF3E50 (darker red)
  --quote-mode-on-primary: 255, 255, 255; // White text on green
  --quote-mode-on-secondary: 255, 255, 255; // White text on orange-brown
  --quote-mode-on-warning: 255, 255, 255; // White text on red
  
  // PATTERN: Lighter versions of active colors (80% white + 20% color)
  --inactive-primary: 227, 225, 252; // #E3E1FC (light purple, 80% white + 20% #7367F0)
  --inactive-secondary: 255, 236, 217; // #FFECD9 (light orange, 80% white + 20% #FF9F43)
  
  --quote-mode-inactive-primary: 214, 242, 228; // #D6F2E4 (light green, 80% white + 20% #33BF78)
  --quote-mode-inactive-secondary: 242, 228, 214; // #F2E4D6 (light orange-brown, 80% white + 20% #BD7832)
  
  // PATTERN: CSS variable override at component root level with :deep() to ensure cascading
  &.quote-mode-active {
    --v-theme-primary: var(--quote-mode-primary);
    --v-theme-primary-darken-1: var(--quote-mode-primary-darken-1);
    --v-theme-secondary: var(--quote-mode-secondary);
    --v-theme-secondary-darken-1: var(--quote-mode-secondary-darken-1);
    --v-theme-warning: var(--quote-mode-warning);
    --v-theme-warning-darken-1: var(--quote-mode-warning-darken-1);
    --v-theme-on-primary: var(--quote-mode-on-primary);
    --v-theme-on-secondary: var(--quote-mode-on-secondary);
    --v-theme-on-warning: var(--quote-mode-on-warning);
    
    --inactive-primary: var(--quote-mode-inactive-primary);
    --inactive-secondary: var(--quote-mode-inactive-secondary);
    
    :deep(*) {
      --v-theme-primary: var(--quote-mode-primary);
      --v-theme-primary-darken-1: var(--quote-mode-primary-darken-1);
      --v-theme-secondary: var(--quote-mode-secondary);
      --v-theme-secondary-darken-1: var(--quote-mode-secondary-darken-1);
      --v-theme-warning: var(--quote-mode-warning);
      --v-theme-warning-darken-1: var(--quote-mode-warning-darken-1);
      --v-theme-on-primary: var(--quote-mode-on-primary);
      --v-theme-on-secondary: var(--quote-mode-on-secondary);
      --v-theme-on-warning: var(--quote-mode-on-warning);
      --inactive-primary: var(--quote-mode-inactive-primary);
      --inactive-secondary: var(--quote-mode-inactive-secondary);
    }
  }
  
  .wizard-layout {
    min-height: 600px;
  }
  
  .stepper-column {
    display: flex;
    flex-direction: column;
    position: relative;
    z-index: 10;
  }
  
  .content-column {
    display: flex;
    flex-direction: column;
  }
  
  .stepper-header {
    border-bottom: 1px solid rgb(var(--v-theme-on-surface-variant));
    padding: 24px 16px !important;
    transition: all 0.3s ease;
    position: relative;
    background-color: rgb(var(--v-theme-surface));
    box-shadow: none;
    width: 100%;
    flex-shrink: 0;
    
    @media (max-width: 959px) {
      padding: 16px 8px !important;
    }
    
    // PATTERN: Background color change and border color change (colors handled by CSS variables)
    .booking-wizard.quote-mode-active & {
      background-color: rgba(var(--v-theme-primary), 0.05);
      border-bottom-color: rgb(var(--v-theme-primary));
    }
  }
  
  // PATTERN: Centered button with transition effects
  .quote-mode-control {
    margin-top: 16px;
    
    .quote-mode-button {
      transition: all 0.3s ease;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }
    }
  }
  
  .step-content {
    padding: 24px !important;
    min-height: 500px;
    
    @media (max-width: 959px) {
      padding: 16px !important;
    }
  }
}

// PATTERN: VList-based horizontal stepper with connectors and state styling
.horizontal-stepper {
  padding: 0;
  display: flex;
  flex-direction: row;
  transition: all 0.3s ease;
  justify-content: space-between;
  align-items: flex-start;
  
  :deep(.v-list-item) {
    flex-direction: column;
    align-items: center;
    flex: 1;
    max-width: 100%;
    padding: 0 8px;
  }
  
  .stepper-item {
    position: relative;
    padding: 8px 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    min-height: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    overflow: visible;
    
    &:hover {
      background-color: rgba(var(--v-theme-on-surface), 0.02);
      border-radius: 8px;
    }
    
    &.step-active {
      .stepper-title {
        color: rgb(var(--v-theme-primary));
        font-weight: 600;
      }
      
      .stepper-subtitle {
        color: rgb(var(--v-theme-primary));
      }
    }
    
    &.step-completed {
      .stepper-title,
      .stepper-subtitle {
        color: rgba(var(--v-theme-on-surface), 0.6);
      }
    }
    
    &.step-pending {
      .stepper-title,
      .stepper-subtitle {
        color: rgba(var(--v-theme-on-surface), 0.4);
      }
    }
    
    &.step-disabled {
      cursor: not-allowed !important;
      opacity: 0.5;
      
      &:hover {
        background-color: transparent;
      }
      
      .stepper-title,
      .stepper-subtitle {
        color: rgba(var(--v-theme-on-surface), 0.3);
      }
    }
    
    &:not(:last-child)::after {
      content: '';
      position: absolute;
      left: calc(100% - 8px); // Start after the item
      top: 24px; // Center vertically on avatar (48px / 2 = 24px)
      width: calc(100% - 16px);
      height: 2px;
      background-color: rgba(var(--v-theme-on-surface), 0.12);
      z-index: 0;
    }
    
    &.step-completed:not(:last-child)::after {
      background-color: rgb(var(--v-theme-primary));
    }
  }
  
  .stepper-title {
    font-size: 0.875rem;
    font-weight: 500;
    margin-top: 8px;
    margin-bottom: 4px;
    text-align: center;
    white-space: normal;
    opacity: 1;
    transform: translateX(0);
    transition: all 0.3s ease;
    
    @media (max-width: 959px) {
      font-size: 0.75rem;
    }
  }
  
  .stepper-subtitle {
    font-size: 0.75rem;
    line-height: 1.2rem;
    text-align: center;
    white-space: normal;
    opacity: 1;
    transform: translateX(0);
    transition: all 0.3s ease;
    
    @media (max-width: 959px) {
      font-size: 0.6875rem;
      display: none; // Hide subtitles on mobile to save space
    }
  }
  
  .stepper-avatar {
    flex-shrink: 0;
    position: relative;
    z-index: 1;
    
    .step-number {
      font-size: 1.25rem;
      font-weight: 600;
      color: inherit;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
    }
  }
}
</style>

