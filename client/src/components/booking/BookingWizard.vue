<script setup lang="ts">
/**
 * BookingWizard Component
 * 
 * LEARNING: Multi-step wizard component with horizontal stepper
 * WHY: Provides guided step-by-step booking flow matching Jose's design
 * PATTERN: Horizontal stepper at top, step content below, navigation buttons at bottom
 * COMPARISON: React uses MUI Stepper. Vue uses custom VList-based horizontal stepper
 */

import { computed, ref, provide, inject, nextTick, type Ref } from 'vue'
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
import type { WizardStateData } from '@/utils/transformers/appointmentToWizardTransformer'
import { transformAppointmentToWizard } from '@/utils/transformers/appointmentToWizardTransformer'
import { WIZARD_STEPS } from '@/configs/wizardSteps'
import type { AvailabilityStepData, PropertyDetailsStepData, ContactsStepData } from '@/types/wizard'
import { useBooking } from '@/composables/useBooking'
import { useAppointmentLoader } from '@/composables/booking/useAppointmentLoader'
import type { AppointmentResponse } from '@/types/appointment'
import { isDevModeEnabled } from '@/utils/env/devMode'

// LEARNING: Create single wizard instance for all steps
// WHY: Ensures all step components share the same wizard state
// PATTERN: Create instance once in parent, provide to children
const wizard = useBookingWizard()
provide('wizard', wizard)

// LEARNING: State for loading appointment data
// WHY: Tracks loaded wizard state for populating form fields
// PATTERN: Reactive ref that holds transformed appointment data
const loadedWizardState = ref<WizardStateData | null>(null)

// LEARNING: Provide loaded wizard state for form field population
// WHY: Enables step components to populate form fields from loaded appointment
// PATTERN: Provide reactive ref that step components can watch
provide('loadedWizardState', loadedWizardState)

// LEARNING: DevMode state for appointment loading
// WHY: Tracks which appointment is loaded for update/reset functionality
// PATTERN: Reactive refs for appointment selection and tracking
const isDevMode = isDevModeEnabled()
const selectedAppointmentId = ref<string | null>(null)
const loadedAppointmentId = ref<string | null>(null)
const isLoadingAppointment = ref(false)

// LEARNING: Navigation and validation state managed by composables
// WHY: Extracted to useWizardNavigation and useWizardValidation composables


// LEARNING: Step definitions from centralized config
// WHY: Extracted to configs/wizardSteps.ts for reusability
// PATTERN: Import step configuration from config file
const steps = WIZARD_STEPS

// LEARNING: Create and provide mutable refs for step data and validation state
// WHY: Parent provides refs that children write to (provide/inject only works parent-to-child)
// PATTERN: Create refs in parent, provide to children, children inject and write to them
// Step data refs
const propertyDetailsStepData = ref<PropertyDetailsStepData | null>(null)
const contactsStepData = ref<ContactsStepData | null>(null)
const availabilityStepData = ref<AvailabilityStepData | null>(null)

// Step validation state refs
const propertyDetailsStepValid = ref<boolean>(false)
const propertyDetailsStepValidate = ref<(() => boolean) | null>(null)
const propertyDetailsFieldErrors = ref<Record<string, string>>({})
const contactsStepValid = ref<boolean>(false)
const contactsStepValidate = ref<(() => boolean) | null>(null)
const availabilityStepValid = ref<boolean>(false)
const availabilityStepValidate = ref<(() => boolean) | null>(null)

// Provide step data refs to children
provide('propertyDetailsStepData', propertyDetailsStepData)
provide('contactsStepData', contactsStepData)
provide('availabilityStepData', availabilityStepData)

// Provide validation state refs to children
provide('propertyDetailsStepValid', propertyDetailsStepValid)
provide('propertyDetailsStepValidate', propertyDetailsStepValidate)
provide('propertyDetailsFieldErrors', propertyDetailsFieldErrors)
provide('contactsStepValid', contactsStepValid)
provide('contactsStepValidate', contactsStepValidate)
provide('availabilityStepValid', availabilityStepValid)
provide('availabilityStepValidate', availabilityStepValidate)

