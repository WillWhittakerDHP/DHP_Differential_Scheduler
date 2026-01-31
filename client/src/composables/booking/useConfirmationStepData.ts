/**
 * useConfirmationStepData Composable
 * 
 * LEARNING: Extracts confirmation step data aggregation and fee calculation logic from ConfirmationStep component
 * WHY: Moves data aggregation and business logic to composable
 * PATTERN: Composable that aggregates wizard state and step data, calculates fees
 */

import { computed, type Ref, type ComputedRef } from 'vue'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import { buildConfirmationPriceData, buildConfirmationSummaryData } from '@/utils/booking/confirmationStepData'

/**
 * Summary data structure
 */
export interface SummaryData {
  serviceType: string
  propertyType: string
  address: string
  squareFootage: string
}

/**
 * Price data structure
 * LEARNING: Represents calculated fees and pricing breakdown for confirmation step
 * WHY: Provides fee breakdown (base vs overage) and order totals
 * PATTERN: Includes base fee total, overage fee total, and calculated order totals
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
  /** Sum of all base fees from all block instances */
  baseFeeTotal?: number
  /** Sum of all overage fees (rateOverBaseFee * squareFootage) from all block instances */
  overageFeeTotal?: number
  /** Line item fees breakdown */
  lineItemFees?: {
    baseFee: number
    overageFee: number
    totalFee: number
  }
  /** Individual line items for display */
  lineItems?: Array<{
    label: string
    amount: number
    isFree: boolean
  }>
}

import type { AvailabilityStepData } from '@/types/wizardStepData'
import type { PropertyDetailsStepData } from '@/types/wizard'

/**
 * Step data interfaces (matching BookingWizard.vue)
 * FIX: Use shared types from wizardStepData.ts and wizard.ts
 */

/**
 * useConfirmationStepData composable parameters
 */
export interface UseConfirmationStepDataParams {
  wizard: {
    selectedServiceTypeBlocks: Ref<BookingBlockInstance[]>
    selectedPropertyTypeBlocks: Ref<BookingBlockInstance[]>
    selectedOptionTypeBlocks: Ref<BookingBlockInstance[]>
    selectedLineItemBlocks: Ref<BookingBlockInstance[]>
    selectedUserTypeBlock: Ref<BookingBlockInstance | null>
  }
  propertyDetailsStepData?: Ref<PropertyDetailsStepData> | null
  availabilityStepData?: Ref<AvailabilityStepData> | null
}

/**
 * useConfirmationStepData composable return type
 */
export interface UseConfirmationStepDataReturn {
  summaryData: ComputedRef<SummaryData>
  priceData: ComputedRef<PriceData>
}

/**
 * useConfirmationStepData composable
 * 
 * LEARNING: Aggregates wizard state and step data for confirmation display
 * WHY: Extracts data aggregation and fee calculation from component to composable
 * PATTERN: Composable that aggregates data from wizard and steps, calculates fees
 */
export function useConfirmationStepData(
  params: UseConfirmationStepDataParams
): UseConfirmationStepDataReturn {
  const {
    wizard,
    propertyDetailsStepData,
    // availabilityStepData available for future scheduling display
  } = params

  /**
   * LEARNING: Aggregate summary data from wizard state and step data
   * WHY: Combines data from multiple sources for display
   * PATTERN: Computed property that aggregates wizard selections and step data
   */
  const summaryData = computed<SummaryData>(() => {
    return buildConfirmationSummaryData(
      {
        selectedServices: wizard.selectedServiceTypeBlocks.value,
        selectedPropertyTypeBlocks: wizard.selectedPropertyTypeBlocks.value,
        selectedOptionTypeBlocks: wizard.selectedOptionTypeBlocks.value,
        selectedLineItemBlocks: wizard.selectedLineItemBlocks.value,
      },
      propertyDetailsStepData?.value ?? null
    )
  })

  /**
   * LEARNING: Calculate price data from wizard selections
   * WHY: Aggregates pricing information from selected services and options
   * PATTERN: Computed property that calculates fees based on selections
   * 
   * LEARNING: Extract square footage and ADU count from propertyDetailsStepData
   * WHY: Square footage is needed for overage fee calculation, ADU count for multipliers
   * PATTERN: Extract squareFootage (with propertySize fallback) and additionalUnits from propertyDetailsStepData
   * 
   * FIX: Explicitly access value to ensure reactivity tracking
   * WHY: Optional chaining may break reactivity tracking in Vue computed properties
   * PATTERN: Extract stepDataValue first, then access nested properties
   */
  const priceData = computed<PriceData>(() => {
    // Explicitly access value to ensure reactivity tracking
    const stepDataValue = propertyDetailsStepData?.value
    const aduCount = stepDataValue?.additionalUnits ?? null
    
    // LEARNING: Extract square footage with fallback to propertySize
    // WHY: Overage fees depend on square footage, use propertySize as fallback if squareFootage not available
    // PATTERN: Use squareFootage if available, otherwise fallback to propertySize, otherwise null
    const squareFootage = stepDataValue?.squareFootage ?? stepDataValue?.propertySize ?? null
    
    return buildConfirmationPriceData({
      selectedServices: wizard.selectedServiceTypeBlocks.value,
      selectedPropertyTypeBlocks: wizard.selectedPropertyTypeBlocks.value,
      selectedOptionTypeBlocks: wizard.selectedOptionTypeBlocks.value,
      selectedLineItemBlocks: wizard.selectedLineItemBlocks.value,
    }, squareFootage, aduCount)
  })

  // LEARNING: Debug watches removed
  // WHY: Debug logging should use proper logger utility, not console.log
  // PATTERN: Remove dev-mode debug watches - use proper logging if needed

  return {
    summaryData,
    priceData
  }
}

