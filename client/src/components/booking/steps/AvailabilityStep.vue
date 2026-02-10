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

import { computed, inject, ref, watch, type Ref, type ComputedRef } from 'vue'
import type { DisplayedMonth } from '@/composables/booking/useDateRangeDecider'
import type { UseComputedAvailabilityReturn } from '@/composables/booking/useComputedAvailability'
import type { TimeSlot } from '@/types/appointment'
import { useBookingWizard } from '@/composables/useBookingWizard'
import { useTimeFormatting } from '@/composables/useTimeFormatting'
import { useAvailabilityLogic } from '@/composables/booking/useAvailabilityLogic'
import { useAppointmentSlots } from '@/composables/booking/useAppointmentSlots'
import { useAvailabilityValidation } from '@/composables/booking/useAvailabilityValidation'
import { useAvailabilityStepData } from '@/composables/booking/useAvailabilityStepData'
import { useOptionTypeBlockSelection } from '@/composables/booking/useOptionTypeBlockSelection'
import { useAvailabilityUI } from '@/composables/booking/useAvailabilityUI'
import { useAvailabilityDefaults } from '@/composables/booking/useAvailabilityDefaults'
import { useMoveablePartsScheduling } from '@/composables/booking/useMoveablePartsScheduling'
import { useAppointmentDuration } from '@/composables/booking/useAppointmentDuration'
import { useMockCalendarRefresh } from '@/composables/booking/useMockCalendarRefresh'
import { usePerspectiveMapping } from '@/composables/booking/usePerspectiveMapping'
import { useWizardStepSync } from '@/composables/booking/useWizardStepSync'
import { useAvailabilityStepHandlers } from '@/composables/booking/useAvailabilityStepHandlers'
import { useAvailabilityDevPanel } from '@/composables/booking/useAvailabilityDevPanel'
import { useAvailabilityEmptyState } from '@/composables/booking/useAvailabilityEmptyState'
import { useAvailabilitySlotColor } from '@/composables/booking/useAvailabilitySlotColor'
import { equals } from '@/utils/ternary/ternaryUtils'
import SelectionCardGroup from '@/components/booking/SelectionCardGroup.vue'
import AppointmentSlotGrid from '@/components/booking/AppointmentSlotGrid.vue'
import DifferentialGraph from '@/components/booking/DifferentialGraph.vue'
import MoveablePartsModal from '@/components/booking/MoveablePartsModal.vue'
import type { WizardStateData } from '@/utils/transformers/appointmentToWizardTransformer'

const wizard = inject<ReturnType<typeof useBookingWizard>>('wizard')
if (!wizard) {
  throw new Error('Wizard instance not provided. Make sure BookingWizard component provides the wizard instance.')
}

const loadedWizardState = inject<Ref<WizardStateData | null>>('loadedWizardState')
if (!loadedWizardState) {
  throw new Error('loadedWizardState not provided. Make sure BookingWizard provides loadedWizardState.')
}

// LEARNING: Inject server-computed availability data from parent (slotsByDay, constraints, events)
// WHY: Slots and constraints come from server; step derives timeSlots and appointmentSlots from slotsByDay
const computedAvailability = inject<UseComputedAvailabilityReturn>('computedAvailability')
if (!computedAvailability) {
  throw new Error('computedAvailability must be provided by BookingWizard')
}

// LEARNING: Use time formatting composable for time operations
// WHY: Moves time formatting logic out of component to prevent recursion
// PATTERN: Composable provides pure utility functions
const { getTodayDate } = useTimeFormatting()

const propertyDetailsStepData = inject<Ref<{ squareFootage?: number | null; bedrooms?: number | null; bathrooms?: number | null; foundationAccess?: 'basement' | 'crawlspace' | 'slab' | null; additionalUnits?: number | null; [key: string]: unknown }> | null>('propertyDetailsStepData')
if (!propertyDetailsStepData) {
  throw new Error('propertyDetailsStepData not provided. Make sure BookingWizard provides propertyDetailsStepData.')
}

