<script setup lang="ts">

import { computed } from 'vue'
import type { SlotTimeBounds } from '@shared/types/availabilityTypes'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import { formatTimeRange } from '@/utils/time/timeFormatting'
import { useWizardSettings } from '@/composables/admin/useWizardSettings'
import type { TimeBasisHandlerProps } from '@/utils/booking/timeBasisHandler'

interface Props extends TimeBasisHandlerProps {
  graphBars: {
    major: SlotTimeBounds | null
    minor: SlotTimeBounds | null
  }
  selectedServices: BookingBlockInstance[]
}

const props = defineProps<Props>()

interface Emits {
  (e: 'time-basis-change', type: 'major' | 'minor'): void
}

const emit = defineEmits<Emits>()

const { labels } = useWizardSettings()
const { majorLabel, minorLabel, majorStateLabel, minorStateLabel } = labels

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

// WHY: Moves time formatting logic out of component
// PATTERN: Composable provides pure utility functions

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

// PATTERN: Uses configurable state labels with fallback to default format
const stateLabel = computed(() => {
  if (!props.isDifferentialService) return null
  if (props.startTimeType === 'major') return majorStateLabel.value
  if (props.startTimeType === 'minor') return minorStateLabel.value
  return null
})

const showStateLabel = computed(() => {
  return props.isDifferentialService &&
         (props.graphBars.major || props.graphBars.minor) &&
         stateLabel.value !== null
})

const minorBarWidthPercent = computed(() => {
  const major = props.graphBars.major?.duration ?? 0
  const minor = props.graphBars.minor?.duration ?? 0
  if (major <= 0) return 50
  if (minor <= 0) return 0
  return Math.min(100, (minor / major) * 100)
})
</script>

<template>
  <!-- WHY: Visual bars showing major and minor time blocks for differential scheduling -->
  <div
    v-if="isDifferentialService"
    class="differential-graph"
  >
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
    
    <!-- WHY: Minor bar width from duration ratio so bottom bar is always shorter than or equal to top -->
    <div 
      class="time-bar minor-bar clickable-bar"
      :style="{ '--minor-bar-width': `${minorBarWidthPercent}%` }"
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
