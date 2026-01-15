<script setup lang="ts">
/**
 * TimeOnSiteGraph Component
 * 
 * LEARNING: Visual bars showing inspector and client time blocks for differential scheduling
 * WHY: Encapsulates time bar display logic and styling
 * PATTERN: Self-contained component with props for time block data
 * 
 * Features:
 * - Differential service: Two stacked bars (inspector full width, client right-justified half width)
 * - Non-differential services: Not shown (component only renders for differential services)
 * - Bar states: Selected/Active based on time basis selector
 * - Responsive design with touch-friendly sizing
 */

import { computed } from 'vue'
import type { TimeRange } from '@/types/appointment'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import { useTimeFormatting } from '@/composables/useTimeFormatting'

interface Props {
  isDifferentialService: boolean
  graphBars: {
    onSite: TimeRange | null      // "Inspector" bar
    clientPresent: TimeRange | null // "Client" bar (null if non-differential)
  }
  selectedServices: BookingBlockInstance[]
  startTimeType: 'onSite' | 'clientPresent' | 'nonDifferential'
}

const props = defineProps<Props>()

interface Emits {
  (e: 'time-basis-change', type: 'inspector' | 'client'): void
}

const emit = defineEmits<Emits>()

// LEARNING: Handler for bar clicks
// WHY: Toggles between Inspector/Client perspectives when bars are clicked
// PATTERN: Same toggle logic as TimeBasisButtonGrid
const handleBarClick = (type: 'inspector' | 'client'): void => {
  // For non-differential services, cannot change
  if (!props.isDifferentialService) {
    return
  }
  
  // Toggle: clicking selected bar switches to other, clicking active bar selects it
  const currentType = props.startTimeType === 'onSite' ? 'inspector' : 'client'
  if (currentType === type) {
    // Clicking selected bar switches to the other option
    const newType = type === 'inspector' ? 'client' : 'inspector'
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

// LEARNING: Computed properties for Time On-Site Graph bar states
// WHY: Reflects Time Basis Selector selection visually per user story
// PATTERN: Computed properties that return 'selected', 'active', or 'single' based on state
// USER_STORY: Corresponding bar becomes Selected when Time Basis Selector is selected, other remains Active
const inspectorBarState = computed(() => {
  if (!props.isDifferentialService) return 'single'
  return props.startTimeType === 'onSite' ? 'selected' : 'active'
})

const clientBarState = computed(() => {
  if (!props.isDifferentialService) return null
  return props.startTimeType === 'clientPresent' ? 'selected' : 'active'
})

// LEARNING: Format time ranges for display
// WHY: Converts TimeRange objects to display strings
// PATTERN: Use formatTimeRange helper, fallback to duration if no time range
const inspectorTimeDisplay = computed(() => {
  if (props.graphBars.onSite) {
    return formatTimeRange(props.graphBars.onSite)
  }
  return null
})

const clientTimeDisplay = computed(() => {
  if (props.graphBars.clientPresent) {
    return formatTimeRange(props.graphBars.clientPresent)
  }
  return null
})

// LEARNING: Computed label for selected state
// WHY: Explains what the buttons represent based on selected perspective
const stateLabel = computed(() => {
  if (!props.isDifferentialService) return null
  if (props.startTimeType === 'onSite') return 'Showing inspector times'
  if (props.startTimeType === 'clientPresent') return 'Showing client times'
  return null
})

// LEARNING: Check if state is selected and time slot exists
// WHY: Only show label when relevant (differential service with selected time slot)
const showStateLabel = computed(() => {
  return props.isDifferentialService && 
         (props.graphBars.onSite || props.graphBars.clientPresent) &&
         stateLabel.value !== null
})
</script>

<template>
  <!-- LEARNING: Time On-Site Graph -->
  <!-- WHY: Visual bars showing inspector and client time blocks for differential scheduling -->
  <!-- PATTERN: Stacked horizontal bars with conditional rendering based on differential -->
  <!-- Show graph when service is differential -->
  <div v-if="isDifferentialService" class="time-on-site-graph">
    <!-- LEARNING: State label when selected -->
    <!-- WHY: Explains what the time slot buttons represent -->
    <div v-if="showStateLabel" class="state-label">
      {{ stateLabel }}
    </div>
    
    <!-- LEARNING: Differential Service - Two stacked bars -->
    <!-- WHY: Shows inspector and client time blocks separately for differential services -->
    <!-- PATTERN: Top bar full width (Inspector), bottom bar right-justified half width (Client) -->
    <!-- Always show bars so users can click them, even when no time slot is selected -->
    <!-- LEARNING: Inspector Time Bar - Full Width, Clickable, Outline Only -->
    <!-- WHY: Shows inspector time block outline, full width, primary color border, clickable to select perspective -->
    <!-- USER_STORY: Top bar extends across full length, outline style only -->
    <!-- USER_STORY: Bar becomes Selected when clicked, Active otherwise -->
    <div 
      class="time-bar inspector-bar clickable-bar" 
      :class="[inspectorBarState, { filled: !!graphBars.onSite }]"
      role="button"
      tabindex="0"
      aria-label="Select Inspector time view"
      @click="handleBarClick('inspector')"
      @keydown.enter="handleBarClick('inspector')"
      @keydown.space.prevent="handleBarClick('inspector')"
    >
      <span v-if="inspectorTimeDisplay" class="bar-text">{{ inspectorTimeDisplay }}</span>
      <span v-else class="bar-text">Select a Time Slot</span>
    </div>
    
    <!-- LEARNING: Client Time Bar - Right-Justified Half Width, Clickable, Outline Only -->
    <!-- WHY: Shows client presentation time block outline, right-justified, half width, secondary color border, clickable to select perspective -->
    <!-- USER_STORY: Bottom bar is right justified, extends across half the length, outline style only -->
    <!-- USER_STORY: Bar becomes Selected when clicked, Active otherwise -->
    <div 
      class="time-bar client-bar clickable-bar" 
      :class="[clientBarState, { filled: !!graphBars.clientPresent }]"
      role="button"
      tabindex="0"
      aria-label="Select Client time view"
      @click="handleBarClick('client')"
      @keydown.enter="handleBarClick('client')"
      @keydown.space.prevent="handleBarClick('client')"
    >
      <span v-if="clientTimeDisplay" class="bar-text">{{ clientTimeDisplay }}</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
// LEARNING: Time On-Site Graph styling
// WHY: Visual bars showing inspector and client time blocks
// PATTERN: Stacked horizontal bars with different widths and colors
// USER_STORY: Top bar full width, bottom bar right-justified half width, aligned on right edge
// LEARNING: Constrain graph width to calendar width
// WHY: Largest bar should be no wider than calendar
.time-on-site-graph {
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
  font-size: 0.875rem;
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface));
  opacity: 0.7;
  z-index: 1;
  position: relative;
}

