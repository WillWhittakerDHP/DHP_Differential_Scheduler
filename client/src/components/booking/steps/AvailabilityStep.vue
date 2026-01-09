<script setup lang="ts">
/**
 * AvailabilityStep Component
 * 
 * LEARNING: Third step for appointment date and time selection
 * WHY: Allows users to select appointment date and time slots
 * PATTERN: Date picker, time slot grid, toggle buttons, availability options with cascade
 * COMPARISON: React uses react-datepicker. Vue uses VDatePicker or VTextField with type="date"
 * 
 * Session 6.9: Integrated with useBookingWizard for cascading availability options
 */

import { computed, inject, ref, type Ref, type ComputedRef } from 'vue'
import type { TimeSlot } from '@/types/appointment'
import { useBookingWizard } from '@/composables/useBookingWizard'
import { useAvailability } from '@/composables/useAvailability'
import { useTimeFormatting } from '@/composables/useTimeFormatting'
import { useAvailabilityLogic } from '@/composables/booking/useAvailabilityLogic'
import { useTimeSlotCalculations } from '@/composables/booking/useTimeSlotCalculations'
import { useAvailabilityValidation } from '@/composables/booking/useAvailabilityValidation'
import { useAvailabilityStepData } from '@/composables/booking/useAvailabilityStepData'
import { useOptionTypeBlockSelection } from '@/composables/booking/useOptionTypeBlockSelection'
import { useAvailabilityUI } from '@/composables/booking/useAvailabilityUI'
import { useAvailabilityDefaults } from '@/composables/booking/useAvailabilityDefaults'
import SelectionCardGroup from '@/components/booking/SelectionCardGroup.vue'
import TimeSlotGrid from '@/components/booking/TimeSlotGrid.vue'
import type { WizardStateData } from '@/utils/transformers/appointmentToWizardTransformer'
import type { AvailabilityStepData } from '@/types/wizard'

// LEARNING: Inject shared wizard instance from parent
// WHY: Ensures all step components share the same wizard state
// PATTERN: Use inject to get provided instance instead of creating new one
const wizard = inject<ReturnType<typeof useBookingWizard>>('wizard')
if (!wizard) {
  throw new Error('Wizard instance not provided. Make sure BookingWizard component provides the wizard instance.')
}

// LEARNING: Inject loaded wizard state for populating form fields
// WHY: Enables populating availability date from loaded appointment
// PATTERN: Inject provided loadedWizardState and watch for changes
const loadedWizardState = inject<Ref<WizardStateData | null>>('loadedWizardState', ref(null))

// LEARNING: Use time formatting composable for time operations
// WHY: Moves time formatting logic out of component to prevent recursion
// PATTERN: Composable provides pure utility functions
const { getTodayDate, formatDuration } = useTimeFormatting()

// LEARNING: Inject property details step data for property-based adjustments
// WHY: Enables property-based time adjustments in availability calculations
// PATTERN: Inject provided propertyDetailsStepData if available
const propertyDetailsStepData = inject<Ref<{ squareFootage?: number | null; bedrooms?: number | null; bathrooms?: number | null; foundationAccess?: 'basement' | 'crawlspace' | 'slab' | null; additionalUnits?: number | null; [key: string]: unknown }> | null>('propertyDetailsStepData', null)

// LEARNING: Create ref wrapper for timeSlots to enable reactive watching
// WHY: `useAvailabilityDefaults` needs a nullable timeSlots source, but `useAvailability` is created later
// PATTERN: Hold the computed ref in a wrapper, then expose two views:
// - nullable (for defaults) to avoid treating "not initialized yet" as "empty"
// - non-null array (for logic) to satisfy composable typing
const timeSlotsWrapper = ref<ComputedRef<TimeSlot[]> | null>(null)
const timeSlotsForDefaults = computed(() => {
  const wrapper = timeSlotsWrapper.value
  if (!wrapper || !('value' in wrapper)) return null as TimeSlot[] | null
  return wrapper.value
}) as ComputedRef<TimeSlot[] | null>
const timeSlotsForLogic = computed(() => {
  const wrapper = timeSlotsWrapper.value
  if (!wrapper || !('value' in wrapper)) return [] as TimeSlot[]
  return wrapper.value
}) as ComputedRef<TimeSlot[]>

// LEARNING: Compute isDifferentialService before useAvailabilityDefaults
// WHY: useAvailabilityDefaults needs isDifferentialService to auto-select startTimeType
// PATTERN: Computed property that checks if any selected service has differential === true
const isDifferentialServiceForDefaults = computed(() => {
  const selectedServices = wizard.selectedServices.value
  return selectedServices.some(s => s.differential === true)
})

