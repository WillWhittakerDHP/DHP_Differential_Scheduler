<script setup lang="ts">
/**
 * PATTERN: ServiceSelectCards Component

PATTERN: Wrapper component that connects w...
 */
import { computed } from 'vue'
import SelectionCardGroup from '../SelectionCardGroup.vue'
import type { SelectionCardConfig } from '../types/selectionCardTypes'
import { useBookingWizard } from '@/composables/booking/useBookingWizard'
import { useInstanceDisplay } from '@/composables/booking/useInstanceDisplay'
import { useInstanceSelectionConfig } from '@/composables/booking/useInstanceSelectionConfig'

interface Props {
  config?: Partial<SelectionCardConfig>
  
  showDependentInstances?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showDependentInstances: true
})

interface Emits {
  (e: 'toggle', id: string): void
  (e: 'toggleDependentOption', parentId: string, childId: string): void
}

const emit = defineEmits<Emits>()

const wizard = useBookingWizard()

const { instancesWithDisplay } = useInstanceDisplay({
  instances: computed(() => wizard.availableServices.value),
  selectedUserTypeBlock: computed(() => wizard.selectedUserTypeBlock.value)
})

const { selectionConfig } = useInstanceSelectionConfig({
  selectionType: 'stack',
  stateField: 'services',
  selectedValue: computed(() => wizard.selectedServiceTypeBlocks.value)
})

const mergedConfig = computed<SelectionCardConfig>(() => {
  const baseConfig = selectionConfig.value
  
  if (props.config) {
    return {
      ...baseConfig,
      ...props.config,
      appearance: {
        ...baseConfig.appearance,
        ...props.config.appearance
      }
    }
  }
  
  return baseConfig
})

// WHY: UI behaves as single-select but stored as array for consistency
const selectedIds = computed<string[]>({
  get: () => wizard.selectedServiceTypeBlocks.value.map(s => s.id),
  set: (ids: string[]) => {
    if (ids.length === 0) {
      if (wizard.selectedServiceTypeBlocks.value.length > 0) {
        wizard.batchUpdate(() => {
          wizard.toggleServiceTypeBlock(wizard.selectedServiceTypeBlocks.value[0])
        })
      }
      return
    }

    const newId = ids[ids.length - 1] // Take last item if multiple (shouldn't happen with radio)
    const currentId = wizard.selectedServiceTypeBlocks.value[0]?.id

    if (newId !== currentId) {
      const service = wizard.availableServices.value.find(s => s.id === newId)
      if (service) {
        wizard.batchUpdate(() => wizard.toggleServiceTypeBlock(service))
        emit('toggle', newId)
      }
    }
  }
})
</script>

<template>
  <!-- LEARNING: Thin wrapper for service selection -->
  <!-- WHY: Clean interface connecting wizard to generic UI component -->
  <SelectionCardGroup
    v-model="selectedIds"
    :items="instancesWithDisplay"
    :config="mergedConfig"
    class="service-select-cards"
  />
</template>

<style scoped>
.service-select-cards {
}
</style>

