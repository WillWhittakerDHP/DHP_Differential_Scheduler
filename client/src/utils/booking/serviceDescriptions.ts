import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'

export function getFilteredServiceDescription(service: BookingBlockInstance, userTypeBlockName: string | null): string {
  // WHY: Return empty string since descriptions property doesn't exist on BookingBlockInstance
  return ''
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


