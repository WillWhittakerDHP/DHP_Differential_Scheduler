/**
 * Service Descriptions Composable
 * 
 * LEARNING: Extracts description filtering logic from ServiceSelectionStep component
 * WHY: Components should be thin UI wrappers - description filtering belongs in composables
 * PATTERN: Composable that provides filtered descriptions based on user type
 * 
 * This composable handles:
 * - User-type-specific description filtering
 * - Generic description fallback
 * - Description prioritization (user-type-specific > default > first matching)
 */

import { computed, type ComputedRef } from 'vue'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import { getFilteredServiceDescription, mapServicesWithFilteredDescriptions } from '@/utils/booking/serviceDescriptions'

/**
 * Service Descriptions Composable Options
 */
export interface UseServiceDescriptionsOptions {
  /**
   * Services to filter descriptions for
   */
  services: ComputedRef<BookingBlockInstance[]>
  
  /**
   * Selected user type (for filtering descriptions)
   */
  selectedUserTypeBlock: ComputedRef<BookingBlockInstance | null>
}

/**
 * Service Descriptions Composable Return Type
 */
export interface UseServiceDescriptionsReturn {
  /**
   * Helper function to filter descriptions by user type
   */
  getFilteredDescription: (service: BookingBlockInstance, userTypeBlockName: string | null) => string
  
  /**
   * Services with filtered descriptions applied
   */
  servicesWithDescriptions: ComputedRef<BookingBlockInstance[]>
}

/**
 * Service Descriptions Composable
 * 
 * LEARNING: Provides description filtering logic extracted from ServiceSelectionStep component
 * WHY: Moves business logic out of components into reusable composable
 * PATTERN: Composable with helper function and computed property for filtered descriptions
 */
export function useServiceDescriptions(
  options: UseServiceDescriptionsOptions
): UseServiceDescriptionsReturn {
  const { services, selectedUserTypeBlock } = options

  /**
   * LEARNING: Helper function to filter descriptions by user type
   * WHY: Reusable logic for filtering descriptions based on selected user type
   * PATTERN: Extract user-type filtering logic into helper function
   * Session 6.7: User-Specific Descriptions - Wizard Display
   */
  const getFilteredDescription = (service: BookingBlockInstance, userTypeBlockName: string | null): string => {
    return getFilteredServiceDescription(service, userTypeBlockName)
  }

  /**
   * LEARNING: Services with filtered descriptions applied
   * WHY: Provides services with descriptions filtered by selected user type
   * PATTERN: Computed property that maps services and applies filtered descriptions
   */
  const servicesWithDescriptions = computed(() => {
    const selectedUserTypeBlockName = selectedUserTypeBlock.value?.name.toLowerCase() || null

    return mapServicesWithFilteredDescriptions(services.value, selectedUserTypeBlockName)
  })

  return {
    getFilteredDescription,
    servicesWithDescriptions
  }
}

