<!--
  Extracted from AvailabilitySubStepContent to reduce template-directive-depth (component-health).
  Wraps AppointmentSlotGrid with optional overlay when showSlotsOverlay is true.
-->
<script setup lang="ts">
import { SLOT_GRID_WRAPPER_OVERLAY_CLASS } from '@/constants/availabilityStepConstants'
import AppointmentSlotGrid from '@/components/booking/AppointmentSlotGrid.vue'
import type { AppointmentSlot } from '@/types/appointment'

interface Props {
  appointmentSlots: AppointmentSlot[]
  selectedButtonIndex: number | null
  timeBasis: 'major' | 'minor' | 'nonDifferential'
  color: 'primary' | 'secondary'
  showSlotsOverlay: boolean
  slotGridOverlayLabel: string | null
  slotGridOverlayError: string | null
}
defineProps<Props>()

const emit = defineEmits<{
  slotClick: [buttonIndex: number]
}>()
</script>

<template>
  <div class="slot-grid-wrapper" :class="{ [SLOT_GRID_WRAPPER_OVERLAY_CLASS]: showSlotsOverlay }">
    <div v-if="showSlotsOverlay" class="slot-grid-overlay">
      <span v-if="slotGridOverlayError" class="slot-grid-overlay-text slot-grid-overlay-error">{{ slotGridOverlayError }}</span>
      <span v-else class="slot-grid-overlay-text">{{ slotGridOverlayLabel }}</span>
    </div>
    <AppointmentSlotGrid
      :appointment-slots="appointmentSlots"
      :selected-button-index="selectedButtonIndex"
      :time-basis="timeBasis"
      :color="color"
      class="appointment-slot-grid-abut"
      @slot-click="emit('slotClick', $event)"
    />
  </div>
</template>
