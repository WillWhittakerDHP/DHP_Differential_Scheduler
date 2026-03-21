<script setup lang="ts">
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
 * WHY: Use selection card group composable for group-level logic
PATTERN: Compo...
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
    <!-- WHY: VRow/VCol creates responsive grid layout -->
    <!-- PATTERN: Conditionally wrap all cards in group component based on config -->
    <VRow v-if="configWithDefaults.layout === 'row'">
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
            <template #default="{ item }">
              <slot :item="item" />
            </template>
          </SelectionCard>
        </VCol>
      </component>
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
            <template #default="{ item }">
              <slot :item="item" />
            </template>
          </SelectionCard>
        </VCol>
      </template>
    </VRow>
    
    <div v-else class="selection-stack">
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
          <template #default="{ item }">
            <slot :item="item" />
          </template>
        </SelectionCard>
      </component>
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
          <template #default="{ item }">
            <slot :item="item" />
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
