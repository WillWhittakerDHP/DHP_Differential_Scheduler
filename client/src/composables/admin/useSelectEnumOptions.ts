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
      { title: 'Time', value: BLOCK_SHAPE_TYPES.TIME },
      { title: 'Event', value: BLOCK_SHAPE_TYPES.EVENT },
      { title: 'Price', value: BLOCK_SHAPE_TYPES.PRICE },
    ]
  })
  return { enumOptions }
}
