<script setup lang="ts">
/**
 * AppointmentSlotGrid Component
 * 
 * LEARNING: Responsive appointment slot button grid with dynamic column calculation
 * WHY: Encapsulates grid layout logic, ResizeObserver, and responsive behavior
 * PATTERN: Self-contained component with props/events for parent communication
 * 
 * Features:
 * - Dynamic column calculation based on available width
 * - ResizeObserver for responsive behavior
 * - Touch-friendly button sizing
 * - Configurable min/max columns and button sizing
 * - Support for AppointmentSlots with dual-time display (major/minor perspectives)
 * - Emits orderIndex along with TimeSlot for proper selection tracking
 */

import { computed, ref } from 'vue'
import type { TimeRange, AppointmentSlots } from '@/types/appointment'
import { useTimeFormatting } from '@/composables/useTimeFormatting'
import { useResponsiveGrid } from '@/composables/booking/useResponsiveGrid'
import { derivePerspective } from '@/utils/booking/appointmentSlotBuilder'
import { useGlobal } from '@/composables/useGlobal'
import { useAvailabilitySettings } from '@/composables/booking/useAvailabilitySettings'
import { isDevModeEnabled } from '@/utils/env/devMode'
import { getColorForViolation, formatViolationTooltip } from '@/utils/booking/constraintColors'

interface Props {
  appointmentSlots: AppointmentSlots // AppointmentSlots structure
  selectedButtonIndex?: number | null // Selection by buttonIndex
  timeBasis?: 'major' | 'minor' | 'nonDifferential' // Time perspective for differential scheduling
  color?: 'primary' | 'secondary'
  variant?: 'flat' | 'outlined'
  loading?: boolean
  minColumns?: number
  maxColumns?: number
  buttonMinWidth?: number
  gap?: number
}

const props = withDefaults(defineProps<Props>(), {
  selectedButtonIndex: null,
  timeBasis: 'nonDifferential',
  color: 'primary',
  variant: 'outlined',
  loading: false,
  minColumns: 1, // LEARNING: Minimum of 1 column allows grid to shrink to single column when space is tight
  maxColumns: 8,
  buttonMinWidth: 140, // Increased from 80 to accommodate "10:00 AM - 10:30 AM" format
  gap: 10
})

const emit = defineEmits<{
  'slot-click': [buttonIndex: number]
}>()

const gridRef = ref<HTMLElement | null>(null)

// LEARNING: Use responsive grid composable
// PATTERN: Composable provides column calculations and ResizeObserver management
const {
  buttonGridColumns
} = useResponsiveGrid({
  gridRef,
  minColumns: props.minColumns,
  maxColumns: props.maxColumns,
  buttonMinWidth: props.buttonMinWidth,
  gap: props.gap
})

// LEARNING: Use time formatting composable for time operations
// WHY: Moves time formatting logic out of component to prevent recursion
// PATTERN: Composable provides pure utility functions
const { formatTimeRange } = useTimeFormatting()

const { getGlobalData } = useGlobal()
const { settings: availabilitySettings } = useAvailabilitySettings()
const isDevMode = isDevModeEnabled()

// LEARNING: Constraint colors and formatting utilities imported from shared module
// WHY: Centralized constants and utilities used across components

interface SlotDisplayData {
  buttonIndex: number
  displayTime: TimeRange | null
  isAvailable: boolean
  violations?: string[]
}

/**
 * LEARNING: Compute display slots from AppointmentSlots
 * WHY: Derives perspective directly using timeBasis prop for reactivity
 * PATTERN: Map over appointmentSlots, call derivePerspective with current timeBasis
 * NOTE: Directly uses timeBasis prop to ensure reactivity when perspective changes
 * LEARNING: Availability doesn't change with perspective - only display time changes
 * WHY: Slots are the same regardless of perspective, only the label/time shown changes
 */
const displaySlots = computed(() => {
  const currentPerspective = props.timeBasis
  const globalData = getGlobalData()
  
  const slots = props.appointmentSlots.map(appointmentSlot => {
    const displayTime = derivePerspective(
      appointmentSlot, 
      currentPerspective,
      globalData || undefined,
      availabilitySettings.value || null
    )
    
    // LEARNING: Include violations for dev mode dot display
    // WHY: Dots are now integrated into buttons, not overlay
    const violations = !appointmentSlot.isAvailable && appointmentSlot.flexibleViolations
      ? appointmentSlot.flexibleViolations
      : undefined
    
    return {
      buttonIndex: appointmentSlot.buttonIndex,
      displayTime,
      isAvailable: appointmentSlot.isAvailable,
      violations
    }
  })
  
  return slots
})

