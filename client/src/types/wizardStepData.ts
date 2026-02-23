/**
 * WHY: The canonical source uses RFC3339 startTime/endTime format
 */
export type { AvailabilityStepData } from '@/utils/booking/availabilityStepData'

import type { FeeEntryBase } from '@shared/types/appointmentFeeTypes'

export interface SummaryData {
  serviceType: string
  propertyType: string
  address: string
  squareFootage: string
}

export interface PriceData {
  totalFee: number
  currency: string
  bagTotal: number
  couponDiscount: number
  orderTotal: number
  deliveryCharges: number
  deliveryFree: boolean
  finalTotal: number
  baseFeeTotal?: number
  overageFeeTotal?: number
  /** Shared fee shape; aligns with FeeEntryBase for type-similarity EXTEND. */
  lineItemFees?: FeeEntryBase
  lineItems?: Array<{
    label: string
    amount: number
    isFree: boolean
  }>
}