// WHY: Resolves circular dependency between composables:
// NOTE: This wrapper pattern is necessary due to initialization order constraints.
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
// NOTE: This is calculated early because useAvailabilityDefaults needs it before useAvailabilityLogic is called
const isEffectivelyDifferentialForDefaults = computed(() => {
  const selectedServices = wizard.selectedServiceTypeBlocks.value
  
  // PATTERN: Use equals() helper from ternaryUtils for proper comparison
  const isDifferential = selectedServices.some(s => equals(s.differential, 'true'))
  if (!isDifferential) return false
  
  // PATTERN: Differential override logic should be handled via events if needed in the future
  
  const serviceHasOverride = false // Removed: differentialOverride check deprecated
  const optionHasOverride = false // Removed: differentialOverride check deprecated
  if (serviceHasOverride || optionHasOverride) return false
  
  return true
})

// LEARNING: Use availability defaults composable for state management and defaulting
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

// LEARNING: Track displayed month for VDatePicker
// WHY: VDatePicker's display-date prop controls which month is shown
// PATTERN: Initialize with default date, will be updated by watch after displayedMonth is injected
// WHY: getTodayDate() returns ISO8601Date string, so create Date object directly
const today = new Date()
const vDatePickerDisplayDate = ref<Date>(new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1)))

// Watch VDatePicker display-date and update parent's displayedMonth
// LEARNING: When user navigates months in calendar, update parent's displayedMonth
// WHY: Triggers API orchestrator to prefetch data for new month
// WHY: Guard against recursive updates - only update if month actually changed
// NOTE: displayedMonth is injected later, so this watch will be set up after injection
// The watch callback will only execute after displayedMonth is available

// LEARNING: Use availability logic composable
// PATTERN: Composable provides reactive computed properties for availability logic
const {
  accumulatedBlockInstances,
  dateRangeForApi,
  propertyDetails: _propertyDetails,
  timeSlotsPerDay: _timeSlotsPerDay,
  selectedDateSingle,
  isEffectivelyDifferential
} = useAvailabilityLogic({
  selectedDate,
  propertyDetailsStepData,
  wizard: {
    selectedUserTypeBlock: wizard.selectedUserTypeBlock,
    selectedServiceTypeBlocks: wizard.selectedServiceTypeBlocks,
    selectedPropertyTypeBlocks: wizard.selectedPropertyTypeBlocks,
    selectedOptionTypeBlocks: wizard.selectedOptionTypeBlocks
  },
  timeSlots: timeSlotsForLogic as ComputedRef<TimeSlot[]>,
  loadedWizardState
})

// Phase 5: Server-computed slots for selected day; timeSlots for logic derived from server (no client slot generation)
const selectedDayKey = computed(() => {
  const start = selectedDate.value?.start
  return start ? (start.includes('T') ? start.split('T')[0] : start) : null
})
const serverSlotsForDay = computed(() => {
  const day = selectedDayKey.value
  if (!day) return []
  return computedAvailability.slotsByDay.value.get(day) ?? []
})
const timeSlotsFromServer = computed<TimeSlot[]>(() =>
  serverSlotsForDay.value.map((s) => ({
    startTime: s.startTime,
    endTime: s.endTime,
    duration: s.duration,
    major: false,
    minor: false,
    moveable: false,
    isAvailable: s.isAvailable,
    flexibleViolations: s.violations,
  }))
)
timeSlotsWrapper.value = timeSlotsFromServer
 
// LEARNING: Use availability option selection composable
// PATTERN: Composable provides reactive computed property for selection
const { selectedOptionTypeBlockId } = useOptionTypeBlockSelection({
  selectedOptionTypeBlocks: wizard.selectedOptionTypeBlocks,
  availableOptionTypeBlocks: wizard.availableOptionTypeBlocks
})

// LEARNING: Use appointment duration composable
// PATTERN: Composable provides computed property for appointment duration
const { appointmentDuration } = useAppointmentDuration({
  accumulatedBlockInstances
})

// LEARNING: Use mock calendar refresh composable
// PATTERN: Composable manages refresh key and reset functionality
const { mockRefreshKey } = useMockCalendarRefresh()

// LEARNING: Inject displayedMonth and updateDisplayedMonth from parent (BookingWizard)
// WHY: Tracks which month is displayed in calendar widget, triggers API prefetching
// PATTERN: Parent provides, child updates via inject
const displayedMonth = inject<Ref<DisplayedMonth>>('displayedMonth')
const updateDisplayedMonth = inject<(month: DisplayedMonth) => void>('updateDisplayedMonth')

if (!displayedMonth || !updateDisplayedMonth) {
  throw new Error('displayedMonth and updateDisplayedMonth must be provided by BookingWizard')
}

