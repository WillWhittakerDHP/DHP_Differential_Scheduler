<script setup lang="ts">
/**
 * Slot Constraint Overlay Component
 * 
 * LEARNING: Dev-mode overlay that displays colored dots for constraints that blocked each slot
 * WHY: Provides visual debugging aid to see WHY each unavailable slot is blocked
 * PATTERN: Lightweight component that consumes pre-computed flexibleViolations from slot data
 * 
 * NOTE: Only shows dots on unavailable slots, using the flexibleViolations array
 * that is computed during slot generation and propagated through AppointmentSlot.
 * This is truly lightweight - no recalculation, just reading existing data.
 * 
 * Features:
 * - Shows dots ONLY on unavailable slots
 * - Reads flexibleViolations to show exactly which constraints blocked each slot
 * - Supports overlap constraints (appointment, driveTimeTo, driveTimeFrom, lunch)
 * - Supports capacity constraints (daily, calendarWeek, rollingWeek)
 * - Supports range constraints (leadTime, dateRange)
 * - Color-coded dots positioned on slot buttons
 * - Tooltips with constraint type info
 */

import { computed, ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import type { AppointmentSlots } from '@/types/appointment'
import { isDevModeEnabled } from '@/utils/env/devMode'

interface Props {
  appointmentSlots: AppointmentSlots
}

const props = defineProps<Props>()

const isDevMode = isDevModeEnabled()

// LEARNING: Color mapping for constraint types
// WHY: Provides visual distinction between different constraint types
// PATTERN: Map constraint type to hex color
// NOTE: Keys match the strings stored in flexibleViolations array (prefixed format)
// Format: 'overlap.{type}.{direct|buffer}', 'capacity.{type}', 'range.{type}'
//
// DISTINCTION: Direct vs Buffer
// - .direct = Slot directly overlaps with busy period (darker shade)
// - .buffer = Slot only blocked due to buffer, not direct overlap (lighter shade)
const CONSTRAINT_COLORS: Record<string, string> = {
  // Direct overlap - by DATA SOURCE (what made the calendar busy)
  // LEARNING: Direct violations use BusyPeriodSource vocabulary, NOT constraint type
  // WHY: Events API provides eventType and transparency - we can distinguish event types
  'overlap.event.direct': '#1565C0',          // Dark Blue - regular calendar event (from Events API)
  'overlap.outOfOffice.direct': '#00897B',    // Teal - out-of-office event (from Events API)
  
  // Buffer overlap - by CONSTRAINT TYPE (what rule added the buffer)
  // LEARNING: Buffer violations use OverlapConstraint type vocabulary
  // WHY: Buffers are about spacing rules, not data sources
  'overlap.appointment.buffer': '#64B5F6',    // Light Blue - appointment buffer constraint
  'overlap.driveTimeTo.buffer': '#81C784',    // Light Green - drive time to buffer
  'overlap.driveTimeFrom.buffer': '#FFB74D',  // Light Orange - drive time from buffer
  'overlap.lunch.buffer': '#BA68C8',          // Light Purple - lunch buffer
  
  // Legacy support (fallback for any code still using old format)
  'overlap.appointment.direct': '#1565C0',    // Legacy: appointment direct overlap
  'overlap.appointment': '#2196F3',    // Blue (medium)
  'overlap.driveTimeTo.direct': '#2E7D32',    // Dark Green
  'overlap.driveTimeFrom.direct': '#E65100',  // Dark Orange
  'overlap.lunch.direct': '#6A1B9A',          // Dark Purple
  'overlap.driveTimeTo': '#4CAF50',    // Green (medium)
  'overlap.driveTimeFrom': '#FF9800',  // Orange (medium)
  'overlap.lunch': '#9C27B0',          // Purple (medium)
  
  // Capacity constraints (format: 'capacity.{type}')
  'capacity.daily': '#009688',         // Teal
  'capacity.calendarWeek': '#00BCD4',  // Cyan
  'capacity.rollingWeek': '#3F51B5',   // Indigo
  
  // Range constraints (format: 'range.{type}')
  'range.leadTime': '#FFC107',         // Amber
  'range.dateRange': '#FF5722',        // Deep Orange
  'range.businessHours': '#E91E63'     // Pink
}

// LEARNING: Simple constraint info interface for display
// WHY: Lightweight structure for what the template needs
interface ConstraintInfo {
  type: string
  color: string
}

// LEARNING: Get color for violation type, handling buffer:minutes format
// WHY: Violation strings may include minutes (e.g., 'overlap.driveTimeTo.buffer:20')
// PATTERN: Strip minutes suffix before color lookup
const getColorForViolation = (violationType: string): string => {
  // Try exact match first
  if (CONSTRAINT_COLORS[violationType]) {
    return CONSTRAINT_COLORS[violationType]
  }
  
  // Strip minutes suffix if present (e.g., 'overlap.driveTimeTo.buffer:20' -> 'overlap.driveTimeTo.buffer')
  const baseType = violationType.replace(/:\d+$/, '')
  if (CONSTRAINT_COLORS[baseType]) {
    return CONSTRAINT_COLORS[baseType]
  }
  
  // Default gray for unknown types
  return '#757575'
}

// LEARNING: Read flexibleViolations directly from slots
// WHY: No recalculation - data is already computed during slot generation
// PATTERN: Only show dots on unavailable slots that have violations
const appliedConstraintsPerSlot = computed(() => {
  const result = new Map<number, ConstraintInfo[]>()
  
  props.appointmentSlots.forEach(slot => {
    // Only show dots on UNAVAILABLE slots
    if (slot.isAvailable) return
    
    // Read the pre-computed violations from the slot
    const violations = slot.flexibleViolations || []
    if (violations.length === 0) return
    
    // Map violations to constraint info
    const constraints: ConstraintInfo[] = violations.map(violationType => ({
      type: violationType,
      color: getColorForViolation(violationType)
    }))
    
    result.set(slot.buttonIndex, constraints)
  })
  
  return result
})

// LEARNING: Get constraint color
// WHY: Maps constraint type to color for visual display
// PATTERN: Lookup in color map
const getConstraintColor = (constraint: ConstraintInfo): string => {
  return constraint.color
}

// LEARNING: Format constraint tooltip text
// WHY: Shows which constraint blocked this slot with clear direct/buffer distinction and buffer value
// PATTERN: Parse constraint type and format human-readable message
// Format: 'overlap.{constraintType}.{direct|buffer}' or 'overlap.{constraintType}.buffer:{minutes}'
const formatConstraintTooltip = (constraint: ConstraintInfo): string => {
  const type = constraint.type
  
  // Parse the constraint type to extract components
  // Format: 'overlap.{constraintType}.{direct|buffer:{minutes}}' or 'capacity.{type}' or 'range.{type}'
  const parts = type.split('.')
  
  if (parts[0] === 'overlap' && parts.length >= 3) {
    const constraintName = parts[1] // e.g., 'appointment', 'driveTimeTo'
    const reasonPart = parts[2] // 'direct' or 'buffer' or 'buffer:20'
    
    // Parse buffer minutes if present (format: 'buffer:20')
    let reason = reasonPart
    let bufferMinutes: number | null = null
    if (reasonPart.includes(':')) {
      const [reasonType, minutes] = reasonPart.split(':')
      reason = reasonType
      bufferMinutes = parseInt(minutes, 10)
    }
    
    const nameMap: Record<string, string> = {
      'event': 'Calendar Event',
      'outOfOffice': 'Out of Office',
      'appointment': 'Appointment Buffer',
      'driveTimeTo': 'Drive Time To',
      'driveTimeFrom': 'Drive Time From',
      'lunch': 'Lunch Break'
    }
    
    const friendlyName = nameMap[constraintName] || constraintName
    
    if (reason === 'direct') {
      return `Direct conflict with ${friendlyName}`
    } else if (reason === 'buffer') {
      if (bufferMinutes !== null && !isNaN(bufferMinutes)) {
        return `${friendlyName} buffer (${bufferMinutes} min)`
      }
      return `${friendlyName} buffer required`
    }
  }
  
  // Fallback for other constraint types
  return `Blocked by: ${type}`
}

// LEARNING: Get button element for positioning
// WHY: Need to position dots relative to slot buttons
// PATTERN: Use querySelector to find button by buttonIndex
const getButtonElement = (buttonIndex: number): HTMLElement | null => {
  const grid = document.querySelector('.appointment-slot-grid')
  if (!grid) return null
  
  const buttons = grid.querySelectorAll('.appointment-slot-btn')
  const slotIndex = props.appointmentSlots.findIndex(s => s.buttonIndex === buttonIndex)
  if (slotIndex === -1 || slotIndex >= buttons.length) return null
  
  return buttons[slotIndex] as HTMLElement
}

// LEARNING: Track button positions for dot positioning
// WHY: Need to position dots absolutely relative to buttons
// PATTERN: Watch for slot changes and update positions
const buttonPositions = ref(new Map<number, { top: number; left: number; width: number; height: number }>())

watch(
  () => props.appointmentSlots,
  () => {
    nextTick(() => {
      updateButtonPositions()
    })
  },
  { immediate: true, deep: true }
)

const updateButtonPositions = (): void => {
  const positions = new Map<number, { top: number; left: number; width: number; height: number }>()
  const grid = document.querySelector('.appointment-slot-grid') as HTMLElement
  if (!grid) return
  
  props.appointmentSlots.forEach(slot => {
    const button = getButtonElement(slot.buttonIndex)
    if (button) {
      const gridRect = grid.getBoundingClientRect()
      const buttonRect = button.getBoundingClientRect()
      positions.set(slot.buttonIndex, {
        top: buttonRect.top - gridRect.top + grid.scrollTop,
        left: buttonRect.left - gridRect.left,
        width: buttonRect.width,
        height: buttonRect.height
      })
    }
  })
  
  buttonPositions.value = positions
}

// LEARNING: Update positions on scroll
// WHY: Buttons move when grid scrolls
// PATTERN: Listen to scroll events
const gridRef = ref<HTMLElement | null>(null)

const handleScroll = (): void => {
  updateButtonPositions()
}

onMounted(() => {
  const grid = document.querySelector('.appointment-slot-grid')
  if (grid) {
    grid.addEventListener('scroll', handleScroll)
    grid.addEventListener('resize', updateButtonPositions)
  }
  window.addEventListener('resize', updateButtonPositions)
  updateButtonPositions()
})

onUnmounted(() => {
  const grid = document.querySelector('.appointment-slot-grid')
  if (grid) {
    grid.removeEventListener('scroll', handleScroll)
    grid.removeEventListener('resize', updateButtonPositions)
  }
  window.removeEventListener('resize', updateButtonPositions)
})
</script>

<script lang="ts">
export default {
  name: 'SlotConstraintOverlay'
}
</script>

<template>
  <div
    v-if="isDevMode"
    ref="gridRef"
    class="slot-constraint-overlay"
  >
    <template v-for="[buttonIndex, constraints] in appliedConstraintsPerSlot" :key="buttonIndex">
      <template v-for="(constraint, index) in constraints" :key="`${buttonIndex}-${constraint.type}-${index}`">
        <div
          v-if="buttonPositions.has(buttonIndex)"
          class="constraint-dot"
          :style="{
            top: `${(buttonPositions.get(buttonIndex)!.top + 4)}px`,
            left: `${(buttonPositions.get(buttonIndex)!.left + buttonPositions.get(buttonIndex)!.width - 12 - (index * 14))}px`,
            backgroundColor: getConstraintColor(constraint)
          }"
        >
          <VTooltip activator="parent" location="top">
            <pre class="tooltip-content">{{ formatConstraintTooltip(constraint) }}</pre>
          </VTooltip>
        </div>
      </template>
    </template>
  </div>
</template>

<style scoped lang="scss">
.slot-constraint-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none; // Allow clicks to pass through to buttons
  z-index: 10;
}

.constraint-dot {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  pointer-events: auto; // Enable tooltip interaction
  
  &:hover {
    transform: scale(1.2);
    transition: transform 0.2s;
  }
}

.tooltip-content {
  margin: 0;
  font-size: 0.75rem;
  white-space: pre-wrap;
  text-align: left;
}
</style>
