import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'

export function getFilteredServiceDescription(service: BookingBlockInstance, userTypeBlockName: string | null): string {
  if (!service.descriptions || service.descriptions.length === 0) {
    return ''
  }

  const matchingDescriptions = service.descriptions.filter((desc) => {
    return desc.userTypeBlock === userTypeBlockName || desc.userTypeBlock === null
  })

  if (matchingDescriptions.length === 0) {
    return ''
  }

  const userTypeBlockSpecific = matchingDescriptions.find((desc) => desc.userTypeBlock === userTypeBlockName)
  const defaultDesc = matchingDescriptions.find((desc) => desc.isDefault === true)

  const selectedDesc = userTypeBlockSpecific || defaultDesc || matchingDescriptions[0]
  return selectedDesc.text
}

export function mapServicesWithFilteredDescriptions(
  services: BookingBlockInstance[],
  selectedUserTypeBlockNameLowercase: string | null,
): Array<BookingBlockInstance & { description?: string }> {
  return services.map((service) => ({
    ...service,
    description: getFilteredServiceDescription(service, selectedUserTypeBlockNameLowercase),
  }))
}


