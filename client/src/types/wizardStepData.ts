/**
 * WHY: The canonical source uses RFC3339 startTime/endTime format
 */
export type { AvailabilityStepData } from '@/utils/booking/availabilityStepData'

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
  lineItemFees?: {
    baseFee: number
    overageFee: number
    totalFee: number
  }
  lineItems?: Array<{
    label: string
    amount: number
    isFree: boolean
  }>
}
