<script setup lang="ts">
/**
 * TimeSlotGrid Component
 * 
 * LEARNING: Responsive time slot button grid with dynamic column calculation
 * WHY: Encapsulates grid layout logic, ResizeObserver, and responsive behavior
 * PATTERN: Self-contained component with props/events for parent communication
 * 
 * Features:
 * - Dynamic column calculation based on available width
 * - ResizeObserver for responsive behavior
 * - Touch-friendly button sizing
 * - Configurable min/max columns and button sizing
 */

import { ref } from 'vue'
import type { TimeSlot } from '@/types/appointment'
import { useTimeFormatting } from '@/composables/useTimeFormatting'
import { useResponsiveGrid } from '@/composables/booking/useResponsiveGrid'

interface Props {
  slots: TimeSlot[]
  selectedSlot?: TimeSlot | null
  color?: 'primary' | 'warning'
  variant?: 'flat' | 'outlined'
  loading?: boolean
  minColumns?: number
  maxColumns?: number
  buttonMinWidth?: number
  gap?: number
}

const props = withDefaults(defineProps<Props>(), {
  selectedSlot: null,
  color: 'primary',
  variant: 'outlined',
  loading: false,
  minColumns: 2,
  maxColumns: 8,
  buttonMinWidth: 140, // Increased from 80 to accommodate "10:00 AM - 10:30 AM" format
  gap: 10
})

const emit = defineEmits<{
  'slot-click': [slot: TimeSlot]
}>()

// LEARNING: Ref for grid container
// WHY: Needed for ResizeObserver and grid styling
// PATTERN: Template ref to HTMLElement
const gridRef = ref<HTMLElement | null>(null)

// LEARNING: Use responsive grid composable
// WHY: Extracts column calculation logic from component to composable
// PATTERN: Composable provides column calculations and ResizeObserver management
const {
  buttonGridColumns,
  isSingleColumn
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
const { formatTimeRange, areSlotsEqual } = useTimeFormatting()

// LEARNING: Handler for time slot button clicks
// WHY: Emits slot click event to parent component
// PATTERN: Event handler that emits TimeSlot object
const handleSlotClick = (slot: TimeSlot): void => {
  emit('slot-click', slot)
}
</script>

<template>
  <!-- LEARNING: Dynamic button grid with computed column count -->
  <!-- WHY: Adapts to available width for optimal button layout -->
  <!-- PATTERN: CSS Grid with dynamic grid-template-columns via inline style -->
  <div
    ref="gridRef"
    class="time-slot-grid"
    :class="{ 'single-column': isSingleColumn }"
    :style="{ '--grid-columns': buttonGridColumns }"
  >
    <VBtn
      v-for="slot in slots"
      :key="`${slot.slotStart}-${slot.slotEnd}`"
      :variant="areSlotsEqual(selectedSlot, slot) ? 'flat' : variant"
      :color="color"
      size="small"
      class="time-slot-btn"
      :disabled="loading"
      @click="handleSlotClick(slot)"
    >
      {{ formatTimeRange(slot) }}
    </VBtn>
  </div>
</template>

<style scoped lang="scss">
// LEARNING: Time slot grid layout with dynamic columns
// WHY: Creates responsive grid layout that adapts to available width
// PATTERN: CSS Grid with dynamic column count based on available width
.time-slot-grid {
  display: grid;
  width: 100%; // Ensure grid fills parent container
  box-sizing: border-box; // Include padding in width calculation
  // LEARNING: Use CSS custom property for dynamic column count
  // WHY: Allows computed property to control grid columns reactively
  // PATTERN: CSS Grid repeat() with CSS custom property, fallback to 2 columns
  grid-template-columns: repeat(var(--grid-columns, 2), 1fr);
  grid-auto-rows: min-content; // Allow natural height
  gap: 8px;
  padding: 1.5rem 0;
  // Match calendar height - ensure grid is at least as tall as calendar widget
  min-height: 300px;
  // Remove fixed max-height - let content wrap naturally
  max-height: none;
  overflow: visible; // Allow natural wrapping on larger screens
  
  @media (min-width: 600px) {
    gap: 10px;
    padding: 2rem 0;
    // Match calendar height on larger screens
    min-height: 350px;
    // Fill available width, wrap naturally, scroll if needed
    max-height: calc(100vh - 400px); // Use viewport height minus header/footer space
    overflow-y: auto;
    overflow-x: hidden;
  }
  
  // LEARNING: Time slot button sizing
  // WHY: Ensures adequate touch targets on mobile (minimum 44x44px) and proper text display
  // PATTERN: Minimum height and width for touch-friendly buttons with proper padding
  .time-slot-btn {
    min-height: 44px; // Touch-friendly minimum size
    min-width: 140px; // Ensure minimum width for time range text like "10:00 AM - 10:30 AM"
    width: 100%; // Fill grid cell
    padding: 0.5rem 1rem !important; // Explicit padding to prevent text overflow
    white-space: nowrap; // Prevent text wrapping
    overflow: hidden;
    text-overflow: ellipsis; // Fallback if text is still too long
    
    @media (min-width: 600px) {
      min-height: 40px;
      padding: 0.625rem 1.25rem !important; // Slightly more padding on larger screens
    }
  }
  
  // LEARNING: Single-column mode with vertical scrolling (ONLY on mobile)
  // WHY: Enables vertical scrolling when space is too limited for multiple columns
  // PATTERN: Single column layout with max-height and overflow-y: auto
  &.single-column {
    grid-template-columns: 1fr;
    max-height: 400px;
    overflow-y: auto;
    overflow-x: hidden;
    scroll-behavior: smooth;
    
    // LEARNING: Custom scrollbar styling (optional, for better UX)
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
  }
}
</style>

