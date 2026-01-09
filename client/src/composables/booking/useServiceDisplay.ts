/**
 * Service Display Composable
 * 
 * LEARNING: Extracts display transformation logic from ServiceSelectionStep component
 * WHY: Components should be thin UI wrappers - display transformations belong in composables
 * PATTERN: Composable that provides icon mapping and display transformations
 * 
 * This composable handles:
 * - Icon mapping with fallback handling
 * - User type display transformations
 * - Service display transformations
 */

import { computed, type ComputedRef } from 'vue'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import { mapSelectionCardItemsWithIconAndDescription } from '@/utils/booking/selectionCardItemDisplay'

/**
 * Service Display Composable Options
 */
export interface UseServiceDisplayOptions {
  /**
   * User types to transform
   */
  userTypeBlocks: ComputedRef<BookingBlockInstance[]>
  
  /**
   * Services to transform
   */
  services: ComputedRef<BookingBlockInstance[]>
  
  /**
   * Selected user type (for description filtering)
   */
  selectedUserTypeBlock: ComputedRef<BookingBlockInstance | null>
  
  /**
   * Function to get filtered description
   */
  getFilteredDescription: (service: BookingBlockInstance, userTypeBlockName: string | null) => string
}

/**
 * Service Display Composable Return Type
 */
export interface UseServiceDisplayReturn {
  /**
   * User types with icons mapped
   */
  wizardStateSelector: ComputedRef<BookingBlockInstance[]>
  
  /**
   * Base services with icons mapped and descriptions filtered
   */
  baseServicesWithIcons: ComputedRef<BookingBlockInstance[]>
}

/**
 * Service Display Composable
 * 
 * LEARNING: Provides display transformation logic extracted from ServiceSelectionStep component
 * WHY: Moves business logic out of components into reusable composable
 * PATTERN: Composable with computed properties for display transformations
 */
export function useServiceDisplay(
  options: UseServiceDisplayOptions
): UseServiceDisplayReturn {
  const {
    userTypeBlocks,
    services,
    selectedUserTypeBlock,
    getFilteredDescription
  } = options

  /**
   * LEARNING: Ensures icons are properly mapped with fallback handling before passing to SelectionCardGroup
   * WHY: Maps wizard items to include icon property with fallback handling
   * PATTERN: Map wizard items to include icon property with fallback handling
   */
  const wizardStateSelector = computed(() => {
    const result = mapSelectionCardItemsWithIconAndDescription({
      items: userTypeBlocks.value,
      getFilteredDescription,
      userTypeBlockNameForDescription: null, // User types don't filter by user type
    })
    
    return result
  })

  /**
   * LEARNING: Descriptions can be user-type-specific (matching selected state control block) or generic (null)
   * WHY: Filter descriptions array by user type, prioritize matching user type, then generic, then default
   * PATTERN: Map services with icons and filtered descriptions
   * NOTE: User type name is dynamically extracted from selected state control block instance
   */
  const baseServicesWithIcons = computed(() => {
    const selectedUserTypeBlockName = selectedUserTypeBlock.value?.name.toLowerCase() || null // Dynamically extracted from selected state control block instance name, or null for generic

    return mapSelectionCardItemsWithIconAndDescription({
      items: services.value,
      getFilteredDescription,
      userTypeBlockNameForDescription: selectedUserTypeBlockName,
    })
  })

  return {
    wizardStateSelector,
    baseServicesWithIcons
  }
}

