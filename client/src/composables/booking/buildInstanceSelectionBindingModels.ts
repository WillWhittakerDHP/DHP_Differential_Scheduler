/**
 * WHY: v-model computeds for instance pickers (useInstanceSelectionState length audit).
 */

import { computed, type ComputedRef } from 'vue'
import { findById } from '@/utils/collections/findById'
import { resolveByIds } from '@/utils/collections/resolveByIds'
import type { UseInstanceSelectionStateParams } from '@/types/booking/instanceSelectionState'

export function buildInstanceSelectionBindingModels(
  params: Pick<UseInstanceSelectionStateParams, 'availableInstances' | 'selectedInstances' | 'toggleSelection'>
): {
  selectedId: ComputedRef<string | null>
  selectedIds: ComputedRef<string[]>
} {
  const { availableInstances, selectedInstances, toggleSelection } = params

  const selectedId = computed<string | null>({
    get: () => {
      const instances = Array.isArray(selectedInstances.value)
        ? selectedInstances.value
        : [selectedInstances.value].filter(Boolean)
      return instances[0]?.id || null
    },
    set: (id: string | null) => {
      if (!id || !toggleSelection) return
      const instance = findById(availableInstances.value, id)
      if (instance) {
        toggleSelection(instance)
      }
    },
  })

  const selectedIds = computed<string[]>({
    get: () => {
      const instances = Array.isArray(selectedInstances.value)
        ? selectedInstances.value
        : [selectedInstances.value].filter(Boolean)
      return instances.map((i) => i.id)
    },
    set: (ids: string[]) => {
      if (!toggleSelection) return
      const { resolved: instances } = resolveByIds(availableInstances.value, ids)
      for (const instance of instances) {
        toggleSelection(instance, true)
      }
    },
  })

  return { selectedId, selectedIds }
}
