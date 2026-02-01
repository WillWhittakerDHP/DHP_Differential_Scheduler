/**
 * Instance Descriptions Composable
 * 
 * LEARNING: Generic description filtering logic for any block instance type
 * WHY: Not service-specific - works with any block shape that has user-type-specific descriptions
 * PATTERN: Composable that provides filtered descriptions based on user type context
 * 
 * This composable handles:
 * - User-type-specific description filtering
 * - Generic description fallback
 * - Description prioritization (user-type-specific > default > first matching)
 * 
 * Session: Generic SelectionCard Refactor (2026-01-09)
 * NOTE: Renamed from useServiceDescriptions to useInstanceDescriptions for generic usage
 */

import { computed, type ComputedRef } from 'vue'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import { getFilteredServiceDescription, mapServicesWithFilteredDescriptions } from '@/utils/booking/serviceDescriptions'

export interface UseInstanceDescriptionsOptions {
  instances: ComputedRef<BookingBlockInstance[]>
  
  selectedUserTypeBlock: ComputedRef<BookingBlockInstance | null>
}

export interface UseInstanceDescriptionsReturn {
  getFilteredDescription: (instance: BookingBlockInstance, userTypeBlockName: string | null) => string
  
  instancesWithDescriptions: ComputedRef<BookingBlockInstance[]>
}

/**
 * Instance Descriptions Composable
 * 
 * LEARNING: Generic description filtering for any block instance type
 * WHY: Decoupled from service-specific naming for broader reuse
 * PATTERN: Composable with helper function and computed property for filtered descriptions
 * 
 * @example
 * ```ts
 * const { getFilteredDescription, instancesWithDescriptions } = useInstanceDescriptions({
 *   instances: computed(() => wizard.availableServices.value),
 *   selectedUserTypeBlock: computed(() => wizard.selectedUserTypeBlock.value)
 * })
 * ```
 */
export function useInstanceDescriptions(
  options: UseInstanceDescriptionsOptions
): UseInstanceDescriptionsReturn {
  const { instances, selectedUserTypeBlock } = options

  /**
   * LEARNING: Helper function to filter descriptions by user type
   * WHY: Reusable logic for filtering descriptions based on selected user type
   * PATTERN: Extract user-type filtering logic into helper function
   */
  const getFilteredDescription = (instance: BookingBlockInstance, userTypeBlockName: string | null): string => {
    return getFilteredServiceDescription(instance, userTypeBlockName)
  }

  /**
   * LEARNING: Block instances with filtered descriptions applied
   * WHY: Provides instances with descriptions filtered by selected user type
   * PATTERN: Computed property that maps instances and applies filtered descriptions
   */
  const instancesWithDescriptions = computed(() => {
    const selectedUserTypeBlockName = selectedUserTypeBlock.value?.name.toLowerCase() || null

    return mapServicesWithFilteredDescriptions(instances.value, selectedUserTypeBlockName)
  })

  return {
    getFilteredDescription,
    instancesWithDescriptions
  }
}

