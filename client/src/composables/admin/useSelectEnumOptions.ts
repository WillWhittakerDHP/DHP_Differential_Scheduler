/**
 * WHY: Keeps SelectInputs.vue under vue-architecture script line limit.
 */
import { computed, type Ref } from 'vue'
import type { ComputedRef } from 'vue'
import { BLOCK_SHAPE_TYPES } from '@/constants/blockShapeTypes'

export interface UseSelectEnumOptionsReturn {
  enumOptions: ComputedRef<{ title: string; value: string }[]>
}

export function useSelectEnumOptions(isEnumSelect: Ref<boolean>): UseSelectEnumOptionsReturn {
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
