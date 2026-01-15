import { getIcon } from '@/utils/iconMapper'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'

export function mapSelectionCardItemsWithIconAndDescription(params: {
  items: readonly BookingBlockInstance[]
}): BookingBlockInstance[] {
  const { items } = params

  return items.map((item) => {
    return {
      ...item,
      icon: getIcon(item.icon),
    }
  })
}


