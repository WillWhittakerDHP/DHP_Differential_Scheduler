import type { SelectionCardConfig, SelectionCardItem } from '@/components/booking/types/selectionCardTypes'

function getVisibleSelectionCardChildrenCore(params: {
  item: SelectionCardItem
  config: SelectionCardConfig
}): SelectionCardItem[] {
  const { item, config } = params

  if (!config.expansion?.enabled) return []

  if (config.expansion?.componentData) {
    const componentData = config.expansion.componentData(item)
    if (componentData && componentData.composite) {
      const vis = componentData.visibleComponents
      return vis !== undefined && vis !== null && Array.isArray(vis) ? vis : []
    }
  } else if (item.instanceComponents) {
    return item.instanceComponents
      .filter((comp) => comp.active === true)
      .map((comp) => ({
        id: comp.id,
        name: comp.name,
        icon: comp.icon,
      }))
  }

  return []
}

export function getVisibleSelectionCardChildren(params: {
  item: SelectionCardItem
  config: SelectionCardConfig
}): SelectionCardItem[] {
  return getVisibleSelectionCardChildrenCore(params)
}

export function shouldSelectionCardExpand(params: {
  item: SelectionCardItem
  config: SelectionCardConfig
}): boolean {
  const { item, config } = params
  if (!config.expansion?.enabled) return false

  const composite = item.composite === true
  if (!composite) return false

  return getVisibleSelectionCardChildrenCore({ item, config }).length > 0
}


