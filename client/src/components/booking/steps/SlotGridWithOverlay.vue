<!--
  Extracted from AvailabilitySubStepContent to reduce template-directive-depth (component-health).
  Wraps AppointmentSlotGrid with optional overlay when showSlotsOverlay is true.
-->
<script setup lang="ts">
import { computed } from 'vue'
import { SLOT_GRID_WRAPPER_OVERLAY_CLASS } from '@/constants/availabilityStepConstants'
import AppointmentSlotGrid from '@/components/booking/AppointmentSlotGrid.vue'
import type { AppointmentSlot } from '@/types/appointment'

interface Props {
  appointmentSlots: AppointmentSlot[]
  selectedButtonIndex: number | null
  timeBasis: 'major' | 'minor' | 'nonDifferential'
  showSlotsOverlay: boolean
  slotGridOverlayLabel: string | null
  slotGridOverlayError: string | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  slotClick: [buttonIndex: number]
}>()

/** Matches useAvailabilitySlotColor: secondary for minor perspective; else grid default (primary). */
const slotGridColorAttrs = computed((): { color?: 'primary' | 'secondary' } =>
  props.timeBasis === 'minor' ? { color: 'secondary' } : {})
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
      class="appointment-slot-grid-abut"
      v-bind="slotGridColorAttrs"
      @slot-click="emit('slotClick', $event)"
    />
  </div>
</template>
