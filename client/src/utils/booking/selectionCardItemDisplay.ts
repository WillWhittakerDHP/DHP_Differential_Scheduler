import { getIcon } from '@/utils/iconMapper'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'

export function mapSelectionCardItemsWithIconAndDescription(params: {
  items: readonly BookingBlockInstance[]
  getFilteredDescription: (item: BookingBlockInstance, userTypeBlockName: string | null) => string
  userTypeBlockNameForDescription: string | null
}): BookingBlockInstance[] {
  const { items, getFilteredDescription, userTypeBlockNameForDescription } = params

  return items.map((item) => {
    return {
      ...item,
      icon: getIcon(item.icon),
      description: getFilteredDescription(item, userTypeBlockNameForDescription),
    }
  })
}


