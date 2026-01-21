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

import { computed, inject, ref, watch, nextTick, type Ref, type ComputedRef } from 'vue'
import type { TimeSlot, PerspectiveKey } from '@/types/appointment'
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
import { roundUpToIncrement, getCalendarAvailability } from '@/utils/timeSlotCalculations'
import SelectionCardGroup from '@/components/booking/SelectionCardGroup.vue'
import AppointmentSlotGrid from '@/components/booking/AppointmentSlotGrid.vue'
import TimeOnSiteGraph from '@/components/booking/TimeOnSiteGraph.vue'
import MoveablePartsModal from '@/components/booking/MoveablePartsModal.vue'
import CalendarMockDevPanel from '@/components/booking/dev/CalendarMockDevPanel.vue'
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
const { getTodayDate } = useTimeFormatting()

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

// LEARNING: Compute effective differential state before useAvailabilityDefaults
// WHY: useAvailabilityDefaults needs effective differential state (considering overrides) to auto-select startTimeType
// PATTERN: Check if service is differential AND no part has differentialOverride: true
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
// NOTE: inspectorOrderIndex and clientOrderIndex are kept for backward compatibility with step data
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

// LEARNING: Calculate appointment duration from block instances for filtering start times
// WHY: Need to ensure last appointment ends at or before day end
// PATTERN: Calculate on-site duration (not total duration) since report writing can happen off-site
const appointmentDuration = computed(() => {
  const instances = accumulatedBlockInstances.value
  if (instances.length === 0) {
    return null
  }
  
  // LEARNING: Calculate on-site duration, not total duration
  // WHY: Report writing can happen off-site, so we only need to ensure on-site work fits in business hours
  // PATTERN: Sum baseTime from parts where onSite === true
  const onSiteDuration = instances.reduce((sum, bi) => {
    if (!bi.partInstances || bi.partInstances.length === 0) return sum
    return sum + bi.partInstances.reduce((partSum, part) => {
      // Only count parts that require being on-site
      return partSum + (part.onSite === true ? (part.baseTime || 0) : 0)
    }, 0)
  }, 0)
  
  // LEARNING: Round up to nearest 15-minute increment
  // WHY: Ensures durations align with standard time increments for cleaner scheduling
  // PATTERN: Use ceiling function to round up
  const roundedDuration = roundUpToIncrement(onSiteDuration, 15)
  
  return roundedDuration > 0 ? roundedDuration : null
})

// LEARNING: Generate available start times from availability settings
// WHY: Buttons should be generated based on admin-configured business hours and intervals
// PATTERN: Use composable to generate times from dayStart + (interval * buttonIndex)
// NOTE: Pass appointmentDuration to filter start times so last appointment ends at or before day end
// LEARNING: Get busy times from calendar for availability checking
// WHY: Need to mark slots as busy when they overlap calendar busy periods
// PATTERN: Get busy times from dateRangeForApi and pass to useAvailableStartTimes
const busyTimesForStartTimes = computed(() => {
  if (!dateRangeForApi.value) return []
  return getCalendarAvailability({
    start: dateRangeForApi.value.start,
    end: dateRangeForApi.value.end
  })
})

const {
  availableStartTimes,
  slotAvailability
} = useAvailableStartTimes({
  selectedDate,
  appointmentDuration,
  busyTimes: busyTimesForStartTimes
})

// LEARNING: Extract time slot durations for fallback when shape duration is 0
// WHY: If services have 0 baseTime, use time slot duration to ensure valid time ranges
// PATTERN: Map timeSlots to durations, indexed by startTime
const timeSlotDurations = computed(() => {
  if (!selectedDate.value.start) return new Map<string, number>()
  
  const daySlots = timeSlotsPerDay.value.find(day => day.date === selectedDate.value.start)
  if (!daySlots) return new Map<string, number>()
  
  // LEARNING: Use array-to-Map constructor instead of forEach with mutations
  // WHY: Functional approach avoids mutations, aligns with workspace rules
  // PATTERN: Build Map from array using constructor with entries
  return new Map(
    daySlots.inspectorTimeSlots.map(slot => [slot.startTime, slot.duration])
  )
})

// LEARNING: Map startTimeType to PerspectiveKey
// WHY: startTimeType uses UI labels, PerspectiveKey uses logic names
// PATTERN: Map UI labels to logic keys
const perspective = computed<PerspectiveKey>(() => {
  if (startTimeType.value === 'inspector') return 'onSite'
  if (startTimeType.value === 'client') return 'clientPresent'
  return 'nonDifferential'
})

