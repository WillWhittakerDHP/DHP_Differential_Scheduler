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
 * LEARNING: Card button type definitions
 * WHY: Type-safe button type specification
 * PATTERN: Union type for button types
 */
type ButtonType = 'expansion' | 'delete' | 'action' | 'options'

/**
 * LEARNING: Button position definitions
 * WHY: Type-safe position specification for absolute positioning
 * PATTERN: Union type for position values
 */
type ButtonPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'inline'

/**
 * LEARNING: Props interface for CardButton component
 * WHY: Type-safe prop definition with sensible defaults
 * PATTERN: Comprehensive props interface with optional configuration
 */
interface Props {
  /**
   * LEARNING: Button type determines icon and behavior
   * WHY: Different button types need different icons and styling
   * PATTERN: Type-based rendering
   */
  type: ButtonType
  
  /**
   * LEARNING: Expansion state for expansion type buttons
   * WHY: Expansion buttons need to show up/down chevron based on state
   * PATTERN: Conditional icon rendering
   */
  expanded?: boolean
  
  /**
   * LEARNING: Button position for absolute positioning
   * WHY: Buttons can be positioned in corners or inline
   * PATTERN: CSS positioning based on position prop
   */
  position?: ButtonPosition
  
  /**
   * LEARNING: Stacked mode for nested cards
   * WHY: Nested cards need higher z-index to appear above parent
   * PATTERN: Z-index calculation based on stacked prop
   */
  stacked?: boolean
  
  /**
   * LEARNING: Custom icon for action type buttons
   * WHY: Action buttons may need custom icons
   * PATTERN: Optional icon prop with type-based defaults
   */
  icon?: string
  
  /**
   * LEARNING: Button size
   * WHY: Different contexts need different button sizes
   * PATTERN: Vuetify size prop passthrough
   */
  size?: 'x-small' | 'small' | 'default' | 'large'
  
  /**
   * LEARNING: Button variant
   * WHY: Different visual styles for different contexts
   * PATTERN: Vuetify variant prop passthrough
   */
  variant?: 'text' | 'flat' | 'tonal' | 'outlined'
  
  /**
   * LEARNING: Button color
   * WHY: Different button types need different colors (e.g., delete = error)
   * PATTERN: Vuetify color prop passthrough
   */
  color?: string
  
  /**
   * LEARNING: Stop propagation control
   * WHY: Most card buttons need stop-propagation, but some may not
   * PATTERN: Configurable with sensible default (true)
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
 * LEARNING: Component emits for click events
 * WHY: Parent components need to handle button clicks
 * PATTERN: defineEmits with TypeScript interface
 */
interface Emits {
  (e: 'click', event: MouseEvent): void
}

const emit = defineEmits<Emits>()

/**
 * LEARNING: Computed property for button icon
 * WHY: Different button types need different icons
 * PATTERN: Type-based icon selection with fallbacks
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
 * LEARNING: Computed property for button color
 * WHY: Different button types need different default colors
 * PATTERN: Type-based color selection with prop override
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
 * LEARNING: Computed property for button classes
 * WHY: Need dynamic classes for positioning and styling
 * PATTERN: Computed class string based on props
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
 * LEARNING: Computed property for z-index
 * WHY: Stacked buttons need higher z-index to appear above parent
 * PATTERN: Base z-index 10, +5 for each stacked level
 */
const zIndex = computed(() => {
  return props.stacked ? 15 : 10
})

/**
 * LEARNING: Event handler for button clicks
 * WHY: Need to handle stop-propagation and emit click event
 * PATTERN: Event handler that conditionally stops propagation
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
// LEARNING: Base card button styling
// WHY: Consistent button appearance across all types
// PATTERN: Base styles with type-specific overrides
.card-button {
  transition: all 0.2s ease;
  
  // LEARNING: Absolute positioning for non-inline buttons
  // WHY: Buttons positioned in corners need absolute positioning
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
  
  // LEARNING: Expansion button specific styling
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
  
  // LEARNING: Stacked button z-index override
  // WHY: Stacked buttons need higher z-index (handled via inline style, but keep class for specificity)
  // PATTERN: Class for potential future styling needs
  &.card-button-stacked {
    // Z-index handled via computed style binding
  }
}
</style>

