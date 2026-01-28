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
import { useAppointmentSlots } from '@/composables/booking/useAppointmentSlots'
import { useAvailabilityValidation } from '@/composables/booking/useAvailabilityValidation'
import { useAvailabilityStepData } from '@/composables/booking/useAvailabilityStepData'
import { useOptionTypeBlockSelection } from '@/composables/booking/useOptionTypeBlockSelection'
import { useAvailabilityUI } from '@/composables/booking/useAvailabilityUI'
import { useAvailabilityDefaults } from '@/composables/booking/useAvailabilityDefaults'
import { useAvailableStartTimes } from '@/composables/booking/useAvailableStartTimes'
import { useMoveablePartsScheduling } from '@/composables/booking/useMoveablePartsScheduling'
import { useAppointmentDuration } from '@/composables/booking/useAppointmentDuration'
import { useTimeSlotDurations } from '@/composables/booking/useTimeSlotDurations'
import { useMockCalendarRefresh } from '@/composables/booking/useMockCalendarRefresh'
import { useBusyTimes } from '@/composables/booking/useBusyTimes'
import { usePerspectiveMapping } from '@/composables/booking/usePerspectiveMapping'
import { useWizardStepSync } from '@/composables/booking/useWizardStepSync'
import { useAvailabilityStepHandlers } from '@/composables/booking/useAvailabilityStepHandlers'
import { useAvailabilityDevPanel } from '@/composables/booking/useAvailabilityDevPanel'
import { useAvailabilityEmptyState } from '@/composables/booking/useAvailabilityEmptyState'
import { useAvailabilitySlotColor } from '@/composables/booking/useAvailabilitySlotColor'
import SelectionCardGroup from '@/components/booking/SelectionCardGroup.vue'
import AppointmentSlotGrid from '@/components/booking/AppointmentSlotGrid.vue'
import TimeOnSiteGraph from '@/components/booking/TimeOnSiteGraph.vue'
import MoveablePartsModal from '@/components/booking/MoveablePartsModal.vue'
import type { WizardStateData } from '@/utils/transformers/appointmentToWizardTransformer'

// LEARNING: Inject shared wizard instance from parent
// WHY: Ensures all step components share the same wizard state
// PATTERN: Use inject to get provided instance instead of creating new one
const wizard = inject<ReturnType<typeof useBookingWizard>>('wizard')
if (!wizard) {
  throw new Error('Wizard instance not provided. Make sure BookingWizard component provides the wizard instance.')
}

// LEARNING: Inject loaded wizard state for populating form fields
// WHY: Enables populating availability date from loaded appointment
// PATTERN: Inject provided loadedWizardState, fail explicitly if not provided
const loadedWizardState = inject<Ref<WizardStateData | null>>('loadedWizardState')
if (!loadedWizardState) {
  throw new Error('loadedWizardState not provided. Make sure BookingWizard provides loadedWizardState.')
}

// LEARNING: Use time formatting composable for time operations
// WHY: Moves time formatting logic out of component to prevent recursion
// PATTERN: Composable provides pure utility functions
const { getTodayDate } = useTimeFormatting()

// LEARNING: Inject property details step data for property-based adjustments
// WHY: Enables property-based time adjustments in availability calculations
// PATTERN: Inject provided propertyDetailsStepData, fail explicitly if not provided
const propertyDetailsStepData = inject<Ref<{ squareFootage?: number | null; bedrooms?: number | null; bathrooms?: number | null; foundationAccess?: 'basement' | 'crawlspace' | 'slab' | null; additionalUnits?: number | null; [key: string]: unknown }> | null>('propertyDetailsStepData')
if (!propertyDetailsStepData) {
  throw new Error('propertyDetailsStepData not provided. Make sure BookingWizard provides propertyDetailsStepData.')
}

// LEARNING: Create ref wrapper for timeSlots to enable reactive watching
// WHY: Resolves circular dependency between composables:
//      - useAvailabilityDefaults needs timeSlots (nullable) but useAvailability creates it later
//      - useAvailability needs accumulatedBlockInstances from useAvailabilityLogic
//      - useAvailabilityLogic needs timeSlots (non-null) from useAvailability
// PATTERN: Hold the computed ref in a wrapper, then expose two views:
// - nullable (for defaults) to avoid treating "not initialized yet" as "empty"
// - non-null array (for logic) to satisfy composable typing
// NOTE: This wrapper pattern is necessary due to initialization order constraints.
//       The wrapper is updated after useAvailability creates timeSlots (line ~156).
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

