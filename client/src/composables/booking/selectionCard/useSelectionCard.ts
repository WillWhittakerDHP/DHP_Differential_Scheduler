/**
 * WHY: Selection Card Composable (booking domain)
WHY: This composable is booki...
 */
import { computed, isRef, ref } from 'vue'
import type { SelectionCardItem, SelectionCardConfig } from '@/components/booking/types/selectionCardTypes'
import { mergeSelectionCardConfigWithDefaults } from '@/utils/booking/selectionCardConfig'
import { getVisibleSelectionCardChildren, shouldSelectionCardExpand } from '@/utils/booking/selectionCardChildren'
import { updateNestedChildSelections } from '@/utils/booking/selectionCardHandlers'
import type { UseSelectionCardOptions, UseSelectionCardReturn, UseSelectionCardGroupOptions, UseSelectionCardGroupReturn } from '@/types/booking/selectionCard/selectionCard'

export type { UseSelectionCardOptions, UseSelectionCardReturn, UseSelectionCardGroupOptions, UseSelectionCardGroupReturn } from '@/types/booking/selectionCard/selectionCard'

export function useSelectionCard(options: UseSelectionCardOptions): UseSelectionCardReturn {
  const {
    item: itemOption,
    modelValue: modelValueOption,
    config: configOption,
    nestedChildSelections: nestedChildSelectionsOption,
    isExpanded: isExpandedOption,
  } = options

  const item = isRef(itemOption) ? itemOption : ref(itemOption)
  const modelValue = isRef(modelValueOption) ? modelValueOption : ref(modelValueOption)
  const config = isRef(configOption) ? configOption : ref(configOption)
  const nestedChildSelections = nestedChildSelectionsOption || ref<string[]>([])
  const isExpanded = isExpandedOption || ref(false)

  const localExpanded = ref(false)

  const configWithDefaults = computed<SelectionCardConfig>(() => {
    return mergeSelectionCardConfigWithDefaults(config.value)
  })

  const isSelected = computed(() => {
    if (Array.isArray(modelValue.value)) {
      return modelValue.value.includes(item.value.id)
    }
    return modelValue.value === item.value.id
  })

  const visibleChildren = computed((): SelectionCardItem[] => {
    return getVisibleSelectionCardChildren({
      item: item.value,
      config: configWithDefaults.value,
    })
  })

  const hasChildren = computed(() => {
    return item.value.composite === true && visibleChildren.value.length > 0
  })

  const handleSelection = (): void => {
    return
  }

  const toggleExpansion = (): void => {
    if (isExpanded.value !== undefined) {
      return
    }
    localExpanded.value = !localExpanded.value
  }

  const isNestedChildSelected = (childId: string): boolean => {
    return nestedChildSelections.value.includes(childId)
  }

  const handleNestedChildUpdate = (childId: string, selected: boolean): void => {
    const raw = nestedChildSelections.value
    const current = raw !== undefined && raw !== null && Array.isArray(raw) ? raw : []
    const updated = updateNestedChildSelections({
      current,
      childId,
      selected,
    })

    void updated
  }

  return {
    isSelected,
    visibleChildren,
    hasChildren,
    handleSelection,
    toggleExpansion,
    isNestedChildSelected,
    handleNestedChildUpdate,
  }
}

export function useSelectionCardGroup(options: UseSelectionCardGroupOptions): UseSelectionCardGroupReturn {
  const { items: itemsOption, modelValue: modelValueOption, config: configOption } = options

  const _items = isRef(itemsOption) ? itemsOption : ref(itemsOption)
  const modelValue = isRef(modelValueOption) ? modelValueOption : ref(modelValueOption)
  const config = configOption ? (isRef(configOption) ? configOption : ref(configOption)) : ref(undefined)
  void _items // Available for future group operations

  const expandedCardIds = ref<string[]>([])
  const nestedSelections = ref<Record<string, string[]>>({})

  const configWithDefaults = computed<SelectionCardConfig>(() => {
    return mergeSelectionCardConfigWithDefaults(config.value)
  })

  const shouldExpand = (item: SelectionCardItem): boolean => {
    return shouldSelectionCardExpand({
      item,
      config: configWithDefaults.value,
    })
  }

  const toggleCardExpansion = (itemId: string): void => {
    const index = expandedCardIds.value.indexOf(itemId)
    if (index > -1) {
      expandedCardIds.value.splice(index, 1)
    } else {
      expandedCardIds.value.push(itemId)
    }
  }

  const handleNestedSelection = (itemId: string, componentIds: string[]): void => {
    nestedSelections.value[itemId] = componentIds
    void modelValue
  }

  return {
    shouldExpand,
    toggleCardExpansion,
    handleNestedSelection,
  }
}


