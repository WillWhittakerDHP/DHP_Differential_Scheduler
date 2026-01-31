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
 * - Support for AppointmentSlots with dual-time display (inspector/client perspectives)
 * - Emits orderIndex along with TimeSlot for proper selection tracking
 */

import { computed, ref } from 'vue'
import type { TimeRange, AppointmentSlots } from '@/types/appointment'
import { useTimeFormatting } from '@/composables/useTimeFormatting'
import { useResponsiveGrid } from '@/composables/booking/useResponsiveGrid'
import { derivePerspective } from '@/utils/booking/appointmentSlotBuilder'

interface Props {
  appointmentSlots: AppointmentSlots // AppointmentSlots structure
  selectedButtonIndex?: number | null // Selection by buttonIndex
  timeBasis?: 'onSite' | 'clientPresent' | 'nonDifferential' // Time perspective for differential scheduling
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

// LEARNING: Ref for grid container
// WHY: Needed for ResizeObserver and grid styling
// PATTERN: Template ref to HTMLElement
const gridRef = ref<HTMLElement | null>(null)

// LEARNING: Use responsive grid composable
// WHY: Extracts column calculation logic from component to composable
// PATTERN: Composable provides column calculations and ResizeObserver management
// LEARNING: Grid measures its own container width via ResizeObserver
// WHY: Trusts Vuetify grid system instead of overriding with explicit width
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

/**
 * LEARNING: Slot display data structure
 * WHY: Associates buttonIndex with display time and availability for rendering
 */
interface SlotDisplayData {
  buttonIndex: number
  displayTime: TimeRange | null
  isAvailable: boolean
}

/**
 * LEARNING: Compute display slots from AppointmentSlots
 * WHY: Derives perspective directly using timeBasis prop for reactivity
 * PATTERN: Map over appointmentSlots, call derivePerspective with current timeBasis
 * NOTE: Directly uses timeBasis prop to ensure reactivity when perspective changes
 */
const displaySlots = computed(() => {
  // LEARNING: Use timeBasis prop directly to derive perspective
  // WHY: Ensures displaySlots recomputes when perspective changes, and we use the correct perspective
  const currentPerspective = props.timeBasis
  
  const slots = props.appointmentSlots.map(appointmentSlot => {
    const displayTime = derivePerspective(appointmentSlot, currentPerspective)
    
    // #region agent log
    if (appointmentSlot.buttonIndex < 3) {
      fetch('http://127.0.0.1:7242/ingest/dee08c11-824d-42a5-9020-c38261879107',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AppointmentSlotGrid.vue:100',message:'AppointmentSlotGrid: derivePerspective result',data:{buttonIndex:appointmentSlot.buttonIndex,currentPerspective,displayTime:displayTime?{startTime:displayTime.startTime,endTime:displayTime.endTime,duration:displayTime.duration}:null,slotTotalTimeRange:appointmentSlot.totalTimeRange?{startTime:appointmentSlot.totalTimeRange.startTime,endTime:appointmentSlot.totalTimeRange.endTime,duration:appointmentSlot.totalTimeRange.duration}:null,slotEventTimeRangesOnSite:appointmentSlot.eventTimeRanges?.['OnSite']?{startTime:appointmentSlot.eventTimeRanges['OnSite'].startTime,endTime:appointmentSlot.eventTimeRanges['OnSite'].endTime,duration:appointmentSlot.eventTimeRanges['OnSite'].duration}:null},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    }
    // #endregion
    
    return {
      buttonIndex: appointmentSlot.buttonIndex,
      displayTime,
      isAvailable: appointmentSlot.isAvailable
    }
  })
  
  return slots
})

// LEARNING: Handler for appointment slot button clicks
// WHY: Emits buttonIndex to parent component
// PATTERN: Event handler that emits buttonIndex
const handleAppointmentSlotClick = (slotData: SlotDisplayData): void => {
  emit('slot-click', slotData.buttonIndex)
}

// LEARNING: Format slot time for display
// WHY: Centralizes formatting logic
// PATTERN: Method that formats the conversion
const formatSlotTime = (slotData: SlotDisplayData): string => {
  if (!slotData.displayTime) {
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
      :disabled="loading || !slotData.displayTime || !slotData.isAvailable"
      @click="handleAppointmentSlotClick(slotData)"
    >
      {{ formatSlotTime(slotData) }}
    </VBtn>
  </div>
</template>

<style scoped lang="scss">
// LEARNING: Appointment slot grid layout with dynamic columns
// WHY: Creates responsive grid layout that adapts to available width
// PATTERN: CSS Grid with dynamic column count based on available width
.appointment-slot-grid {
  display: grid;
  width: 100%; // Fill available space in parent wrapper
  max-width: 100%; // Prevent overflow beyond parent
  min-width: 0; // Allow grid to shrink below content size
  box-sizing: border-box; // Include padding in width calculation
  margin-bottom: 0; // Override default margin to align with container spacing
  // LEARNING: Fixed-width columns based on minimum button width
  // WHY: Ensures at least one button fits, buttons size to content within cells
  // PATTERN: Use fixed column width (140px), buttons will size to content with min-width constraint
  grid-template-columns: repeat(var(--grid-columns, 1), 140px);
  grid-auto-rows: max-content; // Allow height to collapse to button content
  align-content: start; // LEARNING: Keep grid height bound to its items
  justify-content: start; // LEARNING: Align grid to start if there's extra space
  gap: 8px;
  padding: 0 10px; // 20px total horizontal padding
  // LEARNING: Vertical scrolling for overflow
  // WHY: Enables scrolling when there are many time slots that don't fit in visible area
  // PATTERN: Fixed max-height with overflow-y: auto for consistent scrolling behavior
  max-height: 350px;
  overflow-y: auto;
  overflow-x: hidden; // LEARNING: Ensure horizontal overflow is hidden
  scroll-behavior: smooth;
  // LEARNING: Ensure grid fills wrapper div completely
  // WHY: Grid must fill available space in wrapper to get accurate width measurements
  // PATTERN: Explicit width constraints to ensure proper filling
  flex: 0 1 auto; // Allow grid to shrink/grow within flex container
  
  @media (min-width: 600px) {
    gap: 10px;
    padding: 0 10px; // Keep consistent 20px total
  }
  
  // LEARNING: Custom scrollbar styling for better UX
  // WHY: Makes scrollbar more visible and touch-friendly
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
  
  // LEARNING: Appointment slot button sizing
  // WHY: Ensures adequate touch targets on mobile (minimum 44x44px) and proper text display
  // PATTERN: Buttons fill grid cells to prevent overflow
  .appointment-slot-btn {
    min-height: 44px; // Touch-friendly minimum size
    min-width: 140px; // Minimum width for longer time ranges like "10:00 AM - 10:30 AM"
    width: 100%; // LEARNING: Changed from max-content to 100%
    // WHY: Buttons should fill their grid cell, not exceed it
    max-width: 100%; // Prevent overflow beyond grid cell
    padding: 0.5rem 1rem !important; // Explicit padding to prevent text overflow
    white-space: nowrap; // Prevent text wrapping
    overflow: hidden;
    text-overflow: ellipsis; // Fallback if text is still too long
    box-sizing: border-box; // LEARNING: Ensure padding included in width
    
    @media (min-width: 600px) {
      min-height: 40px;
      padding: 0.625rem 1.25rem !important; // Slightly more padding on larger screens
    }
    
    // LEARNING: Active state (default, available, not selected)
    // WHY: Provides light background for available slots to make them clearly active
    // PATTERN: Use light tinted background with primary/secondary color
    // State priority: Active is default, overridden by Selected/Inactive/Busy
    // Note: Applied to buttons that are not busy, not inactive, and not selected (not flat variant)
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
    // WHY: Dark background with inverted text provides strong visual emphasis
    // PATTERN: Override Vuetify flat variant to ensure proper contrast
    // State priority: Selected takes priority over Active, but Busy overrides Selected
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
    
    // LEARNING: Inactive button styling (non-selected slots when something is selected)
    // WHY: Makes inactive buttons clearly muted and less prominent
    // PATTERN: Very light background with reduced opacity for text
    // State priority: Inactive applies when something is selected but this slot is not
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
    // State priority: Busy takes highest priority, overrides all other states
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

