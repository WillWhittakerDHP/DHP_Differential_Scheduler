<template>
  <VChip
    :color="chipColor"
    :variant="chipVariant"
    size="small"
    :style="chipStyle"
    :class="{ 'status-button-override': isOverride }"
    :data-complementary-color="isOverride ? complementaryColor : undefined"
    :data-original-color="isOverride ? props.color : undefined"
    :disabled="disabled"
    role="switch"
    :aria-checked="String(isActive)"
    :aria-label="`Toggle ${label}`"
    :aria-disabled="String(disabled)"
    @click.stop="handleClick"
    @mousedown.stop
    @mouseup.stop
    @touchstart.stop
    @touchend.stop
  >
    {{ label }}
    <VIcon v-if="isOverride" size="small" class="status-button-override-icon">mdi-alert-circle</VIcon>
  </VChip>
</template>

<script setup lang="ts">
/**
 * LEARNING: Reusable StatusButton component
 * WHY: Ensures all status buttons use the same event handling and styling
 * PATTERN: Uses Vue's emit pattern (like CardButton) instead of function props
 * 
 * Supports ternary boolean values:
 * - 'true': success color, flat variant
 * - 'false': default color, outlined variant
 * - 'override': warning color, flat variant with icon indicator
 */

import { computed } from 'vue'
import type { TernaryBoolean } from '@/types/ternary'
import { getComplementaryColor } from '@/utils/colors/complementaryColors'

interface Props {
  label: string
  color: string
  isActive: boolean | TernaryBoolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false
})

const chipStyle = computed(() => {
  if (props.disabled) {
    return 'cursor: not-allowed; position: relative; z-index: 10; pointer-events: none; opacity: 0.6;'
  }
  return 'cursor: pointer; position: relative; z-index: 10; pointer-events: auto'
})

// LEARNING: Determine if value is ternary override state
// WHY: Override state needs special visual indicator
const isOverride = computed(() => {
  return props.isActive === 'override'
})

// LEARNING: Get complementary color for override state
// WHY: Override state uses complementary color for visual distinction
// PATTERN: Use complementary color mapping utility
const complementaryColor = computed(() => {
  return getComplementaryColor(props.color)
})

// LEARNING: Determine chip color based on state
// WHY: Different states need different colors for visual distinction
// PATTERN: 'true' uses configured color, 'override' keeps original color for text/border (background handled by CSS), 'false' uses provided color
// NOTE: Override state keeps original color so text and border remain original color, only background changes via CSS
const chipColor = computed(() => {
  // Always use original color - override state handles background separately via CSS
  return props.color
})

// LEARNING: Determine chip variant based on state
// WHY: Variant provides visual distinction - flat (filled) for true and override, outlined for false
// PATTERN: 'true' = flat (filled with configured color), 'override' = flat (filled with complementary color via CSS), 'false' = outlined
// NOTE: Override uses 'flat' variant to keep button shape consistent, color change handled via CSS variables
const chipVariant = computed(() => {
  if (props.isActive === false || props.isActive === 'false') {
    return 'outlined'
  }
  // Both 'true' and 'override' use 'flat' variant - shape stays consistent
  return 'flat'
})

/**
 * LEARNING: Component emits for click events
 * WHY: Parent components need to handle button clicks
 * PATTERN: defineEmits with TypeScript interface (same as CardButton)
 */
interface Emits {
  (e: 'click', event: Event): void
}

const emit = defineEmits<Emits>()

const handleClick = (event: Event) => {
  // LEARNING: Don't emit click if disabled
  // WHY: Disabled buttons should not trigger actions
  // PATTERN: Early return for disabled state
  if (props.disabled) {
    return
  }
  // LEARNING: Emit click event to parent
  // WHY: Standard Vue pattern - parent handles the logic
  // PATTERN: Emit event, parent handles async operations
  emit('click', event)
}
</script>

<style scoped lang="scss">
// LEARNING: Position override icon absolutely to prevent layout width changes
// WHY: Icon should not affect button width - only color changes, not size
// PATTERN: Absolute positioning - icon overlays at right edge without affecting layout
.status-button-override :deep(.v-chip__content) {
  position: relative;
}

.status-button-override-icon {
  position: absolute !important;
  right: 2px !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
  margin: 0 !important; // Remove any default margins
  pointer-events: none; // Don't interfere with clicks
  font-size: 14px !important; // Slightly smaller to minimize visual impact
}

// LEARNING: Override state styling - less vibrant complementary background with original text/border
// WHY: Override state should have original color text/border but complementary color background (less vibrant/opaque)
// PATTERN: Use CSS custom properties to override background and text colors separately
// NOTE: Using 0.35 opacity for less vibrant, less opaque appearance
.status-button-override {
  // Override background with less vibrant, less opaque complementary color
  &[data-complementary-color="info"] {
    background-color: rgba(var(--v-theme-info), 0.35) !important;
  }
  &[data-complementary-color="secondary"] {
    background-color: rgba(var(--v-theme-secondary), 0.35) !important;
  }
  &[data-complementary-color="primary"] {
    background-color: rgba(var(--v-theme-primary), 0.35) !important;
  }
  &[data-complementary-color="purple"] {
    background-color: rgba(var(--v-theme-purple), 0.35) !important;
  }
  &[data-complementary-color="yellow"] {
    background-color: rgba(var(--v-theme-yellow), 0.35) !important;
  }
  &[data-complementary-color="error"] {
    background-color: rgba(var(--v-theme-error), 0.35) !important;
  }
  &[data-complementary-color="success"] {
    background-color: rgba(var(--v-theme-success), 0.35) !important;
  }
  &[data-complementary-color="grey"] {
    background-color: rgba(var(--v-theme-grey), 0.35) !important;
  }
  
  // Override text color to use original color (not the "on-{color}" variant)
  &[data-original-color="info"] {
    color: rgb(var(--v-theme-info)) !important;
    border-color: rgb(var(--v-theme-info)) !important;
  }
  &[data-original-color="secondary"] {
    color: rgb(var(--v-theme-secondary)) !important;
    border-color: rgb(var(--v-theme-secondary)) !important;
  }
  &[data-original-color="primary"] {
    color: rgb(var(--v-theme-primary)) !important;
    border-color: rgb(var(--v-theme-primary)) !important;
  }
  &[data-original-color="purple"] {
    color: rgb(var(--v-theme-purple)) !important;
    border-color: rgb(var(--v-theme-purple)) !important;
  }
  &[data-original-color="yellow"] {
    color: rgb(var(--v-theme-yellow)) !important;
    border-color: rgb(var(--v-theme-yellow)) !important;
  }
  &[data-original-color="error"] {
    color: rgb(var(--v-theme-error)) !important;
    border-color: rgb(var(--v-theme-error)) !important;
  }
  &[data-original-color="success"] {
    color: rgb(var(--v-theme-success)) !important;
    border-color: rgb(var(--v-theme-success)) !important;
  }
  &[data-original-color="grey"] {
    color: rgb(var(--v-theme-grey)) !important;
    border-color: rgb(var(--v-theme-grey)) !important;
  }
  
  // Add border for override state (flat variant doesn't have border by default)
  border: 1px solid !important;
  
  // Override icon color to match text
  .status-button-override-icon {
    color: inherit !important;
  }
}
</style>

