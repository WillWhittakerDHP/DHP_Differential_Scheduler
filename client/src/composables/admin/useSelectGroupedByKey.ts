/**
 * WHY: Component-logic audit - move .map() out of SelectInputs.
 */
import { computed, type Ref } from 'vue'

export interface SelectGroup {
  groupKey: string
  groupLabel: string
}

export interface GroupedByKeyItem {
  groupKey: string
  groupLabel: string
}

export function useSelectGroupedByKey(
  groupedByKey: Ref<GroupedByKeyItem[]>
): { groupedByKeyComputed: ReturnType<typeof computed<SelectGroup[]>> } {
  const groupedByKeyComputed = computed(() =>
    groupedByKey.value.map((group) => ({
      groupKey: group.groupKey,
      groupLabel: group.groupLabel,
    }))
  )
  return { groupedByKeyComputed }
}
