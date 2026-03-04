<script setup lang="ts">

import { computed, provide } from 'vue'
import { useBookingWizard } from '@/composables/booking/useBookingWizard'
import { useAppointment } from '@/composables/useAppointment'
import { useProperty } from '@/composables/useProperty'
import { useUser } from '@/composables/useUser'
import { useNotification } from '@/composables/useNotification'
import { useWizardNavigation } from '@/composables/booking/useWizardNavigation'
import { useWizardStepValidation } from '@/composables/booking/useWizardStepValidation'
import { useAppointmentDataCollection } from '@/utils/booking/appointmentDataCollection'
import { useWizardDisplay } from '@/composables/booking/useWizardDisplay'
import { useWizardStepContent } from '@/composables/booking/useWizardStepContent'
import { useWizardSubmission } from '@/utils/booking/wizardSubmission'
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
import { useWizardDateAvailability } from '@/composables/booking/useWizardDateAvailability'
import { wizardKey } from '@/composables/booking/injectionKeys'
import type { UseBookingWizardReturn } from '@/types/wizard'

const wizardGrouped = useBookingWizard()
const wizard: UseBookingWizardReturn = {
  ...wizardGrouped.state,
  ...wizardGrouped.actions,
  ...wizardGrouped.computed,
}
provide(wizardKey, wizard)

const steps = WIZARD_STEPS

const stepDataRefs = useWizardStepDataRefs()
const { validateStep } = useWizardStepValidation({ stepDataRefs, wizard })

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
  propertyDetailsStepData: stepDataRefs.propertyDetailsStepData,
  propertyDetailsStepValidate: stepDataRefs.propertyDetailsStepValidate,
  propertyDetailsFieldErrors: stepDataRefs.propertyDetailsFieldErrors,
  contactsStepValidate: stepDataRefs.contactsStepValidate,
  availabilityStepValidate: stepDataRefs.availabilityStepValidate,
  selectedPropertyTypeBlocks: wizard.selectedPropertyTypeBlocks,
})

// WHY: Navigation composable handles validation, just pass through
const handleStepClick = baseHandleStepClick

function stepItemClass(index: number): (string | Record<string, boolean>)[] {
  return ['stepper-item', getStepState(index), { 'step-disabled': !isStepAccessible(index) }]
}
function stepItemStyle(index: number): { cursor: string; opacity: number } {
  const accessible = isStepAccessible(index)
  return { cursor: accessible ? 'pointer' : 'not-allowed', opacity: accessible ? 1 : 0.5 }
}

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
    selectedServiceTypeBlocks: wizard.selectedServiceTypeBlocks,
    selectedPropertyTypeBlocks: wizard.selectedPropertyTypeBlocks,
    selectedOptionTypeBlocks: wizard.selectedOptionTypeBlocks,
    selectedLineItemBlocks: wizard.selectedLineItemBlocks,
    selectedUserTypeBlock: wizard.selectedUserTypeBlock,
    isQuoteMode: wizard.isQuoteMode
  },
  propertyDetailsStepData: stepDataRefs.propertyDetailsStepData,
  contactsStepData: stepDataRefs.contactsStepData,
  availabilityStepData: stepDataRefs.availabilityStepData,
  createProperty,
  createUser,
  showError
})

const {
  loadedWizardState,
  loadedAppointmentId,
  selectedAppointmentId,
  isLoadingAppointment,
  handleLoadAppointment,
  handleUpdateAppointment,
  handleResetWizard,
} = useWizardAppointmentManagement({
  ...stepDataRefs,
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
  showError,
  success,
})

// LEARNING: Use wizard display composable
// PATTERN: Composable provides reactive computed properties for display
const {
  stepSubtitles,
} = useWizardDisplay({
  steps,
  selectedServiceTypeBlocks: wizard.selectedServiceTypeBlocks,
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

void useWizardDateAvailability({ stepDataRefs, activeStep })

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
  handleUpdateAppointment,
  handleResetWizard,
  updateAppointment: {
    isPending: update.isPending,
  },
})
</script>

<template>
  <VCard class="booking-wizard" :class="{ 'quote-mode-active': isQuoteMode }">
    
    <VContainer fluid class="pa-0">
      <VRow density="compact" class="wizard-layout">
        <!-- Stepper Header (Top) -->
        <VCol cols="12" class="stepper-column">
          <VCardText class="stepper-header" :class="{ 'quote-mode-active': isQuoteMode }">
            <VList class="horizontal-stepper" density="compact">
              <VListItem
                v-for="(step, index) in steps"
                :key="index"
                :class="stepItemClass(index)"
                :style="stepItemStyle(index)"
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
            
            <!-- LEARNING: Quote Mode Button -->
            <!-- WHY: Allows users to toggle quote mode -->
            <!-- PATTERN: VBtn with toggle state -->
            <VRow class="mt-4 align-center justify-center" density="compact">
              <VCol cols="auto">
                <VBtn
                  color="primary"
                  :variant="isQuoteMode ? 'flat' : 'outlined'"
                  prepend-icon="tabler-currency-dollar"
                  size="small"
                  @click="toggleQuoteMode"
                  class="quote-mode-button"
                >
                  {{ isQuoteMode ? 'I want to book' : 'I want a quote' }}
                </VBtn>
              </VCol>
              <VCol v-if="isDevMode" cols="auto" class="ml-2">
                <VBtn
                  color="secondary"
                  variant="outlined"
                  size="small"
                  prepend-icon="tabler-file-upload"
                  :loading="fetchAll.isLoading.value || isLoadingAppointment"
                  @click="handleLoadAppointment('random')"
                >
                  Load Random Appointment
                </VBtn>
              </VCol>
              <VCol v-if="isDevMode && loadedAppointmentId" cols="auto" class="ml-2">
                <VBtn
                  color="success"
                  variant="outlined"
                  size="small"
                  prepend-icon="tabler-device-floppy"
                  :loading="update.isPending.value"
                  @click="handleUpdateAppointment"
                >
                  Update Appointment
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
              
              <div class="d-flex gap-3">
                <!-- ENACTMENT(Feature 7): Enable when authentication is implemented -->
                <VTooltip v-if="isLastStep" location="top">
                  <template #activator="{ props: tooltipProps }">
                    <div v-bind="tooltipProps">
                      <VBtn
                        variant="outlined"
                        color="warning"
                        prepend-icon="tabler-clock-pause"
                        disabled
                      >
                        Hold Slot
                      </VBtn>
                    </div>
                  </template>
                  <span>Hold requires authentication (Feature 7)</span>
                </VTooltip>

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
            </div>
          </VCardText>
        </VCol>
      </VRow>
    </VContainer>
  </VCard>
</template>

<style scoped lang="scss" src="./BookingWizard.scss"></style>

