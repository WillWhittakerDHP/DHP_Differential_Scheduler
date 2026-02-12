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
    :tabindex="disabled ? -1 : 0"
    @click.stop="handleClick"
    @keydown="handleKeydown"
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

// WHY: Override state uses complementary color for visual distinction
const complementaryColor = computed(() => {
  return getComplementaryColor(props.color)
})

// LEARNING: Determine chip color based on state
// WHY: Different states need different colors for visual distinction
const chipColor = computed(() => {
  return props.color
})

// LEARNING: Determine chip variant based on state
const chipVariant = computed(() => {
  if (props.isActive === false || props.isActive === 'false') {
    return 'outlined'
  }
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
  // PATTERN: Early return for disabled state
  if (props.disabled) {
    return
  }
  // WHY: Standard Vue pattern - parent handles the logic
  // PATTERN: Emit event, parent handles async operations
  emit('click', event)
}

// LEARNING: ARIA role="switch" requires Space and Enter to toggle
// WHY: Keyboard users must be able to activate the switch without a mouse
const handleKeydown = (event: KeyboardEvent) => {
  const isSpace = event.key === ' ' || event.key === 'Spacebar' || event.keyCode === 32
  const isEnter = event.key === 'Enter' || event.keyCode === 13
  if (isSpace || isEnter) {
    event.preventDefault()
    event.stopPropagation()
    if (!props.disabled) {
      emit('click', event)
    }
  } else {
    event.stopPropagation()
  }
}
</script>

<style scoped lang="scss">
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
.status-button-override {
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
  
  border: 1px solid !important;
  
  .status-button-override-icon {
    color: inherit !important;
  }
}
</style>

