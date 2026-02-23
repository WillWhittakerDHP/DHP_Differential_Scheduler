<script setup lang="ts">
/**
 * SelectionCardGroup Component
 * 
 * LEARNING: Simple wrapper that manages VRadioGroup and state for multiple SelectionCard components
 * WHY: Separates concerns - SelectionCard handles rendering, SelectionCardGroup handles grouping
 * PATTERN: Container component that wraps child components and manages shared state
 * 
 * Features:
 * - Wraps SelectionCard components in VRadioGroup for parent selection
 * - Manages expansion state for all cards
 * - Manages nested selection state
 * - Handles auto-expansion when cards are selected
 */

import { computed } from 'vue'
import SelectionCard from './SelectionCard.vue'
import type { 
  SelectionCardItem, 
  SelectionCardConfig
} from './types/selectionCardTypes'
import { useSelectionCardGroup } from '@/composables/booking/useSelectionCard'
import { useSelectionCardGroupConfig } from '@/composables/booking/useSelectionCardGroupConfig'
import { useSelectionCardGroupState } from '@/composables/booking/useSelectionCardGroupState'
import { useWizardNumberUpdate } from '@/composables/booking/useWizardNumberUpdate'

interface Props {
  items: SelectionCardItem[]
  modelValue: string | string[] | null
  config?: SelectionCardConfig
}

const props = withDefaults(defineProps<Props>(), {
  config: undefined
})

interface Emits {
  (e: 'update:modelValue', value: string | string[] | null): void
  (e: 'update:nestedSelection', itemId: string, componentIds: string[]): void
}

const emit = defineEmits<Emits>()

// LEARNING: Use selection card group config composable
// PATTERN: Composable provides group configuration
const {
  configWithDefaults,
  useGroupWrapper,
  groupComponentName,
  gridColumnProps
} = useSelectionCardGroupConfig({
  config: computed(() => props.config)
})



/**
 * LEARNING: Use selection card group composable for group-level logic
 * WHY: Moves data transformation logic out of component to prevent recursion
 * PATTERN: Composable handles shouldExpand logic and group operations
 */
const selectionCardGroupComposable = useSelectionCardGroup({
  items: computed(() => props.items),
  modelValue: computed(() => props.modelValue),
  config: props.config
})

// WHY: Component uses composable's methods
// PATTERN: Destructure composable return values
const {
  shouldExpand
} = selectionCardGroupComposable

// LEARNING: Use selection card group state composable
// PATTERN: Composable provides state management
const {
  nestedSelections,
  expansionStates,
  internalValue: baseInternalValue,
  handleNestedSelection: baseHandleNestedSelection,
  toggleCardExpansion
} = useSelectionCardGroupState({
  items: computed(() => props.items),
  modelValue: computed(() => props.modelValue),
  configWithDefaults,
  shouldExpand
})

// LEARNING: Use wizard number update composable
// PATTERN: Composable that handles finding and updating instances in wizard arrays
const { updateNumber } = useWizardNumberUpdate()

const handleNumberUpdate = (payload: { itemId: string; number: number | null }) => {
  updateNumber(payload.itemId, payload.number)
}

// WHY: Composable provides getter/setter structure, component needs to emit
// PATTERN: Wrap composable's computed with emit
const internalValue = computed({
  get: () => baseInternalValue.value,
  set: (value: string | string[] | null) => {
    emit('update:modelValue', value)
  }
})

// WHY: Composable provides logic, component needs to emit
// PATTERN: Wrap composable's handler with emit
function handleNestedSelection(itemId: string, componentIds: string[]): void {
  baseHandleNestedSelection(itemId, componentIds)
  emit('update:nestedSelection', itemId, componentIds)
}

</script>

