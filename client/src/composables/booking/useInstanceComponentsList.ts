/**
 * PATTERN: useInstanceComponentsList Composable

PATTERN: Composable that maps serv...
 */
import { computed } from 'vue'
import { useGlobal } from '../useGlobal'
import { useComponentEntity } from '../useComponentEntity'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import { toGlobalEntityId } from '@/utils/globalEntity'
import type { ComponentItem, SelectionCardItem } from '@/components/booking/types/selectionCardTypes'
import { getInstanceComponentsForService, mapServicesWithComponents } from '@/utils/booking/instanceComponentsList'
import type {
  UseInstanceComponentsListOptions,
  UseInstanceComponentsListReturn,
} from '@/types/booking/instanceComponentsList'

export type {
  UseInstanceComponentsListOptions,
  UseInstanceComponentsListReturn,
} from '@/types/booking/instanceComponentsList'

/**
 * PATTERN: useInstanceComponentsList composable
PATTERN: Composable that returns co...
 */
export function useInstanceComponentsList(
  options: UseInstanceComponentsListOptions
): UseInstanceComponentsListReturn {
  const { services } = options

  const { getGlobalEntityById } = useGlobal()
  const componentEntity = useComponentEntity<'blockInstance'>('blockInstance')

  /**
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

