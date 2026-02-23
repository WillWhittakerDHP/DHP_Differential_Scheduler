<script setup lang="ts">
/**

PATTERN: Wrapper component that conn...
 */
import { computed } from 'vue'
import SelectionCardGroup from '../SelectionCardGroup.vue'
import type { SelectionCardConfig } from '../types/selectionCardTypes'
import { useBookingWizard } from '@/composables/booking/useBookingWizard'
import { useInstanceDisplay } from '@/composables/booking/useInstanceDisplay'
import { useInstanceSelectionConfig } from '@/composables/booking/useInstanceSelectionConfig'
import { calculateGridColumnsForItemCount } from '@/utils/booking/selectionCardGroupConfig'

interface Props {
  config?: Partial<SelectionCardConfig>
}

const props = withDefaults(defineProps<Props>(), {})

interface Emits {
  (e: 'select', id: string | null): void
}

const emit = defineEmits<Emits>()

const wizard = useBookingWizard()

const { instancesWithDisplay } = useInstanceDisplay({
  instances: computed(() => wizard.availableUserTypeBlocks.value)
})

const { selectionConfig } = useInstanceSelectionConfig({
  selectionType: 'row',
  stateField: 'userTypeBlock',
  selectedValue: computed(() => wizard.selectedUserTypeBlock.value)
})

const mergedConfig = computed<SelectionCardConfig>(() => {
  const baseConfig = selectionConfig.value
  const itemCount = instancesWithDisplay.value.length
  
  const dynamicGridColumns = calculateGridColumnsForItemCount(itemCount)
  
  if (props.config) {
    return {
      ...baseConfig,
      ...props.config,
      gridColumns: props.config.gridColumns || dynamicGridColumns,
      appearance: {
        ...baseConfig.appearance,
        ...props.config.appearance
      }
    }
  }
  
  return {
    ...baseConfig,
    gridColumns: dynamicGridColumns
  }
})

const selectedId = computed<string | null>({
  get: () => wizard.selectedUserTypeBlock.value?.id || null,
  set: (id: string | null) => {
    if (id) {
      const userTypeBlock = wizard.availableUserTypeBlocks.value.find(ut => ut.id === id)
      if (userTypeBlock) {
        wizard.selectUserTypeBlock(userTypeBlock)
        emit('select', id)
      }
    } else {
      wizard.selectUserTypeBlock(null)
      emit('select', null)
    }
  }
})
</script>

<template>
  <!-- LEARNING: Thin wrapper for user type selection -->
  <!-- WHY: Clean interface connecting wizard to generic UI component -->
  <SelectionCardGroup
    v-model="selectedId"
    :items="instancesWithDisplay"
    :config="mergedConfig"
    class="user-type-select-cards"
  />
</template>

<style scoped>
.user-type-select-cards {
}
</style>

