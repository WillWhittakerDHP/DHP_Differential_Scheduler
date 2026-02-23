/**
 * PATTERN: Instance Descriptions Composable

PATTERN: Composable that provides filt...
 */
import { computed, type ComputedRef } from 'vue'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import { getFilteredServiceDescription, mapServicesWithFilteredDescriptions } from '@/utils/booking/serviceDescriptions'
import type { UseInstanceDisplayOptions } from '@/composables/booking/useInstanceDisplay'

/** Same shape as UseInstanceDisplayOptions; use shared type for single source. */
export type UseInstanceDescriptionsOptions = UseInstanceDisplayOptions

export interface UseInstanceDescriptionsReturn {
  getFilteredDescription: (instance: BookingBlockInstance, userTypeBlockName: string | null) => string
  
  instancesWithDescriptions: ComputedRef<BookingBlockInstance[]>
}

/**
 * PATTERN: Instance Descriptions Composable

PATTERN: Composable with helper functi...
 */
export function useInstanceDescriptions(
  options: UseInstanceDescriptionsOptions
): UseInstanceDescriptionsReturn {
  const { instances, selectedUserTypeBlock } = options

  /**
   */
  const getFilteredDescription = (instance: BookingBlockInstance, userTypeBlockName: string | null): string => {
    return getFilteredServiceDescription(instance, userTypeBlockName)
  }

  /**
   */
  const instancesWithDescriptions = computed(() => {
    const selectedUserTypeBlockName = selectedUserTypeBlock?.value?.name.toLowerCase() ?? null

    return mapServicesWithFilteredDescriptions(instances.value, selectedUserTypeBlockName)
  })

  return {
    getFilteredDescription,
    instancesWithDescriptions
  }
}

