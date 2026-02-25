<script setup lang="ts">

import { computed } from 'vue'
import { timeBasisHandler, type TimeBasisHandlerProps, type TimeBasisHandlerEmits } from '@/utils/booking/timeBasisHandler'
import { useAvailabilitySettings } from '@/composables/booking/useAvailabilitySettings'

const props = defineProps<TimeBasisHandlerProps>()
const emit = defineEmits<TimeBasisHandlerEmits>()

const { settings: availabilitySettings } = useAvailabilitySettings()
const majorLabel = computed(() => {
  const raw = availabilitySettings.value?.differentialPerspectives?.majorLabel
  return raw !== undefined && raw !== null && raw !== '' ? raw : 'Major'
})
const minorLabel = computed(() => {
  const raw = availabilitySettings.value?.differentialPerspectives?.minorLabel
  return raw !== undefined && raw !== null && raw !== '' ? raw : 'Client Formal Presentation'
})

// FIX: Use shared time basis handler from composable
const { handleTimeBasisClick } = timeBasisHandler(props, emit)
</script>

<template>
  <!-- LEARNING: Time Basis Button Grid -->
  <!-- WHY: Styled like appointment slot grid for visual consistency -->
  <!-- PATTERN: CSS Grid with 2 columns, matching AppointmentSlotGrid styling -->
  <div v-if="isDifferentialService" class="time-basis-button-grid">
    <VBtn
      :variant="startTimeType === 'major' ? 'flat' : 'outlined'"
      color="primary"
      size="small"
      class="time-basis-btn"
      @click="handleTimeBasisClick('major')"
    >
      {{ majorLabel }} Times
    </VBtn>
    <VBtn
      :variant="startTimeType === 'minor' ? 'flat' : 'outlined'"
      color="secondary"
      size="small"
      class="time-basis-btn"
      @click="handleTimeBasisClick('minor')"
    >
      {{ minorLabel }} Times
    </VBtn>
  </div>
</template>

<style scoped lang="scss">
// PATTERN: CSS Grid with fixed 140px columns, same as appointment slot grid
.time-basis-button-grid {
  display: grid;
  grid-template-columns: repeat(2, 140px); // Fixed 140px columns to match appointment slot buttons
  gap: 8px;
  padding: 0 10px; // Match AppointmentSlotGrid padding
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
  margin-bottom: 1rem; // Spacing before appointment slot grid
  align-content: start; // Match AppointmentSlotGrid
  justify-content: start; // Match AppointmentSlotGrid
  
  @media (min-width: 600px) {
    gap: 10px;
    padding: 0 10px;
    margin-bottom: 1.5rem;
  }
  
  // PATTERN: Same sizing as .appointment-slot-btn
  .time-basis-btn {
    min-height: 44px; // Touch-friendly minimum size
    min-width: 140px; // Match appointment slot button min-width
    width: 100%; // Fill grid cell
    max-width: 100%; // Prevent overflow beyond grid cell
    padding: 0.5rem 1rem !important; // Match appointment slot button padding
    white-space: nowrap; // Prevent text wrapping
    overflow: hidden;
    text-overflow: ellipsis; // Fallback if text is still too long
    box-sizing: border-box; // Ensure padding included in width
    
    @media (min-width: 600px) {
      min-height: 40px;
      padding: 0.625rem 1.25rem !important; // Match appointment slot button padding
    }
    
    // PATTERN: Same opacity and cursor as appointment slot buttons
    &--inactive {
      opacity: 0.6;
      cursor: default;
    }
  }
}
</style>