// LEARNING: Map appointmentSlotOrderIndex to selectedButtonIndex
// WHY: New system uses buttonIndex instead of orderIndex
// PATTERN: Use appointmentSlotOrderIndex as buttonIndex
const selectedButtonIndex = computed(() => appointmentSlotOrderIndex.value)

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
// WHY: Extracts responsive layout and date handling logic from component to composable
// PATTERN: Composable provides reactive computed properties and handler functions
// NOTE: Appointment slot selection is handled by useAppointmentSlots composable
// LEARNING: Simplified to only check viewport width, removed column measurement
// WHY: Trusts Vuetify grid system instead of fighting it with measurements
const {
  handleDateChange
} = useAvailabilityUI({
  selectedDate,
  selectedButtonIndex,
  fieldErrors
})

// Note: Debug logging removed - shouldShowGridInline is reactive and will update template automatically

// Note: Debug layout logging removed - Vuetify's responsive grid handles layout automatically
// If layout debugging is needed, use Vue DevTools or browser DevTools instead of direct DOM queries

// LEARNING: Handler for appointment slot click
// WHY: Updates selectedButtonIndex when slot is clicked, checks for moveable parts
// PATTERN: Event handler that updates selection state and opens modal if needed
const handleAppointmentSlotClick = (buttonIndex: number): void => {
  appointmentSlotOrderIndex.value = buttonIndex
  
  // After selection, check for moveable parts
  // Use nextTick to ensure selectedSlot has updated
  nextTick(() => {
    if (hasMoveableParts.value && selectedSlot.value) {
      openMoveableModal()
    }
  })
}

// LEARNING: Handler for moveable modal confirm
// WHY: Stores confirmed moveable scheduling and closes modal
// PATTERN: Event handler that updates state
const handleMoveableConfirm = (): void => {
  if (moveableOptions.value) {
    confirmedMoveableScheduling.value = {
      ...moveableOptions.value,
      selectedSlotIndex: selectedMoveableSlotIndex.value
    }
  }
  closeMoveableModal()
}

// LEARNING: Handler for moveable modal cancel
// WHY: Closes modal without saving
// PATTERN: Event handler that resets state
const handleMoveableCancel = (): void => {
  closeMoveableModal()
  // Reset selection when canceling
  selectedMoveableSlotIndex.value = null
}

// LEARNING: Default date initialization is now handled in useAvailabilityDefaults composable
// WHY: The composable watches timeSlots with immediate: true and auto-selects first available date
// PATTERN: No onMounted needed - composable handles all defaulting logic

// LEARNING: Handler for Time Basis Graph time basis change event
// WHY: Updates startTimeType when TimeOnSiteGraph component emits change event
// PATTERN: Event handler that maps UI labels to internal state
const handleTimeBasisChange = (type: 'inspector' | 'client'): void => {
  startTimeType.value = type
}
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
          <!-- LEARNING: Dev Mode Calendar Mock Panel - Next to heading -->
          <!-- WHY: More visible and accessible when debugging -->
          <!-- PATTERN: Positioned next to heading, overlays content when expanded -->
          <div class="calendar-mock-dev-panel-wrapper">
            <CalendarMockDevPanel :date-range="dateRangeForApi" />
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
          <!-- USER_STORY: Show empty state when no slots available -->
          <div v-if="appointmentSlots.length === 0" class="text-body-2 text-medium-emphasis py-4 mb-4 mb-sm-6">
            <span v-if="isEffectivelyDifferential && startTimeType === 'nonDifferential'">
              Click on the Inspector or Client bars below the calendar to view available times.
            </span>
            <span v-else>
              No time slots available for selected date.
            </span>
          </div>

          <AppointmentSlotGrid
            v-else
            :appointment-slots="appointmentSlots"
            :selected-button-index="selectedButtonIndex"
            :time-basis="perspective"
            :color="startTimeType === 'inspector' ? 'primary' : startTimeType === 'client' ? 'secondary' : 'primary'"
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

    <!-- Moveable Parts Scheduling Modal -->
    <MoveablePartsModal
      v-model:show-modal="showMoveableModal"
      :moveable-options="moveableOptions ?? null"
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

// LEARNING: Calendar mock dev panel wrapper
// WHY: Provides positioning context for overlay behavior
// PATTERN: Relative positioning for absolute child positioning, prevent overflow
.calendar-mock-dev-panel-wrapper {
  position: relative;
  z-index: 1;
  overflow: visible;
  
  // LEARNING: Ensure wrapper doesn't constrain panel expansion
  // WHY: Panel needs to expand beyond wrapper bounds when opened
  // PATTERN: Allow overflow for absolute positioned children, prevent clipping
  @media (min-width: 961px) {
    min-width: 0;
    flex-shrink: 0;
    // LEARNING: Allow panel to expand leftward if needed
    // WHY: Prevents panel from being clipped or going off-screen
    // PATTERN: Use negative margin or positioning to allow leftward expansion
  }
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