// LEARNING: Compute effective differential state before useAvailabilityDefaults
// WHY: useAvailabilityDefaults needs effective differential state (considering overrides) to auto-select startTimeType
// PATTERN: Check if service is differential AND no part has differentialOverride: true
// NOTE: This is calculated early because useAvailabilityDefaults needs it before useAvailabilityLogic is called
//       After useAvailabilityLogic is called, we use its isEffectivelyDifferential for everything else
const isEffectivelyDifferentialForDefaults = computed(() => {
  const selectedServices = wizard.selectedServices.value
  const selectedOptions = wizard.selectedOptionTypeBlocks.value
  
  // Check if any service is differential
  const isDifferential = selectedServices.some(s => s.differential === true)
  if (!isDifferential) return false
  
  // Check if any part has differentialOverride: true
  const serviceHasOverride = selectedServices.some(service =>
    service.partInstances?.some(part => part.differentialOverride === true)
  )
  const optionHasOverride = selectedOptions.some(option =>
    option.partInstances?.some(part => part.differentialOverride === true)
  )
  
  // If override exists, force non-differential
  if (serviceHasOverride || optionHasOverride) return false
  
  return true
})

// LEARNING: Use availability defaults composable for state management and defaulting
// WHY: Extracts state management and defaulting logic from component
// PATTERN: Composable manages selectedDate, startTimeType, appointmentSlotOrderIndex
const {
  selectedDate,
  startTimeType,
  appointmentSlotOrderIndex
} = useAvailabilityDefaults({
  loadedWizardState,
  timeSlots: timeSlotsForDefaults,
  isDifferentialService: isEffectivelyDifferentialForDefaults
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
  isEffectivelyDifferential
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

// LEARNING: Use appointment duration composable
// WHY: Extracts duration calculation logic from component to composable
// PATTERN: Composable provides computed property for appointment duration
const { appointmentDuration } = useAppointmentDuration({
  accumulatedBlockInstances
})

// LEARNING: Use mock calendar refresh composable
// WHY: Extracts mock calendar refresh management from component to composable
// PATTERN: Composable manages refresh key and reset functionality
const { mockRefreshKey } = useMockCalendarRefresh()

// LEARNING: Use busy times composable
// WHY: Extracts busy times calculation logic from component to composable
// PATTERN: Composable provides computed property for busy times
const { busyTimes: busyTimesForStartTimes } = useBusyTimes({
  dateRangeForApi,
  mockRefreshKey
})

const {
  availableStartTimes,
  slotAvailability
} = useAvailableStartTimes({
  selectedDate,
  appointmentDuration,
  busyTimes: busyTimesForStartTimes
})

// LEARNING: Use time slot durations composable
// WHY: Extracts time slot duration mapping logic from component to composable
// PATTERN: Composable provides computed Map for time slot durations
const { timeSlotDurations } = useTimeSlotDurations({
  timeSlotsPerDay,
  selectedDate
})

// LEARNING: Use perspective mapping composable
// WHY: Extracts perspective mapping logic from component to composable
// PATTERN: Composable provides computed property for perspective mapping
const { perspective } = usePerspectiveMapping({
  startTimeType
})

// LEARNING: Map appointmentSlotOrderIndex to selectedButtonIndex
// WHY: New system uses buttonIndex instead of orderIndex
// PATTERN: Use appointmentSlotOrderIndex as buttonIndex
const selectedButtonIndex = computed(() => appointmentSlotOrderIndex.value)

// LEARNING: Use availability slot color composable
// WHY: Extracts color selection logic from component to composable
// PATTERN: Composable provides computed property for slot color
const { slotColor } = useAvailabilitySlotColor({
  startTimeType
})

// LEARNING: Use new appointment slots composable
// WHY: Uses shape + slot separation for efficient calculation
// PATTERN: Builds shape once, applies to each available time
const {
  appointmentShape,
  appointmentSlots,
  selectedSlot,
  graphBars
} = useAppointmentSlots({
  blockInstances: accumulatedBlockInstances,
  availableStartTimes,
  slotAvailability,
  timeSlotDurations,
  selectedButtonIndex,
  perspective,
  isDifferentialService: isEffectivelyDifferential
})

// LEARNING: Use moveable parts scheduling composable
// WHY: Detects moveable parts and manages scheduling modal
// PATTERN: Composable provides moveable parts detection and scheduling options
const moveablePartsScheduling = useMoveablePartsScheduling({
  appointmentShape,
  selectedSlot
})

const {
  hasMoveableParts,
  showModal: showMoveableModal,
  moveableOptions,
  selectedSlotIndex: selectedMoveableSlotIndex,
  contingencyPeriod,
  openModal: openMoveableModal,
  closeModal: closeMoveableModal,
  selectSlot: selectMoveableSlot,
  isLoadingOptions
} = moveablePartsScheduling

// Ref to store confirmed moveable scheduling
const confirmedMoveableScheduling = ref<typeof moveableOptions.value>(null)

// LEARNING: Use availability empty state composable
// WHY: Extracts empty state message logic from component to composable
// PATTERN: Composable provides computed property for empty state message
const { emptyStateMessage } = useAvailabilityEmptyState({
  isEffectivelyDifferential,
  startTimeType,
  appointmentSlotsCount: computed(() => appointmentSlots.length)
})

// LEARNING: Use availability step data composable
// WHY: Extracts step data aggregation and time slot transformation from component to composable
// PATTERN: Composable provides reactive computed properties for step data
const { stepData } = useAvailabilityStepData({
  selectedDate,
  selectedSlot,
  moveableScheduling: computed(() => confirmedMoveableScheduling.value)
})

// LEARNING: Use availability validation composable
// WHY: Extracts validation logic from component to composable
// PATTERN: Composable provides validation functions and computed properties
const { fieldErrors, isFormValid, validateForm } = useAvailabilityValidation({
  selectedDate,
  selectedSlot
})

// LEARNING: Use wizard step sync composable
// WHY: Extracts parent ref syncing logic from component to reusable composable
// PATTERN: Composable handles all parent ref syncing automatically
useWizardStepSync({
  stepData,
  isFormValid,
  validateForm,
  stepDataKey: 'availabilityStepData',
  stepValidKey: 'availabilityStepValid',
  stepValidateKey: 'availabilityStepValidate'
})

// LEARNING: Use availability UI composable
// WHY: Extracts responsive layout and date handling logic from component to composable
// PATTERN: Composable provides reactive computed properties and handler functions
const {
  handleDateChange
} = useAvailabilityUI({
  selectedDate,
  selectedButtonIndex,
  fieldErrors
})

// LEARNING: Use availability step handlers composable
// WHY: Extracts event handler logic from component to composable
// PATTERN: Composable provides all event handler functions
const {
  handleAppointmentSlotClick,
  handleMoveableConfirm,
  handleMoveableCancel,
  handleTimeBasisChange
} = useAvailabilityStepHandlers({
  appointmentSlotOrderIndex,
  hasMoveableParts,
  selectedSlot,
  openMoveableModal,
  closeMoveableModal,
  moveableOptions,
  selectedMoveableSlotIndex,
  confirmedMoveableScheduling,
  startTimeType
})

// LEARNING: Use availability dev panel composable
// WHY: Extracts dev panel data providing logic from component to composable
// PATTERN: Composable provides reactive computed object via provide
useAvailabilityDevPanel({
  selectedBlockInstances: accumulatedBlockInstances,
  appointmentSlots,
  selectedDate,
  selectedSlot,
  dateRange: dateRangeForApi,
  busyPeriods: busyTimesForStartTimes,
  refreshKey: mockRefreshKey
})
</script>

<template>
  <div class="availability-step">

    <VRow class="calendar-grid-row">
      <VCol cols="12" class="position-relative" style="overflow: visible;">
        <div class="d-flex align-center justify-space-between flex-wrap mb-2">
          <div>
            <h4 class="text-h4 mb-2">Appointment Availability</h4>
            <p class="text-body-2 mb-6 mb-sm-4">Select a time that works for everybody</p>
          </div>
        </div>
      </VCol>

      <VCol cols="12" class="calendar-col">
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

          <div v-if="fieldErrors.selectedDate" class="text-error text-caption mt-2">
            {{ fieldErrors.selectedDate }}
          </div>
          
          <!-- LEARNING: Time On-Site Graph Component - Under Calendar -->
          <!-- WHY: Always visible, shows time breakdown for selected date/time -->
          <!-- PATTERN: Interactive bars that control perspective selection -->
          <TimeOnSiteGraph
            :is-differential-service="isEffectivelyDifferential"
            :graph-bars="graphBars"
            :selected-services="wizard.selectedServices.value"
            :start-time-type="perspective"
            class="time-graph-wrapper"
            @time-basis-change="handleTimeBasisChange"
          />
        </div>
      </VCol>
      

      <VCol
        cols="12"
        class="time-selection-col"
      >
        <!-- LEARNING: Wrapper div for flex layout of children -->
        <!-- WHY: Separates flex layout (children) from grid width (VCol) -->
        <!-- PATTERN: Let Vuetify handle VCol width, wrapper handles internal flex layout -->
        <div class="time-selection-content">
          <!-- LEARNING: Content conditional on date selection -->
          <!-- WHY: Shows time selection controls when date is selected, placeholder otherwise -->
          <!-- PATTERN: Conditional content within always-visible column -->
          <template v-if="selectedDate.start">
          <!-- LEARNING: Time Slot Grid -->
          <!-- WHY: Displays available time slots in a grid layout -->
          <!-- PATTERN: Always render in time-selection column - Vuetify grid handles responsive layout -->
          <!-- LEARNING: Vuetify's sm="4" and sm="8" automatically place columns side-by-side on sm+ breakpoint -->
          <!-- WHY: Trust Vuetify's grid system instead of conditional rendering -->
          <!-- LEARNING: Empty state message when no slots available -->
          <!-- WHY: Provides user guidance when no slots are shown -->
          <!-- PATTERN: Check appointmentSlots.length directly for conditional rendering, use emptyStateMessage for message text -->
          <div v-if="appointmentSlots.length === 0" class="text-body-2 text-medium-emphasis py-4 mb-4 mb-sm-6">
            {{ emptyStateMessage }}
          </div>

          <AppointmentSlotGrid
            v-else
            :appointment-slots="appointmentSlots"
            :selected-button-index="selectedButtonIndex"
            :time-basis="perspective"
            :color="slotColor"
            class="appointment-slot-grid-abut"
            @slot-click="handleAppointmentSlotClick"
          />
          <div v-if="fieldErrors.selectedTimeSlot" class="text-error text-caption mt-2 mb-2">
            {{ fieldErrors.selectedTimeSlot }}
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
          
          <!-- LEARNING: Availability Options Section -->
          <!-- WHY: Shows availability options filtered by selected base service -->
          <!-- PATTERN: SelectionCardGroup with checkbox mode, stack layout, conditional rendering -->
          <!-- NOTE: Always visible in bottom right when base service is selected (cascade requirement) -->
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
                showBorder: true,
                cardPadding: 'pa-3',
                minHeight: 'auto'
              },
              expansion: { enabled: false }
            }"
            class="availability-cards"
          />
          </div>
        </div>
      </VCol>
    </VRow>

    <!-- LEARNING: Moveable Parts Scheduling Modal -->
    <!-- WHY: Allows users to schedule moveable parts separately -->
    <!-- PATTERN: Pass moveableOptions directly, fail explicitly if null when needed -->
    <!-- TEMPORARY: Currently disabled - will be re-enabled with confirmation modal system -->
    <MoveablePartsModal
      v-model:show-modal="showMoveableModal"
      :moveable-options="moveableOptions"
      :selected-slot-index="selectedMoveableSlotIndex"
      v-model:contingency-period="contingencyPeriod"
      :is-loading-options="isLoadingOptions"
      @select-slot="selectMoveableSlot"
      @confirm="handleMoveableConfirm"
      @cancel="handleMoveableCancel"
    />
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

