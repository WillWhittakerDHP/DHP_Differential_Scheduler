/**
 * WHY: Component-logic audit - move .map() out of SelectInputs.
 */
import { computed, type ComputedRef, type Ref } from 'vue'
import type { SelectGroup } from '@/types/entity/selectOptions'


export function useSelectGroupedByKey(
  groupedByKey: Ref<SelectGroup[]>
): { groupedByKeyComputed: ComputedRef<SelectGroup[]> } {
  const groupedByKeyComputed = computed(() =>
    groupedByKey.value.map((group) => ({
      groupKey: group.groupKey,
      groupLabel: group.groupLabel,
    }))
  )
  return { groupedByKeyComputed }
}