// Watch VDatePicker display-date and update parent's displayedMonth
// LEARNING: When user navigates months in calendar, update parent's displayedMonth
// WHY: Triggers API orchestrator to prefetch data for new month
// WHY: Guard against recursive updates - only update if month actually changed
watch(vDatePickerDisplayDate, (newDate) => {
  if (!isNaN(newDate.getTime()) && displayedMonth && updateDisplayedMonth) {
    const newMonth: DisplayedMonth = {
      year: newDate.getUTCFullYear(),
      month: newDate.getUTCMonth()
    }
    const currentMonth = displayedMonth.value
    // Only update if the month/year actually changed to prevent recursive loop
    if (currentMonth.year !== newMonth.year || currentMonth.month !== newMonth.month) {
      updateDisplayedMonth(newMonth)
    }
  }
})

// LEARNING: Inject appointment duration ref from parent and sync computed duration to it
// WHY: Parent needs actual duration for accurate capacity calculations in server fetch
// PATTERN: Watch computed duration and update parent ref reactively
const appointmentDurationRef = inject<Ref<number | null>>('appointmentDuration')

if (!appointmentDurationRef) {
  throw new Error('appointmentDuration must be provided by BookingWizard')
}

// Sync computed duration back to parent ref
watch(appointmentDuration, (newDuration) => {
  appointmentDurationRef.value = newDuration
}, { immediate: true })

// Watch displayedMonth from parent and update VDatePicker display-date
// LEARNING: Update VDatePicker when displayedMonth changes from parent
// WHY: Keeps calendar widget in sync with parent's displayed month
// PATTERN: Watch injected displayedMonth and update local ref
// WHY: Guard against recursive updates - only update if month actually changed
watch(displayedMonth, (newMonth) => {
  const newDate = new Date(Date.UTC(newMonth.year, newMonth.month, 1))
  const currentDate = vDatePickerDisplayDate.value
  // Only update if the month/year actually changed to prevent recursive loop
  if (currentDate.getUTCFullYear() !== newMonth.year || currentDate.getUTCMonth() !== newMonth.month) {
    vDatePickerDisplayDate.value = newDate
  }
}, { immediate: true })

// LEARNING: Track displayed month from selectedDate
// WHY: When user selects a date, update displayedMonth to match that month
// PATTERN: Watch selectedDate and extract month, update parent's displayedMonth
watch(selectedDate, (newDate) => {
  if (newDate?.start) {
    const date = new Date(newDate.start)
    if (!isNaN(date.getTime())) {
      const month: DisplayedMonth = {
        year: date.getUTCFullYear(),
        month: date.getUTCMonth()
      }
      updateDisplayedMonth(month)
    }
  }
}, { immediate: true })

// LEARNING: Use perspective mapping composable
// PATTERN: Composable provides computed property for perspective mapping
const { perspective } = usePerspectiveMapping({
  startTimeType
})

// PATTERN: Use appointmentSlotOrderIndex as buttonIndex
const selectedButtonIndex = computed(() => appointmentSlotOrderIndex.value)

// LEARNING: Use availability slot color composable
// PATTERN: Composable provides slot color, calendar date availability, and first available date
const { slotColor, allowedDates, firstAvailableDate } = useAvailabilitySlotColor({
  startTimeType,
  slotsByDay: computedAvailability.slotsByDay
})

// LEARNING: Auto-navigate calendar to the first available date when it's not today
// WHY: If today is fully booked, the user shouldn't have to hunt through the calendar
// PATTERN: Watch firstAvailableDate, update selectedDate only if user hasn't manually picked a different date
const firstAvailableNotice = ref<string | null>(null)

watch(firstAvailableDate, (firstDate) => {
  if (!firstDate) return

  const today = getTodayDate()

  // LEARNING: Only auto-navigate if the user is still on the default "today" selection
  // WHY: Respects manual user selection — don't override their choice
  if (selectedDate.value.start !== today) return

  if (firstDate === today) {
    // Today has availability — clear any stale notice
    firstAvailableNotice.value = null
    return
  }

  // LEARNING: First available date is in the future — navigate and notify
  // WHY: User needs to know why the calendar jumped and that today is fully booked
  selectedDate.value = { start: firstDate, end: null }

  // PATTERN: Format the date for a human-readable notification message
  const dateObj = new Date(firstDate + 'T00:00:00')
  const formatted = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
  firstAvailableNotice.value = `Today is fully booked. Showing ${formatted} — the earliest date with available slots.`
}, { immediate: true })