// LEARNING: Use availability defaults composable for state management and defaulting
// WHY: Extracts state management and defaulting logic from component
// PATTERN: Composable manages selectedDate, startTimeType, inspectorTimeSlot, clientTimeSlot
const {
  selectedDate,
  startTimeType,
  inspectorTimeSlot,
  clientTimeSlot
} = useAvailabilityDefaults({
  loadedWizardState,
  timeSlots: timeSlotsForDefaults,
  isDifferentialService: isDifferentialServiceForDefaults
})

// LEARNING: Use availability logic composable
// WHY: Extracts business logic from component to composable
// PATTERN: Composable provides reactive computed properties for availability logic
// NOTE: This composable provides accumulatedBlockInstances, dateRangeForApi, and propertyDetails
//       which were previously defined locally in the component
const {
  accumulatedBlockInstances,
  dateRangeForApi,
  propertyDetails,
  timeSlotsPerDay,
  selectedDateSingle,
  currentTimeSlots: baseCurrentTimeSlots,
  isDifferentialService
} = useAvailabilityLogic({
  selectedDate,
  propertyDetailsStepData,
  wizard: {
    selectedServices: wizard.selectedServices,
    selectedPropertyTypeBlocks: wizard.selectedPropertyTypeBlocks,
    selectedOptionTypeBlocks: wizard.selectedOptionTypeBlocks
  },
  timeSlots: timeSlotsForLogic as ComputedRef<TimeSlot[]>,
  loadedWizardState
})

// LEARNING: useAvailability composable for calculating time slots client-side
// WHY: Calculates available time slots from part instances without API dependency
// PATTERN: Uses computed properties from useAvailabilityLogic (accumulatedBlockInstances, dateRangeForApi, propertyDetails)
const { timeSlots } = useAvailability(
  accumulatedBlockInstances,
  dateRangeForApi,
  propertyDetails as ComputedRef<Record<string, unknown> | null>
)

// LEARNING: Update timeSlotsWrapper with actual timeSlots computed ref
// WHY: Enables useAvailabilityDefaults and useAvailabilityLogic to watch actual timeSlots reactively
// PATTERN: Update wrapper ref after timeSlots is created
timeSlotsWrapper.value = timeSlots as ComputedRef<TimeSlot[]>
 
// LEARNING: Use availability option selection composable
// WHY: Extracts selection logic from component to composable
// PATTERN: Composable provides reactive computed property for selection
const { selectedOptionTypeBlockId } = useOptionTypeBlockSelection({
  selectedOptionTypeBlocks: wizard.selectedOptionTypeBlocks,
  availableOptionTypeBlocks: wizard.availableOptionTypeBlocks
})

// LEARNING: Use time slot calculations composable
// WHY: Extracts duration calculations from component to composable
// PATTERN: Composable provides reactive computed properties for time calculations
const {
  onSiteTotal,
  presentationDuration,
  timeOnSiteBlocks
} = useTimeSlotCalculations({
  wizard: {
    selectedServices: wizard.selectedServices
  },
  inspectorTimeSlot,
  clientTimeSlot,
  isDifferentialService
})

// LEARNING: Use availability step data composable
// WHY: Extracts step data aggregation and time slot transformation from component to composable
// PATTERN: Composable provides reactive computed properties for step data
const { stepData } = useAvailabilityStepData({
  selectedDate,
  inspectorTimeSlot,
  clientTimeSlot,
  onSiteTotal,
  presentationDuration
})

// LEARNING: Use availability validation composable
// WHY: Extracts validation logic from component to composable
// PATTERN: Composable provides validation functions and computed properties
const { fieldErrors, isFormValid, validateForm } = useAvailabilityValidation({
  selectedDate,
  inspectorTimeSlot,
  clientTimeSlot
})

// LEARNING: Inject parent-provided refs for step data and validation state
// WHY: Parent provides refs that children write to (provide/inject only works parent-to-child)
// PATTERN: Inject refs from parent, sync local state to them
const parentAvailabilityStepData = inject<Ref<AvailabilityStepData | null>>('availabilityStepData')
const parentAvailabilityStepValid = inject<Ref<boolean>>('availabilityStepValid')
const parentAvailabilityStepValidate = inject<Ref<(() => boolean) | null>>('availabilityStepValidate')

if (!parentAvailabilityStepData || !parentAvailabilityStepValid || !parentAvailabilityStepValidate) {
  throw new Error('Parent-provided refs not found. Make sure BookingWizard provides availabilityStepData, availabilityStepValid, and availabilityStepValidate.')
}

// LEARNING: Sync local stepData to parent-provided ref
// WHY: Enables BookingWizard to collect availability data
// PATTERN: Watch local stepData and update parent ref
watch(stepData, (newData) => {
  if (parentAvailabilityStepData) {
    parentAvailabilityStepData.value = newData
  }
}, { immediate: true, deep: true })

// LEARNING: Sync local validation state to parent-provided refs
// WHY: Enables BookingWizard to check step validity before navigation
// PATTERN: Watch local validation state and update parent refs
watch(isFormValid, (newValid) => {
  if (parentAvailabilityStepValid) {
    parentAvailabilityStepValid.value = newValid
  }
}, { immediate: true })

