/**
 * useInstanceComponentsList Composable
 * 
 * LEARNING: Extracts component aggregation logic for multiple services
 * WHY: Extracts component extraction logic from ServiceSelectionStep component
 * PATTERN: Composable that maps services and adds component data for composable blocks
 * 
 * Features:
 * - Map services and add component data when service is composable
 * - Extract components per service using useComponentEntity
 * - Filter active components based on selected user type
 */

import { computed, type ComputedRef } from 'vue'
import { useGlobal } from '../useGlobal'
import { useComponentEntity } from '../useComponentEntity'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { ComponentItem, SelectionCardItem } from '@/components/booking/types/selectionCardTypes'
import { getInstanceComponentsForService, mapServicesWithComponents } from '@/utils/booking/instanceComponentsList'

export interface UseInstanceComponentsListOptions {
  services: ComputedRef<BookingBlockInstance[]>
  
  selectedUserTypeBlock: ComputedRef<BookingBlockInstance | null>
}

/**
 * useInstanceComponentsList composable
 * LEARNING: Provides component extraction for multiple services
 * WHY: Centralizes component aggregation logic for reuse
 * PATTERN: Composable that returns computed property with enhanced services
 */
export function useInstanceComponentsList(options: UseInstanceComponentsListOptions) {
  const { services } = options

  const { getGlobalEntityById } = useGlobal()
  const componentEntity = useComponentEntity<'blockInstance'>('blockInstance')

  /**
   * Helper function to get components for a service
   * LEARNING: Uses shared utility function to extract components
   * WHY: Avoids code duplication, uses composable logic
   * PATTERN: Helper function that uses utility function from instanceComponentUtils
   */
  const getInstanceComponents = (service: BookingBlockInstance): ComponentItem[] => {
    return getInstanceComponentsForService({
      service,
      getGlobalEntityById: (entityKey: 'blockInstance' | 'blockShape', id: string) => {
        const result = getGlobalEntityById(entityKey, id)
        return result || null
      },
      getActiveComponentsRelationships: (serviceId: string) => componentEntity.getComponents(serviceId),
    })
  }

  /**
   * Enhance services with component data for composable blocks
   * LEARNING: Map services and add component data when service is composable
   * WHY: Composable blocks need their active components attached for expansion display
   * PATTERN: Computed property that maps services and adds component data
   */
  const servicesWithComponents = computed<SelectionCardItem[]>(() => {
    return mapServicesWithComponents({
      services: services.value,
      getInstanceComponents,
    })
  })

  return {
    servicesWithComponents,
    getInstanceComponents,
  }
}