<template>
  <div class="selection-card-group">
    <!-- LEARNING: Row layout with grid columns -->
    <!-- WHY: VRow/VCol creates responsive grid layout -->
    <!-- PATTERN: Conditionally wrap all cards in group component based on config -->
    <VRow v-if="configWithDefaults.layout === 'row'">
      <!-- LEARNING: Conditionally wrap in group component if needed -->
      <component
        v-if="useGroupWrapper"
        :is="groupComponentName"
        v-model="internalValue"
        class="selection-group selection-group-full-width"
      >
        <VCol
          v-for="item in items"
          :key="item.id"
          v-bind="gridColumnProps"
          class="selection-card-col"
        >
          <SelectionCard
            :item="item"
            :config="configWithDefaults"
            :model-value="modelValue"
            :nested-child-selections="nestedSelections[item.id] || []"
            :is-expanded="!!expansionStates[item.id]"
            @update:model-value="emit('update:modelValue', $event)"
            @update:nested-child-selections="handleNestedSelection(item.id, $event)"
            @update:number="handleNumberUpdate"
            @toggle-expansion="toggleCardExpansion(item.id)"
          >
            <template #icon="{ item }">
              <slot name="icon" :item="item" />
            </template>
            <template #title="{ item }">
              <slot name="title" :item="item" />
            </template>
            <template #description="{ item }">
              <slot name="description" :item="item" />
            </template>
            <template #default="{ item }">
              <slot :item="item" />
            </template>
            <template #child-icon="{ item }">
              <slot name="child-icon" :item="item" />
            </template>
            <template #child-title="{ item }">
              <slot name="child-title" :item="item" />
            </template>
            <template #child-description="{ item }">
              <slot name="child-description" :item="item" />
            </template>
            <template #child-content="{ item }">
              <slot name="child-content" :item="item" />
            </template>
          </SelectionCard>
        </VCol>
      </component>
      <!-- LEARNING: No group wrapper - SelectionCard handles selection explicitly -->
      <template v-else>
        <VCol
          v-for="item in items"
          :key="item.id"
          v-bind="gridColumnProps"
          class="selection-card-col"
        >
          <SelectionCard
            :item="item"
            :config="configWithDefaults"
            :model-value="modelValue"
            :nested-child-selections="nestedSelections[item.id] || []"
            :is-expanded="!!expansionStates[item.id]"
            @update:model-value="emit('update:modelValue', $event)"
            @update:nested-child-selections="handleNestedSelection(item.id, $event)"
            @update:number="handleNumberUpdate"
            @toggle-expansion="toggleCardExpansion(item.id)"
          >
            <template #icon="{ item }">
              <slot name="icon" :item="item" />
            </template>
            <template #title="{ item }">
              <slot name="title" :item="item" />
            </template>
            <template #description="{ item }">
              <slot name="description" :item="item" />
            </template>
            <template #default="{ item }">
              <slot :item="item" />
            </template>
            <template #child-icon="{ item }">
              <slot name="child-icon" :item="item" />
            </template>
            <template #child-title="{ item }">
              <slot name="child-title" :item="item" />
            </template>
            <template #child-description="{ item }">
              <slot name="child-description" :item="item" />
            </template>
            <template #child-content="{ item }">
              <slot name="child-content" :item="item" />
            </template>
          </SelectionCard>
        </VCol>
      </template>
    </VRow>
    
    <!-- LEARNING: Stack layout for vertical list -->
    <div v-else class="selection-stack">
      <!-- LEARNING: Conditionally wrap in group component if needed -->
      <component
        v-if="useGroupWrapper"
        :is="groupComponentName"
        v-model="internalValue"
        class="selection-group"
      >
        <SelectionCard
          v-for="item in items"
          :key="item.id"
          :item="item"
          :config="configWithDefaults"
          :model-value="modelValue"
          :nested-child-selections="nestedSelections[item.id] || []"
          :is-expanded="!!expansionStates[item.id]"
          @update:model-value="emit('update:modelValue', $event)"
          @update:nested-child-selections="handleNestedSelection(item.id, $event)"
          @toggle-expansion="toggleCardExpansion(item.id)"
        >
          <template #icon="{ item }">
            <slot name="icon" :item="item" />
          </template>
          <template #title="{ item }">
            <slot name="title" :item="item" />
          </template>
          <template #description="{ item }">
            <slot name="description" :item="item" />
          </template>
          <template #default="{ item }">
            <slot :item="item" />
          </template>
          <template #child-icon="{ item }">
            <slot name="child-icon" :item="item" />
          </template>
          <template #child-title="{ item }">
            <slot name="child-title" :item="item" />
          </template>
          <template #child-description="{ item }">
            <slot name="child-description" :item="item" />
          </template>
          <template #child-content="{ item }">
            <slot name="child-content" :item="item" />
          </template>
        </SelectionCard>
      </component>
      <!-- LEARNING: No group wrapper - SelectionCard handles selection explicitly -->
      <template v-else>
        <SelectionCard
          v-for="item in items"
          :key="item.id"
          :item="item"
          :config="configWithDefaults"
          :model-value="modelValue"
          :nested-child-selections="nestedSelections[item.id] || []"
          :is-expanded="!!expansionStates[item.id]"
          @update:model-value="emit('update:modelValue', $event)"
          @update:nested-child-selections="handleNestedSelection(item.id, $event)"
          @toggle-expansion="toggleCardExpansion(item.id)"
        >
          <template #icon="{ item }">
            <slot name="icon" :item="item" />
          </template>
          <template #title="{ item }">
            <slot name="title" :item="item" />
          </template>
          <template #description="{ item }">
            <slot name="description" :item="item" />
          </template>
          <template #default="{ item }">
            <slot :item="item" />
          </template>
          <template #child-icon="{ item }">
            <slot name="child-icon" :item="item" />
          </template>
          <template #child-title="{ item }">
            <slot name="child-title" :item="item" />
          </template>
          <template #child-description="{ item }">
            <slot name="child-description" :item="item" />
          </template>
          <template #child-content="{ item }">
            <slot name="child-content" :item="item" />
          </template>
        </SelectionCard>
      </template>
    </div>
  </div>
</template>

<style scoped lang="scss">
.selection-card-group,
.selection-group-full-width {
  width: 100%;
}

.selection-card-col {
  min-width: 0;
  
  :deep(.v-col) {
    min-width: 0;
  }
}

.selection-stack {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
