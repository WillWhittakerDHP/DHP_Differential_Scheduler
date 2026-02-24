/**
 * PATTERN: Enum options for block-shape-type select (User, Service, Property, Option).
 * WHY: Keeps SelectInputs.vue under vue-architecture script line limit.
 */
import { computed, type Ref } from 'vue'
import { BLOCK_SHAPE_TYPES } from '@/constants/blockShapeTypes'

export function useSelectEnumOptions(isEnumSelect: Ref<boolean>) {
  const enumOptions = computed(() => {
    if (!isEnumSelect.value) return []
    return [
      { title: 'User', value: BLOCK_SHAPE_TYPES.USER },
      { title: 'Service', value: BLOCK_SHAPE_TYPES.SERVICE },
      { title: 'Property', value: BLOCK_SHAPE_TYPES.PROPERTY },
      { title: 'Option', value: BLOCK_SHAPE_TYPES.OPTION },
    ]
  })
  return { enumOptions }
}