// LEARNING: Use appointment slots composable (server slots + client shape; no client constraint re-check)
const {
  appointmentShape,
  appointmentSlots,
  selectedSlot,
  graphBars
} = useAppointmentSlots({
  blockInstances: accumulatedBlockInstances,
  serverSlotsForDay,
  selectedButtonIndex,
  perspective,
  isDifferentialService: isEffectivelyDifferential
})

// LEARNING: Use moveable parts scheduling composable
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

const confirmedMoveableScheduling = ref<typeof moveableOptions.value>(null)

// LEARNING: Use availability empty state composable
// PATTERN: Composable provides computed property for empty state message
const { emptyStateMessage } = useAvailabilityEmptyState({
  isEffectivelyDifferential,
  startTimeType,
  appointmentSlotsCount: computed(() => appointmentSlots.value.length)
})

// LEARNING: Use availability step data composable
// PATTERN: Composable provides reactive computed properties for step data
const { stepData } = useAvailabilityStepData({
  selectedDate,
  selectedSlot,
  moveableScheduling: computed(() => confirmedMoveableScheduling.value)
})

// LEARNING: Use availability validation composable
// PATTERN: Composable provides validation functions and computed properties
const { fieldErrors, isFormValid, validateForm } = useAvailabilityValidation({
  selectedDate,
  selectedSlot
})

// LEARNING: Use wizard step sync composable
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
// PATTERN: Composable provides reactive computed properties and handler functions
const {
  handleDateChange
} = useAvailabilityUI({
  selectedDate,
  selectedButtonIndex,
  fieldErrors
})

