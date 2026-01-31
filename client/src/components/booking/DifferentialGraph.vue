<script setup lang="ts">
/**
 * DifferentialGraph Component
 * 
 * LEARNING: Visual bars showing major and minor time blocks for differential scheduling
 * WHY: Encapsulates time bar display logic and styling
 * PATTERN: Self-contained component with props for time block data
 * 
 * Features:
 * - Differential service: Two stacked bars (major full width, minor right-justified half width)
 * - Non-differential services: Not shown (component only renders for differential services)
 * - Bar states: Selected/Active based on time basis selector
 * - Responsive design with touch-friendly sizing
 */

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

// LEARNING: Get configured labels from availability settings
// WHY: Labels are configurable in admin panel
const { settings: availabilitySettings } = useAvailabilitySettings()
const majorLabel = computed(() => 
  availabilitySettings.value?.differentialPerspectives?.majorLabel || 'Major'
)
const minorLabel = computed(() => 
  availabilitySettings.value?.differentialPerspectives?.minorLabel || 'Client Formal Presentation'
)

// LEARNING: Get configured labels from availability settings
// WHY: Labels are configurable in admin panel
const selectTimeSlotLabel = computed(() => 
  availabilitySettings.value?.differentialPerspectives?.selectTimeSlotLabel || 'Select a Time Slot'
)

// LEARNING: Get configured state labels from availability settings
// WHY: State labels are configurable in admin panel
const majorStateLabel = computed(() => 
  availabilitySettings.value?.differentialPerspectives?.majorStateLabel || `Showing ${majorLabel.value} times`
)
const minorStateLabel = computed(() => 
  availabilitySettings.value?.differentialPerspectives?.minorStateLabel || `Showing ${minorLabel.value} times`
)

// LEARNING: Check if a slot is selected
// WHY: Determines when to show overlay vs filled bars
const hasSelectedSlot = computed(() => 
  props.graphBars.major !== null || props.graphBars.minor !== null
)

// LEARNING: Handler for bar clicks
// WHY: Toggles between major/minor perspectives when bars are clicked
// PATTERN: Same toggle logic as TimeBasisButtonGrid
const handleBarClick = (type: 'major' | 'minor'): void => {
  // For non-differential services, cannot change
  if (!props.isDifferentialService) {
    return
  }
  
  // Toggle: clicking selected bar switches to other, clicking active bar selects it
  if (props.startTimeType === type) {
    // Clicking selected bar switches to the other option
    const newType = type === 'major' ? 'minor' : 'major'
    emit('time-basis-change', newType)
  } else {
    // Clicking active bar selects it
    emit('time-basis-change', type)
  }
}

// LEARNING: Use time formatting composable for time range formatting
// WHY: Moves time formatting logic out of component
// PATTERN: Composable provides pure utility functions
const { formatTimeRange } = useTimeFormatting()

// LEARNING: Computed properties for Differential Graph bar states
// WHY: Reflects Time Basis Selector selection visually per user story
// PATTERN: Computed properties that return 'selected', 'active', or 'single' based on state
// USER_STORY: Corresponding bar becomes Selected when Time Basis Selector is selected, other remains Active
const majorBarState = computed(() => {
  if (!props.isDifferentialService) return 'single'
  return props.startTimeType === 'major' ? 'selected' : 'active'
})

const minorBarState = computed(() => {
  if (!props.isDifferentialService) return null
  return props.startTimeType === 'minor' ? 'selected' : 'active'
})

// LEARNING: Format time ranges for display
// WHY: Converts TimeRange objects to display strings
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
// WHY: Explains what the buttons represent based on selected perspective
// PATTERN: Uses configurable state labels with fallback to default format
const stateLabel = computed(() => {
  if (!props.isDifferentialService) return null
  if (props.startTimeType === 'major') return majorStateLabel.value
  if (props.startTimeType === 'minor') return minorStateLabel.value
  return null
})

// LEARNING: Check if state is selected and time slot exists
// WHY: Only show label when relevant (differential service with selected time slot)
const showStateLabel = computed(() => {
  return props.isDifferentialService && 
         (props.graphBars.major || props.graphBars.minor) &&
         stateLabel.value !== null
})
</script>

<template>
  <!-- LEARNING: Differential Graph -->
  <!-- WHY: Visual bars showing major and minor time blocks for differential scheduling -->
  <!-- PATTERN: Stacked horizontal bars with conditional rendering based on differential -->
  <!-- Show graph when service is differential -->
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
    
    <!-- LEARNING: Differential Service - Two stacked bars -->
    <!-- WHY: Shows major and minor time blocks separately for differential services -->
    <!-- PATTERN: Top bar full width (Major), bottom bar right-justified half width (Minor) -->
    <!-- Always show bars so users can click them, even when no time slot is selected -->
    <!-- LEARNING: Major Time Bar - Full Width, Clickable, Filled with Color -->
    <!-- WHY: Shows major time block with filled background, full width, primary color, clickable to select perspective -->
    <!-- USER_STORY: Top bar extends across full length, filled with color when slot selected -->
    <!-- USER_STORY: Bar becomes Selected when clicked, Active otherwise -->
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
    
    <!-- LEARNING: Minor Time Bar - Right-Justified Half Width, Clickable, Filled with Color -->
    <!-- WHY: Shows minor time block with filled background, right-justified, half width, secondary color, clickable to select perspective -->
    <!-- USER_STORY: Bottom bar is right justified, extends across half the length, filled with color when slot selected -->
    <!-- USER_STORY: Bar becomes Selected when clicked, Active otherwise -->
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