// LEARNING: Use wizard validation composable
// WHY: Extracts validation logic from component to composable
// PATTERN: Composable provides validation function
// NOTE: Pass refs directly; composable unwraps them reactively.
const { stepValidators } = useBookingWizardStepValidators({
  selectedUserTypeBlock: wizard.selectedUserTypeBlock,
  selectedServices: wizard.selectedServices,
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

// LEARNING: Get notification functions BEFORE using them in composables
// WHY: showError is needed by useWizardNavigation, so it must be defined first
// PATTERN: Define dependencies before using them
// NOTE: Define showError explicitly to avoid temporal dead zone issues
const notificationComposable = useNotification()
const showError = notificationComposable.error
const success = notificationComposable.success

// LEARNING: Use wizard navigation composable
// WHY: Extracts navigation logic from component to composable
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

// LEARNING: Wrap handleNext to show error on validation failure
// WHY: Navigation composable doesn't handle error display
// PATTERN: Wrap composable function to add error handling
const handleNext = async (): Promise<void> => {
  const isValid = validateStep(activeStep.value)
  if (!isValid) {
    // Handle step 1 (Property Details) validation errors
    if (activeStep.value === 1) {
      // Trigger validation function if available to populate field errors
      if (propertyDetailsStepValidate.value) {
        propertyDetailsStepValidate.value()
        // Wait a tick for fieldErrors to update
        await nextTick()
      }
      
      // Check property type block selection
      const hasPropertyTypeBlock = wizard.selectedPropertyTypeBlocks.value.length > 0
      
      // Log specific field errors if available
      if (propertyDetailsFieldErrors.value && Object.keys(propertyDetailsFieldErrors.value).length > 0) {
        const errors = Object.entries(propertyDetailsFieldErrors.value)
        if (errors.length > 0) {
          const errorMessages = errors.map(([field, error]) => `${field}: ${error}`).join(', ')
          showError(`Please fix the following: ${errorMessages}`)
        } else if (!hasPropertyTypeBlock) {
          showError('Please select at least one property type')
        } else {
          showError('Please complete all required fields: address, city, state, zip code, and size')
        }
      } else {
        // Field errors not available, check form data directly from stepData
        const missingFields: string[] = []
        if (!hasPropertyTypeBlock) missingFields.push('property type')
        
        // Check form fields from propertyDetailsStepData
        if (propertyDetailsStepData.value) {
          const data = propertyDetailsStepData.value
          if (!data.address || data.address.trim().length < 3) missingFields.push('address')
          if (!data.city || data.city.trim().length < 2) missingFields.push('city')
          if (!data.state) missingFields.push('state')
          if (!data.zipCode || !/^\d{5}(-\d{4})?$/.test(data.zipCode)) missingFields.push('zip code')
          if (!data.propertySize || data.propertySize < 1) missingFields.push('property size')
          
          // Check numberOfUnits if multi-family
          const isMultiFamily = wizard.selectedPropertyTypeBlocks.value.some(
            block => block.name?.toLowerCase().includes('multi') || block.name?.toLowerCase().includes('duplex')
          )
          if (isMultiFamily && (!data.numberOfUnits || data.numberOfUnits < 1)) {
            missingFields.push('number of units')
          }
        } else {
          // Step data not available, all fields are missing
          missingFields.push('address', 'city', 'state', 'zip code', 'property size')
        }
        
        // Note: Debug logging removed - error already shown to user via showError
        const missingMsg = missingFields.length > 0 
          ? `Please complete: ${missingFields.join(', ')}`
          : 'Please complete all required fields'
        showError(missingMsg)
      }
    } else if (activeStep.value === 2) {
      // Handle step 2 (Availability) validation errors
      if (availabilityStepValidate.value) {
        availabilityStepValidate.value()
      }
      showError('Please complete all required fields before continuing')
    } else if (activeStep.value === 3) {
      // Handle step 3 (Contacts) validation errors
      if (contactsStepValidate.value) {
        contactsStepValidate.value()
      }
      showError('Please complete all required fields before continuing')
    } else {
      showError('Please complete all required fields before continuing')
    }
    return
  }
  baseHandleNext()
}

// LEARNING: Wrap handleStepClick to show error on validation failure
// WHY: Navigation composable doesn't handle error display
// PATTERN: Wrap composable function to add error handling
const handleStepClick = (index: number): void => {
  baseHandleStepClick(index)
}

// LEARNING: Use wizard display composable
// WHY: Extracts display logic from component to composable
// PATTERN: Composable provides reactive computed properties for display
const {
  stepSubtitles,
} = useWizardDisplay({
  steps,
  selectedServices: wizard.selectedServices,
  loadedWizardState
})

// LEARNING: Use wizard step content composable
// WHY: Extracts component mapping logic from component to composable
// PATTERN: Composable provides step content component mapping
const { getStepContent } = useWizardStepContent()

// LEARNING: Use theme mode composable for quote mode theme switching
// WHY: Provides reactive theme colors and updates CSS variables when quote mode changes
// PATTERN: Composable watches isQuoteMode and updates theme colors automatically
// NOTE: Pass wizard instance directly since we have it in scope
useThemeMode(wizard)

// LEARNING: Computed property for quote mode state
// WHY: Provides reactive access to quote mode for UI color changes
// PATTERN: Computed property that reads from wizard state
const isQuoteMode = computed(() => wizard.isQuoteMode.value)

// LEARNING: Toggle quote mode handler
// WHY: Allows toggling quote mode from stepper button
// PATTERN: Simple toggle function
const toggleQuoteMode = (): void => {
  wizard.isQuoteMode.value = !wizard.isQuoteMode.value
}

// LEARNING: Display computed properties moved to useWizardDisplay composable
// WHY: Extracted to composable for better organization

// LEARNING: Appointment mutation for creating appointments
// WHY: Handles appointment creation with loading and error states
// PATTERN: useMutation from useAppointment composable
const { create, update, fetchAll, fetchRandom } = useAppointment()
const { loadAppointmentById } = useAppointmentLoader()
const { create: createProperty } = useProperty()
const { create: createUser } = useUser()
// NOTE: success and showError are already defined above via useNotification()

// LEARNING: Get booking data for appointment transformation
// WHY: Needed to transform appointment to wizard state
// PATTERN: Use useBooking composable to get scheduler data
const { bookingData } = useBooking()

// LEARNING: Computed property for appointment dropdown items
// WHY: Provides formatted list of appointments for dropdown selection
// PATTERN: Transform appointments array to dropdown format with address display
const appointmentDropdownItems = computed(() => {
  const appointments = fetchAll.data.value || []
  
  // LEARNING: Use map to create items array instead of forEach with push mutations
  // WHY: Functional approach avoids forEach with array mutations
  // PATTERN: Map appointments to items array, prepend "Random Appointment" option
  const items = [
    { text: 'Random Appointment', value: 'random' },
    ...appointments.map((appointment) => {
      const address = appointment.propertyVersion?.address
      const addressText = address 
        ? `${address.address || ''}${address.unit ? ` ${address.unit}` : ''}, ${address.city || ''}, ${address.state || ''}`.trim()
        : `Appointment ${appointment.id.slice(0, 8)}`
      return {
        text: addressText || `Appointment ${appointment.id.slice(0, 8)}`,
        value: appointment.id
      }
    })
  ]
  
  return items
})

// LEARNING: Step data refs are now created and provided above (not injected)
// WHY: Parent provides refs that children write to (provide/inject only works parent-to-child)
// PATTERN: Refs created above, children inject and sync their local state to these refs

// NOTE: Appointment-loading into the wizard has been removed.
// WHY: Keeps the wizard "new booking only" and avoids hidden filtering/mapping surprises from legacy appointment data.

// LEARNING: Use appointment data collection composable
// WHY: Extracts massive data collection logic from component to composable
// PATTERN: Composable provides data collection function
  const { collectAppointmentData } = useAppointmentDataCollection({
  wizard: {
    selectedServices: wizard.selectedServices,
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

// LEARNING: Use wizard submission composable
// WHY: Extracts submission logic from component to composable
// PATTERN: Composable provides submission function
const { handleSubmit } = useWizardSubmission({
  collectAppointmentData,
  createAppointment: create,
  activeStep,
  completedSteps,
  showError,
  success
})

// LEARNING: Handle loading appointment into wizard
// WHY: Enables testing time slot creation by loading existing appointments
// PATTERN: Load appointment, transform to wizard state, populate wizard refs
const handleLoadAppointment = async (appointmentIdOrRandom: string | null): Promise<void> => {
  if (!appointmentIdOrRandom) return
  
  isLoadingAppointment.value = true
  try {
    let appointment
    
    if (appointmentIdOrRandom === 'random') {
      appointment = await fetchRandom()
      if (!appointment) {
        showError('No appointments available to load')
        return
      }
      selectedAppointmentId.value = appointment.id
    } else {
      // LEARNING: Load appointment using composable with cache refresh
      // WHY: Ensures appointment is loaded with all relationships from API
      // PATTERN: Composable handles cache refresh and returns appointment from cache
      try {
        appointment = await loadAppointmentById(appointmentIdOrRandom)
        if (!appointment) {
          showError('Appointment not found')
          return
        }
        selectedAppointmentId.value = appointment.id
      } catch (error) {
        showError('Appointment not found')
        return
      }
    }
    
    if (!appointment || !bookingData.value) {
      showError('Unable to load appointment data')
      return
    }
    
    // Transform appointment to wizard state
    const wizardState = await transformAppointmentToWizard(appointment, bookingData.value)
    
    // Populate wizard state refs (skip cascade to avoid clearing dependent selections)
    // Use spread operators to ensure Vue detects array changes
    wizard.selectUserTypeBlock(wizardState.userTypeBlock, true)
    wizard.selectedServices.value = [...wizardState.services]
    wizard.selectedPropertyTypeBlocks.value = [...wizardState.propertyTypeBlocks]
    wizard.selectedOptionTypeBlocks.value = [...wizardState.optionTypeBlocks]
    wizard.isQuoteMode.value = wizardState.isQuoteMode
    
    // Set loaded wizard state for form field population
    loadedWizardState.value = wizardState
    loadedAppointmentId.value = appointment.id
    
    // Populate step data refs (children will sync from these)
    propertyDetailsStepData.value = wizardState.propertyDetails
    contactsStepData.value = {
      clientInfo: wizardState.contacts.client,
      agentInfo: wizardState.contacts.agent,
      anotherClientInfo: wizardState.contacts.additionalContacts.find(c => c.role === 'anotherClient') || { firstName: '', lastName: '', email: '' },
      transactionManagerInfo: wizardState.contacts.additionalContacts.find(c => c.role === 'transactionManager') || { firstName: '', lastName: '', email: '' },
      sellerInfo: wizardState.contacts.additionalContacts.find(c => c.role === 'seller') || { firstName: '', lastName: '', email: '' },
      showAnotherClient: wizardState.contacts.additionalContacts.some(c => c.role === 'anotherClient'),
      showTransactionManager: wizardState.contacts.additionalContacts.some(c => c.role === 'transactionManager'),
      showSeller: wizardState.contacts.additionalContacts.some(c => c.role === 'seller')
    }
    // NOTE: availabilityStepData is provided by AvailabilityStep component when it mounts
    // The loadedWizardState is already set above, and AvailabilityStep will read from it
    // via useAvailabilityDefaults composable, so we don't need to set it directly here
    
    // LEARNING: Automatically navigate to step 3 after loading appointment
    // WHY: Since appointment data is already loaded, skip step 2 and go directly to step 3 (Availability)
    // PATTERN: Mark intermediate steps as completed and navigate directly to target step
    // Mark step 1 (Property Details) as completed to allow navigation
    completedSteps.value.add(1) // Property Details (step 2)
    // Navigate directly to step 3 (Appointment Availability) - index 2
    activeStep.value = 2
    
    success('Appointment loaded successfully')
    // Clear dropdown selection after load so user can select again
    selectedAppointmentId.value = null
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to load appointment'
    showError(errorMessage)
  } finally {
    isLoadingAppointment.value = false
  }
}

// LEARNING: Handle updating appointment from wizard state
// WHY: Saves current wizard state back to the loaded appointment
// PATTERN: Collect wizard data, update appointment via API
const handleUpdateAppointment = async (): Promise<void> => {
  if (!loadedAppointmentId.value) {
    showError('No appointment loaded')
    return
  }
  
  try {
    const appointmentData = await collectAppointmentData()
    if (!appointmentData) {
      return // Error already shown by collectAppointmentData
    }
    
    await update.mutateAsync({
      id: loadedAppointmentId.value,
      data: appointmentData
    })
    
    success('Appointment updated successfully')
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update appointment'
    console.error('[Wizard] Update appointment error:', error)
    showError(errorMessage)
  } finally {
    // Ensure loading state is cleared even if there's an error
    // The mutation should handle this, but adding as safeguard
  }
}

// LEARNING: Handle resetting wizard state
// WHY: Clears all wizard state and loaded appointment tracking
// PATTERN: Clear all wizard refs and reset loaded state
const handleResetWizard = (): void => {
  wizard.selectUserTypeBlock(null, true)
  wizard.selectedServices.value = []
  wizard.selectedPropertyTypeBlocks.value = []
  wizard.selectedOptionTypeBlocks.value = []
  wizard.isQuoteMode.value = false
  
  loadedWizardState.value = null
  loadedAppointmentId.value = null
  selectedAppointmentId.value = null
  
  // Reset step data refs
  propertyDetailsStepData.value = null
  contactsStepData.value = null
  availabilityStepData.value = null
  
  // Reset validation state
  propertyDetailsStepValid.value = false
  propertyDetailsStepValidate.value = null
  propertyDetailsFieldErrors.value = {}
  contactsStepValid.value = false
  contactsStepValidate.value = null
  availabilityStepValid.value = false
  availabilityStepValidate.value = null
  
  // Reset to first step
  activeStep.value = 0
  
  success('Wizard reset successfully')
}

// LEARNING: Handle resetting mock calendar data
// WHY: Allows developers to regenerate mock busy periods for testing
// PATTERN: Provide reset function that AvailabilityStep can call via inject
const handleResetMocks = (): void => {
  // Emit reset signal via provide/inject
  // AvailabilityStep will inject this and call resetMocks when signal changes
  resetMocksSignal.value++
}

// LEARNING: Reset mocks signal for provide/inject
// WHY: Allows BookingWizard to trigger mock reset in AvailabilityStep
// PATTERN: Incrementing ref that AvailabilityStep watches
const resetMocksSignal = ref(0)
provide('resetMocksSignal', resetMocksSignal)

// LEARNING: Update app-level dev panel buttons
// WHY: DevPanelsContainer is rendered in App.vue, so buttons must be provided at app level
// PATTERN: Inject app-level ref and update it with button functions and state
const appDevPanelButtons = inject<Ref<{
  selectedAppointmentId: Ref<string | null>
  appointmentDropdownItems: ComputedRef<Array<{ text: string; value: string }>>
  loadedAppointmentId: Ref<string | null>
  isLoadingAppointment: Ref<boolean>
  fetchAll: { isLoading: Ref<boolean>; data: Ref<AppointmentResponse[]> }
  handleLoadAppointment: (id: string | null) => Promise<void>
  handleResetWizard: () => void
  handleResetMocks: () => void
} | null>>('devPanelButtons')

if (appDevPanelButtons) {
  appDevPanelButtons.value = {
    selectedAppointmentId,
    appointmentDropdownItems,
    loadedAppointmentId,
    isLoadingAppointment,
    fetchAll,
    handleLoadAppointment,
    handleResetWizard,
    handleResetMocks
  }
}
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
                  {{ isQuoteMode ? 'Quote Mode Active' : 'I only want a quote' }}
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
  
  // LEARNING: Quote mode color variables (20% less vibrant)
  // WHY: Defines quote mode color palette as CSS custom properties
  // PATTERN: CSS variables that override Vuetify theme variables when quote mode is active
  // Colors: Primary-quote (#33BF78), Secondary-quote (#BD7832), Warning-quote (#E6465A)
  --quote-mode-primary: 51, 191, 120; // #33BF78 (green, 20% less vibrant)
  --quote-mode-primary-darken-1: 45, 168, 102; // #2DA866 (darker green)
  --quote-mode-secondary: 189, 120, 50; // #BD7832 (orange-brown, green - 120°, 20% less vibrant)
  --quote-mode-secondary-darken-1: 168, 104, 42; // #A8682A (darker orange-brown)
  --quote-mode-warning: 230, 70, 90; // #E6465A (different red, 20% less vibrant)
  --quote-mode-warning-darken-1: 207, 62, 80; // #CF3E50 (darker red)
  --quote-mode-on-primary: 255, 255, 255; // White text on green
  --quote-mode-on-secondary: 255, 255, 255; // White text on orange-brown
  --quote-mode-on-warning: 255, 255, 255; // White text on red
  
  // LEARNING: Inactive color variables for appointment slot buttons
  // WHY: Provides muted colors for non-selected appointment slots
  // PATTERN: Lighter versions of active colors (80% white + 20% color)
  // Normal mode inactive colors
  --inactive-primary: 227, 225, 252; // #E3E1FC (light purple, 80% white + 20% #7367F0)
  --inactive-secondary: 255, 236, 217; // #FFECD9 (light orange, 80% white + 20% #FF9F43)
  
  // Quote mode inactive colors
  --quote-mode-inactive-primary: 214, 242, 228; // #D6F2E4 (light green, 80% white + 20% #33BF78)
  --quote-mode-inactive-secondary: 242, 228, 214; // #F2E4D6 (light orange-brown, 80% white + 20% #BD7832)
  
  // LEARNING: Override Vuetify theme variables when quote mode is active
  // WHY: All components using primary/secondary/warning colors automatically use quote mode colors
  // PATTERN: CSS variable override at component root level with :deep() to ensure cascading
  // NOTE: useThemeMode composable also updates document root CSS variables for global scope
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
    
    // Update inactive colors for quote mode
    --inactive-primary: var(--quote-mode-inactive-primary);
    --inactive-secondary: var(--quote-mode-inactive-secondary);
    
    // Ensure variables cascade to all child elements (including Vuetify components)
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
    
    // LEARNING: Quote mode active styling
    // WHY: Provides visual feedback when quote mode is active
    // PATTERN: Background color change and border color change (colors handled by CSS variables)
    .booking-wizard.quote-mode-active & {
      background-color: rgba(var(--v-theme-primary), 0.05);
      border-bottom-color: rgb(var(--v-theme-primary));
    }
  }
  
  // LEARNING: Quote mode control styling
  // WHY: Styles the quote mode button below stepper
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

// LEARNING: Custom horizontal stepper styling
// WHY: Creates visual stepper appearance at the top of the wizard
// PATTERN: VList-based horizontal stepper with connectors and state styling
.horizontal-stepper {
  padding: 0;
  display: flex;
  flex-direction: row;
  transition: all 0.3s ease;
  justify-content: space-between;
  align-items: flex-start;
  
  // Ensure VList items are arranged horizontally
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
    
    // Connector line positioned after each step (except last)
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