// LEARNING: Assign validateForm function directly to parent ref
// WHY: validateForm is a function, not a ref, so we assign it directly
// PATTERN: Assign function to parent ref (no watch needed)
parentAvailabilityStepValidate.value = validateForm

// LEARNING: Use availability UI composable
// WHY: Extracts UI-specific logic from component to composable
// PATTERN: Composable provides reactive computed properties and handler functions
const {
  currentTimeSlots,
  selectedTimeSlot,
  shouldMoveGridBelow,
  handleTimeSlotClick,
  handleDateChange
} = useAvailabilityUI({
  selectedDate,
  inspectorTimeSlot,
  clientTimeSlot,
  startTimeType,
  isDifferentialService,
  timeSlotsPerDay,
  baseCurrentTimeSlots,
  fieldErrors
})

// LEARNING: Default date initialization is now handled in useAvailabilityDefaults composable
// WHY: The composable watches timeSlots with immediate: true and auto-selects first available date
// PATTERN: No onMounted needed - composable handles all defaulting logic

// LEARNING: Handler for Time Basis Selector button clicks
// WHY: Toggles between Selected/Active states per user story requirements
// PATTERN: Toggle function that deselects if clicking selected button, otherwise selects
// USER_STORY: Clicking selected button deselects it (sets to null), clicking active button selects it
const handleTimeBasisClick = (type: 'inspector' | 'client'): void => {
  // Toggle: clicking selected button deselects it (sets to null)
  // Otherwise, select the clicked button
  startTimeType.value = startTimeType.value === type ? null : type
}

// LEARNING: Computed properties for Time On-Site Graph bar states
// WHY: Reflects Time Basis Selector selection visually per user story
// PATTERN: Computed properties that return 'selected', 'active', or 'single' based on state
// USER_STORY: Corresponding bar becomes Selected when Time Basis Selector is selected, other remains Active
const inspectorBarState = computed(() => {
  if (!isDifferentialService.value) return 'single'
  return startTimeType.value === 'inspector' ? 'selected' : 'active'
})

const clientBarState = computed(() => {
  if (!isDifferentialService.value) return null
  return startTimeType.value === 'client' ? 'selected' : 'active'
})
</script>

