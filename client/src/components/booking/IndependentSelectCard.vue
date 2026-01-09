<script setup lang="ts">
/**
 * IndependentSelectCard Component
 * 
 * LEARNING: Standalone card for child/dependent selections
 * WHY: Simpler than nested rendering - independent component with its own state
 * PATTERN: Checkbox-based multi-select, no expansion logic needed
 * 
 * Use cases:
 * - Dependent instance options within a parent card
 * - Child selections in any nested context
 * - Add-on services, property options, etc.
 * 
 * Session: Generic SelectionCard Refactor (2026-01-09)
 */

import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import type { SelectionCardItem, SelectionCardConfig } from './types/selectionCardTypes'
import { mergeSelectionCardConfigWithDefaults } from '@/utils/booking/selectionCardConfig'

/**
 * Component props
 */
interface Props {
  /**
   * The item to display
   */
  item: SelectionCardItem
  
  /**
   * Configuration for appearance and behavior
   */
  config?: Partial<SelectionCardConfig>
  
  /**
   * Whether the item is selected
   */
  modelValue: boolean
  
  /**
   * Custom appearance overrides
   */
  appearance?: Partial<SelectionCardConfig['appearance']>
  
  /**
   * Whether the card is disabled
   */
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  disabled: false
})

/**
 * Component emits
 */
interface Emits {
  (e: 'update:modelValue', value: boolean): void
}

const emit = defineEmits<Emits>()

/**
 * LEARNING: Default configuration for independent select cards
 * WHY: Provides sensible defaults for dependent option display
 */
const defaultConfig: SelectionCardConfig = {
  selectionType: 'checkbox',
  selectionComponent: 'VCheckbox',
  selectionGroup: 'none',
  stateSource: 'local',
  layout: 'stack',
  controlPosition: 'left',
  appearance: {
    showIcon: false,
    showDescription: true,
    showBorder: true,
    cardPadding: 'pa-4',
    minHeight: 'auto'
  }
}

/**
 * LEARNING: Merged config with defaults
 * WHY: Allows customization while providing sensible defaults
 */
const mergedConfig = computed<SelectionCardConfig>(() => {
  const baseConfig = props.config 
    ? mergeSelectionCardConfigWithDefaults({ ...defaultConfig, ...props.config })
    : mergeSelectionCardConfigWithDefaults(defaultConfig)
  
  // Apply appearance overrides if provided
  if (props.appearance) {
    return {
      ...baseConfig,
      appearance: {
        ...baseConfig.appearance,
        ...props.appearance
      }
    }
  }
  
  return baseConfig
})

/**
 * LEARNING: Handle card click to toggle selection
 * WHY: Entire card is clickable for better UX
 */
function handleClick(): void {
  if (!props.disabled) {
    emit('update:modelValue', !props.modelValue)
  }
}

/**
 * LEARNING: Handle checkbox click (stop propagation to prevent double-toggle)
 * WHY: Checkbox click shouldn't bubble to card click
 */
function handleCheckboxClick(e: Event): void {
  e.stopPropagation()
  if (!props.disabled) {
    emit('update:modelValue', !props.modelValue)
  }
}

/**
 * LEARNING: Card classes for styling
 */
const cardClasses = computed(() => {
  const classes = [
    'independent-select-card',
    'rounded',
    'cursor-pointer',
    'd-flex',
    'align-center',
    mergedConfig.value.appearance.cardPadding
  ]
  
  if (mergedConfig.value.appearance.showBorder) {
    classes.push('border')
  }
  
  if (props.modelValue) {
    classes.push('active', 'border-primary')
  } else {
    classes.push('border-secondary')
  }
  
  if (props.disabled) {
    classes.push('disabled', 'opacity-50')
  }
  
  return classes.join(' ')
})

/**
 * LEARNING: Content classes for layout
 */
const contentClasses = computed(() => {
  const classes = ['d-flex', 'flex-column', 'flex-grow-1']
  
  if (mergedConfig.value.controlPosition === 'left') {
    classes.push('ms-3')
  }
  
  return classes.join(' ')
})
</script>

<template>
  <!-- LEARNING: Independent select card for dependent options -->
  <!-- WHY: Simpler component without nested rendering complexity -->
  <!-- PATTERN: Checkbox-based card with customizable appearance -->
  <VCard
    :class="cardClasses"
    :style="{ minHeight: mergedConfig.appearance.minHeight }"
    variant="outlined"
    @click="handleClick"
  >
    <!-- LEARNING: Checkbox on the left for consistent multi-select UX -->
    <VCheckbox
      v-if="mergedConfig.controlPosition === 'left'"
      :model-value="modelValue"
      :disabled="disabled"
      hide-details
      class="flex-shrink-0"
      @click.stop="handleCheckboxClick"
    />
    
    <!-- Icon (optional) -->
    <Icon
      v-if="mergedConfig.appearance.showIcon && item.icon && item.icon !== 'tabler-circle'"
      :icon="item.icon"
      width="32"
      height="32"
      class="flex-shrink-0 ms-2"
      :style="{ color: 'rgb(var(--v-theme-on-surface))' }"
    />
    
    <!-- Content -->
    <div :class="contentClasses">
      <!-- Title slot or default -->
      <slot name="title" :item="item">
        <span class="text-body-1 font-weight-medium">
          {{ item.name }}
        </span>
      </slot>
      
      <!-- Description slot or default -->
      <slot name="description" :item="item">
        <span
          v-if="mergedConfig.appearance.showDescription && item.description"
          class="text-body-2 text-medium-emphasis mt-1"
        >
          {{ item.description }}
        </span>
      </slot>
      
      <!-- Default slot for additional content -->
      <slot :item="item" />
    </div>
    
    <!-- Checkbox on the right (if configured) -->
    <VCheckbox
      v-if="mergedConfig.controlPosition !== 'left' && mergedConfig.controlPosition !== 'hidden'"
      :model-value="modelValue"
      :disabled="disabled"
      hide-details
      class="flex-shrink-0 ms-auto"
      @click.stop="handleCheckboxClick"
    />
  </VCard>
</template>

<style scoped lang="scss">
/**
 * LEARNING: Independent select card styling
 * WHY: Clean, consistent appearance for dependent options
 * PATTERN: Uses Vuetify tokens for theme consistency
 */
.independent-select-card {
  transition: all 0.2s ease-in-out;
  
  &:hover:not(.disabled) {
    background-color: rgba(var(--v-theme-primary), 0.04);
  }
  
  &.active {
    background-color: rgba(var(--v-theme-primary), 0.08);
  }
  
  &.disabled {
    cursor: not-allowed;
  }
}

.v-checkbox {
  :deep(.v-selection-control__wrapper) {
    margin-inline-start: 0;
  }
}
</style>

