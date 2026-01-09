import type { SelectionCardConfig, SelectionCardItem } from '@/components/booking/types/selectionCardTypes'

export function getSelectionComponentName(config: SelectionCardConfig): string {
  return config.selectionComponent || 'VRadio'
}

export function getSelectionControlOrder(controlPosition: SelectionCardConfig['controlPosition']): number {
  return controlPosition === 'top' ? -2 : controlPosition === 'left' ? -1 : 1
}

export function buildSelectionComponentProps(params: {
  itemId: SelectionCardItem['id']
  selectionComponent: SelectionCardConfig['selectionComponent']
  controlPosition: SelectionCardConfig['controlPosition']
  controlClasses: Record<string, boolean>
  isSelected: boolean
}): Record<string, unknown> {
  const baseProps: Record<string, unknown> = {
    class: params.controlClasses,
    style: {
      order: getSelectionControlOrder(params.controlPosition),
    },
  }

  if (params.selectionComponent === 'VRadio') {
    baseProps.value = params.itemId
    baseProps.modelValue = params.isSelected
  } else if (params.selectionComponent === 'VCheckbox') {
    baseProps.modelValue = params.isSelected
  }

  return baseProps
}


