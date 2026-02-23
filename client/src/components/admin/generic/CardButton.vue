<!--
  LEARNING: Unified Card Button Component
  WHY: Single reusable component for all card button types (expansion, delete, action, options)
       Eliminates code duplication and ensures consistent stop-propagation handling
  PATTERN: Configurable component with type-based rendering and automatic event handling
  BENEFITS: DRY, consistent behavior, easier to maintain, better z-index management
-->
<script setup lang="ts">
import { computed } from 'vue'

/**
 */
type ButtonType = 'expansion' | 'delete' | 'action' | 'options'

/**
 */
type ButtonPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'inline'

/**
 */
interface Props {
  /**
   */
  type: ButtonType
  
  /**
   * WHY: /**
LEARNING: Expansion state for expansion type buttons
WHY: Expansion ...
   */
  expanded?: boolean
  
  /**
   */
  position?: ButtonPosition
  
  /**
   */
  stacked?: boolean
  
  /**
   */
  icon?: string
  
  /**
   */
  size?: 'x-small' | 'small' | 'default' | 'large'
  
  /**
   */
  variant?: 'text' | 'flat' | 'tonal' | 'outlined'
  
  /**
   */
  color?: string
  
  /**
   */
  stopPropagation?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  expanded: false,
  position: 'top-right',
  stacked: false,
  size: 'small',
  variant: 'text',
  stopPropagation: true
})

/**
 */
interface Emits {
  (e: 'click', event: MouseEvent): void
}

const emit = defineEmits<Emits>()

/**
 */
const buttonIcon = computed(() => {
  if (props.type === 'expansion') {
    return props.expanded ? 'mdi-chevron-up' : 'mdi-chevron-down'
  } else if (props.type === 'delete') {
    return 'tabler-trash'
  } else if (props.type === 'action' && props.icon) {
    return props.icon
  } else if (props.type === 'options') {
    return 'mdi-dots-vertical'
  }
  return 'mdi-circle'
})

/**
 */
const buttonColor = computed(() => {
  if (props.color) {
    return props.color
  }
  if (props.type === 'delete') {
    return 'error'
  }
  return 'default'
})

/**
 */
const buttonClasses = computed(() => {
  const classes: string[] = ['card-button']
  
  if (props.position !== 'inline') {
    classes.push(`card-button-${props.position}`)
  }
  
  if (props.stacked) {
    classes.push('card-button-stacked')
  }
  
  if (props.type === 'expansion') {
    classes.push('card-button-expansion')
  }
  
  return classes.join(' ')
})

/**
 */
const zIndex = computed(() => {
  return props.stacked ? 15 : 10
})

/**
 */
function handleClick(event: MouseEvent): void {
  if (props.stopPropagation) {
    event.stopPropagation()
  }
  emit('click', event)
}
</script>

<template>
  <!--
    LEARNING: Card button with conditional positioning
    WHY: Buttons can be absolutely positioned or inline
    PATTERN: Conditional class application and style binding
  -->
  <VBtn
    :icon="true"
    :size="size"
    :variant="variant"
    :color="buttonColor"
    :class="buttonClasses"
    :style="position !== 'inline' ? { zIndex: zIndex } : undefined"
    @click="handleClick"
  >
    <VIcon 
      :icon="buttonIcon" 
      :size="size"
      :class="{ 'card-button-icon-expansion': type === 'expansion' }"
    />
  </VBtn>
</template>

<style scoped lang="scss">
.card-button {
  transition: all 0.2s ease;
  
  // PATTERN: Position classes with top/right/bottom/left values
  &.card-button-top-right {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
  }
  
  &.card-button-top-left {
    position: absolute;
    top: 0.75rem;
    left: 0.75rem;
  }
  
  &.card-button-bottom-right {
    position: absolute;
    bottom: 0.75rem;
    right: 0.75rem;
  }
  
  &.card-button-bottom-left {
    position: absolute;
    bottom: 0.75rem;
    left: 0.75rem;
  }
  
  // WHY: Expansion buttons need hover state and icon transition
  // PATTERN: Type-specific styling with hover effects
  &.card-button-expansion {
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 50%;
    
    &:hover {
      background-color: rgba(var(--v-theme-on-surface), 0.08);
    }
    
    .card-button-icon-expansion {
      transition: transform 0.3s ease;
      color: rgb(var(--v-theme-on-surface-variant));
    }
  }
  
  // PATTERN: Class for potential future styling needs
  &.card-button-stacked {
  }
}
</style>

