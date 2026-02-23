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
 * PATTERN: Uses Vue's emit pattern (like CardButton) instead of function props

Sup...
 */
import { computed } from 'vue'
import type { TernaryBoolean } from '@/types/ternary'
import { getComplementaryColor } from '@/utils/colors/complementaryColors'
import {
  KEY_ENTER,
  KEY_SPACE,
  KEY_SPACEBAR,
  KEY_CODE_ENTER,
  KEY_CODE_SPACE,
} from './entityCardConstants'

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

const handleKeydown = (event: KeyboardEvent) => {
  const isSpace = event.key === KEY_SPACE || event.key === KEY_SPACEBAR || event.keyCode === KEY_CODE_SPACE
  const isEnter = event.key === KEY_ENTER || event.keyCode === KEY_CODE_ENTER
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

<style scoped lang="scss" src="./StatusButton.scss"></style>

