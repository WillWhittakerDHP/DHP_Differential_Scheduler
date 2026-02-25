/**
 * PATTERN: Instance Display Composable

PATTERN: Composable that provides icon mapp...
 */
import { computed } from 'vue'
import { mapSelectionCardItemsWithIconAndDescription } from '@/utils/booking/selectionCardItemDisplay'
import type { UseInstanceDisplayOptions, UseInstanceDisplayReturn } from '@/types/booking/instanceDisplay'

export type { UseInstanceDisplayOptions, UseInstanceDisplayReturn } from '@/types/booking/instanceDisplay'

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

