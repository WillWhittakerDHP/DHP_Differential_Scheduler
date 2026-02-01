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
 * - Support for AppointmentSlots with dual-time display (major/minor perspectives)
 */

import { computed, ref } from 'vue'
import type { TimeSlot, TimeRange, AppointmentSlots } from '@/types/appointment'
import { useTimeFormatting } from '@/composables/useTimeFormatting'
import { useResponsiveGrid } from '@/composables/booking/useResponsiveGrid'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'

interface Props {
  slots?: TimeSlot[] // Legacy prop for backward compatibility
  appointmentSlots?: AppointmentSlots // New prop for normalized AppointmentSlots structure
  selectedSlot?: TimeSlot | null
  timeBasis?: 'major' | 'minor' | 'nonDifferential' // Time perspective for differential scheduling
  color?: 'primary' | 'secondary'
  variant?: 'flat' | 'outlined'
  loading?: boolean
  minColumns?: number
  maxColumns?: number
  buttonMinWidth?: number
  gap?: number
  blockInstances?: BookingBlockInstance[]
  isDifferentialService?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  slots: () => [],
  appointmentSlots: undefined,
  selectedSlot: null,
  timeBasis: 'nonDifferential',
  color: 'primary',
  variant: 'outlined',
  loading: false,
  minColumns: 2,
  maxColumns: 8,
  buttonMinWidth: 140, // Increased from 80 to accommodate "10:00 AM - 10:30 AM" format
  gap: 10,
  blockInstances: () => [],
  isDifferentialService: false
})

const emit = defineEmits<{
  'slot-click': [slot: TimeSlot | TimeRange, orderIndex: number] // TimeSlot extends TimeRange
}>()

const gridRef = ref<HTMLElement | null>(null)

// LEARNING: Use responsive grid composable
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

/**
 * LEARNING: Slot data structure with orderIndex
 * WHY: Associates TimeSlot with its orderIndex for proper selection tracking
 */
interface SlotData {
  slot: TimeSlot | TimeRange // TimeSlot extends TimeRange, so both are acceptable
  orderIndex: number
}

/**
 * LEARNING: Compute display slots from AppointmentSlots or legacy slots prop
 * WHY: Supports both new AppointmentSlots structure and legacy TimeSlot[] for backward compatibility
 * PATTERN: If appointmentSlots provided, transform based on timeBasis and include orderIndex; otherwise use slots prop
 */
const displaySlots = computed(() => {
  // PATTERN: Transform AppointmentSlots based on timeBasis, include orderIndex
  if (props.appointmentSlots && props.appointmentSlots.length > 0) {
    // WHY: Functional approach - transform array without mutations
    // PATTERN: Map to transform, filter to remove nulls
    return props.appointmentSlots
      .map(appointmentSlot => {
        // PATTERN: Accept both types since TimeSlot extends TimeRange
        let slot: TimeSlot | TimeRange | null = null
        
        if (props.timeBasis === 'minor' && props.isDifferentialService) {
          // PATTERN: Use minor event time range from AppointmentSlot, fallback to totalTimeRange
          const minorEventName = 'Minor' // TODO: Get from availabilitySettings
          slot = appointmentSlot.eventTimeRanges?.[minorEventName] || appointmentSlot.totalTimeRange
        } else {
          // PATTERN: Use major event time range from AppointmentSlot, fallback to totalTimeRange
          const majorEventName = 'Major' // TODO: Get from availabilitySettings
          slot = appointmentSlot.eventTimeRanges?.[majorEventName] || appointmentSlot.totalTimeRange
        }
        
        if (slot) {
          const orderIndex = typeof appointmentSlot.orderIndex === 'number' ? appointmentSlot.orderIndex : 0
          return { slot, orderIndex } as SlotData
        }
        return null
      })
      .filter((item): item is SlotData => item !== null)
  }
  
  // PATTERN: Return slots prop with array index as orderIndex
  return (props.slots || []).map((slot, index) => ({ slot, orderIndex: index }))
})

const handleSlotClick = (slotData: SlotData): void => {
  emit('slot-click', slotData.slot, slotData.orderIndex)
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
      v-for="slotData in displaySlots"
      :key="appointmentSlots ? `appointment-${slotData.orderIndex}-${slotData.slot.startTime}` : `${slotData.slot.startTime}-${slotData.slot.endTime}`"
      :variant="areSlotsEqual(selectedSlot, slotData.slot) ? 'flat' : variant"
      :color="color"
      size="small"
      class="time-slot-btn"
      :disabled="loading || !slotData.slot"
      @click="handleSlotClick(slotData)"
    >
      {{ slotData.slot ? formatTimeRange(slotData.slot) : 'Unavailable' }}
    </VBtn>
  </div>
</template>

<style scoped lang="scss">
.time-slot-grid {
  display: grid;
  width: 100%; // Ensure grid fills parent container
  box-sizing: border-box; // Include padding in width calculation
  // PATTERN: CSS Grid repeat() with CSS custom property, fallback to 2 columns
  grid-template-columns: repeat(var(--grid-columns, 2), 1fr);
  grid-auto-rows: min-content; // Allow natural height
  gap: 8px;
  padding: 1.5rem 0;
  min-height: 300px;
  // Remove fixed max-height - let content wrap naturally
  max-height: none;
  overflow: visible; // Allow natural wrapping on larger screens
  
  @media (min-width: 600px) {
    gap: 10px;
    padding: 2rem 0;
    min-height: 350px;
    max-height: calc(100vh - 400px); // Use viewport height minus header/footer space
    overflow-y: auto;
    overflow-x: hidden;
  }
  
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
  
  // PATTERN: Single column layout with max-height and overflow-y: auto
  &.single-column {
    grid-template-columns: 1fr;
    max-height: 400px;
    overflow-y: auto;
    overflow-x: hidden;
    scroll-behavior: smooth;
    
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