// LEARNING: Filled bar state
// WHY: Shows filled background when time slot is selected
.time-bar.filled {
  background-color: rgba(var(--v-theme-primary), 0.1);
  
  &.inspector-bar.selected {
    background-color: rgba(var(--v-theme-primary), 0.15);
  }
  
  &.client-bar.selected {
    background-color: rgba(var(--v-theme-secondary), 0.15);
  }
  
  .bar-text {
    opacity: 1;
    font-weight: 600;
  }
}

// LEARNING: Inspector bar - Full width outline (constrained to graph width)
// WHY: Full width bar outline in primary color, but width is constrained by parent graph
.inspector-bar {
  width: 100%;
  max-width: 100%; // Ensure it doesn't exceed parent
  box-sizing: border-box; // Include border in width calculation
}

// LEARNING: Client bar - Right-justified half width outline
// WHY: Half width bar aligned to right, secondary color
.client-bar {
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
.inspector-bar.selected {
  border-color: rgb(var(--v-theme-primary));
}

.inspector-bar.active {
  border-color: rgba(var(--v-theme-primary), 0.4);
}

.client-bar.selected {
  border-color: rgb(var(--v-theme-secondary));
}

.client-bar.active {
  border-color: rgba(var(--v-theme-secondary), 0.4);
}

// LEARNING: Selected bar shadow for emphasis
// WHY: Makes selected bar more prominent
// PATTERN: Box shadow on selected state
.inspector-bar.selected,
.client-bar.selected {
  box-shadow: 0 2px 4px rgba(var(--v-theme-on-surface), 0.2);
}
</style>