<template>
  <div class="availability-step">
    <VRow>
      <VCol cols="12">
        <h4 class="text-h4 mb-2">Appointment Availability</h4>
        <p class="text-body-2 mb-6 mb-sm-4">Select a time that works for everybody</p>
      </VCol>
      
      <!-- LEARNING: Calendar Widget Section -->
      <!-- WHY: Permanent calendar widget for better UX (similar to Calendly) -->
      <!-- PATTERN: VDatePicker with month view, permanent display -->
      <!-- WHY: Replaces VTextField date input with permanent calendar widget -->
      <VCol cols="12" sm="4" class="calendar-col">
        <div class="calendar-container">
          <VDatePicker
            v-model="selectedDateSingle"
            :min="getTodayDate()"
            :show-adjacent-months="false"
            :first-day-of-week="0"
            color="primary"
            view-mode="month"
            hide-header
            class="availability-calendar"
            aria-label="Select appointment date"
            @update:model-value="handleDateChange"
          />
          <!-- LEARNING: Validation Error Display -->
          <!-- WHY: Shows validation errors below calendar -->
          <!-- PATTERN: Error message display for date validation -->
          <div v-if="fieldErrors.selectedDate" class="text-error text-caption mt-2">
            {{ fieldErrors.selectedDate }}
          </div>
        </div>
      </VCol>
      
      <!-- LEARNING: Time Selection Section -->
      <!-- WHY: Shows time slots and selection controls -->
      <!-- PATTERN: Always visible, content conditional based on date selection -->
      <!-- Session 6.8: Improved responsive spacing and layout -->
      <VCol cols="12" sm="8" class="time-selection-col">
        <!-- LEARNING: Content conditional on date selection -->
        <!-- WHY: Shows time selection controls when date is selected, placeholder otherwise -->
        <!-- PATTERN: Conditional content within always-visible column -->
        <template v-if="selectedDate.start">
          <!-- LEARNING: Inspector/Client Toggle Buttons -->
          <!-- WHY: Allows switching between Inspector and Client time views for differential services -->
          <!-- PATTERN: Conditional rendering based on isDifferentialService -->
          <!-- USER_STORY: Both buttons Active by default (neither Selected), toggle between Selected/Active -->
          <div v-if="isDifferentialService" class="d-flex align-center justify-center justify-md-start flex-wrap mb-4 mb-sm-6 toggle-buttons">
            <span class="text-body-2 mr-3 mb-2 mb-sm-0">Show start times for:</span>
            <div class="d-flex gap-2">
              <VBtn
                :variant="startTimeType === 'inspector' ? 'flat' : 'outlined'"
                color="primary"
                size="small"
                @click="handleTimeBasisClick('inspector')"
              >
                Inspector
              </VBtn>
              <VBtn
                :variant="startTimeType === 'client' ? 'flat' : 'outlined'"
                color="warning"
                size="small"
                @click="handleTimeBasisClick('client')"
              >
                Client
              </VBtn>
            </div>
          </div>
          
          <!-- LEARNING: Time Slot Grid -->
          <!-- WHY: Displays available time slots in a grid layout -->
          <!-- PATTERN: Conditionally render in same column or new row based on viewport width -->
          <!-- NOTE: When shouldMoveGridBelow is true, grid renders in new row below calendar (see template below) -->
          <template v-if="!shouldMoveGridBelow">
            <!-- LEARNING: Normal layout - grid in same row as calendar -->
            <!-- WHY: Side-by-side layout when space allows -->
            <!-- USER_STORY: Show empty state when neither selector is active (startTimeType === null) -->
            <div v-if="currentTimeSlots.length === 0" class="text-body-2 text-medium-emphasis py-4 mb-4 mb-sm-6">
              <span v-if="isDifferentialService && startTimeType === null">
                Select Inspector or Client to view available times.
              </span>
              <span v-else>
                No time slots available for selected date.
              </span>
            </div>
            <!-- LEARNING: TimeSlotGrid component with dynamic column calculation -->
            <!-- WHY: Encapsulates grid layout logic, ResizeObserver, and responsive behavior -->
            <!-- PATTERN: Reusable component with props/events for parent communication -->
            <TimeSlotGrid
              v-else
              :slots="currentTimeSlots"
              :selected-slot="selectedTimeSlot"
              :color="startTimeType === 'inspector' ? 'primary' : startTimeType === 'client' ? 'warning' : 'primary'"
              class="mb-4 mb-sm-6"
              @slot-click="handleTimeSlotClick"
            />
            <div v-if="fieldErrors.selectedTimeSlot" class="text-error text-caption mt-2 mb-4 mb-sm-6">
              {{ fieldErrors.selectedTimeSlot }}
            </div>
          </template>
          
          <!-- LEARNING: Time On-Site Graph -->
          <!-- WHY: Visual bars showing inspector and client time blocks for differential scheduling -->
          <!-- PATTERN: Stacked horizontal bars with conditional rendering based on differential -->
          <!-- Session 1.3.9.5: Updated to check array length instead of single service -->
          <!-- USER_STORY: Top bar full width, bottom bar right-justified half width, aligned on right edge -->
          <!-- LEARNING: Show bars for differential services even when onSiteTotal is 0 -->
          <!-- WHY: Bars should be visible to show time blocks structure, even before time slot selection -->
          <div v-if="wizard.selectedServices.value.length > 0 && (isDifferentialService || onSiteTotal > 0)" class="time-on-site-graph mt-4 mt-sm-6 mb-4 mb-sm-6">
            <!-- LEARNING: Differential Service - Two stacked bars -->
            <!-- WHY: Shows inspector and client time blocks separately for differential services -->
            <!-- PATTERN: Top bar full width (Inspector), bottom bar right-justified half width (Client) -->
            <template v-if="isDifferentialService">
              <!-- LEARNING: Inspector Time Bar - Full Width -->
              <!-- WHY: Shows inspector time block, full width, primary color -->
              <!-- USER_STORY: Top bar extends across full length of Appointment Selection Field -->
              <!-- USER_STORY: Bar becomes Selected when Inspector button selected, Active otherwise -->
              <div class="time-bar inspector-bar" :class="inspectorBarState">
                <div class="time-bar-fill inspector-fill"></div>
                <div class="time-bar-content">
                  <span class="time-bar-label">{{ timeOnSiteBlocks.inspector.label }}:</span>
                  <span class="time-bar-value">
                    {{ timeOnSiteBlocks.inspector.timeBlock || timeOnSiteBlocks.inspector.duration }}
                  </span>
                </div>
              </div>
              
              <!-- LEARNING: Client Time Bar - Right-Justified Half Width -->
              <!-- WHY: Shows client presentation time block, right-justified, half width, warning color -->
              <!-- USER_STORY: Bottom bar is right justified, extends across half the length, aligned with top bar on right -->
              <!-- USER_STORY: Bar becomes Selected when Client button selected, Active otherwise -->
              <div class="time-bar client-bar" :class="clientBarState">
                <div class="time-bar-fill client-fill"></div>
                <div class="time-bar-content client-bar-content">
                  <span class="time-bar-label">{{ timeOnSiteBlocks.client?.label }}:</span>
                  <span class="time-bar-value">
                    {{ timeOnSiteBlocks.client?.timeBlock || timeOnSiteBlocks.client?.duration }}
                  </span>
                </div>
              </div>
            </template>
            
            <!-- LEARNING: Non-Differential Service - Single bar -->
            <!-- WHY: Shows single time bar for non-differential services -->
            <!-- PATTERN: Single bar with service name(s) and total duration -->
            <!-- Session 1.3.9.5: Updated to show multiple service names or count -->
            <!-- USER_STORY: Single bar in Active Client colors displaying "{Service} Length {onsiteTotal}" -->
            <template v-else>
              <div class="time-bar single-service-bar">
                <div class="time-bar-fill single-service-fill"></div>
                <div class="time-bar-content">
                  <span class="time-bar-label">
                    {{ wizard.selectedServices.value.length === 1 
                      ? `${wizard.selectedServices.value[0]?.name} Length:` 
                      : `${wizard.selectedServices.value.length} Services Length:` }}
                  </span>
                  <span class="time-bar-value">{{ formatDuration(onSiteTotal) }}</span>
                </div>
              </div>
            </template>
          </div>
        </template>
        <template v-else>
          <!-- LEARNING: Placeholder when no date selected -->
          <!-- WHY: Shows message when calendar date hasn't been selected -->
          <!-- PATTERN: Left-aligned text display to match calendar alignment -->
          <div class="d-flex align-center justify-start date-placeholder">
            <p class="text-body-1 text-medium-emphasis">Select a date from the calendar to see available time slots</p>
          </div>
        </template>
      </VCol>
      
      <!-- LEARNING: Full-Width Row Fallback for Time Slot Grid -->
      <!-- WHY: Moves grid below calendar when space is insufficient for side-by-side layout -->
      <!-- PATTERN: Conditional rendering in new row when shouldMoveGridBelow is true -->
      <VCol v-if="shouldMoveGridBelow && selectedDate.start" cols="12" class="time-slot-grid-fallback">
        <!-- LEARNING: Time Slot Grid in new row below calendar -->
        <!-- WHY: Ensures grid is usable even when side-by-side layout doesn't fit -->
        <!-- USER_STORY: Show empty state when neither selector is active (startTimeType === null) -->
        <div v-if="currentTimeSlots.length === 0" class="text-body-2 text-medium-emphasis py-4 mb-4 mb-sm-6">
          <span v-if="isDifferentialService && startTimeType === null">
            Select Inspector or Client to view available times.
          </span>
          <span v-else>
            No time slots available for selected date.
          </span>
        </div>
        <!-- LEARNING: TimeSlotGrid component in full-width row -->
        <!-- WHY: Provides better UX when viewport is too narrow for side-by-side layout -->
        <TimeSlotGrid
          v-else
          :slots="currentTimeSlots"
          :selected-slot="selectedTimeSlot"
          :color="startTimeType === 'inspector' ? 'primary' : startTimeType === 'client' ? 'warning' : 'primary'"
          class="mb-4 mb-sm-6"
          @slot-click="handleTimeSlotClick"
        />
        <div v-if="fieldErrors.selectedTimeSlot" class="text-error text-caption mt-2 mb-4 mb-sm-6">
          {{ fieldErrors.selectedTimeSlot }}
        </div>
      </VCol>
    </VRow>
    
    <!-- LEARNING: Availability Options Section -->
    <!-- WHY: Shows availability options filtered by selected base service -->
    <!-- PATTERN: SelectionCardGroup with checkbox mode, stack layout, conditional rendering -->
    <!-- NOTE: Always visible in bottom right when base service is selected (cascade requirement) -->
    <!-- Session 6.8: Improved spacing and visual hierarchy -->
    <VRow class="availability-options-row">
      <!-- Empty column to match left column spacing -->
      <VCol cols="12" sm="4"></VCol>
      
      <!-- Availability Options in right column -->
      <VCol cols="12" sm="8">
        <!-- Session 1.3.9.5: Updated to check array length instead of single service -->
        <div v-if="wizard.selectedServices.value.length > 0" class="availability-options-section">
          <h5 class="text-h5 mb-4 mb-sm-6">Availability Options</h5>
          
          <!-- Cascade configuration error -->
          <VAlert
            v-if="wizard.availabilityOptionsCascadeError?.value"
            type="error"
            variant="tonal"
            class="mb-6"
          >
            {{ wizard.availabilityOptionsCascadeError.value }}
          </VAlert>
          
          <!-- LEARNING: Empty state when no availability options available -->
          <!-- WHY: Provides feedback when no options match selected base service -->
          <!-- PATTERN: Conditional rendering with helpful message -->
          <!-- Session 6.8: Improved spacing and typography -->
          <div v-else-if="wizard.availableOptionTypeBlocks.value.length === 0" class="text-body-1 text-medium-emphasis py-4">
            No availability options available for selected service.
          </div>
          
          <!-- LEARNING: Availability Options Selection Cards -->
          <!-- WHY: Card-based selection using SelectionCardGroup component -->
          <!-- PATTERN: SelectionCardGroup with radio mode, stack layout, left-aligned radio buttons -->
          <!-- NOTE: Additional services functionality was removed - will be merged into base services in future work -->
          <SelectionCardGroup
            v-else
            v-model="selectedOptionTypeBlockId"
            :items="wizard.availableOptionTypeBlocks.value"
            :config="{
              selectionType: 'radio',
              selectionComponent: 'VRadio',
              selectionGroup: 'none',
              stateSource: 'local',
              layout: 'stack',
              controlPosition: 'left',
              appearance: {
                showIcon: false,
                showDescription: true,
                showBorder: true,
                cardPadding: 'pa-6',
                minHeight: 'auto'
              },
              expansion: { enabled: false }
            }"
            class="availability-cards"
          />
        </div>
        
        <!-- LEARNING: Empty state when no base service selected -->
        <!-- WHY: Provides feedback that base service must be selected first -->
        <!-- PATTERN: Conditional rendering with helpful message -->
        <!-- Session 6.8: Improved spacing and typography -->
        <div v-else class="text-body-1 text-medium-emphasis py-4">
          Please select a service type first to see available options.
        </div>
      </VCol>
    </VRow>
  </div>
