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
  
  const slots = props.appointmentSlots.map(appointmentSlot => {
    const displayTime = derivePerspective(appointmentSlot, currentPerspective)
    
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

<style scoped lang="scss" src="./AppointmentSlotGrid.scss"></style>

