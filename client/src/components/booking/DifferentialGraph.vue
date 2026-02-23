<script setup lang="ts">

import { computed } from 'vue'
import type { TimeRange } from '@/types/appointment'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import { useTimeFormatting } from '@/composables/useTimeFormatting'
import { useAvailabilitySettings } from '@/composables/booking/useAvailabilitySettings'

interface Props {
  isDifferentialService: boolean
  graphBars: {
    major: TimeRange | null
    minor: TimeRange | null
  }
  selectedServices: BookingBlockInstance[]
  startTimeType: 'major' | 'minor' | 'nonDifferential'
}

const props = defineProps<Props>()

interface Emits {
  (e: 'time-basis-change', type: 'major' | 'minor'): void
}

const emit = defineEmits<Emits>()

const { settings: availabilitySettings } = useAvailabilitySettings()
const majorLabel = computed(() => 
  availabilitySettings.value?.differentialPerspectives?.majorLabel || 'Major'
)
const minorLabel = computed(() => 
  availabilitySettings.value?.differentialPerspectives?.minorLabel || 'Client Formal Presentation'
)

const selectTimeSlotLabel = computed(() => 
  availabilitySettings.value?.differentialPerspectives?.selectTimeSlotLabel || 'Select a Time Slot'
)

// WHY: State labels are configurable in admin panel
const majorStateLabel = computed(() => 
  availabilitySettings.value?.differentialPerspectives?.majorStateLabel || `Showing ${majorLabel.value} times`
)
const minorStateLabel = computed(() => 
  availabilitySettings.value?.differentialPerspectives?.minorStateLabel || `Showing ${minorLabel.value} times`
)

const hasSelectedSlot = computed(() => 
  props.graphBars.major !== null || props.graphBars.minor !== null
)

// PATTERN: Same toggle logic as TimeBasisButtonGrid
const handleBarClick = (type: 'major' | 'minor'): void => {
  // For non-differential services, cannot change
  if (!props.isDifferentialService) {
    return
  }
  
  if (props.startTimeType === type) {
    const newType = type === 'major' ? 'minor' : 'major'
    emit('time-basis-change', newType)
  } else {
    emit('time-basis-change', type)
  }
}

// LEARNING: Use time formatting composable for time range formatting
// WHY: Moves time formatting logic out of component
// PATTERN: Composable provides pure utility functions
const { formatTimeRange } = useTimeFormatting()

// LEARNING: Computed properties for Differential Graph bar states
// PATTERN: Computed properties that return 'selected', 'active', or 'single' based on state
const majorBarState = computed(() => {
  if (!props.isDifferentialService) return 'single'
  return props.startTimeType === 'major' ? 'selected' : 'active'
})

const minorBarState = computed(() => {
  if (!props.isDifferentialService) return null
  return props.startTimeType === 'minor' ? 'selected' : 'active'
})

// PATTERN: Use formatTimeRange helper, fallback to duration if no time range
const majorTimeDisplay = computed(() => {
  if (props.graphBars.major) {
    return formatTimeRange(props.graphBars.major)
  }
  return null
})

const minorTimeDisplay = computed(() => {
  if (props.graphBars.minor) {
    return formatTimeRange(props.graphBars.minor)
  }
  return null
})

// LEARNING: Computed label for selected state
// PATTERN: Uses configurable state labels with fallback to default format
const stateLabel = computed(() => {
  if (!props.isDifferentialService) return null
  if (props.startTimeType === 'major') return majorStateLabel.value
  if (props.startTimeType === 'minor') return minorStateLabel.value
  return null
})

// LEARNING: Check if state is selected and time slot exists
const showStateLabel = computed(() => {
  return props.isDifferentialService && 
         (props.graphBars.major || props.graphBars.minor) &&
         stateLabel.value !== null
})
</script>

<template>
  <!-- WHY: Visual bars showing major and minor time blocks for differential scheduling -->
  <div v-if="isDifferentialService" class="differential-graph" :class="{ 'has-overlay': !hasSelectedSlot }">
    <!-- LEARNING: Overlay when no slot is selected -->
    <!-- WHY: Shows configurable "Select a Time Slot" message over entire graph with large text and greys it out -->
    <div v-if="!hasSelectedSlot" class="overlay">
      <span class="overlay-text">{{ selectTimeSlotLabel }}</span>
    </div>
    
    <!-- LEARNING: State label when selected -->
    <!-- WHY: Explains what the time slot buttons represent -->
    <div v-if="showStateLabel" class="state-label">
      {{ stateLabel }}
    </div>
    
    <!-- WHY: Shows major and minor time blocks separately for differential services -->
    <div 
      class="time-bar major-bar clickable-bar" 
      :class="[majorBarState, { filled: hasSelectedSlot && !!graphBars.major }]"
      role="button"
      tabindex="0"
      :aria-label="`Select ${majorLabel} time view`"
      @click="handleBarClick('major')"
      @keydown.enter="handleBarClick('major')"
      @keydown.space.prevent="handleBarClick('major')"
    >
      <span v-if="majorTimeDisplay" class="bar-text" :class="{ 'selected-text': startTimeType === 'major' }">{{ majorTimeDisplay }}</span>
    </div>
    
    <!-- WHY: Shows minor time block with filled background, right-justified, half width -->
    <div 
      class="time-bar minor-bar clickable-bar" 
      :class="[minorBarState, { filled: hasSelectedSlot && !!graphBars.minor }]"
      role="button"
      tabindex="0"
      :aria-label="`Select ${minorLabel} time view`"
      @click="handleBarClick('minor')"
      @keydown.enter="handleBarClick('minor')"
      @keydown.space.prevent="handleBarClick('minor')"
    >
      <span v-if="minorTimeDisplay" class="bar-text" :class="{ 'selected-text': startTimeType === 'minor' }">{{ minorTimeDisplay }}</span>
    </div>
  </div>
</template>

<style scoped lang="scss" src="./DifferentialGraph.scss"></style>
