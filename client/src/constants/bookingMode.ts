import type { BookingModeDomain } from '@shared/constants/ternaryFieldMappings'

export const BOOKING_MODES = ['standalone', 'addOn', 'both'] as const
export type BookingMode = BookingModeDomain