</template>

<style scoped lang="scss">
/**
 * WHY: Ensures consistent spacing and proper responsive behavior
 * PATTERN: Mobile-first responsive design with Vuetify breakpoints
 */
.availability-step {
  // LEARNING: Consistent container padding
  // WHY: Ensures content doesn't touch edges on all screen sizes
  padding: 0;
}

// LEARNING: Calendar column spacing and layout
// WHY: Constrains calendar to left third of screen, provides proper spacing
// PATTERN: Responsive margin bottom, mobile-first layout, let Vuetify grid handle width
// NOTE: Vuetify's md="4" prop handles the 1/3 width, CSS only provides backup constraint
.calendar-col {
  margin-bottom: 1.5rem;
  
  @media (min-width: 600px) {
    margin-bottom: 0;
    // Backup constraint - Vuetify's sm="4" prop is primary width controller
    max-width: 33.333333%;
  }
}

// LEARNING: Calendar container styling
// WHY: Ensures calendar widget is properly contained and styled, constrained to column width
// PATTERN: Container with proper spacing and responsive behavior
// Task: Calendar Visibility - Prevent clipping of Sunday/Saturday days
.calendar-container {
  width: 100%;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  overflow: visible; // Allow calendar to be fully visible (no clipping)
  box-sizing: border-box; // Ensure padding/borders don't cause overflow
  min-width: 280px; // Ensure calendar has minimum width to display all days
  
  // LEARNING: Calendar widget styling
  // WHY: Styles VDatePicker for permanent display with current day outline and selected day highlight
  // PATTERN: Deep selector to style VDatePicker internal elements
  // Task: Calendar Visibility - Ensure month view fits within container without clipping
  :deep(.availability-calendar) {
    width: 100%;
    max-width: 100%; // Ensure VDatePicker respects container width
    box-sizing: border-box; // Prevent overflow from padding/borders
    overflow: visible; // Allow calendar content to be fully visible
    
    // LEARNING: Hide calendar header (removes "SELECT DATE" text and thick bar)
    // WHY: User requested removal of header text and thinner bar
    // PATTERN: Hide header element with CSS using multiple selectors for Vuetify 3
    // NOTE: Vuetify 3 may use different class structure - targeting all possible variants
    .v-date-picker-header,
    .v-date-picker-month__header,
    [class*="date-picker-header"],
    [class*="date-picker-month-header"] {
      display: none !important;
      height: 0 !important;
      padding: 0 !important;
      margin: 0 !important;
      visibility: hidden !important;
      overflow: hidden !important;
    }
    
    // LEARNING: Hide header content and title elements
    // WHY: Remove all header-related elements completely
    // NOTE: Vuetify 3 structure may vary - targeting common patterns
    .v-date-picker-header__content,
    .v-date-picker-header__title,
    .v-date-picker-header__prepend,
    .v-date-picker-header__append,
    .v-date-picker-month__header__content,
    .v-date-picker-month__header__title,
    [class*="header__content"],
    [class*="header__title"] {
      display: none !important;
      height: 0 !important;
      padding: 0 !important;
      margin: 0 !important;
      visibility: hidden !important;
      overflow: hidden !important;
    }
    
    // LEARNING: Ensure no spacing from hidden header
    // WHY: Remove any gaps left by hidden header
    // Task: Calendar Visibility - Ensure month view fits without clipping days
    .v-date-picker-month {
      margin-top: 0 !important;
      padding-top: 0 !important;
      width: 100%;
      max-width: 100%; // Ensure month view respects container
      overflow: visible; // Prevent clipping of Sunday/Saturday
      min-width: 100%; // Ensure calendar fills container width
    }
    
    // LEARNING: Current day styling (outline/border)
    // WHY: Highlights today's date with neutral color outline
    // PATTERN: Style .v-date-picker-month__day with today class
    // NOTE: Vuetify 3 uses different class structure - targeting both possible class names
    .v-date-picker-month__day--today,
    .v-date-picker-month__day.v-date-picker-month__day--today {
      .v-btn {
        border: 2px solid rgba(var(--v-theme-on-surface), 0.3) !important;
        background-color: transparent !important;
        font-weight: 600;
      }
    }
    
    // LEARNING: Selected day styling (primary color highlight)
    // WHY: Highlights selected date with primary color
    // PATTERN: Style .v-date-picker-month__day with selected class
    // NOTE: Vuetify 3 uses different class structure - targeting both possible class names
    .v-date-picker-month__day--selected,
    .v-date-picker-month__day.v-date-picker-month__day--selected {
      .v-btn {
        background-color: rgb(var(--v-theme-primary)) !important;
        color: rgb(var(--v-theme-on-primary)) !important;
        font-weight: 600;
      }
    }
    
    // LEARNING: Day button touch-friendly sizing
    // WHY: Ensures adequate touch targets (minimum 44x44px) for mobile
    // PATTERN: Minimum height and width for touch targets
    .v-date-picker-month__day {
      .v-btn {
        min-width: 44px;
        min-height: 44px;
        width: 100%;
        height: 100%;
        border-radius: 4px;
        transition: all 0.2s ease;
        
        // LEARNING: Hover state for better UX
        // WHY: Provides visual feedback on hover
        // PATTERN: Hover state styling
        &:hover:not(.v-btn--disabled) {
          background-color: rgba(var(--v-theme-primary), 0.1);
        }
        
        @media (min-width: 600px) {
          min-width: auto;
          min-height: auto;
        }
      }
    }
    
    /**
     * WHY: // WHY: Ensures weekday headers are properly styled
     * PATTERN: // PATTERN: Style weekday header row
     */
    .v-date-picker-month__weekday {
      font-weight: 600;
      padding: 0.5rem 0;
      color: rgba(var(--v-theme-on-surface), 0.7);
    }
    
    // LEARNING: Disabled date styling
    // WHY: Ensures disabled dates (past dates) are visually distinct
    // PATTERN: Style disabled date buttons
    .v-date-picker-month__day--disabled {
      .v-btn {
        opacity: 0.4;
        cursor: not-allowed;
      }
    }
  }
}

