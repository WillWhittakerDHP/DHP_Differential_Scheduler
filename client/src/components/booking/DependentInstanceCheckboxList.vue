<script setup lang="ts">
/**
 * WHY: DependentInstanceCheckboxList Component

LEARNING: Renders dependent ins...
 */
import type { SelectionCardItem } from './types/selectionCardTypes'

interface Props {
  options: SelectionCardItem[]
  
  modelValue: string[]
  
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  disabled: false
})

interface Emits {
  (e: 'update:modelValue', value: string[]): void
}

const emit = defineEmits<Emits>()

function isOptionSelected(optionId: string): boolean {
  return props.modelValue.includes(optionId)
}

function handleToggle(optionId: string, selected: boolean): void {
  const current = [...props.modelValue]
  
  if (selected) {
    if (!current.includes(optionId)) {
      current.push(optionId)
    }
  } else {
    const index = current.indexOf(optionId)
    if (index > -1) {
      current.splice(index, 1)
    }
  }
  
  emit('update:modelValue', current)
}
</script>

<template>
  <VExpandTransition>
    <div
      v-if="options.length > 0"
      class="dependent-instance-checkbox-list"
      @click.stop
    >
      <div
        v-for="option in options"
        :key="option.id"
        class="dependent-option-item"
      >
        <VCheckbox
          :model-value="isOptionSelected(option.id)"
          :disabled="disabled"
          :label="option.name"
          @update:model-value="handleToggle(option.id, $event ?? false)"
        >
          <template #label>
            <div class="dependent-option-content">
              <span class="text-body-1 font-weight-medium">
                {{ option.name }}
              </span>
            </div>
          </template>
        </VCheckbox>
      </div>
    </div>
  </VExpandTransition>
</template>

<style scoped lang="scss">
/**
 */
.dependent-instance-checkbox-list {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgb(var(--v-theme-outline-variant));
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  
  .dependent-option-item {
    :deep(.v-checkbox) {
      width: 100%;
      
      .v-label {
        width: 100%;
      }
    }
  }
  
  .dependent-option-content {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    width: 100%;
  }
}
</style>

