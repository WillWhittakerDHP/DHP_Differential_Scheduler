import { extractInstanceComponents, isServiceComposable } from '@/utils/instanceComponentUtils'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { ComponentItem, SelectionCardItem } from '@/components/booking/types/selectionCardTypes'
import type { GlobalEntity } from '@/types/entities'

type ActiveComponentRelationship = { childId: string }

type GetGlobalEntityById = (
  entityKey: 'blockInstance' | 'blockShape',
  id: string
) => GlobalEntity<'blockInstance'> | GlobalEntity<'blockShape'> | null

type GetActiveComponentsRelationships = (serviceId: string) => ActiveComponentRelationship[]

export function getInstanceComponentsForService(params: {
  service: BookingBlockInstance
  getGlobalEntityById: GetGlobalEntityById
  getActiveComponentsRelationships: GetActiveComponentsRelationships
}): ComponentItem[] {
  const { service, getGlobalEntityById, getActiveComponentsRelationships } = params

  if (
    !isServiceComposable({
      serviceId: service.id,
      getGlobalEntityById,
    })
  ) {
    return []
  }

  const instanceComponentsRelationships = getActiveComponentsRelationships(service.id)
  if (!instanceComponentsRelationships || instanceComponentsRelationships.length === 0) {
    return []
  }

  return extractInstanceComponents({
    serviceId: service.id,
    instanceComponentsRelationships,
    getGlobalEntityById,
  })
}

export function mapServicesWithComponents(params: {
  services: readonly BookingBlockInstance[]
  getInstanceComponents: (service: BookingBlockInstance) => ComponentItem[]
}): SelectionCardItem[] {
  return params.services.map((service) => {
    const instanceComponents = params.getInstanceComponents(service)
    return instanceComponents.length > 0
      ? {
          ...service,
          composite: true,
          instanceComponents,
        }
      : service
  })
}


