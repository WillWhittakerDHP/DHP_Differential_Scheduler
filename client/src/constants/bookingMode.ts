import type { BookingModeDomain } from '@shared/constants/ternaryFieldMappings'
import { DEFAULT_VALUES } from './entityFieldConstants'

export const BOOKING_MODES = [DEFAULT_VALUES.BOOKING_MODE, 'addOn', 'both'] as const
export type BookingMode = BookingModeDomain
