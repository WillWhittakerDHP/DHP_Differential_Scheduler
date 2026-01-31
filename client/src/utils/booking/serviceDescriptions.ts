import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'

/**
 * Get filtered service description
 * LEARNING: Descriptions are deprecated in favor of annotation suites (future feature)
 * WHY: Return empty string since descriptions property no longer exists on BookingBlockInstance
 * PATTERN: Return empty string gracefully when descriptions are not available
 */
export function getFilteredServiceDescription(service: BookingBlockInstance, userTypeBlockName: string | null): string {
  // LEARNING: Descriptions are deprecated - annotation suites will replace this functionality
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


