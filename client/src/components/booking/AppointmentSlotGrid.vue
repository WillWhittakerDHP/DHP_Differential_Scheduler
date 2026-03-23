<script setup lang="ts">

import { ref, toRef } from 'vue'
import type { AppointmentSlots } from '@/types/appointment'
import { formatTimeRange } from '@/utils/time/timeFormatting'
import { useResponsiveGrid } from '@/composables/booking/useResponsiveGrid'
import {
  useSlotGridDisplay,
  type SlotDisplayItem,
} from '@/composables/booking/useSlotGridDisplay'
import { isDevModeEnabled } from '@/utils/env/devMode'
import { getColorForViolation, formatViolationTooltip } from '@/utils/booking/constraintColors'

interface Props {
  appointmentSlots: AppointmentSlots // AppointmentSlots structure
  selectedButtonIndex?: number | null // Selection by buttonIndex
  originalInspectionButtonIndex?: number | null // Reschedule: buttonIndex of slot matching loaded appointment's inspector time
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
  originalInspectionButtonIndex: null,
  timeBasis: 'nonDifferential',
  color: 'primary',
  variant: 'outlined',
  loading: false,
  maxColumns: 8,
  buttonMinWidth: 140, // Increased from 80 to accommodate "10:00 AM - 10:30 AM" format
  gap: 10
})

const emit = defineEmits<{
  'slot-click': [buttonIndex: number]
}>()

const gridRef = ref<HTMLElement | null>(null)

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

// WHY: Moves time formatting logic out of component to prevent recursion
// PATTERN: Composable provides pure utility functions

const isDevMode = isDevModeEnabled()

const displaySlots = useSlotGridDisplay({
  appointmentSlots: toRef(props, 'appointmentSlots'),
  timeBasis: toRef(props, 'timeBasis'),
})

const handleAppointmentSlotClick = (slotData: { buttonIndex: number }): void => {
  emit('slot-click', slotData.buttonIndex)
}

// WHY: Centralizes formatting logic
// PATTERN: Method that formats the conversion
const formatSlotTime = (slotData: SlotDisplayItem): string => {
  if (!slotData.displayTime) {
    // PATTERN: Fallback to 'Unavailable' only if truly no time can be determined
    return 'Unavailable'
  }
  
  return formatTimeRange(slotData.displayTime)
}

function slotButtonClass(slotData: SlotDisplayItem): Record<string, boolean> {
  return {
    'appointment-slot-btn--inactive':
      props.selectedButtonIndex !== null && props.selectedButtonIndex !== slotData.buttonIndex,
    'appointment-slot-btn--busy': !slotData.isAvailable,
    'appointment-slot-btn--original-inspection':
      slotData.buttonIndex === props.originalInspectionButtonIndex,
  }
}

function slotButtonTitle(slotData: SlotDisplayItem): string | undefined {
  return slotData.buttonIndex === props.originalInspectionButtonIndex
    ? 'Current appointment time'
    : undefined
}
</script>

<template>
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
      :class="['appointment-slot-btn', slotButtonClass(slotData)]"
      :disabled="loading || !slotData.isAvailable"
      :title="slotButtonTitle(slotData)"
      @click="handleAppointmentSlotClick(slotData)"
    >
      <span class="slot-button-content">
        {{ formatSlotTime(slotData) }}
      </span>
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