// LEARNING: Use availability step handlers composable
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
// PATTERN: Composable provides reactive computed object via provide
useAvailabilityDevPanel({
  selectedBlockInstances: accumulatedBlockInstances,
  appointmentSlots,
  appointmentShape,
  selectedDate,
  selectedSlot,
  dateRange: dateRangeForApi,
  busyPeriods: computed(() => []), // Phase 5: No client busy periods; server returns pre-computed slots
  refreshKey: mockRefreshKey,
  isEffectivelyDifferential
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

      <!-- LEARNING: Notification when calendar auto-navigates to first available date -->
      <!-- WHY: Tells the user why the calendar didn't open on today -->
      <!-- PATTERN: VAlert with info type, dismissible, appears only when firstAvailableNotice is set -->
      <VCol v-if="firstAvailableNotice" cols="12" class="pt-0 pb-2">
        <VAlert
          type="info"
          variant="tonal"
          closable
          density="compact"
          class="first-available-notice"
          @click:close="firstAvailableNotice = null"
        >
          {{ firstAvailableNotice }}
        </VAlert>
      </VCol>

      <VCol cols="12" class="calendar-col">
        <div class="calendar-container">
          <!-- LEARNING: allowed-dates disables calendar days with no available slots -->
          <!-- WHY: Gives users immediate visual feedback about which days have openings -->
          <!-- PATTERN: allowedDates function from useAvailabilitySlotColor checks slotsByDay data -->
          <VDatePicker
            v-model="selectedDateSingle"
            :display-date="vDatePickerDisplayDate"
            :min="getTodayDate()"
            :allowed-dates="allowedDates"
            :show-adjacent-months="false"
            :first-day-of-week="0"
            color="primary"
            view-mode="month"
            hide-header
            class="availability-calendar"
            aria-label="Select appointment date"
            @update:model-value="handleDateChange"
            @update:display-date="vDatePickerDisplayDate = $event"
          />

          <div v-if="fieldErrors.selectedDate" class="text-error text-caption mt-2">
            {{ fieldErrors.selectedDate }}
          </div>
          
          <!-- LEARNING: Time On-Site Graph Component - Under Calendar -->
          <!-- WHY: Always visible, shows time breakdown for selected date/time -->
          <!-- PATTERN: Interactive bars that control perspective selection -->
          <DifferentialGraph
            :is-differential-service="isEffectivelyDifferential"
            :graph-bars="graphBars"
            :selected-services="wizard.selectedServiceTypeBlocks.value"
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
          <div v-if="wizard.selectedServiceTypeBlocks.value.length > 0" class="availability-options-section">
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
.availability-step {
  padding: 0;
}

.calendar-grid-row {
}

// LEARNING: Notification when first available date is not today
// WHY: Subtle info banner that doesn't dominate the layout
.first-available-notice {
  font-size: 0.8125rem;
}

.calendar-col {
  margin-bottom: 1.5rem;
  
  @media (min-width: 600px) {
    margin-bottom: 0;
    // PATTERN: Override flex properties only, let Vuetify handle display
    flex: 0 0 auto !important; // Size to content, don't grow/shrink
    max-width: none !important; // Remove Vuetify's max-width constraint
    width: auto !important; // Let content determine width
  }
}

.calendar-container {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: fit-content; // Constrain to calendar width
  max-width: 100%; // Don't exceed parent column
  align-items: flex-start; // Align children to start, don't stretch
  gap: 0; // Remove gap between calendar and graph
  
  // PATTERN: Deep selector for visual styling only, no width/overflow constraints
  :deep(.availability-calendar) {
    box-sizing: border-box;
    
    // PATTERN: Hide header element with CSS using multiple selectors for Vuetify 3
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
    
    .v-date-picker-month {
      margin-top: 0 !important;
      padding-top: 0 !important;
      margin-bottom: 0 !important;
      padding-bottom: 0 !important;
    }
    
    // PATTERN: Style .v-date-picker-month__day with today class
    .v-date-picker-month__day--today,
    .v-date-picker-month__day.v-date-picker-month__day--today {
      .v-btn {
        border: 2px solid rgba(var(--v-theme-on-surface), 0.3) !important;
        background-color: transparent !important;
        font-weight: 600;
      }
    }
    
    // PATTERN: Style .v-date-picker-month__day with selected class
    .v-date-picker-month__day--selected,
    .v-date-picker-month__day.v-date-picker-month__day--selected {
      .v-btn {
        background-color: rgb(var(--v-theme-primary)) !important;
        color: rgb(var(--v-theme-on-primary)) !important;
        font-weight: 600;
      }
    }
    
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
    
    // LEARNING: Disabled dates come from two sources:
    //   1. Past dates → disabled by VDatePicker's :min prop
    //   2. Fully-booked dates → disabled by :allowed-dates (no available slots)
    // WHY: Both share Vuetify's --disabled class; the reduced opacity + not-allowed cursor
    //       gives users clear visual feedback that these days cannot be selected
    // PATTERN: Style disabled date buttons with reduced opacity and muted text
    .v-date-picker-month__day--disabled {
      .v-btn {
        opacity: 0.35;
        cursor: not-allowed;
        text-decoration: line-through;
        text-decoration-color: rgba(var(--v-theme-on-surface), 0.3);
      }
    }
  }
}

.time-graph-wrapper {
  margin-top: 0.5rem;
  margin-bottom: 0;
  
  @media (min-width: 600px) {
    margin-top: 0.5rem;
  }
}

.time-selection-col {
  padding-left: 0;
  min-width: 0; // Allow column to shrink if needed
  
  @media (min-width: 600px) {
    padding-left: 1rem;
    // PATTERN: Flex grow to fill remaining space
    flex: 1 1 0% !important; // Grow to fill remaining space
  }
}

.time-selection-content {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
  max-width: 100%;
  min-width: 0; // Allow wrapper to shrink below content size
  box-sizing: border-box;
  min-height: 300px;
  // PATTERN: Explicit width constraints to ensure proper filling
  flex: 1 1 auto; // Fill available space in flex container
  
  @media (min-width: 600px) {
    min-height: 350px;
  }
}


.date-placeholder {
  min-height: 300px;
  width: 100%;
  
  @media (min-width: 600px) {
    min-height: 400px;
  }
}

.availability-options-row {
  margin-top: 2rem;
  
  @media (min-width: 600px) {
    margin-top: 3rem;
  }
  
  @media (min-width: 960px) {
    margin-top: 3.5rem;
  }
}

// WHY: Abuts bottom of time selection grid, same width as grid column
.availability-options-section {
  margin-top: 0;
  padding-top: 1.5rem;
  width: 100%;
  
  @media (min-width: 600px) {
    padding-top: 1.5rem;
  }
}

.appointment-slot-grid-abut {
  margin-bottom: 0 !important;
  
  @media (min-width: 600px) {
    margin-bottom: 0 !important;
  }
}

.availability-cards {
  margin-bottom: 1rem;
}

</style>

