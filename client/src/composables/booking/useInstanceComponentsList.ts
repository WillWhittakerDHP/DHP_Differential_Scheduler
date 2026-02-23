/**
 * PATTERN: useInstanceComponentsList Composable

PATTERN: Composable that maps serv...
 */
import { computed, type ComputedRef } from 'vue'
import { useGlobal } from '../useGlobal'
import { useComponentEntity } from '../useComponentEntity'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import { toGlobalEntityId } from '@/types/entities'
import type { ComponentItem, SelectionCardItem } from '@/components/booking/types/selectionCardTypes'
import { getInstanceComponentsForService, mapServicesWithComponents } from '@/utils/booking/instanceComponentsList'

export interface UseInstanceComponentsListOptions {
  services: ComputedRef<BookingBlockInstance[]>
  
  selectedUserTypeBlock: ComputedRef<BookingBlockInstance | null>
}

/**
 * PATTERN: useInstanceComponentsList composable
PATTERN: Composable that returns co...
 */
export function useInstanceComponentsList(options: UseInstanceComponentsListOptions) {
  const { services } = options

  const { getGlobalEntityById } = useGlobal()
  const componentEntity = useComponentEntity<'blockInstance'>('blockInstance')

  /**
   * WHY: /**
Helper function to get components for a service
WHY: Avoids code dup...
   */
  const getInstanceComponents = (service: BookingBlockInstance): ComponentItem[] => {
    return getInstanceComponentsForService({
      service,
      getGlobalEntityById: (entityKey: 'blockInstance' | 'blockShape', id: string) => {
        const result = getGlobalEntityById(entityKey, id)
        return result || null
      },
      getActiveComponentsRelationships: (serviceId: string) => componentEntity.getComponents(toGlobalEntityId(serviceId)),
    })
  }

  /**
   * WHY: /**
Enhance services with component data for composable blocks
LEARNING:...
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