<style scoped lang="scss">
// LEARNING: Differential Graph styling
// WHY: Visual bars showing major and minor time blocks
// PATTERN: Stacked horizontal bars with different widths and colors
// USER_STORY: Top bar full width, bottom bar right-justified half width, aligned on right edge
// LEARNING: Constrain graph width to calendar width
// WHY: Largest bar should be no wider than calendar
.differential-graph {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 328px; // LEARNING: Explicitly match calendar's fixed width (~328px)
  max-width: 328px; // Prevent any expansion
  box-sizing: border-box; // Ensure padding/borders included in width
  align-self: flex-start; // Align to start, don't stretch beyond content
  margin: 0; // Remove any default margins
  padding: 0; // Remove any default padding
  
  @media (max-width: 599px) {
    // On mobile, calendar might be narrower, so use 100% of container
    width: 100%;
    max-width: 100%;
  }
  
  h5 {
    margin: 0;
    font-weight: 500;
  }
}

// LEARNING: State label styling
// WHY: Small label explaining what the buttons represent
.state-label {
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
  text-align: center;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

// LEARNING: Time bar base styling - Outline Only
// WHY: Container for visual bar outline, no fill or text content
// PATTERN: Border-only styling, no background fill
.time-bar {
  position: relative;
  min-height: 48px; // Touch-friendly minimum size
  border-radius: 4px;
  border: 2px solid transparent; // Base border, will be colored by state
  background: transparent; // No fill
  display: flex;
  align-items: center;
  justify-content: center;
  
  @media (min-width: 600px) {
    min-height: 40px;
  }
}

// LEARNING: Bar text styling
// WHY: Text displayed inside the bar
.bar-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  font-size: 0.875rem;
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface));
  opacity: 0.7;
  z-index: 1;
  position: relative;
  
  // LEARNING: Larger text for selected bar
  // WHY: Makes selected bar text more prominent
  &.selected-text {
    font-size: 1rem;
    font-weight: 600;
    opacity: 1;
  }
}

// LEARNING: Bar label styling (major/minor label)
// WHY: Shows configured label prominently on each bar
.bar-label {
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

// LEARNING: Bar time styling (time range display)
// WHY: Shows time range below the label
.bar-time {
  font-size: 0.75rem;
  font-weight: 400;
}

// LEARNING: Filled bar state
// WHY: Shows filled background when time slot is selected
// PATTERN: Always show color when slot selected, with opacity based on selection state
.time-bar.filled {
  // Major bar - always show primary color
  &.major-bar {
    background-color: rgba(var(--v-theme-primary), 0.4);
    
    &.selected {
      background-color: rgb(var(--v-theme-primary));
      opacity: 1;
    }
    
    &.active {
      opacity: 0.4;
    }
  }
  
  // Minor bar - always show secondary color
  &.minor-bar {
    background-color: rgba(var(--v-theme-secondary), 0.4);
    
    &.selected {
      background-color: rgb(var(--v-theme-secondary));
      opacity: 1;
    }
    
    &.active {
      opacity: 0.4;
    }
  }
  
  .bar-text {
    opacity: 0.9;
  }
}

// LEARNING: Major bar - Full width outline (constrained to graph width)
// WHY: Full width bar outline in primary color, but width is constrained by parent graph
.major-bar {
  width: 100%;
  max-width: 100%; // Ensure it doesn't exceed parent
  box-sizing: border-box; // Include border in width calculation
}

// LEARNING: Minor bar - Right-justified half width outline
// WHY: Half width bar aligned to right, secondary color
.minor-bar {
  width: 50%;
  max-width: 50%; // Ensure it doesn't exceed half of parent
  margin-left: auto; // Right-justify
  box-sizing: border-box; // Include border in width calculation
}

// LEARNING: Clickable bar styling
// WHY: Makes bars interactive with hover and focus states
// PATTERN: Cursor pointer, hover effects, focus states for accessibility
.clickable-bar {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(var(--v-theme-on-surface), 0.15);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:focus {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 2px;
  }
  
  &:focus:not(:focus-visible) {
    outline: none;
  }
}

// LEARNING: Bar states - Selected/Active border colors
// WHY: Visual distinction between Selected and Active bars
// PATTERN: Selected bars have colored border, Active bars have muted border
.major-bar.selected {
  border-color: rgb(var(--v-theme-primary));
}

.major-bar.active {
  border-color: rgba(var(--v-theme-primary), 0.4);
}

.minor-bar.selected {
  border-color: rgb(var(--v-theme-secondary));
}

.minor-bar.active {
  border-color: rgba(var(--v-theme-secondary), 0.4);
}

// LEARNING: Selected bar shadow for emphasis
// WHY: Makes selected bar more prominent
// PATTERN: Box shadow on selected state
.major-bar.selected,
.minor-bar.selected {
  box-shadow: 0 2px 4px rgba(var(--v-theme-on-surface), 0.2);
}

// LEARNING: Overlay styling - covers entire graph with large text
// WHY: Shows prominent message when no time slot is selected
// PATTERN: Absolute positioning with large, bold, centered text
.overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.9);
  z-index: 10;
  pointer-events: none; // Allow clicks to pass through to bars
  
  .overlay-text {
    font-size: 1.5rem;
    font-weight: 700;
    color: rgb(var(--v-theme-on-surface));
    text-align: center;
    padding: 1rem;
    
    @media (max-width: 599px) {
      font-size: 1.25rem;
    }
  }
}

// LEARNING: Grey out graph when overlay is visible
// WHY: Visual indication that graph is disabled until slot is selected
// PATTERN: Apply filter/opacity when has-overlay class is present
.differential-graph.has-overlay {
  filter: grayscale(0.5);
  opacity: 0.6;
  
  .time-bar {
    pointer-events: auto; // Ensure bars are still clickable
  }
}
</style>
