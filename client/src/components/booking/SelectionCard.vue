<script setup lang="ts">
/**

WHY: Simplified architecture - dependent option...
 */
import { ref, computed, toRef } from 'vue'
import CardButton from '@/components/admin/generic/CardButton.vue'
import { Icon } from '@iconify/vue'
import DependentInstanceCheckboxList from './DependentInstanceCheckboxList.vue'
import type { 
  SelectionCardItem, 
  SelectionCardConfig
} from './types/selectionCardTypes'
import { useSelectionCard } from '@/composables/booking/useSelectionCard'
import { useSelectionCardConfig } from '@/composables/booking/useSelectionCardConfig'
import { useSelectionCardState } from '@/composables/booking/useSelectionCardState'
import { useSelectionCardHandlers } from '@/composables/booking/useSelectionCardHandlers'
import { useSelectionCardStyles } from '@/composables/booking/useSelectionCardStyles'
import { useSelectionCardComponent } from '@/composables/booking/useSelectionCardComponent'
import { useAnnotationContent } from '@/composables/booking/useAnnotationContent'
import type { BookingBlockAnnotationUi } from '@/types/transformers/bookingData'

interface Props {
  item: SelectionCardItem
  config: SelectionCardConfig
  modelValue?: string | null | string[] // Support both radio and checkbox
  nestedChildSelections?: string[] // Array of selected nested child IDs
  isExpanded?: boolean
  /** When set, annotation cardDescription / cardTooltip resolve for this user type (see task 6.12.2.2). */
  selectedUserTypeBlockInstanceId?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  nestedChildSelections: () => [],
  selectedUserTypeBlockInstanceId: null,
})

interface Emits {
  (e: 'update:modelValue', value: string | null | string[]): void
  (e: 'update:nestedChildSelections', childIds: string[]): void
  (e: 'update:number', payload: { itemId: string; number: number | null }): void
  (e: 'toggle-expansion'): void
}

const emit = defineEmits<Emits>()

const annotationUiRef = computed(
  () => (props.item as SelectionCardItem & { annotationUi?: BookingBlockAnnotationUi }).annotationUi
)
const selectedUtRef = toRef(props, 'selectedUserTypeBlockInstanceId')
const { cardDescription, cardTooltip } = useAnnotationContent(annotationUiRef, selectedUtRef)

const localExpanded = ref(false)

const isExpandedState = computed(() => {
  return props.isExpanded !== undefined ? props.isExpanded : localExpanded.value
})

// PATTERN: Composable provides config with defaults
const { configWithDefaults } = useSelectionCardConfig({
  config: computed(() => props.config)
})

// PATTERN: Composable provides selection state management
const {
  activeStatePlugin,
  isSelected
} = useSelectionCardState({
  item: computed(() => props.item),
  modelValue: computed(() => props.modelValue),
  configWithDefaults,
  emit: (event: 'update:modelValue', value: string | null | string[]) => {
    emit(event, value)
  }
})

// PATTERN: Composable provides computed class strings
const {
  cardClasses,
  controlClasses,
  contentContainerClasses
} = useSelectionCardStyles({
  configWithDefaults,
  isSelected
})

// PATTERN: Composable provides component name and props
const {
  selectionComponentName,
  selectionComponentProps
} = useSelectionCardComponent({
  item: computed(() => props.item),
  configWithDefaults,
  isSelected,
  controlClasses
})

/**
 * WHY: Use selection card composable for core logic
PATTERN: Composable handles...
 */
const selectionCardComposable = useSelectionCard({
  item: computed(() => props.item),
  modelValue: computed(() => props.modelValue),
  config: configWithDefaults,
  nestedChildSelections: computed(() => props.nestedChildSelections),
  isExpanded: computed(() => props.isExpanded)
})

// WHY: Component uses composable's computed values
// PATTERN: Destructure composable return values for use in template
const {
  visibleChildren,
  hasChildren
} = selectionCardComposable

