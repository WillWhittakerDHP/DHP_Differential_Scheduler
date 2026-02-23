/**
 * PATTERN: Instance Display Composable

PATTERN: Composable that provides icon mapp...
 */
import { computed, type ComputedRef } from 'vue'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import { mapSelectionCardItemsWithIconAndDescription } from '@/utils/booking/selectionCardItemDisplay'

export interface UseInstanceDisplayOptions {
  instances: ComputedRef<BookingBlockInstance[]>
  
  selectedUserTypeBlock?: ComputedRef<BookingBlockInstance | null>
  
}

export interface UseInstanceDisplayReturn {
  instancesWithDisplay: ComputedRef<BookingBlockInstance[]>
}


/**
 * PATTERN: Instance Display Composable

PATTERN: Composable with computed propertie...
 */
export function useInstanceDisplay(
  options: UseInstanceDisplayOptions
): UseInstanceDisplayReturn {
  const {
    instances
  } = options

  const instancesWithDisplay = computed(() => {
    return mapSelectionCardItemsWithIconAndDescription({
      items: instances.value,
    })
  })

  return {
    instancesWithDisplay
  }
}

