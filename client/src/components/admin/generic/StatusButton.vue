<template>
  <VChip
    :color="color"
    :variant="isActive ? 'flat' : 'outlined'"
    size="small"
    :style="chipStyle"
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
  </VChip>
</template>

<script setup lang="ts">
/**
 * LEARNING: Reusable StatusButton component
 * WHY: Ensures all status buttons use the same event handling and styling
 * PATTERN: Uses Vue's emit pattern (like CardButton) instead of function props
 */

import { computed } from 'vue'

interface Props {
  label: string
  color: string
  isActive: boolean
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