// LEARNING: Calendar grid row layout
// WHY: Ensure columns are side-by-side on desktop, stacked on mobile
// PATTERN: Let Vuetify handle wrapping naturally, override flex properties on columns
.calendar-grid-row {
  // Vuetify handles flex-wrap automatically based on column widths
}


// LEARNING: Calendar column spacing and layout
// WHY: Calendar widget has fixed width (~328px), column should size to content
// PATTERN: Override only flex properties, not display (Vuetify handles display)
.calendar-col {
  margin-bottom: 1.5rem;
  
  @media (min-width: 600px) {
    margin-bottom: 0;
    // LEARNING: Size calendar column to content, not percentage
    // WHY: Calendar widget has fixed intrinsic width (~328px)
    // PATTERN: Override flex properties only, let Vuetify handle display
    flex: 0 0 auto !important; // Size to content, don't grow/shrink
    max-width: none !important; // Remove Vuetify's max-width constraint
    width: auto !important; // Let content determine width
  }
}

// LEARNING: Calendar container styling
// WHY: Let VDatePicker use its native fixed width (~328px) instead of forcing percentage-based width
// PATTERN: Remove width constraints, let native widget size control rendering
// LEARNING: VDatePicker has intrinsic fixed width - don't override with 100% or overflow:hidden
// LEARNING: Constrain container to calendar width
// WHY: Graph bars should not expand calendar column beyond calendar width
.calendar-container {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: fit-content; // Constrain to calendar width
  max-width: 100%; // Don't exceed parent column
  align-items: flex-start; // Align children to start, don't stretch
  gap: 0; // Remove gap between calendar and graph
  
  // LEARNING: Calendar widget styling
  // WHY: Let VDatePicker render at its native fixed width, only style visual appearance
  // PATTERN: Deep selector for visual styling only, no width/overflow constraints
  :deep(.availability-calendar) {
    box-sizing: border-box;
    
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
    // LEARNING: Let VDatePicker month view use native width
    // WHY: Native fixed width prevents clipping during window resize
    .v-date-picker-month {
      margin-top: 0 !important;
      padding-top: 0 !important;
      margin-bottom: 0 !important;
      padding-bottom: 0 !important;
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

// LEARNING: Time graph wrapper spacing
// WHY: Position graph directly below calendar with minimal spacing
.time-graph-wrapper {
  margin-top: 0.5rem;
  margin-bottom: 0;
  
  @media (min-width: 600px) {
    margin-top: 0.5rem;
  }
}

// LEARNING: Time selection column spacing
// WHY: Grid column fills remaining space after calendar
// PATTERN: Flex grow to fill remaining space, calendar is fixed width
.time-selection-col {
  padding-left: 0;
  min-width: 0; // Allow column to shrink if needed
  
  @media (min-width: 600px) {
    padding-left: 1rem;
    // LEARNING: Grid column fills remaining space after calendar
    // WHY: Calendar column sizes to content, grid should fill the rest
    // PATTERN: Flex grow to fill remaining space
    flex: 1 1 0% !important; // Grow to fill remaining space
  }
}

// LEARNING: Wrapper div for flex layout of children
// WHY: Separates flex layout (children) from grid width (VCol)
// PATTERN: Let Vuetify handle VCol width, wrapper handles internal flex layout
.time-selection-content {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
  max-width: 100%;
  min-width: 0; // Allow wrapper to shrink below content size
  box-sizing: border-box;
  min-height: 300px;
  // LEARNING: Ensure wrapper fills VCol completely
  // WHY: VCol uses flexbox internally, wrapper must fill available space
  // PATTERN: Explicit width constraints to ensure proper filling
  flex: 1 1 auto; // Fill available space in flex container
  
  @media (min-width: 600px) {
    min-height: 350px;
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
// WHY: Abuts bottom of time selection grid, same width as grid column
// PATTERN: No top margin/padding to abut grid, full width of parent column
.availability-options-section {
  margin-top: 0;
  padding-top: 1.5rem;
  width: 100%;
  
  @media (min-width: 600px) {
    padding-top: 1.5rem;
  }
}

// LEARNING: Appointment slot grid when abutting availability options
// WHY: Remove bottom margin so availability options abut directly below
.appointment-slot-grid-abut {
  margin-bottom: 0 !important;
  
  @media (min-width: 600px) {
    margin-bottom: 0 !important;
  }
}

// LEARNING: Availability cards spacing
// WHY: Ensures proper spacing between availability option cards
// PATTERN: Margin bottom on card group container
.availability-cards {
  margin-bottom: 1rem;
}

</style>