// LEARNING: Time selection column spacing
// WHY: Ensures proper spacing for time selection controls, aligns with calendar
// PATTERN: Responsive padding, left-aligned content, fills available width, matches calendar height
.time-selection-col {
  padding-left: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start; // Align content to start to match calendar
  // Allow column to grow and fill available space
  flex: 1;
  min-width: 0; // Allow flexbox to shrink if needed
  // Match calendar height - calendar is typically ~300-350px tall
  min-height: 300px;
  
  @media (min-width: 600px) {
    padding-left: 1rem;
    // Fill remaining horizontal space
    max-width: calc(66.666667% - 1rem); // 8/12 columns minus padding
    // Match calendar height on larger screens
    min-height: 350px;
  }
}

// LEARNING: Toggle buttons responsive alignment
// WHY: Centers buttons on mobile, right-aligns on desktop
// PATTERN: Responsive flex alignment
.toggle-buttons {
  @media (max-width: 959px) {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
}

// LEARNING: Time bar button styling
// WHY: Makes time range display buttons prominent but thinner
// PATTERN: Full width buttons with responsive minimum width, reduced height
// Session 6.8: Responsive button sizing
.time-bar-btn {
  width: 100%;
  min-width: 200px;
  justify-content: center;
  padding: 0.375rem 1rem !important; // Reduced padding for thinner appearance
  min-height: auto !important; // Remove default min-height
  height: auto !important; // Let content determine height
  
  @media (min-width: 600px) {
    min-width: 250px;
    justify-content: flex-end;
  }
}

// LEARNING: Time bars container alignment
// WHY: Centers bars on mobile, left-aligns on desktop to match calendar
// PATTERN: Responsive flex alignment
.time-bars {
  @media (max-width: 959px) {
    align-items: center !important;
  }
  
  @media (min-width: 600px) {
    align-items: flex-start !important;
  }
}

// LEARNING: Date placeholder styling
// WHY: Provides visual feedback when no date is selected
// PATTERN: Responsive height, left-aligned to match calendar
.date-placeholder {
  min-height: 300px;
  width: 100%;
  
  @media (min-width: 600px) {
    min-height: 400px;
  }
}

// LEARNING: Availability options row spacing
// WHY: Provides visual separation between time selection and availability options
// PATTERN: Responsive margin top
.availability-options-row {
  margin-top: 2rem;
  
  @media (min-width: 600px) {
    margin-top: 3rem;
  }
  
  @media (min-width: 960px) {
    margin-top: 3.5rem;
  }
}

// LEARNING: Availability options section spacing
// WHY: Ensures proper spacing within availability options section
// PATTERN: Responsive padding
.availability-options-section {
  padding-top: 1rem;
  
  @media (min-width: 600px) {
    padding-top: 1.5rem;
  }
}

// LEARNING: Availability cards spacing
// WHY: Ensures proper spacing between availability option cards
// PATTERN: Margin bottom on card group container
.availability-cards {
  margin-bottom: 1rem;
}

// LEARNING: Time On-Site Graph styling
// WHY: Visual bars showing inspector and client time blocks
// PATTERN: Stacked horizontal bars with different widths and colors
// USER_STORY: Top bar full width, bottom bar right-justified half width, aligned on right edge
.time-on-site-graph {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

// LEARNING: Time bar base styling
// WHY: Container for visual bar and content overlay
// PATTERN: Relative positioning for absolute-positioned fill and content
.time-bar {
  position: relative;
  width: 100%;
  min-height: 48px; // Touch-friendly minimum size
  border-radius: 4px;
  overflow: hidden; // Ensure fill doesn't overflow rounded corners
  
  @media (min-width: 600px) {
    min-height: 40px;
  }
}

// LEARNING: Time bar fill (visual bar)
// WHY: Creates the actual visual bar/graph appearance
// PATTERN: Absolute positioned fill with color, full height
.time-bar-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  border-radius: 4px;
}

// LEARNING: Inspector time bar fill - Full width
// WHY: Full width bar in Inspector Active Color (primary)
// PATTERN: Full width (100%), primary color
.inspector-fill {
  width: 100%;
  background-color: rgb(var(--v-theme-primary));
}

// LEARNING: Client time bar fill - Right-justified half width
// WHY: Half width bar aligned with right edge of top bar, Client Active Color (warning)
// PATTERN: Right-justified (right: 0), half width (50%), warning color
.client-fill {
  width: 50%;
  right: 0;
  left: auto; // Override left: 0 from base
  background-color: rgb(var(--v-theme-warning));
}

// LEARNING: Single service bar fill - Full width
// WHY: Full width bar in Client Active Color (warning) for non-differential services
// PATTERN: Full width (100%), warning color
.single-service-fill {
  width: 100%;
  background-color: rgb(var(--v-theme-warning));
}

// LEARNING: Time bar content container
// WHY: Contains label and value text, positioned above fill
// PATTERN: Relative positioning, z-index above fill, padding for spacing
.time-bar-content {
  position: relative;
  z-index: 1; // Above fill
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  width: 100%;
  min-height: 48px; // Match bar height
  
  @media (min-width: 600px) {
    min-height: 40px;
  }
}

// LEARNING: Inspector time bar content styling
// WHY: Text color contrasts with primary background
// PATTERN: On-primary text color
.inspector-bar .time-bar-content {
  color: rgb(var(--v-theme-on-primary));
}

// LEARNING: Client time bar content styling
// WHY: Right-aligned content, text color contrasts with warning background
// PATTERN: Right alignment, on-warning text color
.client-bar-content {
  justify-content: flex-end; // Right-align content
  color: rgb(var(--v-theme-on-warning));
}

// LEARNING: Time On-Site Graph bar Selected/Active states
// WHY: Visual distinction between Selected and Active bars per user story
// PATTERN: Selected bars have full opacity and shadow, Active bars have reduced opacity
// USER_STORY: Corresponding bar becomes Selected when Time Basis Selector is selected, other remains Active
.inspector-bar.selected .inspector-fill {
  opacity: 1;
  box-shadow: 0 2px 4px rgba(var(--v-theme-on-surface), 0.2);
}

.inspector-bar.active .inspector-fill {
  opacity: 0.6;
}

.client-bar.selected .client-fill {
  opacity: 1;
  box-shadow: 0 2px 4px rgba(var(--v-theme-on-surface), 0.2);
}

.client-bar.active .client-fill {
  opacity: 0.6;
}

// LEARNING: Single service bar content styling
// WHY: Text color contrasts with warning background
// PATTERN: On-warning text color
.single-service-bar .time-bar-content {
  color: rgb(var(--v-theme-on-warning));
}

// LEARNING: Time bar label styling
// WHY: Consistent label appearance
// PATTERN: Font weight and spacing
.time-bar-label {
  font-weight: 600;
  font-size: 0.875rem;
  
  @media (min-width: 600px) {
    font-size: 1rem;
  }
}

// LEARNING: Time bar value styling
// WHY: Consistent value appearance
// PATTERN: Font weight and spacing
.time-bar-value {
  font-weight: 500;
  font-size: 0.875rem;
  
  @media (min-width: 600px) {
    font-size: 1rem;
  }
}
</style>

