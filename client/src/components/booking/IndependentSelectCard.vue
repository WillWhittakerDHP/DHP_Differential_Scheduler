<script setup lang="ts">
/**
 * WHY: IndependentSelectCard Component

WHY: Simpler than nested rendering - in...
 */
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import type { SelectionCardItem, SelectionCardConfig } from './types/selectionCardTypes'
import { mergeSelectionCardConfigWithDefaults } from '@/utils/booking/selectionCardConfig'

interface Props {
  item: SelectionCardItem
  
  config?: Partial<SelectionCardConfig>
  
  modelValue: boolean
  
  appearance?: Partial<SelectionCardConfig['appearance']>
  
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  disabled: false
})

interface Emits {
  (e: 'update:modelValue', value: boolean): void
}

const emit = defineEmits<Emits>()

const defaultConfig: SelectionCardConfig = {
  selectionType: 'checkbox',
  selectionComponent: 'VCheckbox',
  selectionGroup: 'none',
  stateSource: 'local',
  layout: 'stack',
  controlPosition: 'left',
  appearance: {
    showIcon: false,
    showBorder: true,
    cardPadding: 'pa-4',
    minHeight: 'auto'
  }
}

const mergedConfig = computed<SelectionCardConfig>(() => {
  const baseConfig = props.config 
    ? mergeSelectionCardConfigWithDefaults({ ...defaultConfig, ...props.config })
    : mergeSelectionCardConfigWithDefaults(defaultConfig)
  
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

function handleClick(): void {
  if (!props.disabled) {
    emit('update:modelValue', !props.modelValue)
  }
}

function handleCheckboxClick(e: Event): void {
  e.stopPropagation()
  if (!props.disabled) {
    emit('update:modelValue', !props.modelValue)
  }
}

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
      class="flex-shrink-0 ms-2 independent-select-card-icon"
    />
    
    <!-- Content -->
    <div :class="contentClasses">
      <!-- Title slot or default -->
      <slot name="title" :item="item">
        <span class="text-body-1 font-weight-medium">
          {{ item.name }}
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

.independent-select-card-icon {
  color: rgb(var(--v-theme-on-surface));
}

.v-checkbox {
  :deep(.v-selection-control__wrapper) {
    margin-inline-start: 0;
  }
}
</style>

