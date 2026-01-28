/**
 * Instance Display Composable
 * 
 * LEARNING: Generic display transformation logic for block instances
 * WHY: Not service-specific - works with any block shape (user type, service, property, option)
 * PATTERN: Composable that provides icon mapping and display transformations
 * 
 * This composable handles:
 * - Icon mapping with fallback handling
 * - Display transformations for any block instance type
 * - Description filtering by user type context
 * 
 * Session: Generic SelectionCard Refactor (2026-01-09)
 * NOTE: Renamed from useServiceDisplay to useInstanceDisplay for generic usage
 */

import { computed, type ComputedRef } from 'vue'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import { mapSelectionCardItemsWithIconAndDescription } from '@/utils/booking/selectionCardItemDisplay'

/**
 * Instance Display Composable Options
 */
export interface UseInstanceDisplayOptions {
  /**
   * Block instances to transform (any shape: user type, service, property, option)
   */
  instances: ComputedRef<BookingBlockInstance[]>
  
  /**
   * Optional: Selected user type for description filtering context
   * LEARNING: Some descriptions are user-type-specific
   */
  selectedUserTypeBlock?: ComputedRef<BookingBlockInstance | null>
  
}

/**
 * Instance Display Composable Return Type
 */
export interface UseInstanceDisplayReturn {
  /**
   * Block instances with icons mapped and descriptions processed
   */
  instancesWithDisplay: ComputedRef<BookingBlockInstance[]>
}


/**
 * Instance Display Composable
 * 
 * LEARNING: Generic display transformation for any block instance type
 * WHY: Decoupled from service-specific naming for broader reuse
 * PATTERN: Composable with computed properties for display transformations
 * 
 * @example
 * ```ts
 * // User types
 * const { instancesWithDisplay: wizardStateSelector } = useInstanceDisplay({
 *   instances: computed(() => wizard.availableUserTypeBlocks.value)
 * })
 * 
 * // Services with user-type-specific descriptions
 * const { instancesWithDisplay: servicesWithIcons } = useInstanceDisplay({
 *   instances: computed(() => wizard.availableServices.value),
 *   selectedUserTypeBlock: computed(() => wizard.selectedUserTypeBlock.value),
 *   getFilteredDescription: (service, userTypeBlockName) => filterDescription(service, userTypeBlockName)
 * })
 * ```
 */
export function useInstanceDisplay(
  options: UseInstanceDisplayOptions
): UseInstanceDisplayReturn {
  const {
    instances
  } = options

  /**
   * LEARNING: Maps block instances with icons
   * WHY: Consistent display transformation for any block instance type
   * PATTERN: Use shared utility for icon mapping
   */
  const instancesWithDisplay = computed(() => {
    return mapSelectionCardItemsWithIconAndDescription({
      items: instances.value,
    })
  })

  return {
    instancesWithDisplay
  }
}

