/**
 * PATTERN: Instance Descriptions Composable

PATTERN: Composable that provides filt...
 */
import { computed } from 'vue'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import { getFilteredServiceDescription, mapServicesWithFilteredDescriptions } from '@/utils/booking/serviceDescriptions'
import type { UseInstanceDescriptionsOptions, UseInstanceDescriptionsReturn } from '@/types/booking/instanceDescriptions'

export type { UseInstanceDescriptionsOptions, UseInstanceDescriptionsReturn } from '@/types/booking/instanceDescriptions'

/**
 * PATTERN: Instance Descriptions Composable

PATTERN: Composable with helper functi...
 */
export function useInstanceDescriptions(
  options: UseInstanceDescriptionsOptions
): UseInstanceDescriptionsReturn {
  const { instances, selectedUserTypeBlock } = options

  const getFilteredDescription = (instance: BookingBlockInstance, userTypeBlockName: string | null): string => {
    return getFilteredServiceDescription(instance, userTypeBlockName)
  }

  const instancesWithDescriptions = computed(() => {
    const selectedUserTypeBlockName = selectedUserTypeBlock?.value?.name.toLowerCase() ?? null

    return mapServicesWithFilteredDescriptions(instances.value, selectedUserTypeBlockName)
  })

  return {
    getFilteredDescription,
    instancesWithDescriptions
  }
}