// PATTERN: Composable provides handler functions (includes watch for auto-expand when selected)
const {
  handleSelection,
  handleParentClick,
  toggleExpansion
} = useSelectionCardHandlers({
  item: computed(() => props.item),
  modelValue: computed(() => props.modelValue),
  nestedChildSelections: computed(() => props.nestedChildSelections),
  activeStatePlugin,
  isSelected,
  emit,
  isExpanded: computed(() => props.isExpanded),
  localExpanded,
  hasChildren,
})

const handleNumberUpdate = (value: string | number | null) => {
  const numValue = typeof value === 'string' ? (value === '' ? null : parseInt(value, 10)) : value
  const finalValue = numValue === null || isNaN(numValue as number) ? null : numValue

  emit('update:number', { itemId: props.item.id, number: finalValue })
}
</script>

<template>
  <!-- WHY: Removed VRadioGroup wrapper for better reactivity and configurability -->
  <div class="selection-card-wrapper">
    <!-- WHY: Selection component is rendered dynamically based on config -->
    <!-- PATTERN: VLabel wraps card content, selection component rendered inside -->
      <VLabel
        :class="cardClasses"
        :style="{ minHeight: configWithDefaults.appearance.minHeight }"
        @click="handleParentClick"
      >
      <!-- WHY: Allows VRadio, VCheckbox, or custom components based on config -->
      <!-- PATTERN: Use component :is with computed component name and props -->
      <component
        v-if="configWithDefaults.controlPosition !== 'hidden' && selectionComponentName !== 'custom'"
        :is="selectionComponentName"
        v-bind="selectionComponentProps"
        @click.stop="handleSelection"
      />
      
      <!-- Expansion indicator -->
      <CardButton
        v-if="hasChildren"
        type="expansion"
        :expanded="isExpandedState"
        position="top-right"
        :stacked="false"
        @click.stop="toggleExpansion"
      />
      
      <!-- Card content -->
      <div :class="[contentContainerClasses, 'selection-card-content']">
        <Icon
          v-if="configWithDefaults.appearance.showIcon && item.icon && (configWithDefaults.layout === 'row' || item.icon !== 'tabler-circle')"
          :icon="item.icon"
          width="40"
          height="40"
          class="mb-2 selection-card-icon"
        />

        <div class="d-flex align-center flex-wrap gap-1 mb-2">
          <h6 class="text-headline-small mb-0">
            {{ item.name }}
          </h6>
          <VTooltip v-if="cardTooltip.trim()" location="top">
            <template #activator="{ props: tipProps }">
              <VBtn
                icon
                size="x-small"
                variant="text"
                class="selection-card-info-btn"
                aria-label="More information"
                v-bind="tipProps"
                @click.stop
              >
                <Icon icon="mdi-information-outline" width="20" />
              </VBtn>
            </template>
            <span>{{ cardTooltip }}</span>
          </VTooltip>
        </div>

        <p
          v-if="configWithDefaults.appearance.showDescription !== false && cardDescription.trim()"
          class="text-body-medium text-medium-emphasis mb-2"
        >
          {{ cardDescription }}
        </p>

        <slot :item="item" />
        
        <!-- WHY: When allowMultiple is true, show number input to specify quantity -->
        <!-- PATTERN: Conditional rendering based on item.allowMultiple, only when selected -->
        <VTextField
          v-if="item.allowMultiple && isSelected"
          :model-value="(item as { number?: number | null }).number ?? null"
          type="number"
          min="1"
          label="Quantity"
          density="compact"
          variant="outlined"
          class="mt-2 selection-card-quantity-input"
          @update:model-value="handleNumberUpdate"
          @click.stop
        />
        
        <!-- WHY: Checkbox list appears within the card, not outside -->
        <!-- PATTERN: Render DependentInstanceCheckboxList when expanded and has children -->
        <DependentInstanceCheckboxList
          v-if="hasChildren && isExpandedState"
          :options="visibleChildren"
          :model-value="nestedChildSelections"
          @update:model-value="emit('update:nestedChildSelections', $event)"
        />
      </div>
    </VLabel>
  </div>
</template>

<style scoped lang="scss" src="./SelectionCard.scss"></style>