const handleAppointmentSlotClick = (slotData: SlotDisplayData): void => {
  emit('slot-click', slotData.buttonIndex)
}

// WHY: Centralizes formatting logic
// PATTERN: Method that formats the conversion
const formatSlotTime = (slotData: SlotDisplayData): string => {
  if (!slotData.displayTime) {
    // PATTERN: Fallback to 'Unavailable' only if truly no time can be determined
    return 'Unavailable'
  }
  
  return formatTimeRange(slotData.displayTime)
}
</script>

<template>
  <!-- LEARNING: Dynamic button grid with computed column count -->
  <!-- WHY: Adapts to available width for optimal button layout -->
  <!-- PATTERN: CSS Grid with dynamic grid-template-columns via inline style -->
  <div
    ref="gridRef"
    class="appointment-slot-grid"
    :style="{ '--grid-columns': buttonGridColumns }"
  >
    <VBtn
      v-for="slotData in displaySlots"
      :key="`appointment-${slotData.buttonIndex}`"
      :variant="selectedButtonIndex === slotData.buttonIndex ? 'flat' : variant"
      :color="color"
      size="small"
      :class="['appointment-slot-btn', { 
        'appointment-slot-btn--inactive': selectedButtonIndex !== null && selectedButtonIndex !== slotData.buttonIndex,
        'appointment-slot-btn--busy': !slotData.isAvailable
      }]"
      :disabled="loading || !slotData.isAvailable"
      @click="handleAppointmentSlotClick(slotData)"
    >
      <span class="slot-button-content">
        {{ formatSlotTime(slotData) }}
      </span>
      <!-- LEARNING: Constraint dots positioned in top right corner -->
      <!-- WHY: More reliable than overlay, works correctly with scrolling -->
      <!-- PATTERN: Show dots only in dev mode, only on unavailable slots with violations -->
      <span
        v-if="isDevMode && slotData.violations && slotData.violations.length > 0"
        class="constraint-dots"
      >
        <VTooltip
          v-for="(violation, index) in slotData.violations"
          :key="`${slotData.buttonIndex}-${violation}-${index}`"
          :text="formatViolationTooltip(violation)"
          location="top"
        >
          <template #activator="{ props: tooltipProps }">
            <span
              v-bind="tooltipProps"
              class="constraint-dot"
              :style="{ backgroundColor: getColorForViolation(violation) }"
            />
          </template>
        </VTooltip>
      </span>
    </VBtn>
  </div>
</template>

