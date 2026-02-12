/**
 * LEARNING: Shared wizard step data types
 * WHY: Re-export from canonical source to prevent format mismatches
 * PATTERN: Single source of truth for type definitions
 *
 * SESSION: 2.1.3b - Fixed duplicate interface causing timezone issues
 *
 * Used by:
 * - ConfirmationStep.vue
 * - useConfirmationStepData.ts
 * - AvailabilityStep.vue
 * - useAvailabilityStepData.ts
 */

// LEARNING: Re-export AvailabilityStepData from canonical source
// WHY: The canonical source uses RFC3339 startTime/endTime format
// PATTERN: Avoid duplicate interface definitions
export type { AvailabilityStepData } from '@/utils/booking/availabilityStepData'

/**
 * Summary data for confirmation step display.
 * LEARNING: Aggregated service/property/address/sqft for confirmation
 */
export interface SummaryData {
  serviceType: string
  propertyType: string
  address: string
  squareFootage: string
}

/**
 * Price data structure for confirmation step.
 * LEARNING: Calculated fees and pricing breakdown (base vs overage, order totals)
 */
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