<style scoped lang="scss">
.appointment-slot-grid {
  display: grid;
  width: 100%; // Fill available space in parent wrapper
  max-width: 100%; // Prevent overflow beyond parent
  min-width: 0; // Allow grid to shrink below content size
  box-sizing: border-box; // Include padding in width calculation
  margin-bottom: 0; // Override default margin to align with container spacing
  position: relative; // LEARNING: Enable absolute positioning for constraint overlay
  // PATTERN: Use fixed column width (140px), buttons will size to content with min-width constraint
  grid-template-columns: repeat(var(--grid-columns, 1), 140px);
  grid-auto-rows: max-content; // Allow height to collapse to button content
  align-content: start; // LEARNING: Keep grid height bound to its items
  justify-content: start; // LEARNING: Align grid to start if there's extra space
  gap: 8px;
  padding: 0 10px; // 20px total horizontal padding
  // PATTERN: Fixed max-height with overflow-y: auto for consistent scrolling behavior
  max-height: 350px;
  overflow-y: auto;
  overflow-x: hidden; // LEARNING: Ensure horizontal overflow is hidden
  scroll-behavior: smooth;
  // PATTERN: Explicit width constraints to ensure proper filling
  flex: 0 1 auto; // Allow grid to shrink/grow within flex container
  
  @media (min-width: 600px) {
    gap: 10px;
    padding: 0 10px; // Keep consistent 20px total
  }
  
  // PATTERN: Webkit scrollbar styling
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(var(--v-theme-surface), 0.1);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(var(--v-theme-on-surface), 0.3);
    border-radius: 4px;
    
    &:hover {
      background: rgba(var(--v-theme-on-surface), 0.5);
    }
  }
  
  // PATTERN: Buttons fill grid cells to prevent overflow
  .appointment-slot-btn {
    min-height: 44px; // Touch-friendly minimum size
    min-width: 140px; // Minimum width for longer time ranges like "10:00 AM - 10:30 AM"
    width: 100%; // LEARNING: Changed from max-content to 100%
    max-width: 100%; // Prevent overflow beyond grid cell
    padding: 0.5rem 1rem !important; // Explicit padding to prevent text overflow
    white-space: nowrap; // Prevent text wrapping
    overflow: visible; // LEARNING: Allow dots to be visible
    text-overflow: ellipsis; // Fallback if text is still too long
    box-sizing: border-box; // LEARNING: Ensure padding included in width
    position: relative; // LEARNING: Enable relative positioning for dots
    pointer-events: auto; // LEARNING: Ensure button allows pointer events to pass through to dots
    
    .slot-button-content {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
    }
    
    .constraint-dots {
      position: absolute;
      top: 4px;
      right: 4px;
      display: flex;
      gap: 4px;
      flex-shrink: 0;
      z-index: 10; // LEARNING: Higher z-index to ensure tooltips appear above button
      pointer-events: auto; // LEARNING: Ensure dots can receive pointer events
    }
    
    .constraint-dot {
      width: 12px; // LEARNING: Increased from 8px for better hover target
      height: 12px; // LEARNING: Increased from 8px for better hover target
      border-radius: 50%;
      border: 1px solid rgba(255, 255, 255, 0.8);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
      flex-shrink: 0;
      cursor: help; // LEARNING: Indicate tooltip availability
      pointer-events: auto; // LEARNING: Ensure dot can receive pointer events
    }
    
    @media (min-width: 600px) {
      min-height: 40px;
      padding: 0.625rem 1.25rem !important; // Slightly more padding on larger screens
    }
    
    // LEARNING: Active state (default, available, not selected)
    // PATTERN: Use light tinted background with primary/secondary color
    &[color="primary"]:not(.appointment-slot-btn--busy):not(.appointment-slot-btn--inactive):not(.v-btn--variant-flat) {
      background-color: rgba(var(--v-theme-primary), 0.1) !important;
      border-color: rgb(var(--v-theme-primary)) !important;
      color: rgb(var(--v-theme-on-surface)) !important;
    }
    
    &[color="secondary"]:not(.appointment-slot-btn--busy):not(.appointment-slot-btn--inactive):not(.v-btn--variant-flat) {
      background-color: rgba(var(--v-theme-secondary), 0.1) !important;
      border-color: rgb(var(--v-theme-secondary)) !important;
      color: rgb(var(--v-theme-on-surface)) !important;
    }
    
    // LEARNING: Selected state (when button is selected - uses flat variant)
    // PATTERN: Override Vuetify flat variant to ensure proper contrast
    &.v-btn--variant-flat:not(.appointment-slot-btn--busy) {
      &[color="primary"] {
        background-color: rgb(var(--v-theme-primary)) !important;
        border-color: rgb(var(--v-theme-primary)) !important;
        color: rgb(var(--v-theme-on-primary)) !important;
      }
      
      &[color="secondary"] {
        background-color: rgb(var(--v-theme-secondary)) !important;
        border-color: rgb(var(--v-theme-secondary)) !important;
        color: rgb(var(--v-theme-on-secondary)) !important;
      }
    }
    
    // PATTERN: Very light background with reduced opacity for text
    &--inactive:not(.appointment-slot-btn--busy) {
      &[color="primary"] {
        background-color: rgba(var(--v-theme-primary), 0.05) !important;
        border-color: rgba(var(--v-theme-primary), 0.2) !important;
        color: rgba(var(--v-theme-on-surface), 0.7) !important;
      }
      
      &[color="secondary"] {
        background-color: rgba(var(--v-theme-secondary), 0.05) !important;
        border-color: rgba(var(--v-theme-secondary), 0.2) !important;
        color: rgba(var(--v-theme-on-surface), 0.7) !important;
      }
    }
    
    // LEARNING: Busy slot styling (unavailable due to calendar conflicts)
    // WHY: Gray background clearly indicates unavailable state
    // PATTERN: Use gray surface colors with reduced opacity
    &--busy {
      cursor: not-allowed;
      background-color: rgba(var(--v-theme-on-surface), 0.08) !important;
      border-color: rgba(var(--v-theme-on-surface), 0.2) !important;
      color: rgba(var(--v-theme-on-surface), 0.5) !important;
      opacity: 1 !important; // Remove opacity override, use color opacity instead
    }
  }
  
}
</style>

